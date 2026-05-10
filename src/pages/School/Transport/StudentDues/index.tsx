import { DollarOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import {
  DrawerForm,
  PageContainer,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Tag, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type {
  V1CreateStudentTransportPaymentRequest,
  V1PickupPoint,
  V1Student,
  V1StudentTransportDue,
  V1TransportRoute,
} from '@gosaas/api';
import {
  PickupPointServiceApi,
  StudentServiceApi,
  StudentTransportFeeServiceApi,
  TransportRouteServiceApi,
} from '@gosaas/api';
import { dateUtil, requestTransform } from '@gosaas/core';

const service = new StudentTransportFeeServiceApi();
const studentService = new StudentServiceApi();
const routeService = new TransportRouteServiceApi();
const pickupService = new PickupPointServiceApi();

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

type PaymentFormValues = Omit<V1CreateStudentTransportPaymentRequest, 'collectedAt'> & {
  collectedAt?: string | Date | null;
};

const TableList: React.FC = () => {
  const [students, setStudents] = useState<Record<string, V1Student>>({});
  const [routes, setRoutes] = useState<Record<string, V1TransportRoute>>({});
  const [pickups, setPickups] = useState<Record<string, V1PickupPoint>>({});
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<V1StudentTransportDue>();
  const actionRef = useRef<ActionType>();
  const intl = useIntl();

  useEffect(() => {
    Promise.all([
      studentService.studentServiceListStudent2({
        body: { pageSize: 200, sort: ['admission_no'] },
      }),
      routeService.transportRouteServiceListTransportRoute2({
        body: { pageSize: 100, sort: ['route_title'] },
      }),
      pickupService.pickupPointServiceListPickupPoint2({
        body: { pageSize: 100, sort: ['name'] },
      }),
    ]).then(([studentResp, routeResp, pickupResp]) => {
      setStudents(studentsByEnrollment(studentResp.data.items));
      setRoutes(keyedById(routeResp.data.items));
      setPickups(keyedById(pickupResp.data.items));
    });
  }, []);

  const handlePayment = async (values: PaymentFormValues) => {
    const amount = values.amount || 0;
    const discountAmount = values.discountAmount || 0;
    const fineAmount = values.fineAmount || 0;
    if (amount + discountAmount + fineAmount <= 0) {
      message.error(
        intl.formatMessage({
          id: 'school.transport.payment.amountRequired',
          defaultMessage: 'Enter a payment, discount, or fine amount.',
        }),
      );
      return false;
    }
    const hide = message.loading(
      intl.formatMessage({
        id: 'school.transport.payment.recording',
        defaultMessage: 'Recording...',
      }),
    );
    try {
      await service.studentTransportFeeServiceCreateStudentTransportPayment({
        body: {
          ...values,
          studentTransportFeeId: currentRow!.id!,
          amount,
          discountAmount,
          fineAmount,
          collectedAt: values.collectedAt ? dateUtil(values.collectedAt).toISOString() : undefined,
        },
      });
      hide();
      message.success(
        intl.formatMessage({
          id: 'school.transport.payment.recorded',
          defaultMessage: 'Payment Recorded',
        }),
      );
      setPaymentVisible(false);
      setCurrentRow(undefined);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const columns: ProColumnType<V1StudentTransportDue>[] = [
    {
      title: <FormattedMessage id="school.student.student" defaultMessage="Student" />,
      dataIndex: 'studentEnrollmentId',
      valueType: 'text',
      render: (_, record) => studentLabel(students[record.studentEnrollmentId || '']),
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
      title: <FormattedMessage id="school.transport.month" defaultMessage="Month" />,
      dataIndex: 'month',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.transport.dueDate" defaultMessage="Due Date" />,
      dataIndex: 'dueDate',
      valueType: 'date',
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
    },
    {
      title: <FormattedMessage id="school.transport.generatedBy" defaultMessage="Generated By" />,
      dataIndex: 'generatedBy',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Option" />,
      valueType: 'option',
      render: (_, record) => {
        if ((record.totalBalanceAmount || 0) <= 0) {
          return null;
        }
        return (
          <Button
            icon={<DollarOutlined />}
            type="link"
            onClick={() => {
              setCurrentRow(record);
              setPaymentVisible(true);
            }}
          >
            <FormattedMessage id="school.transport.recordPayment" defaultMessage="Record Payment" />
          </Button>
        );
      },
    },
  ];

  const getData = requestTransform<V1StudentTransportDue, any>(async (req) =>
    service
      .studentTransportFeeServiceListStudentTransportDue2({
        body: { ...req, asOf: new Date().toISOString() },
      })
      .then((resp) => resp.data),
  );

  return (
    <PageContainer>
      <ProTable<V1StudentTransportDue>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        pagination={{ defaultPageSize: 10 }}
        type="table"
        request={getData}
        columns={columns}
        scroll={{ x: 1500 }}
      />
      <DrawerForm<PaymentFormValues>
        open={paymentVisible}
        title={intl.formatMessage({
          id: 'school.transport.recordPayment',
          defaultMessage: 'Record Payment',
        })}
        initialValues={{
          amount: currentRow?.balanceAmount || 0,
          discountAmount: 0,
          fineAmount: 0,
          paymentMode: 'cash',
          collectedAt: new Date(),
        }}
        drawerProps={{
          destroyOnClose: true,
          onClose: () => {
            setPaymentVisible(false);
            setCurrentRow(undefined);
          },
        }}
        onFinish={handlePayment}
      >
        <ProFormDigit
          name="amount"
          label={intl.formatMessage({
            id: 'school.transport.paymentAmount',
            defaultMessage: 'Payment Amount',
          })}
          min={0}
          max={currentRow?.balanceAmount}
          fieldProps={{ precision: 2 }}
        />
        <ProFormDigit
          name="discountAmount"
          label={intl.formatMessage({
            id: 'school.transport.paymentDiscount',
            defaultMessage: 'Discount',
          })}
          min={0}
          max={currentRow?.balanceAmount}
          fieldProps={{ precision: 2 }}
        />
        <ProFormDigit
          name="fineAmount"
          label={intl.formatMessage({
            id: 'school.transport.paymentFine',
            defaultMessage: 'Fine Payment',
          })}
          min={0}
          max={currentRow?.fineBalanceAmount}
          fieldProps={{ precision: 2 }}
        />
        <ProFormSelect
          name="paymentMode"
          label={intl.formatMessage({
            id: 'school.transport.paymentMethod',
            defaultMessage: 'Payment Method',
          })}
          rules={[{ required: true }]}
          valueEnum={{
            cash: intl.formatMessage({
              id: 'school.transport.paymentMethod.cash',
              defaultMessage: 'Cash',
            }),
            bank: intl.formatMessage({
              id: 'school.transport.paymentMethod.bank',
              defaultMessage: 'Bank',
            }),
            cheque: intl.formatMessage({
              id: 'school.transport.paymentMethod.cheque',
              defaultMessage: 'Cheque',
            }),
            online: intl.formatMessage({
              id: 'school.transport.paymentMethod.online',
              defaultMessage: 'Online',
            }),
          }}
        />
        <ProFormDateTimePicker
          name="collectedAt"
          label={intl.formatMessage({
            id: 'school.transport.collectedAt',
            defaultMessage: 'Collected At',
          })}
        />
        <ProFormText
          name="referenceNo"
          label={intl.formatMessage({
            id: 'school.transport.referenceNo',
            defaultMessage: 'Reference No.',
          })}
        />
        <ProFormTextArea
          name="note"
          label={intl.formatMessage({ id: 'school.transport.paymentNote', defaultMessage: 'Note' })}
        />
      </DrawerForm>
    </PageContainer>
  );
};

export default TableList;
