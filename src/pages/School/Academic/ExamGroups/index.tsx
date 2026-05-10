import {
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage, Link, useIntl } from '@umijs/max';
import { Tag } from 'antd';
import React from 'react';
import type { V1ExamGroup } from '@gosaas/api';
import { ExamGroupServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new ExamGroupServiceApi();

const examTypes = [
  'basic_system',
  'school_grade_system',
  'coll_grade_system',
  'gpa',
  'average_passing',
];

const ExamGroups: React.FC = () => {
  const intl = useIntl();
  const examTypeOptions = examTypes.map((value) => ({
    value,
    label: intl.formatMessage({
      id: `school.academic.examGroup.examType.${value}`,
      defaultMessage: value,
    }),
  }));

  const examTypeLabels = examTypeOptions.reduce<Record<string, string>>((ret, item) => {
    ret[item.value] = item.label;
    return ret;
  }, {});

  return (
    <ReferencePage<V1ExamGroup>
      columns={[
        {
          title: <FormattedMessage id="school.academic.examGroup.name" defaultMessage="Name" />,
          dataIndex: 'name',
        },
        {
          title: (
            <FormattedMessage id="school.academic.examGroup.examType" defaultMessage="Exam Type" />
          ),
          dataIndex: 'examType',
          renderText: (value) => examTypeLabels[value] || value,
        },
        {
          title: (
            <FormattedMessage id="school.academic.examGroup.isActive" defaultMessage="Active" />
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
        {
          title: (
            <FormattedMessage
              id="school.academic.examGroup.description"
              defaultMessage="Description"
            />
          ),
          dataIndex: 'description',
          ellipsis: true,
        },
      ]}
      create={(fields) =>
        service.examGroupServiceCreateExamGroup({
          body: {
            name: fields.name,
            examType: fields.examType,
            description: fields.description,
            isActive: fields.isActive ?? true,
          },
        })
      }
      delete={(record) => service.examGroupServiceDeleteExamGroup({ id: record.id! })}
      extraActions={(record) => [
        <Link key="exams" to={`/school/academic/exam-groups/${record.id}/exams`}>
          <FormattedMessage id="school.academic.exam.manage" defaultMessage="Manage Exams" />
        </Link>,
        <Link key="connections" to={`/school/academic/exam-groups/${record.id}/connections`}>
          <FormattedMessage
            id="school.academic.examConnection.manage"
            defaultMessage="Manage Connections"
          />
        </Link>,
      ]}
      formItems={
        <>
          <ProFormText
            name="name"
            label={<FormattedMessage id="school.academic.examGroup.name" defaultMessage="Name" />}
            rules={[{ required: true }]}
          />
          <ProFormSelect
            name="examType"
            label={
              <FormattedMessage
                id="school.academic.examGroup.examType"
                defaultMessage="Exam Type"
              />
            }
            options={examTypeOptions}
            rules={[{ required: true }]}
          />
          <ProFormSwitch
            name="isActive"
            label={
              <FormattedMessage id="school.academic.examGroup.isActive" defaultMessage="Active" />
            }
            initialValue
          />
          <ProFormTextArea
            name="description"
            label={
              <FormattedMessage
                id="school.academic.examGroup.description"
                defaultMessage="Description"
              />
            }
          />
        </>
      }
      get={async (id) => (await service.examGroupServiceGetExamGroup({ id })).data}
      list={async (req) => (await service.examGroupServiceListExamGroup2({ body: req })).data}
      title={(record) => record.name || record.id}
      update={(record, fields) =>
        service.examGroupServiceUpdateExamGroup2({
          examGroupId: record.id!,
          body: {
            examGroup: {
              id: record.id!,
              name: fields.name,
              examType: fields.examType,
              description: fields.description,
              isActive: fields.isActive,
            },
          },
        })
      }
    />
  );
};

export default ExamGroups;
