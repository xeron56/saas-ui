import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ProColumnType } from '@ant-design/pro-components';
import {
  DrawerForm,
  ModalForm,
  PageContainer,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
  ProTable,
} from '@ant-design/pro-components';
import { getRequestInstance } from '@@/plugin-request/request';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Form, Popconfirm, Space, Tabs, Tag, Typography, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { uploadApi } from '@/utils/upload';
import type {
  V1CreateMyDailyAssignmentRequest,
  V1DailyAssignment,
  V1HomeworkStudent,
  V1MyDailyAssignmentStudentOptions,
  V1MyHomework,
  V1UpdateMyDailyAssignmentRequest,
} from '@gosaas/api';
import { DailyAssignmentServiceApi, HomeworkServiceApi } from '@gosaas/api';
import { dateUtil } from '@gosaas/core';

const homeworkService = new HomeworkServiceApi();
const dailyAssignmentService = new DailyAssignmentServiceApi();

type SubmissionFormValues = {
  message: string;
  fileUpload?: UploadFile[];
};

type DailyUploadFormValues = {
  fileUpload?: UploadFile[];
};

type DailyEditFormValues = Pick<
  V1UpdateMyDailyAssignmentRequest,
  'title' | 'description' | 'assignmentDate'
>;

type DailyCreateFormValues = Pick<
  V1CreateMyDailyAssignmentRequest,
  'studentId' | 'subjectGroupId' | 'subjectId' | 'title' | 'description' | 'assignmentDate'
> & {
  fileUpload?: UploadFile[];
};

const getUploadFile = (files?: UploadFile[]) => {
  const item = files?.[0];
  return item?.originFileObj as File | undefined;
};

const downloadBlob = async (url: string, filename: string) => {
  const resp = await getRequestInstance().request<Blob>({
    method: 'GET',
    url,
    responseType: 'blob',
  });
  const objectUrl = window.URL.createObjectURL(resp.data);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};

