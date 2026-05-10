import type { ProColumnType } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import type { V1CreatePickupPointRequest, V1PickupPoint } from '@gosaas/api';
import { PickupPointServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new PickupPointServiceApi();

const TableList: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumnType<V1PickupPoint>[] = [
    {
      title: <FormattedMessage id="school.transport.pickupPoint.name" defaultMessage="Name" />,
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.transport.latitude" defaultMessage="Latitude" />,
      dataIndex: 'latitude',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.transport.longitude" defaultMessage="Longitude" />,
      dataIndex: 'longitude',
      valueType: 'text',
    },
  ];

  return (
    <ReferencePage<V1PickupPoint>
      columns={columns}
      create={(fields: V1CreatePickupPointRequest) =>
        service.pickupPointServiceCreatePickupPoint({ body: fields })
      }
      delete={(record) => service.pickupPointServiceDeletePickupPoint({ id: record.id! })}
      get={async (id) => (await service.pickupPointServiceGetPickupPoint({ id })).data}
      list={async (req: any) =>
        (await service.pickupPointServiceListPickupPoint2({ body: req })).data
      }
      title={(record) => record.name}
      update={(record, fields: any) =>
        service.pickupPointServiceUpdatePickupPoint2({
          pointId: record.id!,
          body: { point: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
          <ProFormText
            name="name"
            label={intl.formatMessage({
              id: 'school.transport.pickupPoint.name',
              defaultMessage: 'Name',
            })}
            rules={[{ required: true }]}
          />
          <ProFormText
            name="latitude"
            label={intl.formatMessage({
              id: 'school.transport.latitude',
              defaultMessage: 'Latitude',
            })}
          />
          <ProFormText
            name="longitude"
            label={intl.formatMessage({
              id: 'school.transport.longitude',
              defaultMessage: 'Longitude',
            })}
          />
        </>
      }
    />
  );
};

export default TableList;
