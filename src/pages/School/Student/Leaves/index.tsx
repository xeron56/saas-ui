import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import {
  DrawerForm,
  PageContainer,
  ProFormDatePicker,
  ProFormSelect,
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
  StudentLeaveServiceUpdateStudentLeaveRequest,
  V1CreateStudentLeaveRequest,
  V1ListStudentLeaveRequest,
  V1Student,
  V1StudentLeave,
  V1StudentLeaveFilter,
  V1StudentLeaveStatus,
} from '@gosaas/api';
import { StudentLeaveServiceApi, StudentServiceApi } from '@gosaas/api';
import { dateUtil, requestTransform } from '@gosaas/core';

const leaveService = new StudentLeaveServiceApi();
const studentService = new StudentServiceApi();

type LeaveFormValues = V1CreateStudentLeaveRequest &
  V1StudentLeave & {
    fileUpload?: UploadFile[];
  };

const statusMeta: Record<
  Exclude<V1StudentLeaveStatus, 'STUDENT_LEAVE_STATUS_UNSPECIFIED'>,
  { color: string; label: string; messageId: string }
> = {
  STUDENT_LEAVE_STATUS_PENDING: {
    color: 'processing',
    label: 'Pending',
    messageId: 'school.student.leave.pending',
  },
  STUDENT_LEAVE_STATUS_APPROVED: {
    color: 'success',
    label: 'Approved',
    messageId: 'school.student.leave.approved',
  },
  STUDENT_LEAVE_STATUS_DISAPPROVED: {
    color: 'error',
    label: 'Disapproved',
    messageId: 'school.student.leave.disapproved',
  },
};

