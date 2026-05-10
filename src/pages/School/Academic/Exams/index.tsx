import {
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage, Link, useParams } from '@umijs/max';
import { Tag } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import type { V1AcademicSession, V1Exam } from '@gosaas/api';
import { AcademicSessionServiceApi, ExamServiceApi } from '@gosaas/api';
import { dateUtil } from '@gosaas/core';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new ExamServiceApi();
const sessionService = new AcademicSessionServiceApi();

const normalizeDate = (value?: string | null) => (value ? dateUtil(value).toISOString() : null);

const Exams: React.FC = () => {
  const { examGroupId } = useParams<{ examGroupId: string }>();
  const [sessions, setSessions] = useState<V1AcademicSession[]>([]);

  useEffect(() => {
    sessionService
      .academicSessionServiceListAcademicSession2({
        body: { pageSize: 200, sort: ['code'] },
      })
      .then((resp) => setSessions(resp.data.items || []));
  }, []);

  const sessionOptions = useMemo(
    () =>
      sessions.map((item) => ({
        label: [item.code, item.name].filter(Boolean).join(' - ') || item.id,
        value: item.id,
      })),
    [sessions],
  );

  const sessionsById = useMemo(
    () =>
      sessions.reduce<Record<string, V1AcademicSession>>((ret, item) => {
        if (item.id) {
          ret[item.id] = item;
        }
        return ret;
      }, {}),
    [sessions],
  );

  return (
    <ReferencePage<V1Exam>
      columns={[
        {
          title: <FormattedMessage id="school.academic.exam.name" defaultMessage="Name" />,
          dataIndex: 'name',
        },
        {
          title: (
            <FormattedMessage
              id="school.academic.exam.academicSession"
              defaultMessage="Academic Session"
            />
          ),
          dataIndex: 'academicSessionId',
          renderText: (value) => {
            const session = sessionsById[value];
            return session ? [session.code, session.name].filter(Boolean).join(' - ') : value;
          },
        },
        {
          title: (
            <FormattedMessage
              id="school.academic.exam.passingPercentage"
              defaultMessage="Passing %"
            />
          ),
          dataIndex: 'passingPercentage',
        },
        {
          title: <FormattedMessage id="school.academic.exam.dateFrom" defaultMessage="From" />,
          dataIndex: 'dateFrom',
          valueType: 'date',
        },
        {
          title: <FormattedMessage id="school.academic.exam.dateTo" defaultMessage="To" />,
          dataIndex: 'dateTo',
          valueType: 'date',
        },
        {
          title: <FormattedMessage id="school.academic.exam.isActive" defaultMessage="Active" />,
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
            <FormattedMessage id="school.academic.exam.isPublish" defaultMessage="Published" />
          ),
          dataIndex: 'isPublish',
          render: (_, record) =>
            record.isPublish ? (
              <Tag color="blue">
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
            <FormattedMessage id="school.academic.exam.description" defaultMessage="Description" />
          ),
          dataIndex: 'description',
          ellipsis: true,
        },
      ]}
      create={(fields) =>
        service.examServiceCreateExam({
          body: {
            examGroupId: examGroupId!,
            academicSessionId: fields.academicSessionId,
            name: fields.name,
            passingPercentage: fields.passingPercentage,
            dateFrom: normalizeDate(fields.dateFrom),
            dateTo: normalizeDate(fields.dateTo),
            useExamRollNo: fields.useExamRollNo ?? true,
            isPublish: fields.isPublish ?? false,
            isActive: fields.isActive ?? true,
            description: fields.description,
          },
        })
      }
      delete={(record) => service.examServiceDeleteExam({ id: record.id! })}
      extraActions={(record) => [
        <Link
          key="students"
          to={`/school/academic/exam-groups/${examGroupId}/exams/${record.id}/students`}
        >
          <FormattedMessage
            id="school.academic.exam.student.assign"
            defaultMessage="Assign Students"
          />
        </Link>,
        <Link
          key="subjects"
          to={`/school/academic/exam-groups/${examGroupId}/exams/${record.id}/subjects`}
        >
          <FormattedMessage
            id="school.academic.exam.subject.manage"
            defaultMessage="Manage Subjects"
          />
        </Link>,
        <Link
          key="marks"
          to={`/school/academic/exam-groups/${examGroupId}/exams/${record.id}/marks`}
        >
          <FormattedMessage id="school.academic.exam.mark.enter" defaultMessage="Enter Marks" />
        </Link>,
      ]}
      formItems={
        <>
          <ProFormText
            name="name"
            label={<FormattedMessage id="school.academic.exam.name" defaultMessage="Name" />}
            rules={[{ required: true }]}
          />
          <ProFormSelect
            name="academicSessionId"
            label={
              <FormattedMessage
                id="school.academic.exam.academicSession"
                defaultMessage="Academic Session"
              />
            }
            options={sessionOptions}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            name="passingPercentage"
            label={
              <FormattedMessage
                id="school.academic.exam.passingPercentage"
                defaultMessage="Passing %"
              />
            }
            min={0}
            max={100}
            fieldProps={{ precision: 2 }}
          />
          <ProFormDatePicker
            name="dateFrom"
            label={<FormattedMessage id="school.academic.exam.dateFrom" defaultMessage="From" />}
          />
          <ProFormDatePicker
            name="dateTo"
            label={<FormattedMessage id="school.academic.exam.dateTo" defaultMessage="To" />}
          />
          <ProFormSwitch
            name="useExamRollNo"
            label={
              <FormattedMessage
                id="school.academic.exam.useExamRollNo"
                defaultMessage="Use Exam Roll No."
              />
            }
            initialValue
          />
          <ProFormSwitch
            name="isActive"
            label={<FormattedMessage id="school.academic.exam.isActive" defaultMessage="Active" />}
            initialValue
          />
          <ProFormSwitch
            name="isPublish"
            label={
              <FormattedMessage id="school.academic.exam.isPublish" defaultMessage="Published" />
            }
          />
          <ProFormTextArea
            name="description"
            label={
              <FormattedMessage
                id="school.academic.exam.description"
                defaultMessage="Description"
              />
            }
          />
        </>
      }
      get={async (id) => (await service.examServiceGetExam({ id })).data}
      list={async (req) =>
        (
          await service.examServiceListExam2({
            body: {
              ...req,
              filter: {
                ...req.filter,
                examGroupId: { $eq: examGroupId },
              },
            },
          })
        ).data
      }
      title={(record) => record.name || record.id}
      update={(record, fields) =>
        service.examServiceUpdateExam2({
          examId: record.id!,
          body: {
            exam: {
              id: record.id!,
              examGroupId: examGroupId!,
              academicSessionId: fields.academicSessionId,
              name: fields.name,
              passingPercentage: fields.passingPercentage,
              dateFrom: normalizeDate(fields.dateFrom),
              dateTo: normalizeDate(fields.dateTo),
              useExamRollNo: fields.useExamRollNo,
              isPublish: fields.isPublish,
              isActive: fields.isActive,
              description: fields.description,
              isRankGenerated: record.isRankGenerated,
            },
          },
        })
      }
    />
  );
};

export default Exams;
