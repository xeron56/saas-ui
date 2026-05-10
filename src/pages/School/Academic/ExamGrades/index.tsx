import {
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Tag } from 'antd';
import React from 'react';
import type { V1ExamGrade } from '@gosaas/api';
import { ExamGradeServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new ExamGradeServiceApi();

const examTypes = [
  'basic_system',
  'school_grade_system',
  'coll_grade_system',
  'gpa',
  'average_passing',
];

const ExamGrades: React.FC = () => {
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
    <ReferencePage<V1ExamGrade>
      columns={[
        {
          title: (
            <FormattedMessage id="school.academic.examGrade.examType" defaultMessage="Exam Type" />
          ),
          dataIndex: 'examType',
          renderText: (value) => examTypeLabels[value] || value,
        },
        {
          title: <FormattedMessage id="school.academic.examGrade.name" defaultMessage="Grade" />,
          dataIndex: 'name',
        },
        {
          title: <FormattedMessage id="school.academic.examGrade.point" defaultMessage="Point" />,
          dataIndex: 'point',
          valueType: 'digit',
        },
        {
          title: (
            <FormattedMessage id="school.academic.examGrade.markUpto" defaultMessage="Lower %" />
          ),
          dataIndex: 'markUpto',
          valueType: 'digit',
        },
        {
          title: (
            <FormattedMessage id="school.academic.examGrade.markFrom" defaultMessage="Upper %" />
          ),
          dataIndex: 'markFrom',
          valueType: 'digit',
        },
        {
          title: (
            <FormattedMessage id="school.academic.examGrade.isActive" defaultMessage="Active" />
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
              id="school.academic.examGrade.description"
              defaultMessage="Description"
            />
          ),
          dataIndex: 'description',
          ellipsis: true,
        },
      ]}
      create={(fields) =>
        service.examGradeServiceCreateExamGrade({
          body: {
            examType: fields.examType,
            name: fields.name,
            point: fields.point,
            markFrom: fields.markFrom,
            markUpto: fields.markUpto,
            description: fields.description,
            isActive: fields.isActive ?? true,
          },
        })
      }
      delete={(record) => service.examGradeServiceDeleteExamGrade({ id: record.id! })}
      formItems={
        <>
          <ProFormSelect
            name="examType"
            label={
              <FormattedMessage
                id="school.academic.examGrade.examType"
                defaultMessage="Exam Type"
              />
            }
            options={examTypeOptions}
            rules={[{ required: true }]}
          />
          <ProFormText
            name="name"
            label={<FormattedMessage id="school.academic.examGrade.name" defaultMessage="Grade" />}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            name="point"
            label={<FormattedMessage id="school.academic.examGrade.point" defaultMessage="Point" />}
            min={0}
            fieldProps={{ precision: 2 }}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            name="markUpto"
            label={
              <FormattedMessage id="school.academic.examGrade.markUpto" defaultMessage="Lower %" />
            }
            min={0}
            max={100}
            fieldProps={{ precision: 2 }}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            name="markFrom"
            label={
              <FormattedMessage id="school.academic.examGrade.markFrom" defaultMessage="Upper %" />
            }
            min={0}
            max={100}
            fieldProps={{ precision: 2 }}
            rules={[{ required: true }]}
          />
          <ProFormSwitch
            name="isActive"
            label={
              <FormattedMessage id="school.academic.examGrade.isActive" defaultMessage="Active" />
            }
            initialValue
          />
          <ProFormTextArea
            name="description"
            label={
              <FormattedMessage
                id="school.academic.examGrade.description"
                defaultMessage="Description"
              />
            }
          />
        </>
      }
      get={async (id) => (await service.examGradeServiceGetExamGrade({ id })).data}
      list={async (req) => (await service.examGradeServiceListExamGrade2({ body: req })).data}
      title={(record) => [record.name, record.examType].filter(Boolean).join(' - ')}
      update={(record, fields) =>
        service.examGradeServiceUpdateExamGrade2({
          examGradeId: record.id!,
          body: {
            examGrade: {
              id: record.id!,
              examType: fields.examType,
              name: fields.name,
              point: fields.point,
              markFrom: fields.markFrom,
              markUpto: fields.markUpto,
              description: fields.description,
              isActive: fields.isActive,
            },
          },
        })
      }
    />
  );
};

export default ExamGrades;
