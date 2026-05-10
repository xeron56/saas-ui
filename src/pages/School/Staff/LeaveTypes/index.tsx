import type { ProColumnType } from '@ant-design/pro-components';
import { ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import type { V1CreateStaffLeaveTypeRequest, V1StaffLeaveType } from '@gosaas/api';
import { StaffLeaveTypeServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new StaffLeaveTypeServiceApi();

const TableList: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumnType<V1StaffLeaveType>[] = [
    {
      title: <FormattedMessage id="school.staff.leaveType.name" defaultMessage="Name" />,
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.staff.leaveType.isActive" defaultMessage="Active" />,
      dataIndex: 'isActive',
      valueType: 'switch',
    },
  ];

  return (
    <ReferencePage<V1StaffLeaveType>
      columns={columns}
      create={(fields: V1CreateStaffLeaveTypeRequest) =>
        service.staffLeaveTypeServiceCreateStaffLeaveType({ body: fields })
      }
      delete={(record) => service.staffLeaveTypeServiceDeleteStaffLeaveType({ id: record.id! })}
      get={async (id) => (await service.staffLeaveTypeServiceGetStaffLeaveType({ id })).data}
      list={async (req: any) =>
        (await service.staffLeaveTypeServiceListStaffLeaveType2({ body: req })).data
      }
      title={(record) => record.name}
      update={(record, fields: any) =>
        service.staffLeaveTypeServiceUpdateStaffLeaveType2({
          leaveTypeId: record.id!,
          body: { leaveType: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
          <ProFormText
            name="name"
            label={intl.formatMessage({
              id: 'school.staff.leaveType.name',
              defaultMessage: 'Name',
            })}
            rules={[{ required: true }]}
          />
          <ProFormSwitch
            name="isActive"
            initialValue={true}
            label={intl.formatMessage({
              id: 'school.staff.leaveType.isActive',
              defaultMessage: 'Active',
            })}
          />
        </>
      }
    />
  );
};

export default TableList;
