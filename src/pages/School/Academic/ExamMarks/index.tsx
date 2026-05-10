import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useParams, useSearchParams } from '@umijs/max';
import {
  Button,
  Checkbox,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  V1ClassSection,
  V1Exam,
  V1ExamSubject,
  V1ExamSubjectMarkItem,
  V1Subject,
} from '@gosaas/api';
import {
  ClassSectionServiceApi,
  ExamMarkServiceApi,
  ExamServiceApi,
  ExamStudentServiceApi,
  ExamSubjectServiceApi,
  SubjectServiceApi,
} from '@gosaas/api';

const classSectionService = new ClassSectionServiceApi();
const examService = new ExamServiceApi();
const examSubjectService = new ExamSubjectServiceApi();
const examMarkService = new ExamMarkServiceApi();
const examStudentService = new ExamStudentServiceApi();
const subjectService = new SubjectServiceApi();

const studentName = (record: V1ExamSubjectMarkItem) =>
  [record.firstName, record.middleName, record.lastName].filter(Boolean).join(' ') ||
  record.studentId;

const ExamMarks: React.FC = () => {
  const intl = useIntl();
  const { examId } = useParams<{ examId: string }>();
  const [searchParams] = useSearchParams();
  const [exam, setExam] = useState<V1Exam>();
  const [classSections, setClassSections] = useState<V1ClassSection[]>([]);
  const [subjects, setSubjects] = useState<V1Subject[]>([]);
  const [examSubjects, setExamSubjects] = useState<V1ExamSubject[]>([]);
  const [classSectionId, setClassSectionId] = useState<string>();
  const [examSubjectId, setExamSubjectId] = useState<string>();
  const [rows, setRows] = useState<V1ExamSubjectMarkItem[]>([]);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingRanks, setGeneratingRanks] = useState(false);

  useEffect(() => {
    if (!examId) {
      return;
    }
    examService.examServiceGetExam({ id: examId }).then((resp) => setExam(resp.data));
    examSubjectService
      .examSubjectServiceListExamSubject2({
        body: {
          pageSize: 300,
          sort: ['examDate', 'timeFrom'],
          filter: { examId: { $eq: examId } },
        },
      })
      .then((resp) => {
        const items = resp.data.items || [];
        setExamSubjects(items);
        const querySubjectId = searchParams.get('examSubjectId') || undefined;
        setExamSubjectId((current) => current || querySubjectId || items[0]?.id);
      });
    subjectService
      .subjectServiceListSubject2({ body: { pageSize: 500, sort: ['name'] } })
      .then((resp) => setSubjects(resp.data.items || []));
  }, [examId, searchParams]);

  useEffect(() => {
    if (!exam?.academicSessionId) {
      return;
    }
    classSectionService
      .classSectionServiceListClassSection2({
        body: {
          pageSize: 500,
          sort: ['code'],
          filter: { academicSessionId: { $eq: exam.academicSessionId } },
        },
      })
      .then((resp) => {
        const items = resp.data.items || [];
        setClassSections(items);
        setClassSectionId((current) => current || items[0]?.id);
      });
  }, [exam?.academicSessionId]);

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

  const selectedExamSubject = useMemo(
    () => examSubjects.find((item) => item.id === examSubjectId),
    [examSubjectId, examSubjects],
  );

  const classSectionOptions = useMemo(
    () => classSections.map((item) => ({ label: item.code || item.id, value: item.id })),
    [classSections],
  );

  const examSubjectOptions = useMemo(
    () =>
      examSubjects.map((item) => {
        const subject = item.subjectId ? subjectsById[item.subjectId] : undefined;
        return {
          label: subject
            ? [subject.name, subject.code].filter(Boolean).join(' - ')
            : item.subjectId,
          value: item.id,
        };
      }),
    [examSubjects, subjectsById],
  );

  const loadMarks = useCallback(async () => {
    if (!examSubjectId || !classSectionId) {
      setRows([]);
      setDirtyIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const resp = await examMarkService.examMarkServiceGetExamSubjectMarks({
        examSubjectId,
        classSectionId,
      });
      setRows(resp.data.items || []);
      setDirtyIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [classSectionId, examSubjectId]);

  useEffect(() => {
    loadMarks();
  }, [loadMarks]);

  const updateRow = (examStudentId: string | undefined, patch: Partial<V1ExamSubjectMarkItem>) => {
    if (!examStudentId) {
      return;
    }
    setRows((current) =>
      current.map((row) => (row.examStudentId === examStudentId ? { ...row, ...patch } : row)),
    );
    setDirtyIds((current) => new Set(current).add(examStudentId));
  };

  const saveMarks = async () => {
    if (!examSubjectId || !classSectionId) {
      return;
    }
    const dirtyRows = rows.filter((row) => row.examStudentId && dirtyIds.has(row.examStudentId));
    const invalid = dirtyRows.find(
      (row) =>
        row.attendance !== 'absent' &&
        ((row.marks ?? 0) < 0 || (row.marks ?? 0) > (selectedExamSubject?.maxMarks ?? 0)),
    );
    if (invalid) {
      message.error(
        intl.formatMessage({
          id: 'school.academic.examMark.saveFailed',
          defaultMessage: 'Unable to save marks',
        }),
      );
      return;
    }
    setSaving(true);
    const hide = message.loading(
      intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
    );
    try {
      const resp = await examMarkService.examMarkServiceSaveExamSubjectMarks({
        examSubjectId,
        body: {
          examSubjectId,
          classSectionId,
          markedAt: new Date().toISOString(),
          marks: dirtyRows.map((row) => ({
            examStudentId: row.examStudentId!,
            marks: row.attendance === 'absent' ? 0 : row.marks ?? 0,
            attendance: row.attendance || 'present',
            note: row.note,
            isActive: row.isActive ?? true,
          })),
        },
      });
      setRows(resp.data.items || []);
      setDirtyIds(new Set());
      hide();
      message.success(
        intl.formatMessage({ id: 'school.academic.examMark.saved', defaultMessage: 'Marks saved' }),
      );
    } catch (error) {
      hide();
      message.error(
        intl.formatMessage({
          id: 'school.academic.examMark.saveFailed',
          defaultMessage: 'Unable to save marks',
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  const generateRanks = async () => {
    if (!examId || !classSectionId) {
      return;
    }
    setGeneratingRanks(true);
    const hide = message.loading(
      intl.formatMessage({
        id: 'school.academic.examRank.generating',
        defaultMessage: 'Generating ranks...',
      }),
    );
    try {
      await examStudentService.examStudentServiceGenerateExamRanks({
        examId,
        classSectionId,
        body: { examId, classSectionId },
      });
      const resp = await examService.examServiceGetExam({ id: examId });
      setExam(resp.data);
      hide();
      message.success(
        intl.formatMessage({
          id: 'school.academic.examRank.generated',
          defaultMessage: 'Ranks generated',
        }),
      );
    } catch (error) {
      hide();
      message.error(
        intl.formatMessage({
          id: 'school.academic.examRank.generateFailed',
          defaultMessage: 'Unable to generate ranks',
        }),
      );
    } finally {
      setGeneratingRanks(false);
    }
  };

  return (
    <PageContainer
      title={intl.formatMessage({
        id: 'school.academic.exam.mark.title',
        defaultMessage: 'Exam Marks',
      })}
    >
      <Space wrap align="end" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={6}>
          <Typography.Text>
            <FormattedMessage
              id="school.academic.examMark.classSection"
              defaultMessage="Class Section"
            />
          </Typography.Text>
          <Select
            value={classSectionId}
            options={classSectionOptions}
            style={{ minWidth: 260 }}
            onChange={(value) => setClassSectionId(value)}
          />
        </Space>
        <Space direction="vertical" size={6}>
          <Typography.Text>
            <FormattedMessage id="school.academic.examMark.subject" defaultMessage="Subject" />
          </Typography.Text>
          <Select
            value={examSubjectId}
            options={examSubjectOptions}
            style={{ minWidth: 300 }}
            onChange={(value) => setExamSubjectId(value)}
          />
        </Space>
        <Button onClick={loadMarks} disabled={!classSectionId || !examSubjectId} loading={loading}>
          <FormattedMessage id="school.academic.examMark.load" defaultMessage="Load" />
        </Button>
        <Button
          type="primary"
          onClick={saveMarks}
          loading={saving}
          disabled={!dirtyIds.size || !classSectionId || !examSubjectId || exam?.isPublish}
        >
          <FormattedMessage id="school.academic.examMark.save" defaultMessage="Save" />
        </Button>
        <Button
          onClick={generateRanks}
          loading={generatingRanks}
          disabled={
            !examId ||
            !classSectionId ||
            !!dirtyIds.size ||
            saving ||
            generatingRanks ||
            exam?.isPublish
          }
        >
          <FormattedMessage
            id="school.academic.examRank.generate"
            defaultMessage="Generate Ranks"
          />
        </Button>
        {exam?.isRankGenerated ? (
          <Tag color="blue">
            <FormattedMessage
              id="school.academic.examRank.generated"
              defaultMessage="Ranks generated"
            />
          </Tag>
        ) : null}
        {selectedExamSubject ? (
          <Space>
            <Tag>
              <FormattedMessage
                id="school.academic.examSubject.maxMarks"
                defaultMessage="Max Marks"
              />
              : {selectedExamSubject.maxMarks}
            </Tag>
            <Tag>
              <FormattedMessage
                id="school.academic.examSubject.minMarks"
                defaultMessage="Min Marks"
              />
              : {selectedExamSubject.minMarks}
            </Tag>
            {selectedExamSubject.roomNo ? (
              <Tag>
                <FormattedMessage
                  id="school.academic.examSubject.roomNo"
                  defaultMessage="Room No."
                />
                : {selectedExamSubject.roomNo}
              </Tag>
            ) : null}
          </Space>
        ) : null}
      </Space>
      <ProTable<V1ExamSubjectMarkItem>
        rowKey="examStudentId"
        search={false}
        options={false}
        loading={loading}
        dataSource={rows}
        pagination={{ pageSize: 20 }}
        columns={[
          {
            title: (
              <FormattedMessage
                id="school.academic.examStudent.admissionNo"
                defaultMessage="Admission No."
              />
            ),
            dataIndex: 'admissionNo',
          },
          {
            title: (
              <FormattedMessage id="school.academic.examStudent.rollNo" defaultMessage="Roll No." />
            ),
            dataIndex: 'rollNo',
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.examStudent.examRollNo"
                defaultMessage="Exam Roll No."
              />
            ),
            dataIndex: 'examRollNo',
            hideInTable: !exam?.useExamRollNo,
          },
          {
            title: (
              <FormattedMessage id="school.academic.examStudent.student" defaultMessage="Student" />
            ),
            renderText: (_, record) => studentName(record),
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.examStudent.fatherName"
                defaultMessage="Father Name"
              />
            ),
            dataIndex: 'fatherName',
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.examStudent.category"
                defaultMessage="Category"
              />
            ),
            dataIndex: 'category',
          },
          {
            title: (
              <FormattedMessage id="school.academic.examStudent.gender" defaultMessage="Gender" />
            ),
            dataIndex: 'gender',
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.examMark.obtainedMarks"
                defaultMessage="Marks"
              />
            ),
            width: 140,
            render: (_, record) => (
              <InputNumber
                min={0}
                max={selectedExamSubject?.maxMarks}
                precision={2}
                value={record.attendance === 'absent' ? 0 : record.marks}
                disabled={record.attendance === 'absent' || exam?.isPublish}
                style={{ width: 120 }}
                onChange={(value) =>
                  updateRow(record.examStudentId, {
                    marks: typeof value === 'number' ? value : 0,
                    attendance: record.attendance || 'present',
                    marked: true,
                  })
                }
              />
            ),
          },
          {
            title: (
              <FormattedMessage id="school.academic.examMark.absent" defaultMessage="Absent" />
            ),
            width: 100,
            render: (_, record) => (
              <Checkbox
                checked={record.attendance === 'absent'}
                disabled={exam?.isPublish}
                onChange={(event) =>
                  updateRow(record.examStudentId, {
                    attendance: event.target.checked ? 'absent' : 'present',
                    marks: event.target.checked ? 0 : record.marks,
                    marked: true,
                  })
                }
              />
            ),
          },
          {
            title: <FormattedMessage id="school.academic.examMark.note" defaultMessage="Note" />,
            width: 220,
            render: (_, record) => (
              <Input
                value={record.note}
                disabled={exam?.isPublish}
                onChange={(event) =>
                  updateRow(record.examStudentId, { note: event.target.value, marked: true })
                }
              />
            ),
          },
          {
            title: (
              <FormattedMessage id="school.academic.examMark.result" defaultMessage="Result" />
            ),
            width: 120,
            render: (_, record) => {
              if (!record.marked && !dirtyIds.has(record.examStudentId || '')) {
                return (
                  <Tag>
                    <FormattedMessage
                      id="school.academic.examMark.unmarked"
                      defaultMessage="Unmarked"
                    />
                  </Tag>
                );
              }
              const passed =
                record.attendance !== 'absent' &&
                (record.marks ?? 0) >= (selectedExamSubject?.minMarks ?? 0);
              return passed ? (
                <Tag color="green">
                  <FormattedMessage id="school.academic.examMark.pass" defaultMessage="Pass" />
                </Tag>
              ) : (
                <Tag color="red">
                  <FormattedMessage id="school.academic.examMark.fail" defaultMessage="Fail" />
                </Tag>
              );
            },
          },
        ]}
      />
    </PageContainer>
  );
};

export default ExamMarks;
