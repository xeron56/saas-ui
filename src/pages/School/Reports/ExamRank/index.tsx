import { SearchOutlined } from '@ant-design/icons';
import type { ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Select, Space, Statistic, Tag, Typography, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import type {
  V1ClassSection,
  V1Exam,
  V1ExamGroup,
  V1ExamRankReportItem,
  V1ExamRankReportReply,
  V1ExamRankReportSubjectResult,
} from '@gosaas/api';
import {
  ClassSectionServiceApi,
  ExamGroupServiceApi,
  ExamServiceApi,
  ExamStudentServiceApi,
} from '@gosaas/api';

const classSectionService = new ClassSectionServiceApi();
const examGroupService = new ExamGroupServiceApi();
const examService = new ExamServiceApi();
const examStudentService = new ExamStudentServiceApi();

type ExamRankReportRow = V1ExamRankReportItem & {
  key: string;
};

const studentName = (row: V1ExamRankReportItem) =>
  [row.firstName, row.middleName, row.lastName].filter(Boolean).join(' ') || row.studentId || '-';

const formatNumber = (value?: number, digits = 2) => Number(value || 0).toFixed(digits);

const subjectResultById = (row: V1ExamRankReportItem, examSubjectId?: string) =>
  (row.subjectResults || []).find((item) => item.examSubjectId === examSubjectId);

const resultTag = (passed?: boolean) =>
  passed ? (
    <Tag color="green">
      <FormattedMessage id="school.report.examRank.pass" defaultMessage="Pass" />
    </Tag>
  ) : (
    <Tag color="red">
      <FormattedMessage id="school.report.examRank.fail" defaultMessage="Fail" />
    </Tag>
  );

const subjectResultContent = (result?: V1ExamRankReportSubjectResult) => {
  if (!result?.marked) {
    return '-';
  }
  const absent = result.attendance === 'absent';
  return (
    <Space direction="vertical" size={0}>
      <Space size={4} wrap>
        <Typography.Text>{formatNumber(result.marks)}</Typography.Text>
        {result.gradeName ? <Tag>{result.gradeName}</Tag> : null}
        {absent ? (
          <Tag color="red">
            <FormattedMessage id="school.report.examRank.absent" defaultMessage="Absent" />
          </Tag>
        ) : null}
      </Space>
      {result.note ? (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {result.note}
        </Typography.Text>
      ) : null}
    </Space>
  );
};

const ExamRankReport: React.FC = () => {
  const intl = useIntl();
  const [examGroups, setExamGroups] = useState<V1ExamGroup[]>([]);
  const [exams, setExams] = useState<V1Exam[]>([]);
  const [classSections, setClassSections] = useState<V1ClassSection[]>([]);
  const [examGroupId, setExamGroupId] = useState<string>();
  const [examId, setExamId] = useState<string>();
  const [classSectionId, setClassSectionId] = useState<string>();
  const [report, setReport] = useState<V1ExamRankReportReply>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      examGroupService.examGroupServiceListExamGroup2({
        body: { pageSize: 200, sort: ['name'] },
      }),
      examService.examServiceListExam2({
        body: { pageSize: 500, sort: ['name'] },
      }),
    ])
      .then(([groupsResp, examsResp]) => {
        const groupItems = groupsResp.data.items || [];
        const examItems = examsResp.data.items || [];
        setExamGroups(groupItems);
        setExams(examItems);
        setExamGroupId((current) => current || groupItems[0]?.id);
      })
      .catch(() => {
        message.error(
          intl.formatMessage({
            id: 'school.report.examRank.referenceLoadFailed',
            defaultMessage: 'Failed to load report reference data.',
          }),
        );
      });
  }, [intl]);

  const filteredExams = useMemo(
    () => exams.filter((item) => !examGroupId || item.examGroupId === examGroupId),
    [examGroupId, exams],
  );

  const selectedExam = useMemo(() => exams.find((item) => item.id === examId), [examId, exams]);

  useEffect(() => {
    setExamId((current) => {
      if (current && filteredExams.some((item) => item.id === current)) {
        return current;
      }
      return filteredExams[0]?.id;
    });
    setReport(undefined);
  }, [filteredExams]);

  useEffect(() => {
    if (!selectedExam?.academicSessionId) {
      setClassSections([]);
      setClassSectionId(undefined);
      return;
    }
    classSectionService
      .classSectionServiceListClassSection2({
        body: {
          pageSize: 500,
          sort: ['code'],
          filter: { academicSessionId: { $eq: selectedExam.academicSessionId } },
        },
      })
      .then((resp) => {
        const items = resp.data.items || [];
        setClassSections(items);
        setClassSectionId((current) =>
          current && items.some((item) => item.id === current) ? current : items[0]?.id,
        );
      })
      .catch(() => {
        message.error(
          intl.formatMessage({
            id: 'school.report.examRank.referenceLoadFailed',
            defaultMessage: 'Failed to load report reference data.',
          }),
        );
      });
  }, [intl, selectedExam?.academicSessionId]);

  const rows: ExamRankReportRow[] = useMemo(
    () =>
      (report?.items || []).map((item) => ({
        ...item,
        key: item.examStudentId || item.studentEnrollmentId || item.studentId || '',
      })),
    [report?.items],
  );

  const summary = useMemo(
    () => ({
      students: rows.length,
      ranked: rows.filter((row) => Number(row.rank || 0) > 0).length,
      unranked: rows.filter((row) => Number(row.rank || 0) <= 0).length,
    }),
    [rows],
  );

  const loadReport = async () => {
    if (!examId || !classSectionId) {
      message.warning(
        intl.formatMessage({
          id: 'school.report.examRank.selectFilters',
          defaultMessage: 'Select an exam and class section first.',
        }),
      );
      return;
    }
    setLoading(true);
    try {
      const resp = await examStudentService.examStudentServiceGetExamRankReport({
        examId,
        classSectionId,
      });
      setReport(resp.data);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.report.examRank.loadFailed',
          defaultMessage: 'Failed to load exam rank report.',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const columns: ProColumnType<ExamRankReportRow>[] = [
    {
      title: <FormattedMessage id="school.report.examRank.rank" defaultMessage="Rank" />,
      dataIndex: 'rank',
      width: 80,
      fixed: 'left',
      search: false,
      renderText: (value) => value || '-',
    },
    {
      title: <FormattedMessage id="school.student.admissionNo" defaultMessage="Admission No." />,
      dataIndex: 'admissionNo',
      width: 130,
      fixed: 'left',
      search: false,
    },
    {
      title: <FormattedMessage id="school.student.rollNo" defaultMessage="Roll No." />,
      dataIndex: report?.useExamRollNo ? 'examRollNo' : 'rollNo',
      width: 110,
      search: false,
      render: (_, record) => (report?.useExamRollNo ? record.examRollNo : record.rollNo) || '-',
    },
    {
      title: <FormattedMessage id="school.student.name" defaultMessage="Name" />,
      dataIndex: 'firstName',
      width: 180,
      search: false,
      render: (_, record) => studentName(record),
    },
    ...(report?.subjects || []).map<ProColumnType<ExamRankReportRow>>((subject) => ({
      title: (
        <Space direction="vertical" size={0}>
          <Typography.Text>{subject.subjectName || subject.subjectId}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {[
              subject.subjectCode,
              `${formatNumber(subject.minMarks, 0)}/${formatNumber(subject.maxMarks, 0)}`,
            ]
              .filter(Boolean)
              .join(' - ')}
          </Typography.Text>
        </Space>
      ),
      dataIndex: subject.examSubjectId || subject.subjectId,
      width: 180,
      search: false,
      render: (_, record) => subjectResultContent(subjectResultById(record, subject.examSubjectId)),
    })),
    {
      title: <FormattedMessage id="school.report.examRank.total" defaultMessage="Total" />,
      dataIndex: 'obtainedMarks',
      width: 130,
      search: false,
      render: (_, record) =>
        `${formatNumber(record.obtainedMarks)}/${formatNumber(record.totalMarks)}`,
    },
    {
      title: <FormattedMessage id="school.report.examRank.percent" defaultMessage="Percent" />,
      dataIndex: 'percentage',
      width: 110,
      search: false,
      renderText: (value) => `${formatNumber(value)}%`,
    },
    {
      title: <FormattedMessage id="school.report.examRank.grade" defaultMessage="Grade" />,
      dataIndex: 'gradeName',
      width: 100,
      search: false,
      renderText: (value) => value || '-',
    },
    {
      title: <FormattedMessage id="school.report.examRank.result" defaultMessage="Result" />,
      dataIndex: 'isPassed',
      width: 110,
      search: false,
      render: (_, record) =>
        report?.examType === 'gpa' ? formatNumber(record.qualityPoint) : resultTag(record.isPassed),
    },
  ];

  return (
    <PageContainer>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space wrap>
          <Select
            showSearch
            allowClear
            value={examGroupId}
            style={{ minWidth: 220 }}
            placeholder={intl.formatMessage({
              id: 'school.academic.examGroup',
              defaultMessage: 'Exam Group',
            })}
            options={examGroups.map((item) => ({ label: item.name || item.id, value: item.id }))}
            optionFilterProp="label"
            onChange={(value) => setExamGroupId(value)}
          />
          <Select
            showSearch
            allowClear
            value={examId}
            style={{ minWidth: 240 }}
            placeholder={intl.formatMessage({
              id: 'school.report.examRank.exam',
              defaultMessage: 'Exam',
            })}
            options={filteredExams.map((item) => ({ label: item.name || item.id, value: item.id }))}
            optionFilterProp="label"
            onChange={(value) => {
              setExamId(value);
              setReport(undefined);
            }}
          />
          <Select
            showSearch
            allowClear
            value={classSectionId}
            style={{ minWidth: 220 }}
            placeholder={intl.formatMessage({
              id: 'school.report.examRank.classSection',
              defaultMessage: 'Class Section',
            })}
            options={classSections.map((item) => ({ label: item.code || item.id, value: item.id }))}
            optionFilterProp="label"
            onChange={(value) => {
              setClassSectionId(value);
              setReport(undefined);
            }}
          />
          <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={loadReport}>
            <FormattedMessage id="school.report.examRank.load" defaultMessage="Load Report" />
          </Button>
        </Space>
        <Space size="large" wrap>
          <Statistic
            title={
              <FormattedMessage id="school.report.examRank.students" defaultMessage="Students" />
            }
            value={summary.students}
          />
          <Statistic
            title={<FormattedMessage id="school.report.examRank.ranked" defaultMessage="Ranked" />}
            value={summary.ranked}
          />
          <Statistic
            title={
              <FormattedMessage id="school.report.examRank.unranked" defaultMessage="Unranked" />
            }
            value={summary.unranked}
          />
          {report && !report.isRankGenerated ? (
            <Tag color="gold">
              <FormattedMessage
                id="school.report.examRank.notGenerated"
                defaultMessage="Ranks not generated"
              />
            </Tag>
          ) : null}
        </Space>
        <ProTable<ExamRankReportRow>
          rowKey="key"
          search={false}
          options={false}
          loading={loading}
          columns={columns}
          dataSource={rows}
          scroll={{ x: 980 + (report?.subjects?.length || 0) * 180 }}
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      </Space>
    </PageContainer>
  );
};

export default ExamRankReport;
