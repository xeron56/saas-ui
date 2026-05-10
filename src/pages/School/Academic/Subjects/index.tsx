import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import React from 'react';
import type { V1Subject } from '@gosaas/api';
import { SubjectServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new SubjectServiceApi();

const subjectTypeOptions = [
  { label: 'Theory', value: 'theory' },
  { label: 'Practical', value: 'practical' },
];

const Subjects: React.FC = () => (
  <ReferencePage<V1Subject>
    columns={[
      {
        title: <FormattedMessage id="school.academic.subject.name" defaultMessage="Subject Name" />,
        dataIndex: 'name',
      },
      {
        title: <FormattedMessage id="school.academic.subject.code" defaultMessage="Subject Code" />,
        dataIndex: 'code',
      },
      {
        title: <FormattedMessage id="school.academic.subject.type" defaultMessage="Subject Type" />,
        dataIndex: 'type',
      },
    ]}
    create={(fields) =>
      service.subjectServiceCreateSubject({
        body: {
          name: fields.name,
          code: fields.code,
          type: fields.type,
        },
      })
    }
    delete={(record) => service.subjectServiceDeleteSubject({ id: record.id! })}
    formItems={
      <>
        <ProFormText
          name="name"
          label={
            <FormattedMessage id="school.academic.subject.name" defaultMessage="Subject Name" />
          }
          rules={[{ required: true }]}
        />
        <ProFormText
          name="code"
          label={
            <FormattedMessage id="school.academic.subject.code" defaultMessage="Subject Code" />
          }
        />
        <ProFormSelect
          name="type"
          label={
            <FormattedMessage id="school.academic.subject.type" defaultMessage="Subject Type" />
          }
          options={subjectTypeOptions}
          rules={[{ required: true }]}
        />
      </>
    }
    get={async (id) => (await service.subjectServiceGetSubject({ id })).data}
    list={async (req) => (await service.subjectServiceListSubject2({ body: req })).data}
    title={(record) => [record.code, record.name].filter(Boolean).join(' - ')}
    update={(record, fields) =>
      service.subjectServiceUpdateSubject2({
        subjectId: record.id!,
        body: {
          subject: {
            id: record.id!,
            name: fields.name,
            code: fields.code,
            type: fields.type,
          },
        },
      })
    }
  />
);

export default Subjects;
