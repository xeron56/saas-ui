import type { ProColumnType } from '@ant-design/pro-components';
import { ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import type { V1CreateFeeGroupRequest, V1FeeGroup } from '@gosaas/api';
import { FeeGroupServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new FeeGroupServiceApi();

const TableList: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumnType<V1FeeGroup>[] = [
    {
      title: <FormattedMessage id="school.fee.groupName" defaultMessage="Group Name" />,
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.fee.nature" defaultMessage="Nature" />,
      dataIndex: 'nature',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.fee.description" defaultMessage="Description" />,
      dataIndex: 'description',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.fee.isActive" defaultMessage="Active" />,
      dataIndex: 'isActive',
      valueType: 'switch',
    },
  ];

  return (
    <ReferencePage<V1FeeGroup>
      columns={columns}
      create={(fields: V1CreateFeeGroupRequest) =>
        service.feeGroupServiceCreateFeeGroup({ body: fields })
      }
      delete={(record) => service.feeGroupServiceDeleteFeeGroup({ id: record.id! })}
      get={async (id) => (await service.feeGroupServiceGetFeeGroup({ id })).data}
      list={async (req: any) => (await service.feeGroupServiceListFeeGroup2({ body: req })).data}
      title={(record) => record.name}
      update={(record, fields: any) =>
        service.feeGroupServiceUpdateFeeGroup2({
          groupId: record.id!,
          body: { group: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
          <ProFormText
            name="name"
            label={intl.formatMessage({ id: 'school.fee.groupName', defaultMessage: 'Group Name' })}
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
