import type { ProColumnType } from '@ant-design/pro-components';
import {
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import type { V1CreateFeeTypeRequest, V1FeeGroup, V1FeeType } from '@gosaas/api';
import { FeeGroupServiceApi, FeeTypeServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new FeeTypeServiceApi();
const groupService = new FeeGroupServiceApi();

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const TableList: React.FC = () => {
  const intl = useIntl();
  const [groups, setGroups] = useState<Record<string, V1FeeGroup>>({});

  useEffect(() => {
    groupService
      .feeGroupServiceListFeeGroup2({ body: { pageSize: 200, sort: ['name'] } })
      .then((resp) => setGroups(keyedById(resp.data.items)));
  }, []);

  const columns: ProColumnType<V1FeeType>[] = [
    {
      title: <FormattedMessage id="school.fee.group" defaultMessage="Fee Group" />,
      dataIndex: 'feeGroupId',
      valueType: 'text',
      render: (_, record) => groups[record.feeGroupId || '']?.name || record.feeGroupId || '-',
    },
    {
      title: <FormattedMessage id="school.fee.typeCode" defaultMessage="Code" />,
      dataIndex: 'code',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.fee.typeName" defaultMessage="Type Name" />,
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.fee.nature" defaultMessage="Nature" />,
      dataIndex: 'nature',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.fee.isActive" defaultMessage="Active" />,
      dataIndex: 'isActive',
      valueType: 'switch',
    },
  ];

  return (
    <ReferencePage<V1FeeType>
      columns={columns}
      create={(fields: V1CreateFeeTypeRequest) =>
        service.feeTypeServiceCreateFeeType({ body: fields })
      }
      delete={(record) => service.feeTypeServiceDeleteFeeType({ id: record.id! })}
      get={async (id) => (await service.feeTypeServiceGetFeeType({ id })).data}
      list={async (req: any) => (await service.feeTypeServiceListFeeType2({ body: req })).data}
      title={(record) => [record.code, record.name].filter(Boolean).join(' - ') || record.id}
      update={(record, fields: any) =>
        service.feeTypeServiceUpdateFeeType2({
          feeTypeId: record.id!,
          body: { feeType: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
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
          <ProFormText
            name="code"
            label={intl.formatMessage({ id: 'school.fee.typeCode', defaultMessage: 'Code' })}
          />
          <ProFormText
            name="name"
            label={intl.formatMessage({ id: 'school.fee.typeName', defaultMessage: 'Type Name' })}
            rules={[{ required: true }]}
          />
          <ProFormText
            name="nature"
            label={intl.formatMessage({ id: 'school.fee.nature', defaultMessage: 'Nature' })}
          />
          <ProFormTextArea
            name="description"
            label={intl.formatMessage({
              id: 'school.fee.description',
              defaultMessage: 'Description',
            })}
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
