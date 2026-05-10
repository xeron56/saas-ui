import type { ProColumnType } from '@ant-design/pro-components';
import {
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import type { V1CreateTransportRouteRequest, V1TransportRoute } from '@gosaas/api';
import { TransportRouteServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new TransportRouteServiceApi();

const TableList: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumnType<V1TransportRoute>[] = [
    {
      title: <FormattedMessage id="school.transport.routeTitle" defaultMessage="Route Title" />,
      dataIndex: 'routeTitle',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.transport.noOfVehicle" defaultMessage="Vehicles" />,
      dataIndex: 'noOfVehicle',
      valueType: 'digit',
    },
    {
      title: <FormattedMessage id="school.transport.note" defaultMessage="Note" />,
      dataIndex: 'note',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.transport.isActive" defaultMessage="Active" />,
      dataIndex: 'isActive',
      valueType: 'switch',
    },
  ];

  return (
    <ReferencePage<V1TransportRoute>
      columns={columns}
      create={(fields: V1CreateTransportRouteRequest) =>
        service.transportRouteServiceCreateTransportRoute({ body: fields })
      }
      delete={(record) => service.transportRouteServiceDeleteTransportRoute({ id: record.id! })}
      get={async (id) => (await service.transportRouteServiceGetTransportRoute({ id })).data}
      list={async (req: any) =>
        (await service.transportRouteServiceListTransportRoute2({ body: req })).data
      }
      title={(record) => record.routeTitle}
      update={(record, fields: any) =>
        service.transportRouteServiceUpdateTransportRoute2({
          routeId: record.id!,
          body: { route: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
          <ProFormText
            name="routeTitle"
            label={intl.formatMessage({
              id: 'school.transport.routeTitle',
              defaultMessage: 'Route Title',
            })}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            name="noOfVehicle"
            label={intl.formatMessage({
              id: 'school.transport.noOfVehicle',
              defaultMessage: 'Vehicles',
            })}
            min={0}
            fieldProps={{ precision: 0 }}
          />
          <ProFormTextArea
            name="note"
            label={intl.formatMessage({ id: 'school.transport.note', defaultMessage: 'Note' })}
          />
          <ProFormSwitch
            name="isActive"
            label={intl.formatMessage({
              id: 'school.transport.isActive',
              defaultMessage: 'Active',
            })}
          />
        </>
      }
    />
  );
};

export default TableList;
