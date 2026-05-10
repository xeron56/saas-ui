import type { ProColumnType } from '@ant-design/pro-components';
import {
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import type { V1CreateHostelRequest, V1Hostel } from '@gosaas/api';
import { HostelServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new HostelServiceApi();

const TableList: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumnType<V1Hostel>[] = [
    {
      title: <FormattedMessage id="school.hostel.hostelName" defaultMessage="Hostel Name" />,
      dataIndex: 'hostelName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.hostel.type" defaultMessage="Type" />,
      dataIndex: 'type',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.hostel.intake" defaultMessage="Intake" />,
      dataIndex: 'intake',
      valueType: 'digit',
    },
    {
      title: <FormattedMessage id="school.hostel.isActive" defaultMessage="Active" />,
      dataIndex: 'isActive',
      valueType: 'switch',
    },
  ];

  return (
    <ReferencePage<V1Hostel>
      columns={columns}
      create={(fields: V1CreateHostelRequest) =>
        service.hostelServiceCreateHostel({ body: fields })
      }
      delete={(record) => service.hostelServiceDeleteHostel({ id: record.id! })}
      get={async (id) => (await service.hostelServiceGetHostel({ id })).data}
      list={async (req: any) => (await service.hostelServiceListHostel2({ body: req })).data}
      title={(record) => record.hostelName}
      update={(record, fields: any) =>
        service.hostelServiceUpdateHostel2({
          hostelId: record.id!,
          body: { hostel: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
          <ProFormText
            name="hostelName"
            label={intl.formatMessage({
              id: 'school.hostel.hostelName',
              defaultMessage: 'Hostel Name',
            })}
            rules={[{ required: true }]}
          />
          <ProFormText
            name="type"
            label={intl.formatMessage({ id: 'school.hostel.type', defaultMessage: 'Type' })}
          />
          <ProFormDigit
            name="intake"
            label={intl.formatMessage({ id: 'school.hostel.intake', defaultMessage: 'Intake' })}
            min={0}
            fieldProps={{ precision: 0 }}
          />
          <ProFormTextArea
            name="address"
            label={intl.formatMessage({ id: 'school.hostel.address', defaultMessage: 'Address' })}
          />
          <ProFormTextArea
            name="description"
            label={intl.formatMessage({
              id: 'school.hostel.description',
              defaultMessage: 'Description',
            })}
          />
          <ProFormSwitch
            name="isActive"
            label={intl.formatMessage({ id: 'school.hostel.isActive', defaultMessage: 'Active' })}
          />
        </>
      }
    />
  );
};

export default TableList;
