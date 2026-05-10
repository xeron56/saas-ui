import type { ProColumnType } from '@ant-design/pro-components';
import { ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import type { V1CreateHolidayTypeRequest, V1HolidayType } from '@gosaas/api';
import { HolidayTypeServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new HolidayTypeServiceApi();

const TableList: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumnType<V1HolidayType>[] = [
    {
      title: <FormattedMessage id="school.academic.holidayType.name" defaultMessage="Name" />,
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: (
        <FormattedMessage id="school.academic.holidayType.isDefault" defaultMessage="Default" />
      ),
      dataIndex: 'isDefault',
      valueType: 'switch',
    },
    {
      title: <FormattedMessage id="school.academic.holidayType.isActive" defaultMessage="Active" />,
      dataIndex: 'isActive',
      valueType: 'switch',
    },
  ];

  return (
    <ReferencePage<V1HolidayType>
      columns={columns}
      create={(fields: V1CreateHolidayTypeRequest) =>
        service.holidayTypeServiceCreateHolidayType({ body: fields })
      }
      delete={(record) => service.holidayTypeServiceDeleteHolidayType({ id: record.id! })}
      get={async (id) => (await service.holidayTypeServiceGetHolidayType({ id })).data}
      list={async (req: any) =>
        (await service.holidayTypeServiceListHolidayType2({ body: req })).data
      }
      title={(record) => record.name}
      update={(record, fields: any) =>
        service.holidayTypeServiceUpdateHolidayType2({
          holidayTypeId: record.id!,
          body: { holidayType: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
          <ProFormText
            name="name"
            label={intl.formatMessage({
              id: 'school.academic.holidayType.name',
              defaultMessage: 'Name',
            })}
            rules={[{ required: true }]}
          />
          <ProFormSwitch
            name="isDefault"
            label={intl.formatMessage({
              id: 'school.academic.holidayType.isDefault',
              defaultMessage: 'Default',
            })}
          />
          <ProFormSwitch
            name="isActive"
            label={intl.formatMessage({
              id: 'school.academic.holidayType.isActive',
              defaultMessage: 'Active',
            })}
          />
        </>
      }
    />
  );
};

export default TableList;
