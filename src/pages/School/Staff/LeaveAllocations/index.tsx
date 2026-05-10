import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import {
  DrawerForm,
  PageContainer,
  ProFormDigit,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, message, Popconfirm, Space } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  StaffLeaveAllocationServiceUpdateStaffLeaveAllocationRequest,
  V1AcademicSession,
  V1CreateStaffLeaveAllocationRequest,
  V1ListStaffLeaveAllocationRequest,
  V1Staff,
  V1StaffLeaveAllocation,
  V1StaffLeaveAllocationFilter,
  V1StaffLeaveType,
} from '@gosaas/api';
import {
  AcademicSessionServiceApi,
  StaffLeaveAllocationServiceApi,
  StaffLeaveTypeServiceApi,
  StaffServiceApi,
} from '@gosaas/api';
import { requestTransform } from '@gosaas/core';

const allocationService = new StaffLeaveAllocationServiceApi();
const staffService = new StaffServiceApi();
const leaveTypeService = new StaffLeaveTypeServiceApi();
const sessionService = new AcademicSessionServiceApi();

type AllocationFormValues = V1CreateStaffLeaveAllocationRequest & V1StaffLeaveAllocation;

const staffLabel = (staff?: V1Staff | V1StaffLeaveAllocation) => {
  if (!staff) {
    return '-';
  }
  return [staff.employeeId, [staff.firstName, staff.lastName].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(' - ');
};

const sessionLabel = (session?: V1AcademicSession | V1StaffLeaveAllocation) => {
  if (!session) {
    return '-';
  }
  const code = 'code' in session ? session.code : session.academicSessionCode;
  const name = 'name' in session ? session.name : session.academicSessionName;
  return [code, name].filter(Boolean).join(' - ') || '-';
};

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [formVisible, setFormVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<V1StaffLeaveAllocation | undefined>();
  const [staff, setStaff] = useState<Record<string, V1Staff>>({});
  const [leaveTypes, setLeaveTypes] = useState<Record<string, V1StaffLeaveType>>({});
  const [sessions, setSessions] = useState<Record<string, V1AcademicSession>>({});
  const intl = useIntl();

  const loadStaff = async (search?: string) => {
    const resp = await staffService.staffServiceListStaff2({
      body: {
        pageSize: 100,
        search,
        sort: ['employee_id'],
        filter: { isActive: { $eq: true } },
      },
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

  const mergeStaff = (items: V1Staff[]) => {
    setStaff((prev) => ({
      ...prev,
      ...items.reduce<Record<string, V1Staff>>((ret, item) => {
        if (item.id) {
          ret[item.id] = item;
        }
        return ret;
      }, {}),
    }));
  };

  const mergeLeaveTypes = (items: V1StaffLeaveType[]) => {
    setLeaveTypes((prev) => ({
      ...prev,
      ...items.reduce<Record<string, V1StaffLeaveType>>((ret, item) => {
        if (item.id) {
          ret[item.id] = item;
        }
        return ret;
      }, {}),
    }));
  };

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

  const handleSave = async (fields: AllocationFormValues) => {
    const selectedLeaveType = fields.leaveTypeId ? leaveTypes[fields.leaveTypeId] : undefined;
    const body: V1CreateStaffLeaveAllocationRequest = {
      staffId: fields.staffId!,
      leaveTypeId: fields.leaveTypeId!,
      leaveTypeName: selectedLeaveType?.name || fields.leaveTypeName,
      academicSessionId: fields.academicSessionId,
      allotedLeave: fields.allotedLeave,
    };
    const hide = message.loading(
      intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
    );
    try {
      if (currentRow) {
        const updateBody: StaffLeaveAllocationServiceUpdateStaffLeaveAllocationRequest = {
          allocation: {
            id: currentRow.id!,
            ...body,
          },
        };
        await allocationService.staffLeaveAllocationServiceUpdateStaffLeaveAllocation2({
          allocationId: currentRow.id!,
          body: updateBody,
        });
      } else {
        await allocationService.staffLeaveAllocationServiceCreateStaffLeaveAllocation({ body });
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

  const handleRemove = async (record: V1StaffLeaveAllocation) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await allocationService.staffLeaveAllocationServiceDeleteStaffLeaveAllocation({
        id: record.id!,
      });
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

  const columns: ProColumnType<V1StaffLeaveAllocation>[] = [
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
      title: (
        <FormattedMessage id="school.staff.leaveAllocation.leaveType" defaultMessage="Leave Type" />
      ),
      dataIndex: 'leaveTypeName',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: (
        <FormattedMessage
          id="school.staff.leaveAllocation.academicSession"
          defaultMessage="Academic Session"
        />
      ),
      dataIndex: 'academicSessionId',
      valueType: 'text',
      ellipsis: true,
      render: (_, entity) => sessionLabel(sessions[entity.academicSessionId || ''] || entity),
    },
    {
      title: (
        <FormattedMessage id="school.staff.leaveAllocation.allotedLeave" defaultMessage="Alloted" />
      ),
      dataIndex: 'allotedLeave',
      valueType: 'digit',
      search: false,
      width: 110,
    },
    {
      title: <FormattedMessage id="common.createdAt" defaultMessage="Created At" />,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      key: 'option',
      valueType: 'option',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentRow(record);
              setFormVisible(true);
            }}
          >
            <FormattedMessage id="common.edit" defaultMessage="Edit" />
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

  const getData = requestTransform<V1StaffLeaveAllocation, V1StaffLeaveAllocationFilter>(
    async (req: V1ListStaffLeaveAllocationRequest) => {
      const resp = await allocationService.staffLeaveAllocationServiceListStaffLeaveAllocation2({
        body: req,
      });
      return resp.data;
    },
  );

  return (
    <PageContainer>
      <ProTable<V1StaffLeaveAllocation>
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
              id="school.staff.leaveAllocation.create"
              defaultMessage="New Allocation"
            />
          </Button>,
        ]}
        type="table"
        request={getData}
        columns={columns}
      />
      <DrawerForm<AllocationFormValues>
        title={intl.formatMessage({
          id: currentRow
            ? 'school.staff.leaveAllocation.edit'
            : 'school.staff.leaveAllocation.create',
          defaultMessage: currentRow ? 'Edit Allocation' : 'New Allocation',
        })}
        open={formVisible}
        drawerProps={{
          destroyOnClose: true,
          onClose: () => {
            setCurrentRow(undefined);
            setFormVisible(false);
          },
        }}
        initialValues={currentRow || { allotedLeave: 0 }}
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
            mergeStaff(items);
            return items
              .filter((item) => item.id)
              .map((item) => ({ label: staffLabel(item), value: item.id! }));
          }}
        />
        <ProFormSelect
          name="leaveTypeId"
          label={intl.formatMessage({
            id: 'school.staff.leaveAllocation.leaveType',
            defaultMessage: 'Leave Type',
          })}
          rules={[{ required: true }]}
          showSearch
          options={leaveTypeOptions}
          request={async ({ keyWords }) => {
            const items = await loadLeaveTypes(keyWords);
            mergeLeaveTypes(items);
            return items
              .filter((item) => item.id)
              .map((item) => ({ label: item.name || item.id!, value: item.id! }));
          }}
        />
        <ProFormSelect
          name="academicSessionId"
          label={intl.formatMessage({
            id: 'school.staff.leaveAllocation.academicSession',
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
        <ProFormDigit
          name="allotedLeave"
          label={intl.formatMessage({
            id: 'school.staff.leaveAllocation.allotedLeave',
            defaultMessage: 'Alloted Leave',
          })}
          min={0}
          fieldProps={{ precision: 1 }}
          rules={[{ required: true }]}
        />
      </DrawerForm>
    </PageContainer>
  );
};

export default TableList;
