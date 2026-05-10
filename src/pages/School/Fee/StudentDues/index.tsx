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
  V1CreateStudentFeePaymentRequest,
  V1FeeGroup,
  V1FeeType,
  V1Student,
  V1StudentFeeDue,
} from '@gosaas/api';
import {
  FeeGroupServiceApi,
  FeeTypeServiceApi,
  StudentFeeServiceApi,
  StudentServiceApi,
} from '@gosaas/api';
import { dateUtil, requestTransform } from '@gosaas/core';

const service = new StudentFeeServiceApi();
const studentService = new StudentServiceApi();
const groupService = new FeeGroupServiceApi();
const typeService = new FeeTypeServiceApi();

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

type PaymentFormValues = Omit<V1CreateStudentFeePaymentRequest, 'collectedAt'> & {
  collectedAt?: string | Date | null;
};

const TableList: React.FC = () => {
  const [students, setStudents] = useState<Record<string, V1Student>>({});
  const [groups, setGroups] = useState<Record<string, V1FeeGroup>>({});
  const [types, setTypes] = useState<Record<string, V1FeeType>>({});
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<V1StudentFeeDue>();
  const actionRef = useRef<ActionType>();
  const intl = useIntl();

  useEffect(() => {
    Promise.all([
      studentService.studentServiceListStudent2({
        body: { pageSize: 200, sort: ['admission_no'] },
      }),
      groupService.feeGroupServiceListFeeGroup2({ body: { pageSize: 200, sort: ['name'] } }),
      typeService.feeTypeServiceListFeeType2({ body: { pageSize: 200, sort: ['code'] } }),
    ]).then(([studentResp, groupResp, typeResp]) => {
      setStudents(studentsByEnrollment(studentResp.data.items));
      setGroups(keyedById(groupResp.data.items));
      setTypes(keyedById(typeResp.data.items));
    });
  }, []);

  const handlePayment = async (values: PaymentFormValues) => {
    const amount = values.amount || 0;
    const discountAmount = values.discountAmount || 0;
    const fineAmount = values.fineAmount || 0;
    if (amount + discountAmount + fineAmount <= 0) {
      message.error(
        intl.formatMessage({
          id: 'school.fee.payment.amountRequired',
          defaultMessage: 'Enter a payment, discount, or fine amount.',
        }),
      );
      return false;
    }
    const hide = message.loading(
      intl.formatMessage({ id: 'school.fee.payment.recording', defaultMessage: 'Recording...' }),
    );
    try {
      await service.studentFeeServiceCreateStudentFeePayment({
        body: {
          ...values,
          studentFeeId: currentRow!.id!,
          amount,
          discountAmount,
          fineAmount,
          collectedAt: values.collectedAt ? dateUtil(values.collectedAt).toISOString() : undefined,
        },
      });
      hide();
      message.success(
        intl.formatMessage({
          id: 'school.fee.payment.recorded',
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

  const columns: ProColumnType<V1StudentFeeDue>[] = [
    {
      title: <FormattedMessage id="school.student.student" defaultMessage="Student" />,
      dataIndex: 'studentEnrollmentId',
      valueType: 'text',
      render: (_, record) => studentLabel(students[record.studentEnrollmentId || '']),
    },
    {
      title: <FormattedMessage id="school.fee.group" defaultMessage="Fee Group" />,
      dataIndex: 'feeGroupId',
      valueType: 'text',
      render: (_, record) => groups[record.feeGroupId || '']?.name || record.feeGroupId || '-',
    },
    {
      title: <FormattedMessage id="school.fee.type" defaultMessage="Fee Type" />,
      dataIndex: 'feeTypeId',
      valueType: 'text',
      render: (_, record) =>
        types[record.feeTypeId || '']?.name || types[record.feeTypeId || '']?.code || '-',
    },
    {
      title: <FormattedMessage id="school.fee.dueDate" defaultMessage="Due Date" />,
      dataIndex: 'dueDate',
      valueType: 'date',
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
            <FormattedMessage id="school.fee.recordPayment" defaultMessage="Record Payment" />
          </Button>
        );
      },
    },
  ];

  const getData = requestTransform<V1StudentFeeDue, any>(async (req) =>
    service
      .studentFeeServiceListStudentFeeDue2({
        body: { ...req, asOf: new Date().toISOString() },
      })
      .then((resp) => resp.data),
  );

  return (
    <PageContainer>
      <ProTable<V1StudentFeeDue>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        pagination={{ defaultPageSize: 10 }}
        type="table"
        request={getData}
        columns={columns}
        scroll={{ x: 1400 }}
      />
      <DrawerForm<PaymentFormValues>
        open={paymentVisible}
        title={intl.formatMessage({
          id: 'school.fee.recordPayment',
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
            id: 'school.fee.paymentAmount',
            defaultMessage: 'Payment Amount',
          })}
          min={0}
          max={currentRow?.balanceAmount}
          fieldProps={{ precision: 2 }}
        />
        <ProFormDigit
          name="discountAmount"
          label={intl.formatMessage({
            id: 'school.fee.paymentDiscount',
            defaultMessage: 'Discount',
          })}
          min={0}
          max={currentRow?.balanceAmount}
          fieldProps={{ precision: 2 }}
        />
        <ProFormDigit
          name="fineAmount"
          label={intl.formatMessage({
            id: 'school.fee.paymentFine',
            defaultMessage: 'Fine Payment',
          })}
          min={0}
          max={currentRow?.fineBalanceAmount}
          fieldProps={{ precision: 2 }}
        />
        <ProFormSelect
          name="paymentMode"
          label={intl.formatMessage({
            id: 'school.fee.paymentMethod',
            defaultMessage: 'Payment Method',
          })}
          rules={[{ required: true }]}
          valueEnum={{
            cash: intl.formatMessage({
              id: 'school.fee.paymentMethod.cash',
              defaultMessage: 'Cash',
            }),
            bank: intl.formatMessage({
              id: 'school.fee.paymentMethod.bank',
              defaultMessage: 'Bank',
            }),
            cheque: intl.formatMessage({
              id: 'school.fee.paymentMethod.cheque',
              defaultMessage: 'Cheque',
            }),
            online: intl.formatMessage({
              id: 'school.fee.paymentMethod.online',
              defaultMessage: 'Online',
            }),
          }}
        />
        <ProFormDateTimePicker
          name="collectedAt"
          label={intl.formatMessage({
            id: 'school.fee.collectedAt',
            defaultMessage: 'Collected At',
          })}
        />
        <ProFormText
          name="referenceNo"
          label={intl.formatMessage({
            id: 'school.fee.referenceNo',
            defaultMessage: 'Reference No.',
          })}
        />
        <ProFormTextArea
          name="note"
          label={intl.formatMessage({ id: 'school.fee.paymentNote', defaultMessage: 'Note' })}
        />
      </DrawerForm>
    </PageContainer>
  );
};

export default TableList;
