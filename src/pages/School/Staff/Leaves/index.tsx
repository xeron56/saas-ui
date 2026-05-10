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
  ProFormDigit,
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
  StaffLeaveServiceUpdateStaffLeaveRequest,
  V1AcademicSession,
  V1CreateStaffLeaveRequest,
  V1ListStaffLeaveRequest,
  V1Staff,
  V1StaffLeave,
  V1StaffLeaveFilter,
  V1StaffLeaveStatus,
  V1StaffLeaveType,
} from '@gosaas/api';
import {
  AcademicSessionServiceApi,
  StaffLeaveServiceApi,
  StaffLeaveTypeServiceApi,
  StaffServiceApi,
} from '@gosaas/api';
import { dateUtil, requestTransform } from '@gosaas/core';

const leaveService = new StaffLeaveServiceApi();
const leaveTypeService = new StaffLeaveTypeServiceApi();
const staffService = new StaffServiceApi();
const sessionService = new AcademicSessionServiceApi();

type LeaveFormValues = V1CreateStaffLeaveRequest &
  V1StaffLeave & {
    fileUpload?: UploadFile[];
  };

const statusMeta: Record<
  Exclude<V1StaffLeaveStatus, 'STAFF_LEAVE_STATUS_UNSPECIFIED'>,
  { color: string; label: string; messageId: string }
> = {
  STAFF_LEAVE_STATUS_PENDING: {
    color: 'processing',
    label: 'Pending',
    messageId: 'school.staff.leave.pending',
  },
  STAFF_LEAVE_STATUS_APPROVED: {
    color: 'success',
    label: 'Approved',
    messageId: 'school.staff.leave.approved',
  },
  STAFF_LEAVE_STATUS_DISAPPROVED: {
    color: 'error',
    label: 'Disapproved',
    messageId: 'school.staff.leave.disapproved',
  },
};

