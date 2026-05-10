import {
  CheckCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
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
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { uploadApi } from '@/utils/upload';
import type {
  DailyAssignmentServiceUpdateDailyAssignmentRequest,
  V1ClassSection,
  V1CreateDailyAssignmentRequest,
  V1DailyAssignment,
  V1DailyAssignmentFilter,
  V1EvaluateDailyAssignmentRequest,
  V1ListDailyAssignmentRequest,
  V1Staff,
  V1Student,
  V1Subject,
  V1SubjectGroup,
} from '@gosaas/api';
import {
  ClassSectionServiceApi,
  DailyAssignmentServiceApi,
  StaffServiceApi,
  StudentServiceApi,
  SubjectGroupServiceApi,
  SubjectServiceApi,
} from '@gosaas/api';
import { dateUtil, requestTransform } from '@gosaas/core';

const assignmentService = new DailyAssignmentServiceApi();
const classSectionService = new ClassSectionServiceApi();
const studentService = new StudentServiceApi();
const subjectGroupService = new SubjectGroupServiceApi();
const subjectService = new SubjectServiceApi();
const staffService = new StaffServiceApi();

type DailyAssignmentFormValues = V1CreateDailyAssignmentRequest &
  V1DailyAssignment & {
    fileUpload?: UploadFile[];
  };

type EvaluationFormValues = V1EvaluateDailyAssignmentRequest;

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const studentsByEnrollment = (items: V1Student[] = []) =>
  items.reduce<Record<string, V1Student>>((ret, item) => {
    if (item.enrollment?.id) {
      ret[item.enrollment.id] = item;
    }
    return ret;
  }, {});

const normalizeDate = (value?: string | null) => (value ? dateUtil(value).toISOString() : null);

const getUploadFile = (files?: UploadFile[]) => {
  const item = files?.[0];
  return item?.originFileObj as File | undefined;
};

const studentLabel = (student?: V1Student, fallback?: string) => {
  if (!student) {
    return fallback || '-';
  }
  return [
    student.admissionNo,
    [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
    student.enrollment?.rollNo,
  ]
    .filter(Boolean)
    .join(' - ');
};

const subjectLabel = (subject?: V1Subject, fallback?: string) =>
  subject
    ? [subject.code, subject.name].filter(Boolean).join(' - ') || subject.id
    : fallback || '-';

const staffLabel = (staff?: V1Staff, fallback?: string) =>
  staff
    ? [staff.employeeId, staff.firstName, staff.lastName].filter(Boolean).join(' ') || staff.id
    : fallback || '-';

const DailyAssignments: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const [formVisible, setFormVisible] = useState(false);
  const [evaluateVisible, setEvaluateVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<V1DailyAssignment>();
  const [evaluationRow, setEvaluationRow] = useState<V1DailyAssignment>();
  const [students, setStudents] = useState<Record<string, V1Student>>({});
  const [classSections, setClassSections] = useState<Record<string, V1ClassSection>>({});
  const [subjectGroups, setSubjectGroups] = useState<Record<string, V1SubjectGroup>>({});
  const [subjects, setSubjects] = useState<Record<string, V1Subject>>({});
  const [staff, setStaff] = useState<Record<string, V1Staff>>({});

  useEffect(() => {
    Promise.all([
      studentService.studentServiceListStudent2({
        body: { pageSize: 500, sort: ['admission_no'] },
      }),
      classSectionService.classSectionServiceListClassSection2({
        body: { pageSize: 300, sort: ['code'] },
      }),
      subjectGroupService.subjectGroupServiceListSubjectGroup2({
        body: { pageSize: 300, sort: ['name'] },
      }),
      subjectService.subjectServiceListSubject2({ body: { pageSize: 300, sort: ['name'] } }),
      staffService.staffServiceListStaff2({
        body: {
          pageSize: 300,
          sort: ['roleName', 'employeeId'],
          filter: { isActive: { $eq: true } },
        },
      }),
    ]).then(([studentResp, classSectionResp, subjectGroupResp, subjectResp, staffResp]) => {
      setStudents(studentsByEnrollment(studentResp.data.items));
      setClassSections(keyedById(classSectionResp.data.items));
      setSubjectGroups(keyedById(subjectGroupResp.data.items));
      setSubjects(keyedById(subjectResp.data.items));
      setStaff(keyedById(staffResp.data.items));
    });
  }, []);

  const studentOptions = useMemo(
    () =>
      Object.entries(students).map(([enrollmentId, student]) => ({
        label: studentLabel(student, enrollmentId),
        value: enrollmentId,
      })),
    [students],
  );

  const subjectGroupOptions = useMemo(
    () =>
      Object.values(subjectGroups).map((item) => ({
        label: item.name || item.id,
        value: item.id,
      })),
    [subjectGroups],
  );

  const subjectOptions = useMemo(
    () =>
      Object.values(subjects).map((item) => ({
        label: subjectLabel(item),
        value: item.id,
      })),
    [subjects],
  );

  const staffOptions = useMemo(
    () =>
      Object.values(staff).map((item) => ({
        label: staffLabel(item),
        value: item.id,
      })),
    [staff],
  );

  const handleSave = async (fields: DailyAssignmentFormValues) => {
    const file = getUploadFile(fields.fileUpload);
    const body = {
      studentEnrollmentId: fields.studentEnrollmentId!,
      subjectGroupId: fields.subjectGroupId!,
      subjectId: fields.subjectId!,
      title: fields.title!,
      description: fields.description,
      assignmentDate: normalizeDate(fields.assignmentDate),
    };
    const hide = message.loading(
      intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
    );
    try {
      let assignmentId = currentRow?.id;
      if (currentRow) {
        const updateBody: DailyAssignmentServiceUpdateDailyAssignmentRequest = {
          assignment: {
            id: currentRow.id!,
            ...body,
          },
        };
        await assignmentService.dailyAssignmentServiceUpdateDailyAssignment2({
          assignmentId: currentRow.id!,
          body: updateBody,
        });
      } else {
        const resp = await assignmentService.dailyAssignmentServiceCreateDailyAssignment({ body });
        assignmentId = resp.data.id;
      }
      if (file && assignmentId) {
        await uploadApi(`/v1/school/daily-assignment/${assignmentId}/upload`, { file });
      }
      hide();
      message.success(intl.formatMessage({ id: 'common.saved', defaultMessage: 'Saved' }));
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleEvaluate = async (fields: EvaluationFormValues) => {
    if (!evaluationRow?.id) {
      return false;
    }
    const hide = message.loading(
      intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
    );
    try {
      await assignmentService.dailyAssignmentServiceEvaluateDailyAssignment({
        id: evaluationRow.id,
        body: {
          id: evaluationRow.id,
          staffId: fields.staffId!,
          evaluationDate: normalizeDate(fields.evaluationDate),
          remark: fields.remark,
        },
      });
      hide();
      message.success(intl.formatMessage({ id: 'common.saved', defaultMessage: 'Saved' }));
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleRemove = async (record: V1DailyAssignment) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await assignmentService.dailyAssignmentServiceDeleteDailyAssignment({ id: record.id! });
      hide();
      message.success(
        intl.formatMessage({ id: 'common.deleted', defaultMessage: 'Delete Successfully' }),
      );
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleDownload = async (record: V1DailyAssignment) => {
    try {
      const resp = await assignmentService.dailyAssignmentServiceDownloadDailyAssignmentAttachment({
        id: record.id!,
      });
      const url = window.URL.createObjectURL(resp.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.file?.name || record.title || 'daily-assignment';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.academic.dailyAssignment.downloadFailed',
          defaultMessage: 'Download Failed',
        }),
      );
    }
  };

  const columns: ProColumnType<V1DailyAssignment>[] = [
    {
      title: <FormattedMessage id="school.academic.dailyAssignment.title" defaultMessage="Title" />,
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: <FormattedMessage id="school.student.student" defaultMessage="Student" />,
      dataIndex: 'studentEnrollmentId',
      render: (_, record) => studentLabel(students[record.studentEnrollmentId || '']),
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.dailyAssignment.classSection"
          defaultMessage="Class Section"
        />
      ),
      dataIndex: 'studentEnrollmentId',
      search: false,
      render: (_, record) => {
        const student = students[record.studentEnrollmentId || ''];
        const classSectionID = student?.enrollment?.classSectionId || '';
        return classSections[classSectionID]?.code || classSectionID || '-';
      },
    },
    {
      title: (
        <FormattedMessage id="school.academic.dailyAssignment.subject" defaultMessage="Subject" />
      ),
      dataIndex: 'subjectId',
      render: (_, record) => subjectLabel(subjects[record.subjectId || ''], record.subjectId),
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.dailyAssignment.assignmentDate"
          defaultMessage="Submission Date"
        />
      ),
      dataIndex: 'assignmentDate',
      valueType: 'date',
    },
    {
      title: (
        <FormattedMessage id="school.academic.dailyAssignment.status" defaultMessage="Status" />
      ),
      dataIndex: 'evaluationDate',
      search: false,
      render: (_, record) =>
        record.evaluationDate ? (
          <Tag color="success">
            <FormattedMessage
              id="school.academic.dailyAssignment.evaluated"
              defaultMessage="Evaluated"
            />
          </Tag>
        ) : (
          <Tag>
            <FormattedMessage
              id="school.academic.dailyAssignment.pending"
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
      valueType: 'date',
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.dailyAssignment.evaluatedBy"
          defaultMessage="Evaluated By"
        />
      ),
      dataIndex: 'evaluatedByStaffId',
      render: (_, record) =>
        staffLabel(staff[record.evaluatedByStaffId || ''], record.evaluatedByStaffId),
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.dailyAssignment.attachment"
          defaultMessage="Attachment"
        />
      ),
      dataIndex: ['file', 'name'],
      ellipsis: true,
      search: false,
      render: (_, record) => record.file?.name || '-',
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      key: 'option',
      valueType: 'option',
      width: 260,
      render: (_, record) => {
        const locked = Boolean(record.evaluatedByStaffId);
        return (
          <Space size="small" wrap>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              disabled={locked}
              onClick={() => {
                setCurrentRow(record);
                setFormVisible(true);
              }}
            >
              <FormattedMessage id="common.edit" defaultMessage="Edit" />
            </Button>
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              disabled={!record.file?.id}
              onClick={() => handleDownload(record)}
            >
              <FormattedMessage
                id="school.academic.dailyAssignment.download"
                defaultMessage="Download"
              />
            </Button>
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setEvaluationRow(record);
                setEvaluateVisible(true);
              }}
            >
              <FormattedMessage
                id="school.academic.dailyAssignment.evaluate"
                defaultMessage="Evaluate"
              />
            </Button>
            <Popconfirm
              title={intl.formatMessage({ id: 'common.delete', defaultMessage: 'Delete' })}
              onConfirm={() => handleRemove(record)}
              disabled={locked}
            >
              <Button type="link" size="small" danger disabled={locked} icon={<DeleteOutlined />}>
                <FormattedMessage id="common.delete" defaultMessage="Delete" />
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const getData = requestTransform<V1DailyAssignment, V1DailyAssignmentFilter>(
    async (req: V1ListDailyAssignmentRequest) => {
      const resp = await assignmentService.dailyAssignmentServiceListDailyAssignment2({
        body: req,
      });
      return resp.data;
    },
  );

  return (
    <PageContainer>
      <ProTable<V1DailyAssignment>
        actionRef={actionRef}
        rowKey="id"
        pagination={{ defaultPageSize: 10 }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRow(undefined);
              setFormVisible(true);
            }}
          >
            <PlusOutlined />{' '}
            <FormattedMessage
              id="school.academic.dailyAssignment.create"
              defaultMessage="New Daily Assignment"
            />
          </Button>,
        ]}
        type="table"
        request={getData}
        columns={columns}
      />
      <DrawerForm<DailyAssignmentFormValues>
        title={intl.formatMessage({
          id: currentRow
            ? 'school.academic.dailyAssignment.edit'
            : 'school.academic.dailyAssignment.create',
          defaultMessage: currentRow ? 'Edit Daily Assignment' : 'New Daily Assignment',
        })}
        open={formVisible}
        drawerProps={{
          destroyOnClose: true,
          onClose: () => {
            setCurrentRow(undefined);
            setFormVisible(false);
          },
        }}
        initialValues={currentRow}
        onOpenChange={setFormVisible}
        onFinish={async (values) => {
          const ok = await handleSave(values);
          if (ok) {
            setCurrentRow(undefined);
          }
          return ok;
        }}
      >
        <ProFormText
          name="title"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.title',
            defaultMessage: 'Title',
          })}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="studentEnrollmentId"
          label={intl.formatMessage({ id: 'school.student.student', defaultMessage: 'Student' })}
          rules={[{ required: true }]}
          options={studentOptions}
          showSearch
        />
        <ProFormSelect
          name="subjectGroupId"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.subjectGroup',
            defaultMessage: 'Subject Group',
          })}
          rules={[{ required: true }]}
          options={subjectGroupOptions}
          showSearch
        />
        <ProFormSelect
          name="subjectId"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.subject',
            defaultMessage: 'Subject',
          })}
          rules={[{ required: true }]}
          options={subjectOptions}
          showSearch
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
      </DrawerForm>
      <ModalForm<EvaluationFormValues>
        title={intl.formatMessage({
          id: 'school.academic.dailyAssignment.evaluate',
          defaultMessage: 'Evaluate Daily Assignment',
        })}
        open={evaluateVisible}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setEvaluationRow(undefined);
            setEvaluateVisible(false);
          },
        }}
        initialValues={{
          ...evaluationRow,
          staffId: evaluationRow?.evaluatedByStaffId,
        }}
        onOpenChange={setEvaluateVisible}
        onFinish={async (values) => {
          const ok = await handleEvaluate(values);
          if (ok) {
            setEvaluationRow(undefined);
          }
          return ok;
        }}
      >
        <ProFormSelect
          name="staffId"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.evaluatedBy',
            defaultMessage: 'Evaluated By',
          })}
          rules={[{ required: true }]}
          options={staffOptions}
          showSearch
        />
        <ProFormDatePicker
          name="evaluationDate"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.evaluationDate',
            defaultMessage: 'Evaluation Date',
          })}
          rules={[{ required: true }]}
        />
        <ProFormTextArea
          name="remark"
          label={intl.formatMessage({
            id: 'school.academic.dailyAssignment.remark',
            defaultMessage: 'Remark',
          })}
          fieldProps={{ rows: 4, maxLength: 1000, showCount: true }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default DailyAssignments;
