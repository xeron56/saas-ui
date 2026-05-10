import type { ProColumnType } from '@ant-design/pro-components';
import {
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import type {
  V1AcademicSession,
  V1CreateTransportFeeMasterRequest,
  V1TransportFeeMaster,
} from '@gosaas/api';
import { AcademicSessionServiceApi, TransportFeeMasterServiceApi } from '@gosaas/api';
import { dateUtil } from '@gosaas/core';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new TransportFeeMasterServiceApi();
const sessionService = new AcademicSessionServiceApi();

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const monthOptions = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
].map((month) => ({ label: month, value: month }));

const fineTypeOptions = [
  { label: 'None', value: '' },
  { label: 'Fixed', value: 'fix' },
  { label: 'Percentage', value: 'percentage' },
];

const normalizeFeeMaster = (fields: V1CreateTransportFeeMasterRequest & V1TransportFeeMaster) => ({
  ...fields,
  dueDate: fields.dueDate ? dateUtil(fields.dueDate).toISOString() : undefined,
});

const TableList: React.FC = () => {
  const intl = useIntl();
  const [sessions, setSessions] = useState<Record<string, V1AcademicSession>>({});

  useEffect(() => {
    sessionService
      .academicSessionServiceListAcademicSession2({ body: { pageSize: 100, sort: ['code'] } })
      .then((resp) => setSessions(keyedById(resp.data.items)));
  }, []);

  const columns: ProColumnType<V1TransportFeeMaster>[] = [
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
      title: <FormattedMessage id="school.transport.fineType" defaultMessage="Fine Type" />,
      dataIndex: 'fineType',
      valueType: 'text',
    },
    {
      title: (
        <FormattedMessage id="school.transport.finePercentage" defaultMessage="Fine Percentage" />
      ),
      dataIndex: 'finePercentage',
      valueType: 'percent',
    },
    {
      title: <FormattedMessage id="school.transport.fineAmount" defaultMessage="Fine Amount" />,
      dataIndex: 'fineAmount',
      valueType: 'money',
    },
  ];

  return (
    <ReferencePage<V1TransportFeeMaster>
      columns={columns}
      create={(fields: V1CreateTransportFeeMasterRequest) =>
        service.transportFeeMasterServiceCreateTransportFeeMaster({
          body: normalizeFeeMaster(fields),
        })
      }
      delete={(record) =>
        service.transportFeeMasterServiceDeleteTransportFeeMaster({ id: record.id! })
      }
      get={async (id) =>
        (await service.transportFeeMasterServiceGetTransportFeeMaster({ id })).data
      }
      list={async (req: any) =>
        (await service.transportFeeMasterServiceListTransportFeeMaster2({ body: req })).data
      }
      title={(record) =>
        [sessions[record.academicSessionId || '']?.code, record.month]
          .filter(Boolean)
          .join(' - ') || record.id
      }
      update={(record, fields: any) =>
        service.transportFeeMasterServiceUpdateTransportFeeMaster2({
          feeMasterId: record.id!,
          body: { feeMaster: { id: record.id!, ...normalizeFeeMaster(fields) } },
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
            name="month"
            label={intl.formatMessage({ id: 'school.transport.month', defaultMessage: 'Month' })}
            options={monthOptions}
            rules={[{ required: true }]}
            showSearch
          />
          <ProFormDatePicker
            name="dueDate"
            label={intl.formatMessage({
              id: 'school.transport.dueDate',
              defaultMessage: 'Due Date',
            })}
          />
          <ProFormSelect
            name="fineType"
            label={intl.formatMessage({
              id: 'school.transport.fineType',
              defaultMessage: 'Fine Type',
            })}
            options={fineTypeOptions}
          />
          <ProFormDigit
            name="finePercentage"
            label={intl.formatMessage({
              id: 'school.transport.finePercentage',
              defaultMessage: 'Fine Percentage',
            })}
            min={0}
            max={100}
          />
          <ProFormDigit
            name="fineAmount"
            label={intl.formatMessage({
              id: 'school.transport.fineAmount',
              defaultMessage: 'Fine Amount',
            })}
            min={0}
          />
          <ProFormText name="id" hidden />
        </>
      }
    />
  );
};

export default TableList;
