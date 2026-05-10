import { DownloadOutlined, SaveOutlined, SendOutlined, UploadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormTextArea,
  ProFormUploadButton,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, history, useIntl, useParams } from '@umijs/max';
import { Button, DatePicker, Input, InputNumber, message, Select, Space, Tag } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { uploadApi } from '@/utils/upload';
import type {
  V1Homework,
  V1HomeworkStudent,
  V1HomeworkEvaluationInput,
  V1Staff,
} from '@gosaas/api';
import { HomeworkServiceApi, StaffServiceApi } from '@gosaas/api';
import { dateUtil } from '@gosaas/core';

const homeworkService = new HomeworkServiceApi();
const staffService = new StaffServiceApi();

type EvaluationDraft = {
  marks?: number;
  note?: string;
};

type SubmissionFormValues = {
  message?: string;
  fileUpload?: UploadFile[];
};

const getUploadFile = (files?: UploadFile[]) => {
  const item = files?.[0];
  return item?.originFileObj as File | undefined;
};

const studentName = (record: V1HomeworkStudent) =>
  [record.firstName, record.middleName, record.lastName].filter(Boolean).join(' ') ||
  record.studentId ||
  '-';

const staffLabel = (staff?: V1Staff) =>
  staff ? [staff.employeeId, staff.firstName, staff.lastName].filter(Boolean).join(' ') : '';

