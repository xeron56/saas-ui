import {
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, Link, useParams } from '@umijs/max';
import { Tag } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import type { V1ExamSubject, V1Subject } from '@gosaas/api';
import { ExamSubjectServiceApi, SubjectServiceApi } from '@gosaas/api';
import { dateUtil } from '@gosaas/core';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new ExamSubjectServiceApi();
const subjectService = new SubjectServiceApi();

const normalizeDate = (value?: string | null) => (value ? dateUtil(value).toISOString() : null);

const ExamSubjects: React.FC = () => {
  const { examGroupId, examId } = useParams<{ examGroupId: string; examId: string }>();
  const [subjects, setSubjects] = useState<V1Subject[]>([]);

  useEffect(() => {
    subjectService
      .subjectServiceListSubject2({
        body: { pageSize: 300, sort: ['name'] },
      })
      .then((resp) => setSubjects(resp.data.items || []));
  }, []);

  const subjectOptions = useMemo(
    () =>
      subjects.map((item) => ({
        label: [item.name, item.code].filter(Boolean).join(' - ') || item.id,
        value: item.id,
      })),
    [subjects],
  );

  const subjectsById = useMemo(
    () =>
      subjects.reduce<Record<string, V1Subject>>((ret, item) => {
        if (item.id) {
          ret[item.id] = item;
        }
        return ret;
      }, {}),
    [subjects],
  );

  return (
    <ReferencePage<V1ExamSubject>
      columns={[
        {
          title: (
            <FormattedMessage id="school.academic.examSubject.subject" defaultMessage="Subject" />
          ),
          dataIndex: 'subjectId',
          renderText: (value) => {
            const subject = subjectsById[value];
            return subject ? [subject.name, subject.code].filter(Boolean).join(' - ') : value;
          },
        },
        {
          title: <FormattedMessage id="school.academic.examSubject.date" defaultMessage="Date" />,
          dataIndex: 'examDate',
          valueType: 'date',
        },
        {
          title: (
            <FormattedMessage
              id="school.academic.examSubject.startTime"
              defaultMessage="Start Time"
            />
          ),
          dataIndex: 'timeFrom',
        },
        {
          title: (
            <FormattedMessage id="school.academic.examSubject.duration" defaultMessage="Duration" />
          ),
          dataIndex: 'duration',
        },
        {
          title: (
            <FormattedMessage
              id="school.academic.examSubject.creditHours"
              defaultMessage="Credit Hours"
            />
          ),
          dataIndex: 'creditHours',
        },
        {
          title: (
            <FormattedMessage id="school.academic.examSubject.roomNo" defaultMessage="Room No." />
          ),
          dataIndex: 'roomNo',
        },
        {
          title: (
            <FormattedMessage
              id="school.academic.examSubject.maxMarks"
              defaultMessage="Max Marks"
            />
          ),
          dataIndex: 'maxMarks',
        },
        {
          title: (
            <FormattedMessage
              id="school.academic.examSubject.minMarks"
              defaultMessage="Min Marks"
            />
          ),
          dataIndex: 'minMarks',
        },
        {
          title: (
            <FormattedMessage id="school.academic.examSubject.isActive" defaultMessage="Active" />
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
        service.examSubjectServiceCreateExamSubject({
          body: {
            examId: examId!,
            subjectId: fields.subjectId,
            examDate: normalizeDate(fields.examDate),
            timeFrom: fields.timeFrom,
            duration: fields.duration,
            roomNo: fields.roomNo,
            maxMarks: fields.maxMarks,
            minMarks: fields.minMarks,
            creditHours: fields.creditHours,
            isActive: fields.isActive ?? true,
          },
        })
      }
      delete={(record) => service.examSubjectServiceDeleteExamSubject({ id: record.id! })}
      extraActions={(record) => [
        <Link
          key="marks"
          to={`/school/academic/exam-groups/${examGroupId}/exams/${examId}/marks?examSubjectId=${record.id}`}
        >
          <FormattedMessage id="school.academic.exam.mark.enter" defaultMessage="Enter Marks" />
        </Link>,
      ]}
      formItems={
        <>
          <ProFormSelect
            name="subjectId"
            label={
              <FormattedMessage id="school.academic.examSubject.subject" defaultMessage="Subject" />
            }
            options={subjectOptions}
            rules={[{ required: true }]}
            showSearch
          />
          <ProFormDatePicker
            name="examDate"
            label={<FormattedMessage id="school.academic.examSubject.date" defaultMessage="Date" />}
            rules={[{ required: true }]}
          />
          <ProFormText
            name="timeFrom"
            label={
              <FormattedMessage
                id="school.academic.examSubject.startTime"
                defaultMessage="Start Time"
              />
            }
            fieldProps={{ type: 'time', step: 60 }}
            rules={[{ required: true }]}
          />
          <ProFormText
            name="duration"
            label={
              <FormattedMessage
                id="school.academic.examSubject.duration"
                defaultMessage="Duration"
              />
            }
            rules={[{ required: true }]}
          />
          <ProFormText
            name="roomNo"
            label={
              <FormattedMessage id="school.academic.examSubject.roomNo" defaultMessage="Room No." />
            }
            rules={[{ required: true }]}
          />
          <ProFormDigit
            name="maxMarks"
            label={
              <FormattedMessage
                id="school.academic.examSubject.maxMarks"
                defaultMessage="Max Marks"
              />
            }
            min={0.01}
            fieldProps={{ precision: 2 }}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            name="minMarks"
            label={
              <FormattedMessage
                id="school.academic.examSubject.minMarks"
                defaultMessage="Min Marks"
              />
            }
            min={0.01}
            fieldProps={{ precision: 2 }}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            name="creditHours"
            label={
              <FormattedMessage
                id="school.academic.examSubject.creditHours"
                defaultMessage="Credit Hours"
              />
            }
            min={0}
            fieldProps={{ precision: 2 }}
          />
          <ProFormSwitch
            name="isActive"
            label={
              <FormattedMessage id="school.academic.examSubject.isActive" defaultMessage="Active" />
            }
            initialValue
          />
        </>
      }
      get={async (id) => (await service.examSubjectServiceGetExamSubject({ id })).data}
      list={async (req) =>
        (
          await service.examSubjectServiceListExamSubject2({
            body: {
              ...req,
              filter: {
                ...req.filter,
                examId: { $eq: examId },
              },
            },
          })
        ).data
      }
      title={(record) => {
        const subject = record.subjectId ? subjectsById[record.subjectId] : undefined;
        return subject?.name || record.subjectId || record.id;
      }}
      update={(record, fields) =>
        service.examSubjectServiceUpdateExamSubject2({
          examSubjectId: record.id!,
          body: {
            examSubject: {
              id: record.id!,
              examId: examId!,
              subjectId: fields.subjectId,
              examDate: normalizeDate(fields.examDate),
              timeFrom: fields.timeFrom,
              duration: fields.duration,
              roomNo: fields.roomNo,
              maxMarks: fields.maxMarks,
              minMarks: fields.minMarks,
              creditHours: fields.creditHours,
              isActive: fields.isActive,
            },
          },
        })
      }
    />
  );
};

export default ExamSubjects;
