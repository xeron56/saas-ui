import { ProFormDigit, ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Tag } from 'antd';
import React from 'react';
import type { V1MarkDivision } from '@gosaas/api';
import { MarkDivisionServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new MarkDivisionServiceApi();

const MarkDivisions: React.FC = () => (
  <ReferencePage<V1MarkDivision>
    columns={[
      {
        title: <FormattedMessage id="school.academic.markDivision.name" defaultMessage="Name" />,
        dataIndex: 'name',
      },
      {
        title: (
          <FormattedMessage
            id="school.academic.markDivision.percentageTo"
            defaultMessage="Lower %"
          />
        ),
        dataIndex: 'percentageTo',
        valueType: 'digit',
      },
      {
        title: (
          <FormattedMessage
            id="school.academic.markDivision.percentageFrom"
            defaultMessage="Upper %"
          />
        ),
        dataIndex: 'percentageFrom',
        valueType: 'digit',
      },
      {
        title: (
          <FormattedMessage id="school.academic.markDivision.isActive" defaultMessage="Active" />
        ),
        dataIndex: 'isActive',
        render: (_, record) =>
          record.isActive ? (
            <Tag color="green">
              <FormattedMessage id="common.yes" defaultMessage="Yes" />
            </Tag>
          ) : (
            <Tag>
              <FormattedMessage id="common.no" defaultMessage="No" />
            </Tag>
          ),
      },
    ]}
    create={(fields) =>
      service.markDivisionServiceCreateMarkDivision({
        body: {
          name: fields.name,
          percentageFrom: fields.percentageFrom,
          percentageTo: fields.percentageTo,
          isActive: fields.isActive ?? true,
        },
      })
    }
    delete={(record) => service.markDivisionServiceDeleteMarkDivision({ id: record.id! })}
    formItems={
      <>
        <ProFormText
          name="name"
          label={<FormattedMessage id="school.academic.markDivision.name" defaultMessage="Name" />}
          rules={[{ required: true }]}
        />
        <ProFormDigit
          name="percentageTo"
          label={
            <FormattedMessage
              id="school.academic.markDivision.percentageTo"
              defaultMessage="Lower %"
            />
          }
          min={0}
          max={100}
          fieldProps={{ precision: 2 }}
          rules={[{ required: true }]}
        />
        <ProFormDigit
          name="percentageFrom"
          label={
            <FormattedMessage
              id="school.academic.markDivision.percentageFrom"
              defaultMessage="Upper %"
            />
          }
          min={0}
          max={100}
          fieldProps={{ precision: 2 }}
          rules={[{ required: true }]}
        />
        <ProFormSwitch
          name="isActive"
          label={
            <FormattedMessage id="school.academic.markDivision.isActive" defaultMessage="Active" />
          }
          initialValue
        />
      </>
    }
    get={async (id) => (await service.markDivisionServiceGetMarkDivision({ id })).data}
    list={async (req) => (await service.markDivisionServiceListMarkDivision2({ body: req })).data}
    title={(record) => record.name || ''}
    update={(record, fields) =>
      service.markDivisionServiceUpdateMarkDivision2({
        markDivisionId: record.id!,
        body: {
          markDivision: {
            id: record.id!,
            name: fields.name,
            percentageFrom: fields.percentageFrom,
            percentageTo: fields.percentageTo,
            isActive: fields.isActive,
          },
        },
      })
    }
  />
);

export default MarkDivisions;
