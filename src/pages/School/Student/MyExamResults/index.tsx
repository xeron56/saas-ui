import { DownloadOutlined, EyeOutlined, PrinterOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Empty, Space, Spin, Table, Tag, Typography, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  V1ExamRankReportItem,
  V1ExamRankReportSubject,
  V1ExamRankReportSubjectResult,
  V1ExamResultCardSummary,
  V1ExamStudentMarksheetReportReply,
} from '@gosaas/api';
import { ExamStudentServiceApi } from '@gosaas/api';

const examStudentService = new ExamStudentServiceApi();

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

type StudentName = Pick<
  V1ExamResultCardSummary,
  'firstName' | 'middleName' | 'lastName' | 'studentId'
>;

const studentName = (row?: StudentName) =>
  [row?.firstName, row?.middleName, row?.lastName].filter(Boolean).join(' ') ||
  row?.studentId ||
  '-';

const formatNumber = (value?: number, digits = 2) => Number(value || 0).toFixed(digits);

const subjectResultById = (row?: V1ExamRankReportItem, examSubjectId?: string) =>
  (row?.subjectResults || []).find((item) => item.examSubjectId === examSubjectId);

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

const subjectMark = (result?: V1ExamRankReportSubjectResult) => {
  if (!result?.marked) {
    return '-';
  }
  return (
    <Space size={4} wrap>
      <Typography.Text>{formatNumber(result.marks)}</Typography.Text>
      {result.gradeName ? <Tag>{result.gradeName}</Tag> : null}
      {result.attendance === 'absent' ? (
        <Tag color="red">
          <FormattedMessage id="school.report.examRank.absent" defaultMessage="Absent" />
        </Tag>
      ) : null}
    </Space>
  );
};

