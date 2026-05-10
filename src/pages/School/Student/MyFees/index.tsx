import type { ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Tabs, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import type {
  V1FeeGroup,
  V1FeeType,
  V1PickupPoint,
  V1StudentFeeDue,
  V1StudentFeePayment,
  V1StudentTransportDue,
  V1StudentTransportPayment,
  V1TransportRoute,
} from '@gosaas/api';
import {
  FeeGroupServiceApi,
  FeeTypeServiceApi,
  PickupPointServiceApi,
  StudentFeeServiceApi,
  StudentTransportFeeServiceApi,
  TransportRouteServiceApi,
} from '@gosaas/api';
import { dateUtil } from '@gosaas/core';

const feeService = new StudentFeeServiceApi();
const transportService = new StudentTransportFeeServiceApi();
const groupService = new FeeGroupServiceApi();
const typeService = new FeeTypeServiceApi();
const routeService = new TransportRouteServiceApi();
const pickupService = new PickupPointServiceApi();

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const statusColor = (status?: string) => {
  if (status === 'paid') {
    return 'success';
  }
  if (status === 'partial') {
    return 'processing';
  }
  return 'warning';
};

const feeTitle = (
  item: V1StudentFeeDue | undefined,
  groups: Record<string, V1FeeGroup>,
  types: Record<string, V1FeeType>,
) => {
  if (!item) {
    return '-';
  }
  return [
    groups[item.feeGroupId || '']?.name || item.feeGroupId,
    types[item.feeTypeId || '']?.name || types[item.feeTypeId || '']?.code || item.feeTypeId,
  ]
    .filter(Boolean)
    .join(' - ');
};

const transportFeeTitle = (
  item: V1StudentTransportDue | undefined,
  routes: Record<string, V1TransportRoute>,
  pickups: Record<string, V1PickupPoint>,
) => {
  if (!item) {
    return '-';
  }
  return [
    item.month,
    item.transportRouteId
      ? routes[item.transportRouteId]?.routeTitle || item.transportRouteId
      : undefined,
    item.pickupPointId ? pickups[item.pickupPointId]?.name || item.pickupPointId : undefined,
  ]
    .filter(Boolean)
    .join(' - ');
};

const MyFees: React.FC = () => {
  const intl = useIntl();
  const [groups, setGroups] = useState<Record<string, V1FeeGroup>>({});
  const [types, setTypes] = useState<Record<string, V1FeeType>>({});
  const [routes, setRoutes] = useState<Record<string, V1TransportRoute>>({});
  const [pickups, setPickups] = useState<Record<string, V1PickupPoint>>({});
  const [duesById, setDuesById] = useState<Record<string, V1StudentFeeDue>>({});
  const [transportDuesById, setTransportDuesById] = useState<Record<string, V1StudentTransportDue>>(
    {},
  );

  useEffect(() => {
    Promise.all([
      groupService.feeGroupServiceListFeeGroup2({ body: { pageSize: 200, sort: ['name'] } }),
      typeService.feeTypeServiceListFeeType2({ body: { pageSize: 200, sort: ['code'] } }),
      routeService.transportRouteServiceListTransportRoute2({
        body: { pageSize: 100, sort: ['route_title'] },
      }),
      pickupService.pickupPointServiceListPickupPoint2({
        body: { pageSize: 100, sort: ['name'] },
      }),
      feeService.studentFeeServiceListMyStudentFeeDue({
        body: { pageSize: 500, sort: ['due_date'], asOf: new Date().toISOString() },
      }),
      transportService.studentTransportFeeServiceListMyStudentTransportDue({
        body: { pageSize: 500, sort: ['due_date'], asOf: new Date().toISOString() },
      }),
    ]).then(([groupResp, typeResp, routeResp, pickupResp, dueResp, transportDueResp]) => {
      setGroups(keyedById(groupResp.data.items));
      setTypes(keyedById(typeResp.data.items));
      setRoutes(keyedById(routeResp.data.items));
      setPickups(keyedById(pickupResp.data.items));
      setDuesById(keyedById(dueResp.data.items));
      setTransportDuesById(keyedById(transportDueResp.data.items));
    });
  }, []);

  const dueColumns: ProColumnType<V1StudentFeeDue>[] = [
    {
      title: <FormattedMessage id="school.fee.fee" defaultMessage="Fee" />,
      dataIndex: 'feeTypeId',
      valueType: 'text',
      render: (_, record) => feeTitle(record, groups, types),
    },
    {
      title: <FormattedMessage id="school.fee.dueDate" defaultMessage="Due Date" />,
      dataIndex: 'dueDate',
      valueType: 'date',
      render: (_, record) => (record.dueDate ? dateUtil(record.dueDate).format('YYYY-MM-DD') : '-'),
    },
    {
      title: <FormattedMessage id="school.fee.baseFee" defaultMessage="Base Fee" />,
      dataIndex: 'amount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.fee.fine" defaultMessage="Fine" />,
      dataIndex: 'fineDueAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.fee.totalDue" defaultMessage="Total Due" />,
      dataIndex: 'totalDueAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.fee.paidAmount" defaultMessage="Paid" />,
      dataIndex: 'paidAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.fee.discountAmount" defaultMessage="Discount" />,
      dataIndex: 'discountAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.fee.totalBalance" defaultMessage="Balance" />,
      dataIndex: 'totalBalanceAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.fee.paymentStatus" defaultMessage="Status" />,
      dataIndex: 'paymentStatus',
      valueType: 'text',
      render: (_, record) => {
        const status = record.paymentStatus || 'unpaid';
        return (
          <Tag color={statusColor(status)}>
            {intl.formatMessage({
              id: `school.fee.paymentStatus.${status}`,
              defaultMessage: status,
            })}
          </Tag>
        );
      },
    },
    {
      title: <FormattedMessage id="school.fee.lastPaidAt" defaultMessage="Last Paid At" />,
      dataIndex: 'lastPaidAt',
      valueType: 'dateTime',
      render: (_, record) =>
        record.lastPaidAt ? dateUtil(record.lastPaidAt).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  const paymentColumns: ProColumnType<V1StudentFeePayment>[] = [
    {
      title: <FormattedMessage id="school.fee.fee" defaultMessage="Fee" />,
      dataIndex: 'studentFeeId',
      valueType: 'text',
      render: (_, record) => feeTitle(duesById[record.studentFeeId || ''], groups, types),
    },
    {
      title: <FormattedMessage id="school.fee.collectedAt" defaultMessage="Collected At" />,
      dataIndex: 'collectedAt',
      valueType: 'dateTime',
      render: (_, record) =>
        record.collectedAt ? dateUtil(record.collectedAt).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: <FormattedMessage id="school.fee.paidAmount" defaultMessage="Paid" />,
      dataIndex: 'amount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.fee.discountAmount" defaultMessage="Discount" />,
      dataIndex: 'discountAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.fee.fine" defaultMessage="Fine" />,
      dataIndex: 'fineAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.fee.paymentMode" defaultMessage="Payment Mode" />,
      dataIndex: 'paymentMode',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.fee.referenceNo" defaultMessage="Reference No." />,
      dataIndex: 'referenceNo',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.fee.note" defaultMessage="Note" />,
      dataIndex: 'note',
      valueType: 'text',
      ellipsis: true,
    },
  ];

  const transportDueColumns: ProColumnType<V1StudentTransportDue>[] = [
    {
      title: <FormattedMessage id="school.transport.month" defaultMessage="Month" />,
      dataIndex: 'month',
      valueType: 'text',
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
      title: <FormattedMessage id="school.transport.dueDate" defaultMessage="Due Date" />,
      dataIndex: 'dueDate',
      valueType: 'date',
      render: (_, record) => (record.dueDate ? dateUtil(record.dueDate).format('YYYY-MM-DD') : '-'),
    },
    {
      title: <FormattedMessage id="school.transport.baseFee" defaultMessage="Base Fee" />,
      dataIndex: 'amount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.transport.fine" defaultMessage="Fine" />,
      dataIndex: 'fineDueAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.transport.totalDue" defaultMessage="Total Due" />,
      dataIndex: 'totalDueAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.transport.paidAmount" defaultMessage="Paid" />,
      dataIndex: 'paidAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.transport.discountAmount" defaultMessage="Discount" />,
      dataIndex: 'discountAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.transport.totalBalance" defaultMessage="Balance" />,
      dataIndex: 'totalBalanceAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.transport.paymentStatus" defaultMessage="Status" />,
      dataIndex: 'paymentStatus',
      valueType: 'text',
      render: (_, record) => {
        const status = record.paymentStatus || 'unpaid';
        return (
          <Tag color={statusColor(status)}>
            {intl.formatMessage({
              id: `school.transport.paymentStatus.${status}`,
              defaultMessage: status,
            })}
          </Tag>
        );
      },
    },
    {
      title: <FormattedMessage id="school.transport.lastPaidAt" defaultMessage="Last Paid At" />,
      dataIndex: 'lastPaidAt',
      valueType: 'dateTime',
      render: (_, record) =>
        record.lastPaidAt ? dateUtil(record.lastPaidAt).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  const transportPaymentColumns: ProColumnType<V1StudentTransportPayment>[] = [
    {
      title: <FormattedMessage id="school.transport.fee" defaultMessage="Transport Fee" />,
      dataIndex: 'studentTransportFeeId',
      valueType: 'text',
      render: (_, record) =>
        transportFeeTitle(transportDuesById[record.studentTransportFeeId || ''], routes, pickups),
    },
    {
      title: <FormattedMessage id="school.transport.collectedAt" defaultMessage="Collected At" />,
      dataIndex: 'collectedAt',
      valueType: 'dateTime',
      render: (_, record) =>
        record.collectedAt ? dateUtil(record.collectedAt).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: <FormattedMessage id="school.transport.paidAmount" defaultMessage="Paid" />,
      dataIndex: 'amount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.transport.discountAmount" defaultMessage="Discount" />,
      dataIndex: 'discountAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.transport.fine" defaultMessage="Fine" />,
      dataIndex: 'fineAmount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.transport.paymentMode" defaultMessage="Payment Mode" />,
      dataIndex: 'paymentMode',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.transport.referenceNo" defaultMessage="Reference No." />,
      dataIndex: 'referenceNo',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.transport.note" defaultMessage="Note" />,
      dataIndex: 'note',
      valueType: 'text',
      ellipsis: true,
    },
  ];

  return (
    <PageContainer>
      <Tabs
        items={[
          {
            key: 'dues',
            label: <FormattedMessage id="school.fee.regularDues" defaultMessage="Regular Dues" />,
            children: (
              <ProTable<V1StudentFeeDue>
                rowKey="id"
                search={false}
                pagination={{ defaultPageSize: 10 }}
                columns={dueColumns}
                request={async (params) => {
                  const resp = await feeService.studentFeeServiceListMyStudentFeeDue({
                    body: {
                      pageOffset: ((params.current || 1) - 1) * (params.pageSize || 10),
                      pageSize: params.pageSize,
                      sort: ['due_date', 'created_at'],
                      asOf: new Date().toISOString(),
                    },
                  });
                  setDuesById((prev) => ({ ...prev, ...keyedById(resp.data.items) }));
                  return {
                    data: resp.data.items || [],
                    total: resp.data.filterSize || resp.data.totalSize || 0,
                    success: true,
                  };
                }}
              />
            ),
          },
          {
            key: 'payments',
            label: (
              <FormattedMessage id="school.fee.regularPayments" defaultMessage="Regular Payments" />
            ),
            children: (
              <ProTable<V1StudentFeePayment>
                rowKey="id"
                search={false}
                pagination={{ defaultPageSize: 10 }}
                columns={paymentColumns}
                request={async (params) => {
                  const resp = await feeService.studentFeeServiceListMyStudentFeePayment({
                    body: {
                      pageOffset: ((params.current || 1) - 1) * (params.pageSize || 10),
                      pageSize: params.pageSize,
                      sort: ['-collected_at', '-created_at'],
                    },
                  });
                  return {
                    data: resp.data.items || [],
                    total: resp.data.filterSize || resp.data.totalSize || 0,
                    success: true,
                  };
                }}
              />
            ),
          },
          {
            key: 'transport-dues',
            label: (
              <FormattedMessage id="school.fee.transportDues" defaultMessage="Transport Dues" />
            ),
            children: (
              <ProTable<V1StudentTransportDue>
                rowKey="id"
                search={false}
                pagination={{ defaultPageSize: 10 }}
                columns={transportDueColumns}
                scroll={{ x: 1300 }}
                request={async (params) => {
                  const resp =
                    await transportService.studentTransportFeeServiceListMyStudentTransportDue({
                      body: {
                        pageOffset: ((params.current || 1) - 1) * (params.pageSize || 10),
                        pageSize: params.pageSize,
                        sort: ['due_date', 'created_at'],
                        asOf: new Date().toISOString(),
                      },
                    });
                  setTransportDuesById((prev) => ({ ...prev, ...keyedById(resp.data.items) }));
                  return {
                    data: resp.data.items || [],
                    total: resp.data.filterSize || resp.data.totalSize || 0,
                    success: true,
                  };
                }}
              />
            ),
          },
          {
            key: 'transport-payments',
            label: (
              <FormattedMessage
                id="school.fee.transportPayments"
                defaultMessage="Transport Payments"
              />
            ),
            children: (
              <ProTable<V1StudentTransportPayment>
                rowKey="id"
                search={false}
                pagination={{ defaultPageSize: 10 }}
                columns={transportPaymentColumns}
                request={async (params) => {
                  const resp =
                    await transportService.studentTransportFeeServiceListMyStudentTransportPayment({
                      body: {
                        pageOffset: ((params.current || 1) - 1) * (params.pageSize || 10),
                        pageSize: params.pageSize,
                        sort: ['-collected_at', '-created_at'],
                      },
                    });
                  return {
                    data: resp.data.items || [],
                    total: resp.data.filterSize || resp.data.totalSize || 0,
                    success: true,
                  };
                }}
              />
            ),
          },
        ]}
      />
    </PageContainer>
  );
};

export default MyFees;