const studentName = (row?: V1HomeworkStudent) =>
  [row?.admissionNo, [row?.firstName, row?.middleName, row?.lastName].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(' - ') ||
  row?.studentId ||
  '-';

const dailyStudentName = (row?: V1MyDailyAssignmentStudentOptions) =>
  [
    row?.admissionNo,
    row?.rollNo,
    [row?.firstName, row?.middleName, row?.lastName].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(' - ') ||
  row?.studentId ||
  '-';

const formatDate = (value?: string | null) => (value ? dateUtil(value).format('YYYY-MM-DD') : '-');
const normalizeDate = (value?: string | null) => (value ? dateUtil(value).toISOString() : null);

const homeworkSubmissionClosed = (row?: V1MyHomework) =>
  Boolean(
    row?.homework?.submitDate &&
      dateUtil(row.homework.submitDate).endOf('day').isBefore(dateUtil()),
  );

const homeworkStatus = (row: V1MyHomework) => {
  if (row.student?.evaluation) {
    return 'evaluated';
  }
  if (row.student?.submission) {
    return 'submitted';
  }
  if (homeworkSubmissionClosed(row)) {
    return 'overdue';
  }
  return 'pending';
};

const statusTag = (status: string) => {
  if (status === 'evaluated') {
    return (
      <Tag color="green">
        <FormattedMessage id="school.student.myAssignments.evaluated" defaultMessage="Evaluated" />
      </Tag>
    );
  }
  if (status === 'submitted') {
    return (
      <Tag color="blue">
        <FormattedMessage id="school.student.myAssignments.submitted" defaultMessage="Submitted" />
      </Tag>
    );
  }
  if (status === 'overdue') {
    return (
      <Tag color="red">
        <FormattedMessage id="school.student.myAssignments.overdue" defaultMessage="Overdue" />
      </Tag>
    );
  }
  return (
    <Tag>
      <FormattedMessage id="school.student.myAssignments.pending" defaultMessage="Pending" />
    </Tag>
  );
};

const MyAssignments: React.FC = () => {
  const intl = useIntl();
  const [dailyCreateForm] = Form.useForm<DailyCreateFormValues>();
  const [homework, setHomework] = useState<V1MyHomework[]>([]);
  const [dailyAssignments, setDailyAssignments] = useState<V1DailyAssignment[]>([]);
  const [dailyOptions, setDailyOptions] = useState<V1MyDailyAssignmentStudentOptions[]>([]);
  const [loading, setLoading] = useState(false);
  const [submissionRow, setSubmissionRow] = useState<V1MyHomework>();
  const [dailyCreateOpen, setDailyCreateOpen] = useState(false);
  const [dailyCreateStudentId, setDailyCreateStudentId] = useState<string>();
  const [dailyCreateSubjectGroupId, setDailyCreateSubjectGroupId] = useState<string>();
  const [dailyEditRow, setDailyEditRow] = useState<V1DailyAssignment>();
  const [dailyUploadRow, setDailyUploadRow] = useState<V1DailyAssignment>();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [homeworkResp, dailyResp, dailyOptionsResp] = await Promise.all([
        homeworkService.homeworkServiceListMyHomework({ query: { pageSize: 200 } }),
        dailyAssignmentService.dailyAssignmentServiceListMyDailyAssignment({
          query: { pageSize: 200 },
        }),
        dailyAssignmentService.dailyAssignmentServiceListMyDailyAssignmentOptions(),
      ]);
      setHomework(homeworkResp.data.items || []);
      setDailyAssignments(dailyResp.data.items || []);
      setDailyOptions(dailyOptionsResp.data.students || []);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.student.myAssignments.loadFailed',
          defaultMessage: 'Failed to load assignments.',
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [intl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dailyCreateStudent = useMemo(
    () => dailyOptions.find((item) => item.studentId === dailyCreateStudentId),
    [dailyCreateStudentId, dailyOptions],
  );

  const dailyCreateSubjectGroup = useMemo(
    () =>
      dailyCreateStudent?.subjectGroups?.find(
        (item) => item.subjectGroupId === dailyCreateSubjectGroupId,
      ),
    [dailyCreateStudent, dailyCreateSubjectGroupId],
  );

  const dailyStudentOptions = useMemo(
    () =>
      dailyOptions.map((item) => ({
        label: dailyStudentName(item),
        value: item.studentId,
      })),
    [dailyOptions],
  );

  const dailySubjectGroupOptions = useMemo(
    () =>
      (dailyCreateStudent?.subjectGroups || []).map((item) => ({
        label: item.name || item.subjectGroupId || '-',
        value: item.subjectGroupId,
      })),
    [dailyCreateStudent],
  );

  const dailySubjectOptions = useMemo(
    () =>
      (dailyCreateSubjectGroup?.subjects || []).map((item) => ({
        label: [item.code, item.name].filter(Boolean).join(' - ') || item.subjectId || '-',
        value: item.subjectId,
      })),
    [dailyCreateSubjectGroup],
  );

  const handleSubmit = useCallback(
    async (values: SubmissionFormValues) => {
      const studentId = submissionRow?.student?.studentId;
      const homeworkId = submissionRow?.homework?.id;
      const messageText = values.message?.trim();
      if (!studentId || !homeworkId || !messageText) {
        return false;
      }
      const file = getUploadFile(values.fileUpload);
      const resp = await homeworkService.homeworkServiceSubmitMyHomework({
        studentId,
        homeworkId,
        body: { studentId, homeworkId, message: messageText },
      });
      const submissionId = resp.data.student?.submission?.id;
      if (file && submissionId) {
        await uploadApi(`/v1/school/me/homework/submission/${submissionId}/upload`, { file });
      }
      message.success(
        intl.formatMessage({
          id: 'school.student.myAssignments.submitSuccess',
          defaultMessage: 'Homework submitted.',
        }),
      );
      setSubmissionRow(undefined);
      await loadData();
      return true;
    },
    [intl, loadData, submissionRow],
  );

  const handleDailyCreate = useCallback(
    async (values: DailyCreateFormValues) => {
      if (!values.studentId || !values.subjectGroupId || !values.subjectId || !values.title) {
        return false;
      }
      const file = getUploadFile(values.fileUpload);
      const resp = await dailyAssignmentService.dailyAssignmentServiceCreateMyDailyAssignment({
        studentId: values.studentId,
        body: {
          studentId: values.studentId,
          subjectGroupId: values.subjectGroupId,
          subjectId: values.subjectId,
          title: values.title,
          description: values.description,
          assignmentDate: normalizeDate(values.assignmentDate),
        },
      });
      if (file && resp.data.id) {
        await uploadApi(`/v1/school/me/daily-assignment/${resp.data.id}/upload`, { file });
      }
      message.success(
        intl.formatMessage({
          id: 'school.academic.dailyAssignment.created',
          defaultMessage: 'Created',
        }),
      );
      setDailyCreateOpen(false);
      setDailyCreateStudentId(undefined);
      setDailyCreateSubjectGroupId(undefined);
      dailyCreateForm.resetFields();
      await loadData();
      return true;
    },
    [dailyCreateForm, intl, loadData],
  );

  const handleDailyUpload = useCallback(
    async (values: DailyUploadFormValues) => {
      const file = getUploadFile(values.fileUpload);
      if (!dailyUploadRow?.id || !file) {
        return false;
      }
      await uploadApi(`/v1/school/me/daily-assignment/${dailyUploadRow.id}/upload`, { file });
      message.success(
        intl.formatMessage({
          id: 'school.student.myAssignments.uploadSuccess',
          defaultMessage: 'Attachment uploaded.',
        }),
      );
      setDailyUploadRow(undefined);
      await loadData();
      return true;
    },
    [dailyUploadRow, intl, loadData],
  );

  const handleDailySave = useCallback(
    async (values: DailyEditFormValues) => {
      if (!dailyEditRow?.id || !dailyEditRow.subjectGroupId || !dailyEditRow.subjectId) {
        return false;
      }
      await dailyAssignmentService.dailyAssignmentServiceUpdateMyDailyAssignment2({
        id: dailyEditRow.id,
        body: {
          id: dailyEditRow.id,
          subjectGroupId: dailyEditRow.subjectGroupId,
          subjectId: dailyEditRow.subjectId,
          title: values.title,
          description: values.description,
          assignmentDate: normalizeDate(values.assignmentDate),
        },
      });
      message.success(intl.formatMessage({ id: 'common.saved', defaultMessage: 'Saved' }));
      setDailyEditRow(undefined);
      await loadData();
      return true;
    },
    [dailyEditRow, intl, loadData],
  );

  const handleDailyRemove = useCallback(
    async (row: V1DailyAssignment) => {
      if (!row.id) {
        return false;
      }
      const hide = message.loading(
        intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
      );
      try {
        await dailyAssignmentService.dailyAssignmentServiceDeleteMyDailyAssignment({ id: row.id });
        hide();
        message.success(
          intl.formatMessage({ id: 'common.deleted', defaultMessage: 'Delete Successfully' }),
        );
        await loadData();
        return true;
      } catch (error) {
        hide();
        return false;
      }
    },
    [intl, loadData],
  );

  const handleHomeworkDownload = useCallback(
    async (row: V1MyHomework) => {
      if (!row.homework?.id) {
        return;
      }
      try {
        await downloadBlob(
          `/v1/school/me/homework/${row.homework.id}/download`,
          row.homework.file?.name || row.homework.title || 'homework',
        );
      } catch (error) {
        message.error(
          intl.formatMessage({
            id: 'school.academic.homework.downloadFailed',
            defaultMessage: 'Download Failed',
          }),
        );
      }
    },
    [intl],
  );

  const handleSubmissionDownload = useCallback(
    async (row: V1MyHomework) => {
      const submission = row.student?.submission;
      if (!submission?.id) {
        return;
      }
      try {
        await downloadBlob(
          `/v1/school/me/homework/submission/${submission.id}/download`,
          submission.file?.name || 'submission',
        );
      } catch (error) {
        message.error(
          intl.formatMessage({
            id: 'school.academic.homework.downloadFailed',
            defaultMessage: 'Download Failed',
          }),
        );
      }
    },
    [intl],
  );

  const handleDailyDownload = useCallback(
    async (row: V1DailyAssignment) => {
      if (!row.id) {
        return;
      }
      try {
        await downloadBlob(
          `/v1/school/me/daily-assignment/${row.id}/download`,
          row.file?.name || row.title || 'daily-assignment',
        );
      } catch (error) {
        message.error(
          intl.formatMessage({
            id: 'school.academic.dailyAssignment.downloadFailed',
            defaultMessage: 'Download Failed',
          }),
        );
      }
    },
    [intl],
  );

  const homeworkColumns = useMemo<ProColumnType<V1MyHomework>[]>(
    () => [
      {
        title: <FormattedMessage id="school.student.name" defaultMessage="Student" />,
        dataIndex: 'student',
        render: (_, row) => studentName(row.student),
      },
      {
        title: <FormattedMessage id="school.academic.homework.title" defaultMessage="Homework" />,
        dataIndex: ['homework', 'title'],
        render: (_, row) => (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>
              {row.homework?.title || row.homework?.id || '-'}
            </Typography.Text>
            {row.homework?.description ? (
              <Typography.Text type="secondary">{row.homework.description}</Typography.Text>
            ) : null}
          </Space>
        ),
      },
      {
        title: (
          <FormattedMessage
            id="school.academic.homework.homeworkDate"
            defaultMessage="Assigned Date"
          />
        ),
        dataIndex: ['homework', 'homeworkDate'],
        width: 140,
        render: (_, row) => formatDate(row.homework?.homeworkDate),
      },
      {
        title: (
          <FormattedMessage id="school.academic.homework.submitDate" defaultMessage="Due Date" />
        ),
        dataIndex: ['homework', 'submitDate'],
        width: 140,
        render: (_, row) => formatDate(row.homework?.submitDate),
      },
      {
        title: <FormattedMessage id="school.academic.homework.status" defaultMessage="Status" />,
        dataIndex: 'status',
        width: 130,
        render: (_, row) => statusTag(homeworkStatus(row)),
      },
      {
        title: (
          <FormattedMessage id="school.academic.homework.submission" defaultMessage="Submission" />
        ),
        dataIndex: 'submission',
        render: (_, row) => row.student?.submission?.message || '-',
      },
      {
        title: <FormattedMessage id="school.academic.homework.marks" defaultMessage="Marks" />,
        dataIndex: 'marks',
        width: 120,
        render: (_, row) =>
          row.student?.evaluation
            ? `${row.student.evaluation.marks || 0}/${row.homework?.maxMarks || 0}`
            : '-',
      },
      {
        title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
        valueType: 'option',
        width: 260,
        render: (_, row) => (
          <Space size="small" wrap>
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              disabled={!row.homework?.file?.id}
              onClick={() => handleHomeworkDownload(row)}
            >
              <FormattedMessage
                id="school.student.myAssignments.assignmentFile"
                defaultMessage="Assignment"
              />
            </Button>
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              disabled={!row.student?.submission?.file?.id}
              onClick={() => handleSubmissionDownload(row)}
            >
              <FormattedMessage
                id="school.student.myAssignments.submissionFile"
                defaultMessage="Submission File"
              />
            </Button>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              disabled={Boolean(row.student?.evaluation) || homeworkSubmissionClosed(row)}
              onClick={() => setSubmissionRow(row)}
            >
              <FormattedMessage
                id="school.student.myAssignments.submitHomework"
                defaultMessage="Submit"
              />
            </Button>
          </Space>
        ),
      },
    ],
    [handleHomeworkDownload, handleSubmissionDownload],
  );

  const dailyColumns = useMemo<ProColumnType<V1DailyAssignment>[]>(
    () => [
      {
        title: (
          <FormattedMessage id="school.academic.dailyAssignment.title" defaultMessage="Title" />
        ),
        dataIndex: 'title',
        render: (_, row) => (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{row.title || row.id || '-'}</Typography.Text>
            {row.description ? (
              <Typography.Text type="secondary">{row.description}</Typography.Text>
            ) : null}
          </Space>
        ),
      },
      {
        title: (
          <FormattedMessage
            id="school.academic.dailyAssignment.subjectGroup"
            defaultMessage="Subject Group"
          />
        ),
        dataIndex: 'subjectGroupId',
        ellipsis: true,
      },
      {
        title: (
          <FormattedMessage id="school.academic.dailyAssignment.subject" defaultMessage="Subject" />
        ),
        dataIndex: 'subjectId',
        ellipsis: true,
      },
      {
        title: (
          <FormattedMessage
            id="school.academic.dailyAssignment.assignmentDate"
            defaultMessage="Submission Date"
          />
        ),
        dataIndex: 'assignmentDate',
        width: 150,
        render: (_, row) => formatDate(row.assignmentDate),
      },
      {
        title: (
          <FormattedMessage id="school.academic.dailyAssignment.status" defaultMessage="Status" />
        ),
        dataIndex: 'status',
        width: 130,
        render: (_, row) =>
          row.evaluatedByStaffId ? (
            <Tag color="green">
              <FormattedMessage
                id="school.student.myAssignments.evaluated"
                defaultMessage="Evaluated"
              />
            </Tag>
          ) : (
            <Tag>
              <FormattedMessage
                id="school.student.myAssignments.pending"
                defaultMessage="Pending"
              />
            </Tag>
          ),
      },
      {
        title: (
          <FormattedMessage
            id="school.academic.dailyAssignment.evaluationDate"
            defaultMessage="Evaluation Date"
          />
        ),
        dataIndex: 'evaluationDate',
        width: 150,
        render: (_, row) => formatDate(row.evaluationDate),
      },
      {
        title: (
          <FormattedMessage id="school.academic.dailyAssignment.remark" defaultMessage="Remark" />
        ),
        dataIndex: 'remark',
        render: (_, row) => row.remark || '-',
      },
      {
        title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
        valueType: 'option',
        width: 260,
        render: (_, row) => (
          <Space size="small" wrap>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              disabled={Boolean(row.evaluatedByStaffId)}
              onClick={() => setDailyEditRow(row)}
            >
              <FormattedMessage id="common.edit" defaultMessage="Edit" />
            </Button>
            <Button
              type="link"
              size="small"
              icon={<UploadOutlined />}
              disabled={Boolean(row.evaluatedByStaffId)}
              onClick={() => setDailyUploadRow(row)}
            >
              <FormattedMessage id="school.student.myAssignments.upload" defaultMessage="Upload" />
            </Button>
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              disabled={!row.file?.id}
              onClick={() => handleDailyDownload(row)}
            >
              <FormattedMessage
                id="school.academic.dailyAssignment.download"
                defaultMessage="Download"
              />
            </Button>
            <Popconfirm
              title={intl.formatMessage({ id: 'common.delete', defaultMessage: 'Delete' })}
              onConfirm={() => handleDailyRemove(row)}
              disabled={Boolean(row.evaluatedByStaffId)}
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={Boolean(row.evaluatedByStaffId)}
              >
                <FormattedMessage id="common.delete" defaultMessage="Delete" />
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDailyDownload, handleDailyRemove, intl],
  );

  return (
    <PageContainer
      extra={[
        <Button
          key="createDailyAssignment"
          type="primary"
          icon={<PlusOutlined />}
          disabled={!dailyOptions.length}
          onClick={() => setDailyCreateOpen(true)}
        >
          <FormattedMessage
            id="school.academic.dailyAssignment.create"
            defaultMessage="New Daily Assignment"
          />
        </Button>,
        <Button key="reload" icon={<ReloadOutlined />} onClick={loadData}>
          <FormattedMessage id="school.student.myAssignments.refresh" defaultMessage="Refresh" />
        </Button>,
      ]}
    >
      <Tabs
        items={[
          {
            key: 'homework',
            label: (
              <FormattedMessage
                id="school.student.myAssignments.homework"
                defaultMessage="Homework"
              />
            ),
            children: (
              <ProTable<V1MyHomework>
                rowKey={(row) =>
                  `${row.homework?.id || ''}:${row.student?.studentEnrollmentId || ''}`
                }
                search={false}
                loading={loading}
                dataSource={homework}
                columns={homeworkColumns}
                pagination={{ defaultPageSize: 20 }}
                options={false}
              />
            ),
          },
          {
            key: 'dailyAssignments',
            label: (
              <FormattedMessage
                id="school.student.myAssignments.dailyAssignments"
                defaultMessage="Daily Assignments"
              />
            ),
            children: (
              <ProTable<V1DailyAssignment>
                rowKey="id"
                search={false}
                loading={loading}
                dataSource={dailyAssignments}
                columns={dailyColumns}
                pagination={{ defaultPageSize: 20 }}
                options={false}
              />
            ),
          },
        ]}
      />
      <ModalForm<SubmissionFormValues>
        title={intl.formatMessage({
          id: 'school.student.myAssignments.submitHomework',
          defaultMessage: 'Submit Homework',
        })}
        open={Boolean(submissionRow)}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setSubmissionRow(undefined),
        }}
        initialValues={{ message: submissionRow?.student?.submission?.message }}
        onFinish={handleSubmit}
      >
        <ProFormTextArea
          name="message"
          label={intl.formatMessage({
            id: 'school.academic.homework.submission',
            defaultMessage: 'Submission',
          })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'school.student.myAssignments.submissionRequired',
                defaultMessage: 'Enter a submission message.',
              }),
            },
          ]}
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
      <ModalForm<DailyCreateFormValues>
        form={dailyCreateForm}
        title={intl.formatMessage({
          id: 'school.academic.dailyAssignment.create',
          defaultMessage: 'New Daily Assignment',
        })}
        open={dailyCreateOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setDailyCreateOpen(false);
            setDailyCreateStudentId(undefined);
            setDailyCreateSubjectGroupId(undefined);
            dailyCreateForm.resetFields();
          },
        }}
        onFinish={handleDailyCreate}
      >
        <ProFormSelect
          name="studentId"
          label={intl.formatMessage({ id: 'school.student.name', defaultMessage: 'Student' })}
          options={dailyStudentOptions}
          rules={[{ required: true }]}
          fieldProps={{
            showSearch: true,
            optionFilterProp: 'label',
            onChange: (value) => {
              setDailyCreateStudentId(value);
              setDailyCreateSubjectGroupId(undefined);
              dailyCreateForm.setFieldsValue({
                subjectGroupId: undefined,
                subjectId: undefined,
              });
            },
          }}
        />
        <ProFormSelect
          name="subjectGroupId"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.subjectGroup',
            defaultMessage: 'Subject Group',
          })}
          options={dailySubjectGroupOptions}
          disabled={!dailyCreateStudentId}
          rules={[{ required: true }]}
          fieldProps={{
            showSearch: true,
            optionFilterProp: 'label',
            onChange: (value) => {
              setDailyCreateSubjectGroupId(value);
              dailyCreateForm.setFieldsValue({ subjectId: undefined });
            },
          }}
        />
        <ProFormSelect
          name="subjectId"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.subject',
            defaultMessage: 'Subject',
          })}
          options={dailySubjectOptions}
          disabled={!dailyCreateSubjectGroupId}
          rules={[{ required: true }]}
          fieldProps={{
            showSearch: true,
            optionFilterProp: 'label',
          }}
        />
        <ProFormText
          name="title"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.title',
            defaultMessage: 'Title',
          })}
          rules={[{ required: true }]}
        />
        <ProFormDatePicker
          name="assignmentDate"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.assignmentDate',
            defaultMessage: 'Submission Date',
          })}
          rules={[{ required: true }]}
        />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.description',
            defaultMessage: 'Description',
          })}
          fieldProps={{ rows: 4, maxLength: 1000, showCount: true }}
        />
        <ProFormUploadButton
          name="fileUpload"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.attachment',
            defaultMessage: 'Attachment',
          })}
          max={1}
          icon={<UploadOutlined />}
          fieldProps={{
            beforeUpload: () => false,
          }}
        />
      </ModalForm>
      <DrawerForm<DailyEditFormValues>
        title={intl.formatMessage({
          id: 'school.academic.dailyAssignment.edit',
          defaultMessage: 'Edit Daily Assignment',
        })}
        open={Boolean(dailyEditRow)}
        drawerProps={{
          destroyOnClose: true,
          onClose: () => setDailyEditRow(undefined),
        }}
        initialValues={dailyEditRow}
        onOpenChange={(open) => {
          if (!open) {
            setDailyEditRow(undefined);
          }
        }}
        onFinish={handleDailySave}
      >
        <ProFormText
          name="title"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.title',
            defaultMessage: 'Title',
          })}
          rules={[{ required: true }]}
        />
        <ProFormDatePicker
          name="assignmentDate"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.assignmentDate',
            defaultMessage: 'Submission Date',
          })}
          rules={[{ required: true }]}
        />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.description',
            defaultMessage: 'Description',
          })}
          fieldProps={{ rows: 4, maxLength: 1000, showCount: true }}
        />
      </DrawerForm>
      <ModalForm<DailyUploadFormValues>
        title={intl.formatMessage({
          id: 'school.student.myAssignments.uploadAttachment',
          defaultMessage: 'Upload Attachment',
        })}
        open={Boolean(dailyUploadRow)}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setDailyUploadRow(undefined),
        }}
        onFinish={handleDailyUpload}
      >
        <ProFormUploadButton
          name="fileUpload"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.attachment',
            defaultMessage: 'Attachment',
          })}
          max={1}
          icon={<UploadOutlined />}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'school.student.myAssignments.attachmentRequired',
                defaultMessage: 'Select an attachment.',
              }),
            },
          ]}
          fieldProps={{
            beforeUpload: () => false,
          }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default MyAssignments;