const MyExamResults: React.FC = () => {
  const intl = useIntl();
  const [items, setItems] = useState<V1ExamResultCardSummary[]>([]);
  const [selected, setSelected] = useState<V1ExamResultCardSummary>();
  const [marksheet, setMarksheet] = useState<V1ExamStudentMarksheetReportReply>();
  const [loadingList, setLoadingList] = useState(false);
  const [loadingCard, setLoadingCard] = useState(false);

  const loadCard = useCallback(
    async (row?: V1ExamResultCardSummary) => {
      if (!row?.studentId || !row?.examId) {
        setSelected(undefined);
        setMarksheet(undefined);
        return;
      }
      setSelected(row);
      setLoadingCard(true);
      try {
        const resp = await examStudentService.examStudentServiceGetMyPublishedExamResultCard({
          studentId: row.studentId,
          examId: row.examId,
        });
        setMarksheet(resp.data);
      } catch (error) {
        message.error(
          intl.formatMessage({
            id: 'school.student.myExamResults.loadFailed',
            defaultMessage: 'Failed to load exam result.',
          }),
        );
      } finally {
        setLoadingCard(false);
      }
    },
    [intl],
  );

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const resp = await examStudentService.examStudentServiceListMyPublishedExamResultCards({
        query: { pageSize: 100 },
      });
      const nextItems = resp.data.items || [];
      setItems(nextItems);
      await loadCard(nextItems[0]);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.student.myExamResults.listFailed',
          defaultMessage: 'Failed to load published exam results.',
        }),
      );
    } finally {
      setLoadingList(false);
    }
  }, [intl, loadCard]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const downloadMarksheetPDF = async () => {
    if (!selected?.studentId || !selected.examId) {
      return;
    }
    try {
      const resp = await examStudentService.examStudentServiceDownloadMyPublishedExamMarksheetPdf({
        studentId: selected.studentId,
        examId: selected.examId,
      });
      downloadBlob(resp.data, 'exam-result.pdf');
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.student.myExamResults.downloadFailed',
          defaultMessage: 'Failed to download exam result PDF.',
        }),
      );
    }
  };

  const item = marksheet?.item;

  const subjectColumns = useMemo(
    () => [
      {
        title: (
          <FormattedMessage id="school.report.examMarksheet.subject" defaultMessage="Subject" />
        ),
        dataIndex: 'subjectName',
        render: (_: unknown, subject: V1ExamRankReportSubject) =>
          [subject.subjectName || subject.subjectId, subject.subjectCode]
            .filter(Boolean)
            .join(' - '),
      },
      {
        title: (
          <FormattedMessage id="school.report.examMarksheet.maxMarks" defaultMessage="Max Marks" />
        ),
        dataIndex: 'maxMarks',
        width: 110,
        render: (value: number) => formatNumber(value, 0),
      },
      {
        title: (
          <FormattedMessage id="school.report.examMarksheet.minMarks" defaultMessage="Min Marks" />
        ),
        dataIndex: 'minMarks',
        width: 110,
        render: (value: number) => formatNumber(value, 0),
      },
      {
        title: <FormattedMessage id="school.report.examMarksheet.marks" defaultMessage="Marks" />,
        dataIndex: 'marks',
        width: 180,
        render: (_: unknown, subject: V1ExamRankReportSubject) =>
          subjectMark(subjectResultById(item, subject.examSubjectId)),
      },
      {
        title: <FormattedMessage id="school.report.examMarksheet.note" defaultMessage="Note" />,
        dataIndex: 'note',
        render: (_: unknown, subject: V1ExamRankReportSubject) =>
          subjectResultById(item, subject.examSubjectId)?.note || '-',
      },
    ],
    [item],
  );

  const resultColumns = [
    {
      title: <FormattedMessage id="school.report.examRank.exam" defaultMessage="Exam" />,
      dataIndex: 'examName',
      render: (_: unknown, row: V1ExamResultCardSummary) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{row.examName || row.examId}</Typography.Text>
          <Typography.Text type="secondary">{row.examType || '-'}</Typography.Text>
        </Space>
      ),
    },
    {
      title: <FormattedMessage id="school.report.examMarksheet.student" defaultMessage="Student" />,
      dataIndex: 'studentId',
      render: (_: unknown, row: V1ExamResultCardSummary) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{studentName(row)}</Typography.Text>
          <Typography.Text type="secondary">
            {row.admissionNo || row.studentId || '-'}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: <FormattedMessage id="school.report.examRank.total" defaultMessage="Total" />,
      dataIndex: 'obtainedMarks',
      width: 140,
      render: (_: unknown, row: V1ExamResultCardSummary) =>
        `${formatNumber(row.obtainedMarks)}/${formatNumber(row.totalMarks)}`,
    },
    {
      title: <FormattedMessage id="school.report.examRank.percent" defaultMessage="Percent" />,
      dataIndex: 'percentage',
      width: 120,
      render: (value: number) => `${formatNumber(value)}%`,
    },
    {
      title: <FormattedMessage id="school.report.examRank.result" defaultMessage="Result" />,
      dataIndex: 'isPassed',
      width: 120,
      render: (value: boolean) => resultTag(value),
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      width: 90,
      render: (_: unknown, row: V1ExamResultCardSummary) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={(event) => {
            event.stopPropagation();
            loadCard(row);
          }}
        >
          <FormattedMessage id="pages.searchTable.view" defaultMessage="View" />
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <style>
        {`@media print {
          body * { visibility: hidden; }
          .my-exam-result-print, .my-exam-result-print * { visibility: visible; }
          .my-exam-result-print { position: absolute; left: 0; top: 0; width: 100%; }
          .my-exam-result-controls, .ant-pro-page-container-children-content > .ant-space > .ant-table-wrapper { display: none !important; }
        }`}
      </style>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space className="my-exam-result-controls" wrap>
          <Button icon={<ReloadOutlined />} loading={loadingList} onClick={loadList}>
            <FormattedMessage id="pages.searchTable.refresh" defaultMessage="Refresh" />
          </Button>
          <Button icon={<PrinterOutlined />} disabled={!marksheet} onClick={() => window.print()}>
            <FormattedMessage id="school.report.examMarksheet.print" defaultMessage="Print" />
          </Button>
          <Button
            icon={<DownloadOutlined />}
            disabled={!selected?.studentId || !selected.examId}
            onClick={downloadMarksheetPDF}
          >
            <FormattedMessage
              id="school.report.examMarksheet.downloadPdf"
              defaultMessage="Download PDF"
            />
          </Button>
        </Space>

        <Table<V1ExamResultCardSummary>
          rowKey={(row) => row.examStudentId || `${row.studentId}-${row.examId}`}
          columns={resultColumns}
          dataSource={items}
          loading={loadingList}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          rowClassName={(row) =>
            row.examStudentId === selected?.examStudentId ? 'ant-table-row-selected' : ''
          }
          onRow={(row) => ({ onClick: () => loadCard(row) })}
        />

        <Spin spinning={loadingCard}>
          {marksheet ? (
            <div
              className="my-exam-result-print"
              style={{
                background: '#fff',
                border: '1px solid #d9d9d9',
                padding: 24,
                maxWidth: 980,
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                  <Typography.Title level={3} style={{ marginBottom: 4 }}>
                    {marksheet.examName}
                  </Typography.Title>
                  <Typography.Text strong>
                    <FormattedMessage
                      id="school.student.myExamResults.resultCard"
                      defaultMessage="Result Card"
                    />
                  </Typography.Text>
                </div>

                {marksheet.isRankGenerated ? null : (
                  <Tag color="gold" style={{ width: 'fit-content' }}>
                    <FormattedMessage
                      id="school.report.examMarksheet.notGenerated"
                      defaultMessage="Ranks not generated"
                    />
                  </Tag>
                )}

                <Space size="large" wrap>
                  <Typography.Text>
                    <strong>
                      <FormattedMessage id="school.student.name" defaultMessage="Name" />:
                    </strong>{' '}
                    {studentName(item)}
                  </Typography.Text>
                  <Typography.Text>
                    <strong>
                      <FormattedMessage
                        id="school.student.admissionNo"
                        defaultMessage="Admission No."
                      />
                      :
                    </strong>{' '}
                    {item?.admissionNo || '-'}
                  </Typography.Text>
                  <Typography.Text>
                    <strong>
                      <FormattedMessage id="school.student.rollNo" defaultMessage="Roll No." />:
                    </strong>{' '}
                    {marksheet.useExamRollNo ? item?.examRollNo || '-' : item?.rollNo || '-'}
                  </Typography.Text>
                  <Typography.Text>
                    <strong>
                      <FormattedMessage id="school.report.examRank.rank" defaultMessage="Rank" />:
                    </strong>{' '}
                    {item?.rank || '-'}
                  </Typography.Text>
                  <Typography.Text>
                    <strong>
                      <FormattedMessage
                        id="school.report.examMarksheet.division"
                        defaultMessage="Division"
                      />
                      :
                    </strong>{' '}
                    {item?.divisionName || '-'}
                  </Typography.Text>
                </Space>

                <Table<V1ExamRankReportSubject>
                  rowKey={(row) => row.examSubjectId || row.subjectId || ''}
                  columns={subjectColumns}
                  dataSource={marksheet.subjects || []}
                  pagination={false}
                  size="small"
                />

                <Space size="large" wrap>
                  <Typography.Text>
                    <strong>
                      <FormattedMessage id="school.report.examRank.total" defaultMessage="Total" />:
                    </strong>{' '}
                    {formatNumber(item?.obtainedMarks)}/{formatNumber(item?.totalMarks)}
                  </Typography.Text>
                  <Typography.Text>
                    <strong>
                      <FormattedMessage
                        id="school.report.examRank.percent"
                        defaultMessage="Percent"
                      />
                      :
                    </strong>{' '}
                    {formatNumber(item?.percentage)}%
                  </Typography.Text>
                  <Typography.Text>
                    <strong>
                      <FormattedMessage id="school.report.examRank.grade" defaultMessage="Grade" />:
                    </strong>{' '}
                    {item?.gradeName || '-'}
                  </Typography.Text>
                  <Typography.Text>
                    <strong>
                      <FormattedMessage
                        id="school.report.examRank.result"
                        defaultMessage="Result"
                      />
                      :
                    </strong>{' '}
                    {marksheet.examType === 'gpa'
                      ? formatNumber(item?.qualityPoint)
                      : resultTag(item?.isPassed)}
                  </Typography.Text>
                </Space>

                {item?.teacherRemark ? (
                  <Typography.Paragraph>
                    <strong>
                      <FormattedMessage
                        id="school.report.examMarksheet.teacherRemark"
                        defaultMessage="Teacher Remark"
                      />
                      :
                    </strong>{' '}
                    {item.teacherRemark}
                  </Typography.Paragraph>
                ) : null}
              </Space>
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={intl.formatMessage({
                id: 'school.student.myExamResults.empty',
                defaultMessage: 'No published exam results are available.',
              })}
            />
          )}
        </Spin>
      </Space>
    </PageContainer>
  );
};

export default MyExamResults;