const HomeworkSubmissions: React.FC = () => {
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const [homework, setHomework] = useState<V1Homework>();
  const [rows, setRows] = useState<V1HomeworkStudent[]>([]);
  const [staff, setStaff] = useState<V1Staff[]>([]);
  const [staffId, setStaffId] = useState<string>();
  const [evaluationDate, setEvaluationDate] = useState<any>(dateUtil());
  const [drafts, setDrafts] = useState<Record<string, EvaluationDraft>>({});
  const [submissionRow, setSubmissionRow] = useState<V1HomeworkStudent>();

  const load = useCallback(async () => {
    if (!homeworkId) {
      return;
    }
    const [homeworkResp, rosterResp] = await Promise.all([
      homeworkService.homeworkServiceGetHomework({ id: homeworkId }),
      homeworkService.homeworkServiceListHomeworkStudent({ homeworkId }),
    ]);
    setHomework(homeworkResp.data);
    setStaffId((current) => current || homeworkResp.data.staffId);
    const roster = rosterResp.data.items || [];
    setRows(roster);
    setDrafts(
      roster.reduce<Record<string, EvaluationDraft>>((ret, row) => {
        if (row.studentEnrollmentId && row.evaluation) {
          ret[row.studentEnrollmentId] = {
            marks: row.evaluation.marks,
            note: row.evaluation.note,
          };
        }
        return ret;
      }, {}),
    );
  }, [homeworkId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    staffService
      .staffServiceListStaff2({
        body: {
          pageSize: 300,
          sort: ['roleName', 'employeeId'],
          filter: { isActive: { $eq: true } },
        },
      })
      .then((resp) => setStaff(resp.data.items || []));
  }, []);

  const staffOptions = useMemo(
    () => staff.map((item) => ({ label: staffLabel(item) || item.id, value: item.id })),
    [staff],
  );

  const updateDraft = (enrollmentId: string | undefined, patch: EvaluationDraft) => {
    if (!enrollmentId) {
      return;
    }
    setDrafts((current) => ({
      ...current,
      [enrollmentId]: {
        ...current[enrollmentId],
        ...patch,
      },
    }));
  };

  const handleSaveEvaluations = async () => {
    if (!homeworkId || !staffId || !evaluationDate) {
      message.warning(
        intl.formatMessage({
          id: 'school.academic.homework.selectEvaluator',
          defaultMessage: 'Select evaluator and evaluation date',
        }),
      );
      return;
    }
    const items = rows
      .map<V1HomeworkEvaluationInput | undefined>((row) => {
        const draft = drafts[row.studentEnrollmentId || ''];
        if (!row.studentEnrollmentId || (!draft && !row.evaluation)) {
          return undefined;
        }
        return {
          studentEnrollmentId: row.studentEnrollmentId,
          marks: Number(draft?.marks || 0),
          note: draft?.note,
          status: 'complete',
        };
      })
      .filter(Boolean) as V1HomeworkEvaluationInput[];
    if (items.length === 0) {
      message.warning(
        intl.formatMessage({
          id: 'school.academic.homework.noEvaluations',
          defaultMessage: 'No evaluations to save',
        }),
      );
      return;
    }
    const hide = message.loading(
      intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
    );
    try {
      const resp = await homeworkService.homeworkServiceSaveHomeworkEvaluations({
        homeworkId,
        body: {
          homeworkId,
          staffId,
          evaluationDate: dateUtil(evaluationDate).toISOString(),
          items,
        },
      });
      hide();
      setRows(resp.data.items || []);
      message.success(intl.formatMessage({ id: 'common.saved', defaultMessage: 'Saved' }));
      actionRef.current?.reload();
    } catch (error) {
      hide();
    }
  };

  const handleSubmit = async (values: SubmissionFormValues) => {
    if (!homeworkId || !submissionRow?.studentEnrollmentId || !values.message) {
      return false;
    }
    const file = getUploadFile(values.fileUpload);
    const hide = message.loading(
      intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
    );
    try {
      const resp = await homeworkService.homeworkServiceSubmitHomework({
        homeworkId,
        body: {
          homeworkId,
          studentEnrollmentId: submissionRow.studentEnrollmentId,
          message: values.message,
        },
      });
      if (file && resp.data.id) {
        await uploadApi(`/v1/school/homework/submission/${resp.data.id}/upload`, { file });
      }
      hide();
      message.success(intl.formatMessage({ id: 'common.saved', defaultMessage: 'Saved' }));
      setSubmissionRow(undefined);
      await load();
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleDownload = async (record: V1HomeworkStudent) => {
    if (!record.submission?.id) {
      return;
    }
    try {
      const resp = await homeworkService.homeworkServiceDownloadHomeworkSubmissionAttachment({
        id: record.submission.id,
      });
      const url = window.URL.createObjectURL(resp.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.submission.file?.name || 'submission';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.academic.homework.downloadFailed',
          defaultMessage: 'Download Failed',
        }),
      );
    }
  };

  const columns: ProColumnType<V1HomeworkStudent>[] = [
    {
      title: <FormattedMessage id="school.student.admissionNo" defaultMessage="Admission No" />,
      dataIndex: 'admissionNo',
      width: 130,
    },
    {
      title: <FormattedMessage id="school.student.rollNo" defaultMessage="Roll No" />,
      dataIndex: 'rollNo',
      width: 110,
    },
    {
      title: <FormattedMessage id="school.student.name" defaultMessage="Student" />,
      render: (_, record) => studentName(record),
    },
    {
      title: <FormattedMessage id="school.academic.homework.status" defaultMessage="Status" />,
      search: false,
      width: 120,
      render: (_, record) =>
        record.evaluation ? (
          <Tag color="green">
            <FormattedMessage id="school.academic.homework.evaluated" defaultMessage="Evaluated" />
          </Tag>
        ) : record.submission ? (
          <Tag color="blue">
            <FormattedMessage id="school.academic.homework.submitted" defaultMessage="Submitted" />
          </Tag>
        ) : (
          <Tag>
            <FormattedMessage id="school.academic.homework.pending" defaultMessage="Pending" />
          </Tag>
        ),
    },
    {
      title: (
        <FormattedMessage id="school.academic.homework.submission" defaultMessage="Submission" />
      ),
      search: false,
      ellipsis: true,
      render: (_, record) => record.submission?.message || '-',
    },
    {
      title: <FormattedMessage id="school.academic.homework.marks" defaultMessage="Marks" />,
      search: false,
      width: 130,
      render: (_, record) => (
        <InputNumber
          min={0}
          max={homework?.maxMarks || undefined}
          precision={2}
          value={drafts[record.studentEnrollmentId || '']?.marks}
          onChange={(value) =>
            updateDraft(record.studentEnrollmentId, { marks: Number(value || 0) })
          }
        />
      ),
    },
    {
      title: <FormattedMessage id="school.academic.homework.evaluatorNote" defaultMessage="Note" />,
      search: false,
      render: (_, record) => (
        <Input
          value={drafts[record.studentEnrollmentId || '']?.note}
          onChange={(event) =>
            updateDraft(record.studentEnrollmentId, { note: event.target.value })
          }
        />
      ),
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      valueType: 'option',
      width: 230,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<SendOutlined />}
            onClick={() => setSubmissionRow(record)}
          >
            <FormattedMessage id="school.academic.homework.submit" defaultMessage="Submit" />
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            disabled={!record.submission?.file?.id}
            onClick={() => handleDownload(record)}
          >
            <FormattedMessage id="school.academic.homework.download" defaultMessage="Download" />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title={intl.formatMessage({
        id: 'school.academic.homework.submissions',
        defaultMessage: 'Homework Submissions',
      })}
      onBack={() => history.push('/school/academic/homework')}
    >
      <Space style={{ marginBottom: 16 }} wrap>
        <span>{homework?.title}</span>
        <Select
          style={{ minWidth: 220 }}
          placeholder={intl.formatMessage({
            id: 'school.academic.homework.staff',
            defaultMessage: 'Staff',
          })}
          options={staffOptions}
          value={staffId}
          onChange={setStaffId}
          showSearch
        />
        <DatePicker value={evaluationDate} onChange={setEvaluationDate} />
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveEvaluations}>
          <FormattedMessage
            id="school.academic.homework.saveEvaluations"
            defaultMessage="Save Evaluations"
          />
        </Button>
      </Space>
      <ProTable<V1HomeworkStudent>
        actionRef={actionRef}
        rowKey="studentEnrollmentId"
        search={false}
        dataSource={rows}
        columns={columns}
        pagination={{ defaultPageSize: 20 }}
      />
      <ModalForm<SubmissionFormValues>
        title={intl.formatMessage({
          id: 'school.academic.homework.submit',
          defaultMessage: 'Submit Homework',
        })}
        open={Boolean(submissionRow)}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setSubmissionRow(undefined),
        }}
        initialValues={{ message: submissionRow?.submission?.message }}
        onFinish={handleSubmit}
      >
        <ProFormTextArea
          name="message"
          label={intl.formatMessage({
            id: 'school.academic.homework.submission',
            defaultMessage: 'Submission',
          })}
          rules={[{ required: true }]}
          fieldProps={{ rows: 4, maxLength: 1000, showCount: true }}
        />
        <ProFormUploadButton
          name="fileUpload"
          label={intl.formatMessage({
            id: 'school.academic.homework.attachment',
            defaultMessage: 'Attachment',
          })}
          max={1}
          icon={<UploadOutlined />}
          fieldProps={{
            beforeUpload: () => false,
          }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default HomeworkSubmissions;
