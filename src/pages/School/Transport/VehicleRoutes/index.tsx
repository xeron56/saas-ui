import type { ProColumnType } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import type {
  V1CreateVehicleRouteRequest,
  V1TransportRoute,
  V1Vehicle,
  V1VehicleRoute,
} from '@gosaas/api';
import { TransportRouteServiceApi, VehicleRouteServiceApi, VehicleServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new VehicleRouteServiceApi();
const routeService = new TransportRouteServiceApi();
const vehicleService = new VehicleServiceApi();

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const TableList: React.FC = () => {
  const intl = useIntl();
  const [routes, setRoutes] = useState<Record<string, V1TransportRoute>>({});
  const [vehicles, setVehicles] = useState<Record<string, V1Vehicle>>({});

  useEffect(() => {
    Promise.all([
      routeService.transportRouteServiceListTransportRoute2({
        body: { pageSize: 100, sort: ['route_title'] },
      }),
      vehicleService.vehicleServiceListVehicle2({ body: { pageSize: 100, sort: ['vehicle_no'] } }),
    ]).then(([routeResp, vehicleResp]) => {
      setRoutes(keyedById(routeResp.data.items));
      setVehicles(keyedById(vehicleResp.data.items));
    });
  }, []);

  const columns: ProColumnType<V1VehicleRoute>[] = [
    {
      title: <FormattedMessage id="school.transport.route" defaultMessage="Route" />,
      dataIndex: 'transportRouteId',
      valueType: 'text',
      render: (_, record) =>
        record.transportRouteId
          ? routes[record.transportRouteId]?.routeTitle || record.transportRouteId
          : '-',
    },
    {
      title: <FormattedMessage id="school.transport.vehicle" defaultMessage="Vehicle" />,
      dataIndex: 'vehicleId',
      valueType: 'text',
      render: (_, record) =>
        record.vehicleId ? vehicles[record.vehicleId]?.vehicleNo || record.vehicleId : '-',
    },
  ];

  return (
    <ReferencePage<V1VehicleRoute>
      columns={columns}
      create={(fields: V1CreateVehicleRouteRequest) =>
        service.vehicleRouteServiceCreateVehicleRoute({ body: fields })
      }
      delete={(record) => service.vehicleRouteServiceDeleteVehicleRoute({ id: record.id! })}
      get={async (id) => (await service.vehicleRouteServiceGetVehicleRoute({ id })).data}
      list={async (req: any) =>
        (await service.vehicleRouteServiceListVehicleRoute2({ body: req })).data
      }
      title={(record) =>
        [
          routes[record.transportRouteId || '']?.routeTitle,
          vehicles[record.vehicleId || '']?.vehicleNo,
        ]
          .filter(Boolean)
          .join(' - ') || record.id
      }
      update={(record, fields: any) =>
        service.vehicleRouteServiceUpdateVehicleRoute2({
          vehicleRouteId: record.id!,
          body: { vehicleRoute: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
          <ProFormSelect
            name="transportRouteId"
            label={intl.formatMessage({
              id: 'school.transport.route',
              defaultMessage: 'Route',
            })}
            rules={[{ required: true }]}
            request={async () => {
              const resp = await routeService.transportRouteServiceListTransportRoute2({
                body: { pageSize: 100, sort: ['route_title'] },
              });
              return (resp.data.items || []).map((item) => ({
                label: item.routeTitle || item.id,
                value: item.id,
              }));
            }}
          />
          <ProFormSelect
            name="vehicleId"
            label={intl.formatMessage({
              id: 'school.transport.vehicle',
              defaultMessage: 'Vehicle',
            })}
            rules={[{ required: true }]}
            request={async () => {
              const resp = await vehicleService.vehicleServiceListVehicle2({
                body: { pageSize: 100, sort: ['vehicle_no'] },
              });
              return (resp.data.items || []).map((item) => ({
                label: item.vehicleNo || item.id,
                value: item.id,
              }));
            }}
          />
        </>
      }
    />
  );
};

export default TableList;