const studentLabel = (student?: V1Student) => {
  if (!student) {
    return '-';
  }
  return [student.admissionNo, [student.firstName, student.lastName].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(' - ');
};

const normalizeDate = (value?: string | null) => (value ? dateUtil(value).toISOString() : null);

const getUploadFile = (files?: UploadFile[]) => {
  const item = files?.[0];
  return item?.originFileObj as File | undefined;
};

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<V1StudentLeave | undefined>();
  const [students, setStudents] = useState<Record<string, V1Student>>({});
  const intl = useIntl();

  const loadStudents = async (search?: string) => {
    const resp = await studentService.studentServiceListStudent2({
      body: { pageSize: 100, search, sort: ['admission_no'] },
    });
    return resp.data.items || [];
  };

  useEffect(() => {
    loadStudents().then((items) => {
      setStudents(
        items.reduce<Record<string, V1Student>>((ret, item) => {
          if (item.enrollment?.id) {
            ret[item.enrollment.id] = item;
          }
          return ret;
        }, {}),
      );
    });
  }, []);

  const studentOptions = useMemo(
    () =>
      Object.entries(students).map(([enrollmentId, student]) => ({
        label: studentLabel(student),
        value: enrollmentId,
      })),
    [students],
  );

  const handleSave = async (fields: LeaveFormValues) => {
    const file = getUploadFile(fields.fileUpload);
    const body = {
      studentEnrollmentId: fields.studentEnrollmentId!,
      fromDate: normalizeDate(fields.fromDate),
      toDate: normalizeDate(fields.toDate),
      applyDate: normalizeDate(fields.applyDate),
      reason: fields.reason,
      requestType: fields.requestType,
    };
    const hide = message.loading(
      intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
    );
    try {
      let leaveID = currentRow?.id;
      if (currentRow) {
        const updateBody: StudentLeaveServiceUpdateStudentLeaveRequest = {
          leave: {
            id: currentRow.id!,
            ...body,
          },
        };
        await leaveService.studentLeaveServiceUpdateStudentLeave2({
          leaveId: currentRow.id!,
          body: updateBody,
        });
      } else {
        const resp = await leaveService.studentLeaveServiceCreateStudentLeave({ body });
        leaveID = resp.data.id;
      }
      if (file && leaveID) {
        await uploadApi(`/v1/school/student/leave/${leaveID}/upload`, { file });
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

  const handleDownload = async (record: V1StudentLeave) => {
    try {
      const resp = await leaveService.studentLeaveServiceDownloadStudentLeaveAttachment({
        id: record.id!,
      });
      const url = window.URL.createObjectURL(resp.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.file?.name || 'leave-attachment';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.student.leave.downloadFailed',
          defaultMessage: 'Download Failed',
        }),
      );
    }
  };

  const handleStatus = async (record: V1StudentLeave, status: V1StudentLeaveStatus) => {
    const hide = message.loading(
      intl.formatMessage({
        id: 'school.student.leave.updatingStatus',
        defaultMessage: 'Updating...',
      }),
    );
    try {
      await leaveService.studentLeaveServiceUpdateStudentLeaveStatus({
        id: record.id!,
        body: {
          id: record.id!,
          status,
        },
      });
      hide();
      message.success(
        intl.formatMessage({
          id: 'school.student.leave.statusUpdated',
          defaultMessage: 'Status updated',
        }),
      );
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleRemove = async (record: V1StudentLeave) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await leaveService.studentLeaveServiceDeleteStudentLeave({ id: record.id! });
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

  const columns: ProColumnType<V1StudentLeave>[] = [
    {
      title: <FormattedMessage id="school.student.student" defaultMessage="Student" />,
      dataIndex: 'studentEnrollmentId',
      valueType: 'text',
      ellipsis: true,
      render: (_, entity) => studentLabel(students[entity.studentEnrollmentId || '']),
    },
    {
      title: <FormattedMessage id="school.student.leave.fromDate" defaultMessage="From Date" />,
      dataIndex: 'fromDate',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="school.student.leave.toDate" defaultMessage="To Date" />,
      dataIndex: 'toDate',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="school.student.leave.applyDate" defaultMessage="Apply Date" />,
      dataIndex: 'applyDate',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="school.student.leave.reason" defaultMessage="Reason" />,
      dataIndex: 'reason',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: (
        <FormattedMessage id="school.student.leave.requestType" defaultMessage="Request Type" />
      ),
      dataIndex: 'requestType',
      valueType: 'select',
      valueEnum: {
        student: {
          text: (
            <FormattedMessage
              id="school.student.leave.requestType.student"
              defaultMessage="Student"
            />
          ),
        },
        staff: {
          text: (
            <FormattedMessage id="school.student.leave.requestType.staff" defaultMessage="Staff" />
          ),
        },
      },
    },
    {
      title: <FormattedMessage id="school.student.leave.status" defaultMessage="Status" />,
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        STUDENT_LEAVE_STATUS_PENDING: {
          text: <FormattedMessage id="school.student.leave.pending" defaultMessage="Pending" />,
        },
        STUDENT_LEAVE_STATUS_APPROVED: {
          text: <FormattedMessage id="school.student.leave.approved" defaultMessage="Approved" />,
        },
        STUDENT_LEAVE_STATUS_DISAPPROVED: {
          text: (
            <FormattedMessage id="school.student.leave.disapproved" defaultMessage="Disapproved" />
          ),
        },
      },
      render: (_, entity) => {
        const meta =
          entity.status && entity.status !== 'STUDENT_LEAVE_STATUS_UNSPECIFIED'
            ? statusMeta[entity.status]
            : statusMeta.STUDENT_LEAVE_STATUS_PENDING;
        return (
          <Tag color={meta.color}>
            {intl.formatMessage({ id: meta.messageId, defaultMessage: meta.label })}
          </Tag>
        );
      },
    },
    {
      title: <FormattedMessage id="school.student.leave.attachment" defaultMessage="Attachment" />,
      dataIndex: ['file', 'name'],
      valueType: 'text',
      ellipsis: true,
      search: false,
      render: (_, entity) => entity.file?.name || '-',
    },
    {
      title: <FormattedMessage id="common.createdAt" defaultMessage="CreatedAt" />,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      key: 'option',
      valueType: 'option',
      width: 280,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            disabled={record.status !== 'STUDENT_LEAVE_STATUS_PENDING'}
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
            icon={<CheckOutlined />}
            disabled={record.status === 'STUDENT_LEAVE_STATUS_APPROVED'}
            onClick={() => handleStatus(record, 'STUDENT_LEAVE_STATUS_APPROVED')}
          >
            <FormattedMessage id="school.student.leave.approve" defaultMessage="Approve" />
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CloseOutlined />}
            danger
            disabled={record.status === 'STUDENT_LEAVE_STATUS_DISAPPROVED'}
            onClick={() => handleStatus(record, 'STUDENT_LEAVE_STATUS_DISAPPROVED')}
          >
            <FormattedMessage id="school.student.leave.disapprove" defaultMessage="Disapprove" />
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            disabled={!record.file?.id}
            onClick={() => handleDownload(record)}
          >
            <FormattedMessage id="school.student.leave.download" defaultMessage="Download" />
          </Button>
          <Popconfirm
            title={intl.formatMessage({ id: 'common.delete', defaultMessage: 'Delete' })}
            onConfirm={() => handleRemove(record)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              <FormattedMessage id="common.delete" defaultMessage="Delete" />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const getData = requestTransform<V1StudentLeave, V1StudentLeaveFilter>(
    async (req: V1ListStudentLeaveRequest) => {
      const resp = await leaveService.studentLeaveServiceListStudentLeave2({ body: req });
      return resp.data;
    },
  );

  return (
    <PageContainer>
      <ProTable<V1StudentLeave>
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
            <FormattedMessage id="school.student.leave.create" defaultMessage="New Leave" />
          </Button>,
        ]}
        type="table"
        request={getData}
        columns={columns}
      />
      <DrawerForm<LeaveFormValues>
        title={intl.formatMessage({
          id: currentRow ? 'school.student.leave.edit' : 'school.student.leave.create',
          defaultMessage: currentRow ? 'Edit Leave' : 'New Leave',
        })}
        open={formVisible}
        drawerProps={{
          destroyOnClose: true,
          onClose: () => {
            setCurrentRow(undefined);
            setFormVisible(false);
          },
        }}
        initialValues={currentRow || { requestType: 'student' }}
        onOpenChange={setFormVisible}
        onFinish={async (values) => {
          const ok = await handleSave(values);
          if (ok) {
            setCurrentRow(undefined);
          }
          return ok;
        }}
      >
        <ProFormSelect
          name="studentEnrollmentId"
          label={intl.formatMessage({ id: 'school.student.student', defaultMessage: 'Student' })}
          rules={[{ required: true }]}
          showSearch
          options={studentOptions}
          request={async ({ keyWords }) => {
            const items = await loadStudents(keyWords);
            setStudents((prev) => ({
              ...prev,
              ...items.reduce<Record<string, V1Student>>((ret, item) => {
                if (item.enrollment?.id) {
                  ret[item.enrollment.id] = item;
                }
                return ret;
              }, {}),
            }));
            return items
              .filter((item) => item.enrollment?.id)
              .map((item) => ({ label: studentLabel(item), value: item.enrollment!.id! }));
          }}
        />
        <ProFormDatePicker
          name="fromDate"
          label={intl.formatMessage({
            id: 'school.student.leave.fromDate',
            defaultMessage: 'From Date',
          })}
          rules={[{ required: true }]}
        />
        <ProFormDatePicker
          name="toDate"
          label={intl.formatMessage({
            id: 'school.student.leave.toDate',
            defaultMessage: 'To Date',
          })}
          rules={[{ required: true }]}
        />
        <ProFormDatePicker
          name="applyDate"
          label={intl.formatMessage({
            id: 'school.student.leave.applyDate',
            defaultMessage: 'Apply Date',
          })}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="requestType"
          label={intl.formatMessage({
            id: 'school.student.leave.requestType',
            defaultMessage: 'Request Type',
          })}
          valueEnum={{
            student: intl.formatMessage({
              id: 'school.student.leave.requestType.student',
              defaultMessage: 'Student',
            }),
            staff: intl.formatMessage({
              id: 'school.student.leave.requestType.staff',
              defaultMessage: 'Staff',
            }),
          }}
        />
        <ProFormTextArea
          name="reason"
          label={intl.formatMessage({
            id: 'school.student.leave.reason',
            defaultMessage: 'Reason',
          })}
          fieldProps={{ rows: 4, maxLength: 500, showCount: true }}
        />
        <ProFormUploadButton
          name="fileUpload"
          label={intl.formatMessage({
            id: 'school.student.leave.attachment',
            defaultMessage: 'Attachment',
          })}
          max={1}
          icon={<UploadOutlined />}
          fieldProps={{
            beforeUpload: () => false,
          }}
        />
      </DrawerForm>
    </PageContainer>
  );
};

export default TableList;
