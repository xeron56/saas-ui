import type { ProColumnType } from '@ant-design/pro-components';
import {
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import type {
  V1AcademicSession,
  V1CreateFeeMasterRequest,
  V1FeeGroup,
  V1FeeMaster,
  V1FeeType,
} from '@gosaas/api';
import {
  AcademicSessionServiceApi,
  FeeGroupServiceApi,
  FeeMasterServiceApi,
  FeeTypeServiceApi,
} from '@gosaas/api';
import { dateUtil } from '@gosaas/core';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new FeeMasterServiceApi();
const sessionService = new AcademicSessionServiceApi();
const groupService = new FeeGroupServiceApi();
const typeService = new FeeTypeServiceApi();

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const fineTypeOptions = [
  { label: 'None', value: '' },
  { label: 'Fixed', value: 'fix' },
  { label: 'Percentage', value: 'percentage' },
  { label: 'Cumulative', value: 'cumulative' },
];

const normalizeFeeMaster = (fields: V1CreateFeeMasterRequest & V1FeeMaster) => ({
  ...fields,
  dueDate: fields.dueDate ? dateUtil(fields.dueDate).toISOString() : undefined,
});

const feeMasterLabel = (
  item: V1FeeMaster,
  sessions: Record<string, V1AcademicSession>,
  groups: Record<string, V1FeeGroup>,
  types: Record<string, V1FeeType>,
) =>
  [
    sessions[item.academicSessionId || '']?.code,
    groups[item.feeGroupId || '']?.name,
    types[item.feeTypeId || '']?.name || types[item.feeTypeId || '']?.code,
  ]
    .filter(Boolean)
    .join(' - ') || item.id;

const TableList: React.FC = () => {
  const intl = useIntl();
  const [sessions, setSessions] = useState<Record<string, V1AcademicSession>>({});
  const [groups, setGroups] = useState<Record<string, V1FeeGroup>>({});
  const [types, setTypes] = useState<Record<string, V1FeeType>>({});

  useEffect(() => {
    Promise.all([
      sessionService.academicSessionServiceListAcademicSession2({
        body: { pageSize: 100, sort: ['code'] },
      }),
      groupService.feeGroupServiceListFeeGroup2({ body: { pageSize: 200, sort: ['name'] } }),
      typeService.feeTypeServiceListFeeType2({ body: { pageSize: 200, sort: ['code'] } }),
    ]).then(([sessionResp, groupResp, typeResp]) => {
      setSessions(keyedById(sessionResp.data.items));
      setGroups(keyedById(groupResp.data.items));
      setTypes(keyedById(typeResp.data.items));
    });
  }, []);

  const columns: ProColumnType<V1FeeMaster>[] = [
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
      title: <FormattedMessage id="school.fee.amount" defaultMessage="Amount" />,
      dataIndex: 'amount',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="school.fee.dueDate" defaultMessage="Due Date" />,
      dataIndex: 'dueDate',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="school.fee.fineType" defaultMessage="Fine Type" />,
      dataIndex: 'fineType',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.fee.isActive" defaultMessage="Active" />,
      dataIndex: 'isActive',
      valueType: 'switch',
    },
  ];

  return (
    <ReferencePage<V1FeeMaster>
      columns={columns}
      create={(fields: V1CreateFeeMasterRequest) =>
        service.feeMasterServiceCreateFeeMaster({ body: normalizeFeeMaster(fields) })
      }
      delete={(record) => service.feeMasterServiceDeleteFeeMaster({ id: record.id! })}
      get={async (id) => (await service.feeMasterServiceGetFeeMaster({ id })).data}
      list={async (req: any) => (await service.feeMasterServiceListFeeMaster2({ body: req })).data}
      title={(record) => feeMasterLabel(record, sessions, groups, types)}
      update={(record, fields: any) =>
        service.feeMasterServiceUpdateFeeMaster2({
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
            name="feeGroupId"
            label={intl.formatMessage({ id: 'school.fee.group', defaultMessage: 'Fee Group' })}
            rules={[{ required: true }]}
            request={async () => {
              const resp = await groupService.feeGroupServiceListFeeGroup2({
                body: { pageSize: 200, sort: ['name'] },
              });
              return (resp.data.items || []).map((item) => ({
                label: item.name || item.id,
                value: item.id,
              }));
            }}
            showSearch
          />
          <ProFormSelect
            name="feeTypeId"
            label={intl.formatMessage({ id: 'school.fee.type', defaultMessage: 'Fee Type' })}
            rules={[{ required: true }]}
            request={async () => {
              const resp = await typeService.feeTypeServiceListFeeType2({
                body: { pageSize: 200, sort: ['code'] },
              });
              return (resp.data.items || []).map((item) => ({
                label: [item.code, item.name].filter(Boolean).join(' - ') || item.id,
                value: item.id,
              }));
            }}
            showSearch
          />
          <ProFormDigit
            name="amount"
            label={intl.formatMessage({ id: 'school.fee.amount', defaultMessage: 'Amount' })}
            min={0}
            fieldProps={{ precision: 2 }}
          />
          <ProFormDatePicker
            name="dueDate"
            label={intl.formatMessage({ id: 'school.fee.dueDate', defaultMessage: 'Due Date' })}
          />
          <ProFormSelect
            name="fineType"
            label={intl.formatMessage({ id: 'school.fee.fineType', defaultMessage: 'Fine Type' })}
            options={fineTypeOptions}
          />
          <ProFormDigit
            name="finePercentage"
            label={intl.formatMessage({
              id: 'school.fee.finePercentage',
              defaultMessage: 'Fine Percentage',
            })}
            min={0}
            max={100}
          />
          <ProFormDigit
            name="fineAmount"
            label={intl.formatMessage({
              id: 'school.fee.fineAmount',
              defaultMessage: 'Fine Amount',
            })}
            min={0}
          />
          <ProFormDigit
            name="finePerDay"
            label={intl.formatMessage({
              id: 'school.fee.finePerDay',
              defaultMessage: 'Fine Per Day',
            })}
            min={0}
          />
          <ProFormSwitch
            name="isActive"
            label={intl.formatMessage({ id: 'school.fee.isActive', defaultMessage: 'Active' })}
          />
        </>
      }
    />
  );
};

export default TableList;
