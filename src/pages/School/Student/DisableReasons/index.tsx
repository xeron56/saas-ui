import type { ProColumnType } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import type { V1CreateDisableReasonRequest, V1DisableReason } from '@gosaas/api';
import { DisableReasonServiceApi } from '@gosaas/api';
import ReferencePage from '../components/ReferencePage';

const service = new DisableReasonServiceApi();

const TableList: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumnType<V1DisableReason>[] = [
    {
      title: <FormattedMessage id="school.student.disableReason.reason" defaultMessage="Reason" />,
      dataIndex: 'reason',
      valueType: 'text',
    },
  ];

  return (
    <ReferencePage<V1DisableReason>
      columns={columns}
      create={(fields: V1CreateDisableReasonRequest) =>
        service.disableReasonServiceCreateDisableReason({ body: fields })
      }
      delete={(record) => service.disableReasonServiceDeleteDisableReason({ id: record.id! })}
      get={async (id) => (await service.disableReasonServiceGetDisableReason({ id })).data}
      list={async (req: any) =>
        (await service.disableReasonServiceListDisableReason2({ body: req })).data
      }
      title={(record) => record.reason}
      update={(record, fields: any) =>
        service.disableReasonServiceUpdateDisableReason2({
          reasonId: record.id!,
          body: { reason: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <ProFormText
          name="reason"
          label={intl.formatMessage({
            id: 'school.student.disableReason.reason',
            defaultMessage: 'Reason',
          })}
          rules={[{ required: true }]}
        />
      }
    />
  );
};

export default TableList;
