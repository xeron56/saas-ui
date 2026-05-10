import {
  CalendarOutlined,
  CarOutlined,
  DollarOutlined,
  DownloadOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, DatePicker, Space, Statistic, Table, Tabs, Tag, Typography, message } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  V1FeeGroup,
  V1FeeType,
  V1PickupPoint,
  V1Student,
  V1StudentFeeDue,
  V1StudentTransportDue,
  V1TransportRoute,
} from '@gosaas/api';
import {
  FeeGroupServiceApi,
  FeeTypeServiceApi,
  PickupPointServiceApi,
  StudentFeeServiceApi,
  StudentServiceApi,
  StudentTransportFeeServiceApi,
  TransportRouteServiceApi,
} from '@gosaas/api';
import { dateUtil, requestTransform } from '@gosaas/core';

const feeService = new StudentFeeServiceApi();
const transportFeeService = new StudentTransportFeeServiceApi();
const studentService = new StudentServiceApi();
const groupService = new FeeGroupServiceApi();
const typeService = new FeeTypeServiceApi();
const routeService = new TransportRouteServiceApi();
const pickupService = new PickupPointServiceApi();

const PAGE_SIZE = 500;

type ListReply<T> = {
  items?: T[];
  totalSize?: number;
};

type Summary = {
  count: number;
  totalDueAmount: number;
  paidAmount: number;
  discountAmount: number;
  fineDueAmount: number;
  totalBalanceAmount: number;
};

type SummaryRow = Summary & {
  key: string;
  label: React.ReactNode;
};

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const studentsByEnrollment = (items: V1Student[] = []) =>
  items.reduce<Record<string, V1Student>>((ret, item) => {
    if (item.enrollment?.id) {
      ret[item.enrollment.id] = item;
    }
    return ret;
  }, {});

const studentLabel = (student?: V1Student) => {
  if (!student) {
    return '-';
  }
  return [
    student.admissionNo,
    [student.firstName, student.lastName].filter(Boolean).join(' '),
    student.enrollment?.rollNo,
  ]
    .filter(Boolean)
    .join(' - ');
};

const statusColor = (status?: string) => {
  if (status === 'paid') {
    return 'success';
  }
  if (status === 'partial') {
    return 'processing';
  }
  return 'warning';
};

const emptySummary = (): Summary => ({
  count: 0,
  totalDueAmount: 0,
  paidAmount: 0,
  discountAmount: 0,
  fineDueAmount: 0,
  totalBalanceAmount: 0,
});

const aggregate = (
  items: Array<
    Pick<
      V1StudentFeeDue | V1StudentTransportDue,
      'totalDueAmount' | 'paidAmount' | 'discountAmount' | 'fineDueAmount' | 'totalBalanceAmount'
    >
  >,
): Summary =>
  items.reduce<Summary>((ret, item) => {
    ret.count += 1;
    ret.totalDueAmount += item.totalDueAmount || 0;
    ret.paidAmount += item.paidAmount || 0;
    ret.discountAmount += item.discountAmount || 0;
    ret.fineDueAmount += item.fineDueAmount || 0;
    ret.totalBalanceAmount += item.totalBalanceAmount || 0;
    return ret;
  }, emptySummary());

const combineSummary = (left: Summary, right: Summary): Summary => ({
  count: left.count + right.count,
  totalDueAmount: left.totalDueAmount + right.totalDueAmount,
  paidAmount: left.paidAmount + right.paidAmount,
  discountAmount: left.discountAmount + right.discountAmount,
  fineDueAmount: left.fineDueAmount + right.fineDueAmount,
  totalBalanceAmount: left.totalBalanceAmount + right.totalBalanceAmount,
});

const fetchAll = async <T,>(loader: (pageOffset: number) => Promise<ListReply<T>>) => {
  const all: T[] = [];
  let pageOffset = 0;

  for (;;) {
    const resp = await loader(pageOffset);
    const items = resp.items || [];
    all.push(...items);

    if (
      items.length < PAGE_SIZE ||
      (resp.totalSize !== null && resp.totalSize !== undefined && all.length >= resp.totalSize) ||
      items.length === 0
    ) {
      return all;
    }
    pageOffset += items.length;
  }
};

