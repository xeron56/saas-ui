import { DownloadOutlined, MailOutlined, PrinterOutlined, SearchOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Divider, Select, Space, Table, Tag, Typography, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import type {
  V1ClassSection,
  V1Exam,
  V1ExamGroup,
  V1ExamMarksheetTemplate,
  V1ExamRankReportItem,
  V1ExamRankReportReply,
  V1ExamRankReportSubject,
  V1ExamRankReportSubjectResult,
  V1ExamStudentMarksheetReportReply,
} from '@gosaas/api';
import {
  ClassSectionServiceApi,
  ExamGroupServiceApi,
  ExamMarksheetTemplateServiceApi,
  ExamServiceApi,
  ExamStudentServiceApi,
} from '@gosaas/api';

const classSectionService = new ClassSectionServiceApi();
const examGroupService = new ExamGroupServiceApi();
const examService = new ExamServiceApi();
const examStudentService = new ExamStudentServiceApi();
const marksheetTemplateService = new ExamMarksheetTemplateServiceApi();

const studentName = (row?: V1ExamRankReportItem) =>
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

const assetUrl = (file?: { url?: string }) => file?.url || undefined;

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

const ExamMarksheetReport: React.FC = () => {
  const intl = useIntl();
  const [examGroups, setExamGroups] = useState<V1ExamGroup[]>([]);
  const [exams, setExams] = useState<V1Exam[]>([]);
  const [classSections, setClassSections] = useState<V1ClassSection[]>([]);
  const [templates, setTemplates] = useState<V1ExamMarksheetTemplate[]>([]);
  const [examGroupId, setExamGroupId] = useState<string>();
  const [examId, setExamId] = useState<string>();
  const [classSectionId, setClassSectionId] = useState<string>();
  const [templateId, setTemplateId] = useState<string>();
  const [studentId, setStudentId] = useState<string>();
  const [rosterReport, setRosterReport] = useState<V1ExamRankReportReply>();
  const [marksheet, setMarksheet] = useState<V1ExamStudentMarksheetReportReply>();
  const [loading, setLoading] = useState(false);
  const [emailing, setEmailing] = useState(false);

  useEffect(() => {
    Promise.all([
      examGroupService.examGroupServiceListExamGroup2({
        body: { pageSize: 200, sort: ['name'] },
      }),
      examService.examServiceListExam2({
        body: { pageSize: 500, sort: ['name'] },
      }),
      marksheetTemplateService.examMarksheetTemplateServiceListExamMarksheetTemplate2({
        body: { pageSize: 200, sort: ['template'] },
      }),
    ])
      .then(([groupsResp, examsResp, templatesResp]) => {
        const groupItems = groupsResp.data.items || [];
        const examItems = examsResp.data.items || [];
        const templateItems = templatesResp.data.items || [];
        setExamGroups(groupItems);
        setExams(examItems);
        setTemplates(templateItems);
        setExamGroupId((current) => current || groupItems[0]?.id);
        setTemplateId((current) => current || templateItems[0]?.id);
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
  const selectedClassSection = useMemo(
    () => classSections.find((item) => item.id === classSectionId),
    [classSectionId, classSections],
  );
  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === templateId),
    [templateId, templates],
  );

  useEffect(() => {
    setExamId((current) => {
      if (current && filteredExams.some((item) => item.id === current)) {
        return current;
      }
      return filteredExams[0]?.id;
    });
    setStudentId(undefined);
    setRosterReport(undefined);
    setMarksheet(undefined);
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

  const students = rosterReport?.items || [];
  const item = marksheet?.item;

  const loadMarksheet = async () => {
    if (!examId || !classSectionId) {
      message.warning(
        intl.formatMessage({
          id: 'school.report.examMarksheet.selectFilters',
          defaultMessage: 'Select an exam, class section, and student first.',
        }),
      );
      return;
    }
    setLoading(true);
    try {
      let targetStudentId = studentId;
      if (!targetStudentId) {
        const rosterResp = await examStudentService.examStudentServiceGetExamRankReport({
          examId,
          classSectionId,
        });
        const nextRoster = rosterResp.data;
        setRosterReport(nextRoster);
        targetStudentId = nextRoster.items?.[0]?.examStudentId;
        setStudentId(targetStudentId);
      }
      if (!targetStudentId) {
        message.warning(
          intl.formatMessage({
            id: 'school.report.examMarksheet.selectStudent',
            defaultMessage: 'Select student',
          }),
        );
        return;
      }
      const resp = await examStudentService.examStudentServiceGetExamStudentMarksheetReport({
        examId,
        classSectionId,
        examStudentId: targetStudentId,
      });
      setMarksheet(resp.data);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.report.examMarksheet.loadFailed',
          defaultMessage: 'Failed to load exam marksheet.',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!examId || !classSectionId) {
      return;
    }
    const resp = await examStudentService.examStudentServiceGetExamRankReport({
      examId,
      classSectionId,
    });
    setRosterReport(resp.data);
    setStudentId((current) =>
      current && resp.data.items?.some((row) => row.examStudentId === current)
        ? current
        : resp.data.items?.[0]?.examStudentId,
    );
  };

  const downloadMarksheetPDF = async () => {
    if (!examId || !classSectionId || !studentId) {
      message.warning(
        intl.formatMessage({
          id: 'school.report.examMarksheet.selectFilters',
          defaultMessage: 'Select an exam, class section, and student first.',
        }),
      );
      return;
    }
    try {
      const resp = await examStudentService.examStudentServiceDownloadExamStudentMarksheetPdf({
        examId,
        classSectionId,
        examStudentId: studentId,
      });
      downloadBlob(resp.data, 'marksheet.pdf');
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.report.examMarksheet.downloadFailed',
          defaultMessage: 'Failed to download exam marksheet PDF.',
        }),
      );
    }
  };

  const emailMarksheetPDF = async () => {
    if (!examId || !classSectionId || !studentId) {
      message.warning(
        intl.formatMessage({
          id: 'school.report.examMarksheet.selectFilters',
          defaultMessage: 'Select an exam, class section, and student first.',
        }),
      );
      return;
    }
    setEmailing(true);
    try {
      const resp = await examStudentService.examStudentServiceSendExamStudentMarksheetEmail({
        examId,
        classSectionId,
        examStudentId: studentId,
      });
      message.success(
        intl.formatMessage(
          {
            id: 'school.report.examMarksheet.emailSuccess',
            defaultMessage: 'Sent marksheet PDF to {count} recipient(s).',
          },
          { count: resp.data.sent_count || 0 },
        ),
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.report.examMarksheet.emailFailed',
          defaultMessage: 'Failed to email exam marksheet PDF.',
        }),
      );
    } finally {
      setEmailing(false);
    }
  };

  const resetReport = () => {
    setStudentId(undefined);
    setRosterReport(undefined);
    setMarksheet(undefined);
  };

  const visible = (key: keyof V1ExamMarksheetTemplate, fallback = true) =>
    Boolean(selectedTemplate?.[key] ?? fallback);

  const headerImageUrl = assetUrl(selectedTemplate?.headerImageFile);
  const leftLogoUrl = assetUrl(selectedTemplate?.leftLogoFile);
  const rightLogoUrl = assetUrl(selectedTemplate?.rightLogoFile);
  const backgroundImageUrl = assetUrl(selectedTemplate?.backgroundImageFile);
  const signatureAssets = [
    {
      key: 'left',
      label: intl.formatMessage({
        id: 'school.academic.examMarksheetTemplate.leftSign',
        defaultMessage: 'Left Signature',
      }),
      url: assetUrl(selectedTemplate?.leftSignFile),
    },
    {
      key: 'middle',
      label: intl.formatMessage({
        id: 'school.academic.examMarksheetTemplate.middleSign',
        defaultMessage: 'Middle Signature',
      }),
      url: assetUrl(selectedTemplate?.middleSignFile),
    },
    {
      key: 'right',
      label: intl.formatMessage({
        id: 'school.academic.examMarksheetTemplate.rightSign',
        defaultMessage: 'Right Signature',
      }),
      url: assetUrl(selectedTemplate?.rightSignFile),
    },
  ];

  const columns = [
    {
      title: <FormattedMessage id="school.report.examMarksheet.subject" defaultMessage="Subject" />,
      dataIndex: 'subjectName',
      render: (_: unknown, subject: V1ExamRankReportSubject) =>
        [subject.subjectName || subject.subjectId, subject.subjectCode].filter(Boolean).join(' - '),
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
  ];

  return (
    <PageContainer>
      <style>
        {`@media print {
          body * { visibility: hidden; }
          .exam-marksheet-print, .exam-marksheet-print * { visibility: visible; }
          .exam-marksheet-print { position: absolute; left: 0; top: 0; width: 100%; }
          .exam-marksheet-controls { display: none !important; }
        }`}
      </style>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space className="exam-marksheet-controls" wrap>
          <Select
            showSearch
            allowClear
            value={examGroupId}
            style={{ minWidth: 220 }}
            placeholder={intl.formatMessage({
              id: 'school.academic.examGroup',
              defaultMessage: 'Exam Group',
            })}
            options={examGroups.map((row) => ({ label: row.name || row.id, value: row.id }))}
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
            options={filteredExams.map((row) => ({ label: row.name || row.id, value: row.id }))}
            optionFilterProp="label"
            onChange={(value) => {
              setExamId(value);
              resetReport();
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
            options={classSections.map((row) => ({ label: row.code || row.id, value: row.id }))}
            optionFilterProp="label"
            onChange={(value) => {
              setClassSectionId(value);
              resetReport();
            }}
            onDropdownVisibleChange={(open) => {
              if (!open && examId && classSectionId && !rosterReport) {
                loadStudents().catch(() => undefined);
              }
            }}
          />
          <Select
            showSearch
            allowClear
            value={templateId}
            style={{ minWidth: 220 }}
            placeholder={intl.formatMessage({
              id: 'school.report.examMarksheet.template',
              defaultMessage: 'Template',
            })}
            options={templates.map((row) => ({ label: row.template || row.id, value: row.id }))}
            optionFilterProp="label"
            onChange={setTemplateId}
          />
          <Select
            showSearch
            allowClear
            value={studentId}
            style={{ minWidth: 240 }}
            placeholder={intl.formatMessage({
              id: 'school.report.examMarksheet.student',
              defaultMessage: 'Student',
            })}
            options={students.map((row) => ({
              label: `${studentName(row)} (${row.admissionNo || row.studentId || '-'})`,
              value: row.examStudentId,
            }))}
            optionFilterProp="label"
            onFocus={() => {
              if (!rosterReport) {
                loadStudents().catch(() => undefined);
              }
            }}
            onChange={(value) => {
              setStudentId(value);
              setMarksheet(undefined);
            }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={loading}
            onClick={loadMarksheet}
          >
            <FormattedMessage
              id="school.report.examMarksheet.load"
              defaultMessage="Load Marksheet"
            />
          </Button>
          <Button icon={<PrinterOutlined />} disabled={!marksheet} onClick={() => window.print()}>
            <FormattedMessage id="school.report.examMarksheet.print" defaultMessage="Print" />
          </Button>
          <Button
            icon={<DownloadOutlined />}
            disabled={!examId || !classSectionId || !studentId}
            onClick={downloadMarksheetPDF}
          >
            <FormattedMessage
              id="school.report.examMarksheet.downloadPdf"
              defaultMessage="Download PDF"
            />
          </Button>
          <Button
            icon={<MailOutlined />}
            loading={emailing}
            disabled={!examId || !classSectionId || !studentId}
            onClick={emailMarksheetPDF}
          >
            <FormattedMessage
              id="school.report.examMarksheet.emailPdf"
              defaultMessage="Email PDF"
            />
          </Button>
        </Space>

        {marksheet ? (
          <div
            className="exam-marksheet-print"
            style={{
              background: '#fff',
              backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              border: '1px solid #d9d9d9',
              padding: 24,
              maxWidth: 980,
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {headerImageUrl ? (
                <img
                  src={headerImageUrl}
                  alt=""
                  style={{
                    width: '100%',
                    maxHeight: 180,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : null}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '96px 1fr 96px',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  {leftLogoUrl ? (
                    <img
                      src={leftLogoUrl}
                      alt=""
                      style={{ width: 80, height: 80, objectFit: 'contain' }}
                    />
                  ) : null}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Typography.Title level={3} style={{ marginBottom: 4 }}>
                    {selectedTemplate?.schoolName || marksheet.examName || selectedExam?.name}
                  </Typography.Title>
                  {selectedTemplate?.heading ? (
                    <Typography.Title level={4} style={{ marginTop: 0 }}>
                      {selectedTemplate.heading}
                    </Typography.Title>
                  ) : null}
                  <Typography.Text strong>
                    {selectedTemplate?.title || selectedTemplate?.examName || marksheet.examName}
                  </Typography.Text>
                  {selectedTemplate?.examCenter ? (
                    <>
                      <br />
                      <Typography.Text>{selectedTemplate.examCenter}</Typography.Text>
                    </>
                  ) : null}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {rightLogoUrl ? (
                    <img
                      src={rightLogoUrl}
                      alt=""
                      style={{ width: 80, height: 80, objectFit: 'contain' }}
                    />
                  ) : null}
                </div>
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
                {visible('showName') ? (
                  <Typography.Text>
                    <strong>
                      <FormattedMessage id="school.student.name" defaultMessage="Name" />:
                    </strong>{' '}
                    {studentName(item)}
                  </Typography.Text>
                ) : null}
                {visible('showFatherName') ? (
                  <Typography.Text>
                    <strong>
                      <FormattedMessage
                        id="school.academic.examMarksheetTemplate.showFatherName"
                        defaultMessage="Father Name"
                      />
                      :
                    </strong>{' '}
                    {item?.fatherName || '-'}
                  </Typography.Text>
                ) : null}
                {visible('showAdmissionNo') ? (
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
                ) : null}
                {visible('showRollNo') ? (
                  <Typography.Text>
                    <strong>
                      <FormattedMessage id="school.student.rollNo" defaultMessage="Roll No." />:
                    </strong>{' '}
                    {marksheet.useExamRollNo ? item?.examRollNo || '-' : item?.rollNo || '-'}
                  </Typography.Text>
                ) : null}
                {visible('showClass') || visible('showSection', false) ? (
                  <Typography.Text>
                    <strong>
                      <FormattedMessage
                        id="school.report.examRank.classSection"
                        defaultMessage="Class Section"
                      />
                      :
                    </strong>{' '}
                    {selectedClassSection?.code || marksheet.classSectionId}
                  </Typography.Text>
                ) : null}
                {visible('showRank', false) ? (
                  <Typography.Text>
                    <strong>
                      <FormattedMessage id="school.report.examRank.rank" defaultMessage="Rank" />:
                    </strong>{' '}
                    {item?.rank || '-'}
                  </Typography.Text>
                ) : null}
                {visible('showDivision') ? (
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
                ) : null}
              </Space>

              <Table<V1ExamRankReportSubject>
                rowKey={(row) => row.examSubjectId || row.subjectId || ''}
                columns={columns}
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
                    <FormattedMessage id="school.report.examRank.result" defaultMessage="Result" />:
                  </strong>{' '}
                  {marksheet.examType === 'gpa'
                    ? formatNumber(item?.qualityPoint)
                    : resultTag(item?.isPassed)}
                </Typography.Text>
              </Space>

              {visible('showTeacherRemark') && item?.teacherRemark ? (
                <>
                  <Divider style={{ margin: '8px 0' }} />
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
                </>
              ) : null}

              {signatureAssets.some((asset) => asset.url) ? (
                <>
                  <Divider style={{ margin: '16px 0 8px' }} />
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: 24,
                      alignItems: 'end',
                    }}
                  >
                    {signatureAssets.map((asset) => (
                      <div key={asset.key} style={{ textAlign: 'center', minHeight: 92 }}>
                        {asset.url ? (
                          <img
                            src={asset.url}
                            alt=""
                            style={{
                              width: 120,
                              height: 56,
                              objectFit: 'contain',
                              display: 'block',
                              margin: '0 auto 8px',
                            }}
                          />
                        ) : null}
                        <div style={{ borderTop: '1px solid #222', paddingTop: 6 }}>
                          <Typography.Text>{asset.label}</Typography.Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </Space>
          </div>
        ) : null}
      </Space>
    </PageContainer>
  );
};

export default ExamMarksheetReport;