const staffLabel = (staff?: V1Staff | V1StaffLeave) => {
  if (!staff) {
    return '-';
  }
  return [staff.employeeId, [staff.firstName, staff.lastName].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(' - ');
};

const sessionLabel = (session?: V1AcademicSession | V1StaffLeave) => {
  if (!session) {
    return '-';
  }
  const code = 'code' in session ? session.code : session.academicSessionCode;
  const name = 'name' in session ? session.name : session.academicSessionName;
  return [code, name].filter(Boolean).join(' - ') || '-';
};

const normalizeDate = (value?: string | null) => (value ? dateUtil(value).toISOString() : null);

const getUploadFile = (files?: UploadFile[]) => {
  const item = files?.[0];
  return item?.originFileObj as File | undefined;
};

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [formVisible, setFormVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<V1StaffLeave | undefined>();
  const [staff, setStaff] = useState<Record<string, V1Staff>>({});
  const [leaveTypes, setLeaveTypes] = useState<Record<string, V1StaffLeaveType>>({});
  const [sessions, setSessions] = useState<Record<string, V1AcademicSession>>({});
  const intl = useIntl();

  const loadStaff = async (search?: string) => {
    const resp = await staffService.staffServiceListStaff2({
      body: { pageSize: 100, search, sort: ['employee_id'] },
    });
    return resp.data.items || [];
  };

  const loadLeaveTypes = async (search?: string) => {
    const resp = await leaveTypeService.staffLeaveTypeServiceListStaffLeaveType2({
      body: { pageSize: 100, search, sort: ['name'], filter: { isActive: { $eq: true } } },
    });
    return resp.data.items || [];
  };

  const loadSessions = async (search?: string) => {
    const resp = await sessionService.academicSessionServiceListAcademicSession2({
      body: { pageSize: 100, search, sort: ['code'] },
    });
    return resp.data.items || [];
  };

  useEffect(() => {
    loadStaff().then((items) => {
      setStaff(
        items.reduce<Record<string, V1Staff>>((ret, item) => {
          if (item.id) {
            ret[item.id] = item;
          }
          return ret;
        }, {}),
      );
    });
    loadLeaveTypes().then((items) => {
      setLeaveTypes(
        items.reduce<Record<string, V1StaffLeaveType>>((ret, item) => {
          if (item.id) {
            ret[item.id] = item;
          }
          return ret;
        }, {}),
      );
    });
    loadSessions().then((items) => {
      setSessions(
        items.reduce<Record<string, V1AcademicSession>>((ret, item) => {
          if (item.id) {
            ret[item.id] = item;
          }
          return ret;
        }, {}),
      );
    });
  }, []);

  const staffOptions = useMemo(
    () =>
      Object.entries(staff).map(([staffId, item]) => ({
        label: staffLabel(item),
        value: staffId,
      })),
    [staff],
  );

  const leaveTypeOptions = useMemo(
    () =>
      Object.entries(leaveTypes).map(([leaveTypeId, item]) => ({
        label: item.name || leaveTypeId,
        value: leaveTypeId,
      })),
    [leaveTypes],
  );

  const sessionOptions = useMemo(
    () =>
      Object.entries(sessions).map(([sessionId, item]) => ({
        label: sessionLabel(item),
        value: sessionId,
      })),
    [sessions],
  );

  const mergeSessions = (items: V1AcademicSession[]) => {
    setSessions((prev) => ({
      ...prev,
      ...items.reduce<Record<string, V1AcademicSession>>((ret, item) => {
        if (item.id) {
          ret[item.id] = item;
        }
        return ret;
      }, {}),
    }));
  };

  const handleSave = async (fields: LeaveFormValues) => {
    const file = getUploadFile(fields.fileUpload);
    const selectedLeaveType = fields.leaveTypeId ? leaveTypes[fields.leaveTypeId] : undefined;
    const body: V1CreateStaffLeaveRequest = {
      staffId: fields.staffId!,
      leaveTypeId: fields.leaveTypeId,
      leaveTypeName: selectedLeaveType?.name || fields.leaveTypeName,
      leaveFrom: normalizeDate(fields.leaveFrom),
      leaveTo: normalizeDate(fields.leaveTo),
      applyDate: normalizeDate(fields.applyDate),
      leaveDays: fields.leaveDays,
      employeeRemark: fields.employeeRemark,
      adminRemark: fields.adminRemark,
      appliedByStaffId: fields.appliedByStaffId,
      halfDayLeave: fields.halfDayLeave,
      academicSessionId: fields.academicSessionId,
    };
    const hide = message.loading(
      intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
    );
    try {
      let leaveID = currentRow?.id;
      if (currentRow) {
        const updateBody: StaffLeaveServiceUpdateStaffLeaveRequest = {
          leave: {
            id: currentRow.id!,
            ...body,
          },
        };
        await leaveService.staffLeaveServiceUpdateStaffLeave2({
          leaveId: currentRow.id!,
          body: updateBody,
        });
      } else {
        const resp = await leaveService.staffLeaveServiceCreateStaffLeave({ body });
        leaveID = resp.data.id;
      }
      if (file && leaveID) {
        await uploadApi(`/v1/school/staff/leave/${leaveID}/upload`, { file });
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

  const handleDownload = async (record: V1StaffLeave) => {
    try {
      const resp = await leaveService.staffLeaveServiceDownloadStaffLeaveAttachment({
        id: record.id!,
      });
      const url = window.URL.createObjectURL(resp.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.file?.name || 'staff-leave-attachment';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.staff.leave.downloadFailed',
          defaultMessage: 'Download Failed',
        }),
      );
    }
  };

  const handleStatus = async (record: V1StaffLeave, status: V1StaffLeaveStatus) => {
    const hide = message.loading(
      intl.formatMessage({
        id: 'school.staff.leave.updatingStatus',
        defaultMessage: 'Updating...',
      }),
    );
    try {
      await leaveService.staffLeaveServiceUpdateStaffLeaveStatus({
        id: record.id!,
        body: {
          id: record.id!,
          status,
          adminRemark: record.adminRemark,
        },
      });
      hide();
      message.success(
        intl.formatMessage({
          id: 'school.staff.leave.statusUpdated',
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

  const handleRemove = async (record: V1StaffLeave) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await leaveService.staffLeaveServiceDeleteStaffLeave({ id: record.id! });
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

  const columns: ProColumnType<V1StaffLeave>[] = [
    {
      title: <FormattedMessage id="school.staff.staff" defaultMessage="Staff" />,
      dataIndex: 'staffId',
      valueType: 'text',
      ellipsis: true,
      render: (_, entity) => staffLabel(staff[entity.staffId || ''] || entity),
    },
    {
      title: <FormattedMessage id="school.staff.roleName" defaultMessage="Role" />,
      dataIndex: 'roleName',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: <FormattedMessage id="school.staff.leave.leaveType" defaultMessage="Leave Type" />,
      dataIndex: 'leaveTypeName',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: (
        <FormattedMessage
          id="school.staff.leave.academicSession"
          defaultMessage="Academic Session"
        />
      ),
      dataIndex: 'academicSessionId',
      valueType: 'select',
      ellipsis: true,
      fieldProps: {
        showSearch: true,
        options: sessionOptions,
      },
      render: (_, entity) => sessionLabel(sessions[entity.academicSessionId || ''] || entity),
    },
    {
      title: <FormattedMessage id="school.staff.leave.fromDate" defaultMessage="From Date" />,
      dataIndex: 'leaveFrom',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="school.staff.leave.toDate" defaultMessage="To Date" />,
      dataIndex: 'leaveTo',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="school.staff.leave.leaveDays" defaultMessage="Days" />,
      dataIndex: 'leaveDays',
      valueType: 'digit',
      search: false,
      width: 90,
    },
    {
      title: <FormattedMessage id="school.staff.leave.applyDate" defaultMessage="Apply Date" />,
      dataIndex: 'applyDate',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="school.staff.leave.status" defaultMessage="Status" />,
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        STAFF_LEAVE_STATUS_PENDING: {
          text: <FormattedMessage id="school.staff.leave.pending" defaultMessage="Pending" />,
        },
        STAFF_LEAVE_STATUS_APPROVED: {
          text: <FormattedMessage id="school.staff.leave.approved" defaultMessage="Approved" />,
        },
        STAFF_LEAVE_STATUS_DISAPPROVED: {
          text: (
            <FormattedMessage id="school.staff.leave.disapproved" defaultMessage="Disapproved" />
          ),
        },
      },
      render: (_, entity) => {
        const meta =
          entity.status && entity.status !== 'STAFF_LEAVE_STATUS_UNSPECIFIED'
            ? statusMeta[entity.status]
            : statusMeta.STAFF_LEAVE_STATUS_PENDING;
        return (
          <Tag color={meta.color}>
            {intl.formatMessage({ id: meta.messageId, defaultMessage: meta.label })}
          </Tag>
        );
      },
    },
    {
      title: <FormattedMessage id="school.staff.leave.employeeRemark" defaultMessage="Remark" />,
      dataIndex: 'employeeRemark',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: <FormattedMessage id="school.staff.leave.attachment" defaultMessage="Attachment" />,
      dataIndex: ['file', 'name'],
      valueType: 'text',
      ellipsis: true,
      search: false,
      render: (_, entity) => entity.file?.name || '-',
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
            disabled={record.status !== 'STAFF_LEAVE_STATUS_PENDING'}
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
            disabled={record.status === 'STAFF_LEAVE_STATUS_APPROVED'}
            onClick={() => handleStatus(record, 'STAFF_LEAVE_STATUS_APPROVED')}
          >
            <FormattedMessage id="school.staff.leave.approve" defaultMessage="Approve" />
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CloseOutlined />}
            danger
            disabled={record.status === 'STAFF_LEAVE_STATUS_DISAPPROVED'}
            onClick={() => handleStatus(record, 'STAFF_LEAVE_STATUS_DISAPPROVED')}
          >
            <FormattedMessage id="school.staff.leave.disapprove" defaultMessage="Disapprove" />
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            disabled={!record.file?.id}
            onClick={() => handleDownload(record)}
          >
            <FormattedMessage id="school.staff.leave.download" defaultMessage="Download" />
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

  const getData = requestTransform<V1StaffLeave, V1StaffLeaveFilter>(
    async (req: V1ListStaffLeaveRequest) => {
      const resp = await leaveService.staffLeaveServiceListStaffLeave2({ body: req });
      return resp.data;
    },
  );

  return (
    <PageContainer>
      <ProTable<V1StaffLeave>
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
            <FormattedMessage id="school.staff.leave.create" defaultMessage="New Leave" />
          </Button>,
        ]}
        type="table"
        request={getData}
        columns={columns}
      />
      <DrawerForm<LeaveFormValues>
        title={intl.formatMessage({
          id: currentRow ? 'school.staff.leave.edit' : 'school.staff.leave.create',
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
        initialValues={currentRow || { applyDate: dateUtil().toISOString() }}
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
          name="staffId"
          label={intl.formatMessage({ id: 'school.staff.staff', defaultMessage: 'Staff' })}
          rules={[{ required: true }]}
          showSearch
          options={staffOptions}
          request={async ({ keyWords }) => {
            const items = await loadStaff(keyWords);
            setStaff((prev) => ({
              ...prev,
              ...items.reduce<Record<string, V1Staff>>((ret, item) => {
                if (item.id) {
                  ret[item.id] = item;
                }
                return ret;
              }, {}),
            }));
            return items
              .filter((item) => item.id)
              .map((item) => ({ label: staffLabel(item), value: item.id! }));
          }}
        />
        <ProFormSelect
          name="leaveTypeId"
          label={intl.formatMessage({
            id: 'school.staff.leave.leaveType',
            defaultMessage: 'Leave Type',
          })}
          showSearch
          options={leaveTypeOptions}
          request={async ({ keyWords }) => {
            const items = await loadLeaveTypes(keyWords);
            setLeaveTypes((prev) => ({
              ...prev,
              ...items.reduce<Record<string, V1StaffLeaveType>>((ret, item) => {
                if (item.id) {
                  ret[item.id] = item;
                }
                return ret;
              }, {}),
            }));
            return items
              .filter((item) => item.id)
              .map((item) => ({ label: item.name || item.id!, value: item.id! }));
          }}
        />
        <ProFormText
          name="leaveTypeName"
          label={intl.formatMessage({
            id: 'school.staff.leave.leaveTypeName',
            defaultMessage: 'Leave Type Name',
          })}
        />
        <ProFormSelect
          name="academicSessionId"
          label={intl.formatMessage({
            id: 'school.staff.leave.academicSession',
            defaultMessage: 'Academic Session',
          })}
          showSearch
          allowClear
          options={sessionOptions}
          request={async ({ keyWords }) => {
            const items = await loadSessions(keyWords);
            mergeSessions(items);
            return items
              .filter((item) => item.id)
              .map((item) => ({ label: sessionLabel(item), value: item.id! }));
          }}
        />
        <ProFormDatePicker
          name="leaveFrom"
          label={intl.formatMessage({
            id: 'school.staff.leave.fromDate',
            defaultMessage: 'From Date',
          })}
          rules={[{ required: true }]}
        />
        <ProFormDatePicker
          name="leaveTo"
          label={intl.formatMessage({
            id: 'school.staff.leave.toDate',
            defaultMessage: 'To Date',
          })}
          rules={[{ required: true }]}
        />
        <ProFormDatePicker
          name="applyDate"
          label={intl.formatMessage({
            id: 'school.staff.leave.applyDate',
            defaultMessage: 'Apply Date',
          })}
          rules={[{ required: true }]}
        />
        <ProFormDigit
          name="leaveDays"
          label={intl.formatMessage({
            id: 'school.staff.leave.leaveDays',
            defaultMessage: 'Leave Days',
          })}
          min={0}
          fieldProps={{ precision: 1 }}
        />
        <ProFormSelect
          name="halfDayLeave"
          label={intl.formatMessage({
            id: 'school.staff.leave.halfDayLeave',
            defaultMessage: 'Half Day',
          })}
          valueEnum={{
            first_half: intl.formatMessage({
              id: 'school.staff.leave.firstHalf',
              defaultMessage: 'First Half',
            }),
            second_half: intl.formatMessage({
              id: 'school.staff.leave.secondHalf',
              defaultMessage: 'Second Half',
            }),
          }}
          allowClear
        />
        <ProFormSelect
          name="appliedByStaffId"
          label={intl.formatMessage({
            id: 'school.staff.leave.appliedBy',
            defaultMessage: 'Applied By',
          })}
          showSearch
          options={staffOptions}
          request={async ({ keyWords }) => {
            const items = await loadStaff(keyWords);
            setStaff((prev) => ({
              ...prev,
              ...items.reduce<Record<string, V1Staff>>((ret, item) => {
                if (item.id) {
                  ret[item.id] = item;
                }
                return ret;
              }, {}),
            }));
            return items
              .filter((item) => item.id)
              .map((item) => ({ label: staffLabel(item), value: item.id! }));
          }}
        />
        <ProFormTextArea
          name="employeeRemark"
          label={intl.formatMessage({
            id: 'school.staff.leave.employeeRemark',
            defaultMessage: 'Employee Remark',
          })}
          fieldProps={{ rows: 4, maxLength: 500, showCount: true }}
        />
        <ProFormTextArea
          name="adminRemark"
          label={intl.formatMessage({
            id: 'school.staff.leave.adminRemark',
            defaultMessage: 'Admin Remark',
          })}
          fieldProps={{ rows: 3, maxLength: 500, showCount: true }}
        />
        <ProFormUploadButton
          name="fileUpload"
          label={intl.formatMessage({
            id: 'school.staff.leave.attachment',
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