const numericValue = (value?: number) => Number(value || 0).toFixed(2);

const csvValue = (value?: string | number | null) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadCsv = (filename: string, rows: Array<Array<string | number | null | undefined>>) => {
  const csv = rows.map((row) => row.map(csvValue).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const FinanceReport: React.FC = () => {
  const [asOf, setAsOf] = useState(dateUtil());
  const [students, setStudents] = useState<Record<string, V1Student>>({});
  const [groups, setGroups] = useState<Record<string, V1FeeGroup>>({});
  const [types, setTypes] = useState<Record<string, V1FeeType>>({});
  const [routes, setRoutes] = useState<Record<string, V1TransportRoute>>({});
  const [pickups, setPickups] = useState<Record<string, V1PickupPoint>>({});
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [regularExporting, setRegularExporting] = useState(false);
  const [transportExporting, setTransportExporting] = useState(false);
  const [feeSummary, setFeeSummary] = useState<Summary>(emptySummary());
  const [transportSummary, setTransportSummary] = useState<Summary>(emptySummary());
  const feeActionRef = useRef<ActionType>();
  const transportActionRef = useRef<ActionType>();
  const intl = useIntl();

  const asOfISO = useMemo(() => asOf.endOf('day').toISOString(), [asOf]);
  const totalSummary = useMemo(
    () => combineSummary(feeSummary, transportSummary),
    [feeSummary, transportSummary],
  );

  useEffect(() => {
    Promise.all([
      studentService.studentServiceListStudent2({
        body: { pageSize: 500, sort: ['admission_no'] },
      }),
      groupService.feeGroupServiceListFeeGroup2({ body: { pageSize: 200, sort: ['name'] } }),
      typeService.feeTypeServiceListFeeType2({ body: { pageSize: 200, sort: ['code'] } }),
      routeService.transportRouteServiceListTransportRoute2({
        body: { pageSize: 200, sort: ['route_title'] },
      }),
      pickupService.pickupPointServiceListPickupPoint2({
        body: { pageSize: 200, sort: ['name'] },
      }),
    ])
      .then(([studentResp, groupResp, typeResp, routeResp, pickupResp]) => {
        setStudents(studentsByEnrollment(studentResp.data.items));
        setGroups(keyedById(groupResp.data.items));
        setTypes(keyedById(typeResp.data.items));
        setRoutes(keyedById(routeResp.data.items));
        setPickups(keyedById(pickupResp.data.items));
      })
      .catch(() => {
        message.error(
          intl.formatMessage({
            id: 'school.report.finance.referenceLoadFailed',
            defaultMessage: 'Failed to load report reference data.',
          }),
        );
      });
  }, [intl]);

  useEffect(() => {
    let cancelled = false;
    setSummaryLoading(true);

    Promise.all([
      fetchAll<V1StudentFeeDue>((pageOffset) =>
        feeService
          .studentFeeServiceListStudentFeeDue2({
            body: { pageOffset, pageSize: PAGE_SIZE, asOf: asOfISO },
          })
          .then((resp) => resp.data),
      ),
      fetchAll<V1StudentTransportDue>((pageOffset) =>
        transportFeeService
          .studentTransportFeeServiceListStudentTransportDue2({
            body: { pageOffset, pageSize: PAGE_SIZE, asOf: asOfISO },
          })
          .then((resp) => resp.data),
      ),
    ])
      .then(([fees, transportFees]) => {
        if (!cancelled) {
          setFeeSummary(aggregate(fees));
          setTransportSummary(aggregate(transportFees));
        }
      })
      .catch(() => {
        if (!cancelled) {
          message.error(
            intl.formatMessage({
              id: 'school.report.finance.summaryLoadFailed',
              defaultMessage: 'Failed to load finance reconciliation totals.',
            }),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [asOfISO, intl]);

  const feeColumns: ProColumnType<V1StudentFeeDue>[] = [
    {
      title: <FormattedMessage id="school.student.student" defaultMessage="Student" />,
      dataIndex: 'studentEnrollmentId',
      render: (_, record) => studentLabel(students[record.studentEnrollmentId || '']),
    },
    {
      title: <FormattedMessage id="school.fee.group" defaultMessage="Fee Group" />,
      dataIndex: 'feeGroupId',
      render: (_, record) => groups[record.feeGroupId || '']?.name || record.feeGroupId || '-',
    },
    {
      title: <FormattedMessage id="school.fee.type" defaultMessage="Fee Type" />,
      dataIndex: 'feeTypeId',
      render: (_, record) =>
        types[record.feeTypeId || '']?.name || types[record.feeTypeId || '']?.code || '-',
    },
    {
      title: <FormattedMessage id="school.fee.dueDate" defaultMessage="Due Date" />,
      dataIndex: 'dueDate',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="school.fee.totalDue" defaultMessage="Total Due" />,
      dataIndex: 'totalDueAmount',
      valueType: 'money',
      sorter: true,
    },
    {
      title: <FormattedMessage id="school.fee.paidAmount" defaultMessage="Paid" />,
      dataIndex: 'paidAmount',
      valueType: 'money',
      sorter: true,
    },
    {
      title: <FormattedMessage id="school.fee.discountAmount" defaultMessage="Discount" />,
      dataIndex: 'discountAmount',
      valueType: 'money',
      sorter: true,
    },
    {
      title: <FormattedMessage id="school.fee.totalBalance" defaultMessage="Balance" />,
      dataIndex: 'totalBalanceAmount',
      valueType: 'money',
      sorter: true,
    },
    {
      title: <FormattedMessage id="school.fee.paymentStatus" defaultMessage="Status" />,
      dataIndex: 'paymentStatus',
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
    },
  ];

  const transportColumns: ProColumnType<V1StudentTransportDue>[] = [
    {
      title: <FormattedMessage id="school.student.student" defaultMessage="Student" />,
      dataIndex: 'studentEnrollmentId',
      render: (_, record) => studentLabel(students[record.studentEnrollmentId || '']),
    },
    {
      title: <FormattedMessage id="school.transport.route" defaultMessage="Route" />,
      dataIndex: 'transportRouteId',
      render: (_, record) =>
        record.transportRouteId
          ? routes[record.transportRouteId]?.routeTitle || record.transportRouteId
          : '-',
    },
    {
      title: <FormattedMessage id="school.transport.pickupPoint" defaultMessage="Pickup Point" />,
      dataIndex: 'pickupPointId',
      render: (_, record) =>
        record.pickupPointId ? pickups[record.pickupPointId]?.name || record.pickupPointId : '-',
    },
    {
      title: <FormattedMessage id="school.transport.month" defaultMessage="Month" />,
      dataIndex: 'month',
    },
    {
      title: <FormattedMessage id="school.transport.dueDate" defaultMessage="Due Date" />,
      dataIndex: 'dueDate',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="school.transport.totalDue" defaultMessage="Total Due" />,
      dataIndex: 'totalDueAmount',
      valueType: 'money',
      sorter: true,
    },
    {
      title: <FormattedMessage id="school.transport.paidAmount" defaultMessage="Paid" />,
      dataIndex: 'paidAmount',
      valueType: 'money',
      sorter: true,
    },
    {
      title: <FormattedMessage id="school.transport.discountAmount" defaultMessage="Discount" />,
      dataIndex: 'discountAmount',
      valueType: 'money',
      sorter: true,
    },
    {
      title: <FormattedMessage id="school.transport.totalBalance" defaultMessage="Balance" />,
      dataIndex: 'totalBalanceAmount',
      valueType: 'money',
      sorter: true,
    },
    {
      title: <FormattedMessage id="school.transport.paymentStatus" defaultMessage="Status" />,
      dataIndex: 'paymentStatus',
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
    },
  ];

  const summaryRows: SummaryRow[] = [
    {
      key: 'fee',
      label: (
        <FormattedMessage id="school.report.finance.regularFees" defaultMessage="Regular Fees" />
      ),
      ...feeSummary,
    },
    {
      key: 'transport',
      label: (
        <FormattedMessage
          id="school.report.finance.transportFees"
          defaultMessage="Transport Fees"
        />
      ),
      ...transportSummary,
    },
    {
      key: 'total',
      label: <FormattedMessage id="school.report.finance.total" defaultMessage="Total" />,
      ...totalSummary,
    },
  ];

  const summaryColumns = [
    {
      title: <FormattedMessage id="school.report.finance.source" defaultMessage="Source" />,
      dataIndex: 'label',
    },
    {
      title: <FormattedMessage id="school.report.finance.items" defaultMessage="Items" />,
      dataIndex: 'count',
      align: 'right' as const,
    },
    {
      title: <FormattedMessage id="school.report.finance.totalDue" defaultMessage="Total Due" />,
      dataIndex: 'totalDueAmount',
      align: 'right' as const,
      render: (value?: number) => numericValue(value),
    },
    {
      title: <FormattedMessage id="school.report.finance.paid" defaultMessage="Paid" />,
      dataIndex: 'paidAmount',
      align: 'right' as const,
      render: (value?: number) => numericValue(value),
    },
    {
      title: <FormattedMessage id="school.report.finance.discount" defaultMessage="Discount" />,
      dataIndex: 'discountAmount',
      align: 'right' as const,
      render: (value?: number) => numericValue(value),
    },
    {
      title: <FormattedMessage id="school.report.finance.fineDue" defaultMessage="Fine Due" />,
      dataIndex: 'fineDueAmount',
      align: 'right' as const,
      render: (value?: number) => numericValue(value),
    },
    {
      title: <FormattedMessage id="school.report.finance.balance" defaultMessage="Balance" />,
      dataIndex: 'totalBalanceAmount',
      align: 'right' as const,
      render: (value?: number) => numericValue(value),
    },
  ];

  const feeData = requestTransform<V1StudentFeeDue, any>((req) =>
    feeService
      .studentFeeServiceListStudentFeeDue2({
        body: { ...req, asOf: asOfISO },
      })
      .then((resp) => resp.data),
  );

  const transportData = requestTransform<V1StudentTransportDue, any>((req) =>
    transportFeeService
      .studentTransportFeeServiceListStudentTransportDue2({
        body: { ...req, asOf: asOfISO },
      })
      .then((resp) => resp.data),
  );

  const handleRegularFeeExport = async () => {
    setRegularExporting(true);

    try {
      const resp = await feeService.studentFeeServiceGetStudentFeeReconciliationSnapshot({
        body: { asOf: asOfISO },
      });
      const snapshotAsOf = resp.data.asOf || asOfISO;
      const rows: Array<Array<string | number | null | undefined>> = [
        [
          intl.formatMessage({
            id: 'school.report.finance.asOf',
            defaultMessage: 'As Of',
          }),
          intl.formatMessage({
            id: 'school.student.student',
            defaultMessage: 'Student',
          }),
          intl.formatMessage({
            id: 'school.fee.group',
            defaultMessage: 'Fee Group',
          }),
          intl.formatMessage({
            id: 'school.fee.type',
            defaultMessage: 'Fee Type',
          }),
          intl.formatMessage({
            id: 'school.fee.dueDate',
            defaultMessage: 'Due Date',
          }),
          intl.formatMessage({
            id: 'school.fee.totalDue',
            defaultMessage: 'Total Due',
          }),
          intl.formatMessage({
            id: 'school.fee.paidAmount',
            defaultMessage: 'Paid',
          }),
          intl.formatMessage({
            id: 'school.fee.discountAmount',
            defaultMessage: 'Discount',
          }),
          intl.formatMessage({
            id: 'school.report.finance.fineDue',
            defaultMessage: 'Fine Due',
          }),
          intl.formatMessage({
            id: 'school.fee.totalBalance',
            defaultMessage: 'Balance',
          }),
          intl.formatMessage({
            id: 'school.fee.paymentStatus',
            defaultMessage: 'Status',
          }),
          intl.formatMessage({
            id: 'school.fee.lastPaidAt',
            defaultMessage: 'Last Paid At',
          }),
        ],
        ...(resp.data.items || []).map((item) => {
          const status = item.paymentStatus || 'unpaid';
          return [
            dateUtil(snapshotAsOf).format('YYYY-MM-DD HH:mm:ss'),
            studentLabel(students[item.studentEnrollmentId || '']),
            groups[item.feeGroupId || '']?.name || item.feeGroupId || '',
            types[item.feeTypeId || '']?.name || types[item.feeTypeId || '']?.code || '',
            item.dueDate ? dateUtil(item.dueDate).format('YYYY-MM-DD') : '',
            numericValue(item.totalDueAmount),
            numericValue(item.paidAmount),
            numericValue(item.discountAmount),
            numericValue(item.fineDueAmount),
            numericValue(item.totalBalanceAmount),
            intl.formatMessage({
              id: `school.fee.paymentStatus.${status}`,
              defaultMessage: status,
            }),
            item.lastPaidAt ? dateUtil(item.lastPaidAt).format('YYYY-MM-DD HH:mm:ss') : '',
          ];
        }),
      ];

      downloadCsv(`regular-fee-reconciliation-${asOf.format('YYYY-MM-DD')}.csv`, rows);
    } catch {
      message.error(
        intl.formatMessage({
          id: 'school.report.finance.regularFeeExportFailed',
          defaultMessage: 'Failed to export regular fee reconciliation snapshot.',
        }),
      );
    } finally {
      setRegularExporting(false);
    }
  };

  const handleTransportFeeExport = async () => {
    setTransportExporting(true);

    try {
      const resp =
        await transportFeeService.studentTransportFeeServiceGetStudentTransportReconciliationSnapshot(
          {
            body: { asOf: asOfISO },
          },
        );
      const snapshotAsOf = resp.data.asOf || asOfISO;
      const rows: Array<Array<string | number | null | undefined>> = [
        [
          intl.formatMessage({
            id: 'school.report.finance.asOf',
            defaultMessage: 'As Of',
          }),
          intl.formatMessage({
            id: 'school.student.student',
            defaultMessage: 'Student',
          }),
          intl.formatMessage({
            id: 'school.transport.route',
            defaultMessage: 'Route',
          }),
          intl.formatMessage({
            id: 'school.transport.pickupPoint',
            defaultMessage: 'Pickup Point',
          }),
          intl.formatMessage({
            id: 'school.transport.month',
            defaultMessage: 'Month',
          }),
          intl.formatMessage({
            id: 'school.transport.dueDate',
            defaultMessage: 'Due Date',
          }),
          intl.formatMessage({
            id: 'school.transport.totalDue',
            defaultMessage: 'Total Due',
          }),
          intl.formatMessage({
            id: 'school.transport.paidAmount',
            defaultMessage: 'Paid',
          }),
          intl.formatMessage({
            id: 'school.transport.discountAmount',
            defaultMessage: 'Discount',
          }),
          intl.formatMessage({
            id: 'school.report.finance.fineDue',
            defaultMessage: 'Fine Due',
          }),
          intl.formatMessage({
            id: 'school.transport.totalBalance',
            defaultMessage: 'Balance',
          }),
          intl.formatMessage({
            id: 'school.transport.paymentStatus',
            defaultMessage: 'Status',
          }),
          intl.formatMessage({
            id: 'school.transport.lastPaidAt',
            defaultMessage: 'Last Paid At',
          }),
        ],
        ...(resp.data.items || []).map((item) => {
          const status = item.paymentStatus || 'unpaid';
          return [
            dateUtil(snapshotAsOf).format('YYYY-MM-DD HH:mm:ss'),
            studentLabel(students[item.studentEnrollmentId || '']),
            routes[item.transportRouteId || '']?.routeTitle || item.transportRouteId || '',
            pickups[item.pickupPointId || '']?.name || item.pickupPointId || '',
            item.month,
            item.dueDate ? dateUtil(item.dueDate).format('YYYY-MM-DD') : '',
            numericValue(item.totalDueAmount),
            numericValue(item.paidAmount),
            numericValue(item.discountAmount),
            numericValue(item.fineDueAmount),
            numericValue(item.totalBalanceAmount),
            intl.formatMessage({
              id: `school.transport.paymentStatus.${status}`,
              defaultMessage: status,
            }),
            item.lastPaidAt ? dateUtil(item.lastPaidAt).format('YYYY-MM-DD HH:mm:ss') : '',
          ];
        }),
      ];

      downloadCsv(`transport-fee-reconciliation-${asOf.format('YYYY-MM-DD')}.csv`, rows);
    } catch {
      message.error(
        intl.formatMessage({
          id: 'school.report.finance.transportFeeExportFailed',
          defaultMessage: 'Failed to export transport fee reconciliation snapshot.',
        }),
      );
    } finally {
      setTransportExporting(false);
    }
  };

  return (
    <PageContainer>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Space wrap size={16}>
          <Statistic
            title={intl.formatMessage({
              id: 'school.report.finance.outstanding',
              defaultMessage: 'Outstanding',
            })}
            value={numericValue(totalSummary.totalBalanceAmount)}
            prefix={<DollarOutlined />}
            loading={summaryLoading}
          />
          <Statistic
            title={intl.formatMessage({
              id: 'school.report.finance.collected',
              defaultMessage: 'Collected',
            })}
            value={numericValue(totalSummary.paidAmount)}
            prefix={<DollarOutlined />}
            loading={summaryLoading}
          />
          <Statistic
            title={intl.formatMessage({
              id: 'school.report.finance.openItems',
              defaultMessage: 'Open Items',
            })}
            value={totalSummary.count}
            prefix={<FileSearchOutlined />}
            loading={summaryLoading}
          />
          <Space>
            <CalendarOutlined />
            <Typography.Text>
              <FormattedMessage id="school.report.finance.asOf" defaultMessage="As Of" />
            </Typography.Text>
            <DatePicker
              allowClear={false}
              value={asOf}
              onChange={(value) => {
                if (value) {
                  setAsOf(value);
                  feeActionRef.current?.reload();
                  transportActionRef.current?.reload();
                }
              }}
            />
          </Space>
        </Space>
        <Table<SummaryRow>
          bordered
          columns={summaryColumns}
          dataSource={summaryRows}
          loading={summaryLoading}
          pagination={false}
          rowKey="key"
          size="small"
        />
        <Tabs
          items={[
            {
              key: 'regular',
              label: (
                <Space>
                  <DollarOutlined />
                  <FormattedMessage
                    id="school.report.finance.regularFees"
                    defaultMessage="Regular Fees"
                  />
                </Space>
              ),
              children: (
                <ProTable<V1StudentFeeDue>
                  actionRef={feeActionRef}
                  columns={feeColumns}
                  pagination={{ defaultPageSize: 10 }}
                  request={feeData}
                  rowKey="id"
                  search={false}
                  scroll={{ x: 1200 }}
                  toolBarRender={() => [
                    <Button
                      key="export"
                      icon={<DownloadOutlined />}
                      loading={regularExporting}
                      onClick={handleRegularFeeExport}
                      size="small"
                    >
                      <FormattedMessage
                        id="school.report.finance.exportRegularFees"
                        defaultMessage="Export"
                      />
                    </Button>,
                  ]}
                  type="table"
                />
              ),
            },
            {
              key: 'transport',
              label: (
                <Space>
                  <CarOutlined />
                  <FormattedMessage
                    id="school.report.finance.transportFees"
                    defaultMessage="Transport Fees"
                  />
                </Space>
              ),
              children: (
                <ProTable<V1StudentTransportDue>
                  actionRef={transportActionRef}
                  columns={transportColumns}
                  pagination={{ defaultPageSize: 10 }}
                  request={transportData}
                  rowKey="id"
                  search={false}
                  scroll={{ x: 1200 }}
                  toolBarRender={() => [
                    <Button
                      key="export"
                      icon={<DownloadOutlined />}
                      loading={transportExporting}
                      onClick={handleTransportFeeExport}
                      size="small"
                    >
                      <FormattedMessage
                        id="school.report.finance.exportTransportFees"
                        defaultMessage="Export"
                      />
                    </Button>,
                  ]}
                  type="table"
                />
              ),
            },
          ]}
        />
      </Space>
    </PageContainer>
  );
};

export default FinanceReport;
