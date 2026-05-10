import type { ProColumnType } from '@ant-design/pro-components';
import { ProFormDigit, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import type {
  V1AcademicSession,
  V1CreateRoutePickupPointRequest,
  V1PickupPoint,
  V1RoutePickupPoint,
  V1TransportRoute,
} from '@gosaas/api';
import {
  AcademicSessionServiceApi,
  PickupPointServiceApi,
  RoutePickupPointServiceApi,
  TransportRouteServiceApi,
} from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new RoutePickupPointServiceApi();
const sessionService = new AcademicSessionServiceApi();
const routeService = new TransportRouteServiceApi();
const pickupService = new PickupPointServiceApi();

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const TableList: React.FC = () => {
  const intl = useIntl();
  const [sessions, setSessions] = useState<Record<string, V1AcademicSession>>({});
  const [routes, setRoutes] = useState<Record<string, V1TransportRoute>>({});
  const [pickups, setPickups] = useState<Record<string, V1PickupPoint>>({});

  useEffect(() => {
    Promise.all([
      sessionService.academicSessionServiceListAcademicSession2({
        body: { pageSize: 100, sort: ['code'] },
      }),
      routeService.transportRouteServiceListTransportRoute2({
        body: { pageSize: 100, sort: ['route_title'] },
      }),
      pickupService.pickupPointServiceListPickupPoint2({
        body: { pageSize: 100, sort: ['name'] },
      }),
    ]).then(([sessionResp, routeResp, pickupResp]) => {
      setSessions(keyedById(sessionResp.data.items));
      setRoutes(keyedById(routeResp.data.items));
      setPickups(keyedById(pickupResp.data.items));
    });
  }, []);

  const columns: ProColumnType<V1RoutePickupPoint>[] = [
    {
      title: <FormattedMessage id="school.academic.sessions" defaultMessage="Academic Sessions" />,
      dataIndex: 'academicSessionId',
      valueType: 'text',
      render: (_, record) =>
        record.academicSessionId
          ? sessions[record.academicSessionId]?.code || record.academicSessionId
          : '-',
    },
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
      title: <FormattedMessage id="school.transport.pickupPoint" defaultMessage="Pickup Point" />,
      dataIndex: 'pickupPointId',
      valueType: 'text',
      render: (_, record) =>
        record.pickupPointId ? pickups[record.pickupPointId]?.name || record.pickupPointId : '-',
    },
    {
      title: <FormattedMessage id="school.transport.pickupTime" defaultMessage="Pickup Time" />,
      dataIndex: 'pickupTime',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.transport.fees" defaultMessage="Fees" />,
      dataIndex: 'fees',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.transport.orderNumber" defaultMessage="Order" />,
      dataIndex: 'orderNumber',
      valueType: 'digit',
    },
  ];

  return (
    <ReferencePage<V1RoutePickupPoint>
      columns={columns}
      create={(fields: V1CreateRoutePickupPointRequest) =>
        service.routePickupPointServiceCreateRoutePickupPoint({ body: fields })
      }
      delete={(record) => service.routePickupPointServiceDeleteRoutePickupPoint({ id: record.id! })}
      get={async (id) => (await service.routePickupPointServiceGetRoutePickupPoint({ id })).data}
      list={async (req: any) =>
        (await service.routePickupPointServiceListRoutePickupPoint2({ body: req })).data
      }
      title={(record) =>
        [
          routes[record.transportRouteId || '']?.routeTitle,
          pickups[record.pickupPointId || '']?.name,
        ]
          .filter(Boolean)
          .join(' - ') || record.id
      }
      update={(record, fields: any) =>
        service.routePickupPointServiceUpdateRoutePickupPoint2({
          pointId: record.id!,
          body: { point: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
          <ProFormSelect
            name="academicSessionId"
            label={intl.formatMessage({
              id: 'school.academic.sessions',
              defaultMessage: 'Academic Sessions',
            })}
            rules={[{ required: true }]}
            request={async () => {
              const resp = await sessionService.academicSessionServiceListAcademicSession2({
                body: { pageSize: 100, sort: ['code'] },
              });
              return (resp.data.items || []).map((item) => ({
                label: item.code || item.name || item.id,
                value: item.id,
              }));
            }}
          />
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
            name="pickupPointId"
            label={intl.formatMessage({
              id: 'school.transport.pickupPoint',
              defaultMessage: 'Pickup Point',
            })}
            rules={[{ required: true }]}
            request={async () => {
              const resp = await pickupService.pickupPointServiceListPickupPoint2({
                body: { pageSize: 100, sort: ['name'] },
              });
              return (resp.data.items || []).map((item) => ({
                label: item.name || item.id,
                value: item.id,
              }));
            }}
          />
          <ProFormDigit
            name="fees"
            label={intl.formatMessage({ id: 'school.transport.fees', defaultMessage: 'Fees' })}
            min={0}
          />
          <ProFormDigit
            name="destinationDistance"
            label={intl.formatMessage({
              id: 'school.transport.destinationDistance',
              defaultMessage: 'Distance',
            })}
            min={0}
          />
          <ProFormText
            name="pickupTime"
            label={intl.formatMessage({
              id: 'school.transport.pickupTime',
              defaultMessage: 'Pickup Time',
            })}
          />
          <ProFormDigit
            name="orderNumber"
            label={intl.formatMessage({
              id: 'school.transport.orderNumber',
              defaultMessage: 'Order',
            })}
            min={0}
            fieldProps={{ precision: 0 }}
          />
        </>
      }
    />
  );
};

export default TableList;
