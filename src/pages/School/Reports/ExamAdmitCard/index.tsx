import { DownloadOutlined, PrinterOutlined, SearchOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Divider, Select, Space, Table, Typography, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import type {
  V1ClassSection,
  V1Exam,
  V1ExamAdmitCardTemplate,
  V1ExamGroup,
  V1ExamRankReportItem,
  V1ExamRankReportReply,
  V1ExamRankReportSubject,
  V1ExamStudentAdmitCardReportReply,
} from '@gosaas/api';
import {
  ClassSectionServiceApi,
  ExamAdmitCardTemplateServiceApi,
  ExamGroupServiceApi,
  ExamServiceApi,
  ExamStudentServiceApi,
} from '@gosaas/api';

const classSectionService = new ClassSectionServiceApi();
const examGroupService = new ExamGroupServiceApi();
const examService = new ExamServiceApi();
const examStudentService = new ExamStudentServiceApi();
const admitCardTemplateService = new ExamAdmitCardTemplateServiceApi();

const studentName = (row?: V1ExamRankReportItem) =>
  [row?.firstName, row?.middleName, row?.lastName].filter(Boolean).join(' ') ||
  row?.studentId ||
  '-';

const assetUrl = (file?: { url?: string }) => file?.url || undefined;

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

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

const ExamAdmitCardReport: React.FC = () => {
  const intl = useIntl();
  const [examGroups, setExamGroups] = useState<V1ExamGroup[]>([]);
  const [exams, setExams] = useState<V1Exam[]>([]);
  const [classSections, setClassSections] = useState<V1ClassSection[]>([]);
  const [templates, setTemplates] = useState<V1ExamAdmitCardTemplate[]>([]);
  const [examGroupId, setExamGroupId] = useState<string>();
  const [examId, setExamId] = useState<string>();
  const [classSectionId, setClassSectionId] = useState<string>();
  const [templateId, setTemplateId] = useState<string>();
  const [studentId, setStudentId] = useState<string>();
  const [rosterReport, setRosterReport] = useState<V1ExamRankReportReply>();
  const [admitCard, setAdmitCard] = useState<V1ExamStudentAdmitCardReportReply>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      examGroupService.examGroupServiceListExamGroup2({
        body: { pageSize: 200, sort: ['name'] },
      }),
      examService.examServiceListExam2({
        body: { pageSize: 500, sort: ['name'] },
      }),
      admitCardTemplateService.examAdmitCardTemplateServiceListExamAdmitCardTemplate2({
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
    setAdmitCard(undefined);
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
  const item = admitCard?.item;

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

  const loadAdmitCard = async () => {
    if (!examId || !classSectionId) {
      message.warning(
        intl.formatMessage({
          id: 'school.report.examAdmitCard.selectFilters',
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
            id: 'school.report.examAdmitCard.selectStudent',
            defaultMessage: 'Select student',
          }),
        );
        return;
      }
      const resp = await examStudentService.examStudentServiceGetExamStudentAdmitCardReport({
        examId,
        classSectionId,
        examStudentId: targetStudentId,
      });
      setAdmitCard(resp.data);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.report.examAdmitCard.loadFailed',
          defaultMessage: 'Failed to load exam admit card.',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadAdmitCardPDF = async () => {
    if (!examId || !classSectionId || !studentId) {
      message.warning(
        intl.formatMessage({
          id: 'school.report.examAdmitCard.selectFilters',
          defaultMessage: 'Select an exam, class section, and student first.',
        }),
      );
      return;
    }
    setLoading(true);
    try {
      const resp = await examStudentService.examStudentServiceDownloadExamStudentAdmitCardPdf({
        examId,
        classSectionId,
        examStudentId: studentId,
      });
      downloadBlob(
        resp.data,
        `${admitCard?.examName || selectedExam?.name || 'exam'}-admit-card.pdf`,
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.report.examAdmitCard.downloadFailed',
          defaultMessage: 'Failed to download exam admit card PDF.',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const resetReport = () => {
    setStudentId(undefined);
    setRosterReport(undefined);
    setAdmitCard(undefined);
  };

  const visible = (key: keyof V1ExamAdmitCardTemplate, fallback = true) =>
    Boolean(selectedTemplate?.[key] ?? fallback);

  const leftLogoUrl = assetUrl(selectedTemplate?.leftLogo);
  const rightLogoUrl = assetUrl(selectedTemplate?.rightLogo);
  const signUrl = assetUrl(selectedTemplate?.sign);
  const backgroundImageUrl = assetUrl(selectedTemplate?.backgroundImage);

  const columns = [
    {
      title: <FormattedMessage id="school.report.examAdmitCard.subject" defaultMessage="Subject" />,
      dataIndex: 'subjectName',
      render: (_: unknown, subject: V1ExamRankReportSubject) =>
        [subject.subjectName || subject.subjectId, subject.subjectCode].filter(Boolean).join(' - '),
    },
    {
      title: <FormattedMessage id="school.report.examAdmitCard.date" defaultMessage="Date" />,
      dataIndex: 'examDate',
      width: 130,
      render: (value: string | null) => formatDate(value),
    },
    {
      title: <FormattedMessage id="school.report.examAdmitCard.time" defaultMessage="Time" />,
      dataIndex: 'timeFrom',
      width: 120,
      render: (value: string) => value || '-',
    },
    {
      title: (
        <FormattedMessage id="school.report.examAdmitCard.duration" defaultMessage="Duration" />
      ),
      dataIndex: 'duration',
      width: 120,
      render: (value: string) => value || '-',
    },
    {
      title: <FormattedMessage id="school.report.examAdmitCard.room" defaultMessage="Room" />,
      dataIndex: 'roomNo',
      width: 120,
      render: (value: string) => value || '-',
    },
  ];

  return (
    <PageContainer>
      <style>
        {`@media print {
          body * { visibility: hidden; }
          .exam-admit-card-print, .exam-admit-card-print * { visibility: visible; }
          .exam-admit-card-print { position: absolute; left: 0; top: 0; width: 100%; }
          .exam-admit-card-controls { display: none !important; }
        }`}
      </style>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space className="exam-admit-card-controls" wrap>
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
              id: 'school.report.examAdmitCard.template',
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
              id: 'school.report.examAdmitCard.student',
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
              setAdmitCard(undefined);
            }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={loading}
            onClick={loadAdmitCard}
          >
            <FormattedMessage
              id="school.report.examAdmitCard.load"
              defaultMessage="Load Admit Card"
            />
          </Button>
          <Button icon={<PrinterOutlined />} disabled={!admitCard} onClick={() => window.print()}>
            <FormattedMessage id="school.report.examAdmitCard.print" defaultMessage="Print" />
          </Button>
          <Button
            icon={<DownloadOutlined />}
            disabled={!admitCard}
            loading={loading}
            onClick={downloadAdmitCardPDF}
          >
            <FormattedMessage
              id="school.report.examAdmitCard.downloadPdf"
              defaultMessage="Download PDF"
            />
          </Button>
        </Space>

        {admitCard ? (
          <div
            className="exam-admit-card-print"
            style={{
              background: '#fff',
              backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              border: '1px solid #d9d9d9',
              padding: 24,
              maxWidth: 920,
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
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
                    {selectedTemplate?.schoolName || admitCard.examName || selectedExam?.name}
                  </Typography.Title>
                  {selectedTemplate?.heading ? (
                    <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
                      {selectedTemplate.heading}
                    </Typography.Title>
                  ) : null}
                  <Typography.Text strong>
                    {selectedTemplate?.title || selectedTemplate?.examName || admitCard.examName}
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

              <Divider style={{ margin: '8px 0' }} />

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
                        id="school.academic.examAdmitCardTemplate.showFatherName"
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
                    {admitCard.useExamRollNo ? item?.examRollNo || '-' : item?.rollNo || '-'}
                  </Typography.Text>
                ) : null}
                {visible('showGender') ? (
                  <Typography.Text>
                    <strong>
                      <FormattedMessage
                        id="school.academic.examAdmitCardTemplate.showGender"
                        defaultMessage="Gender"
                      />
                      :
                    </strong>{' '}
                    {item?.gender || '-'}
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
                    {selectedClassSection?.code || admitCard.classSectionId}
                  </Typography.Text>
                ) : null}
              </Space>

              <Table<V1ExamRankReportSubject>
                rowKey={(row) => row.examSubjectId || row.subjectId || ''}
                columns={columns}
                dataSource={admitCard.subjects || []}
                pagination={false}
                size="small"
              />

              {selectedTemplate?.contentFooter ? (
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                  {selectedTemplate.contentFooter}
                </Typography.Paragraph>
              ) : null}

              {signUrl ? (
                <>
                  <Divider style={{ margin: '16px 0 8px' }} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: 180, textAlign: 'center' }}>
                      <img
                        src={signUrl}
                        alt=""
                        style={{
                          width: 140,
                          height: 56,
                          objectFit: 'contain',
                          display: 'block',
                          margin: '0 auto 8px',
                        }}
                      />
                      <div style={{ borderTop: '1px solid #222', paddingTop: 6 }}>
                        <Typography.Text>
                          <FormattedMessage
                            id="school.academic.examAdmitCardTemplate.sign"
                            defaultMessage="Signature"
                          />
                        </Typography.Text>
                      </div>
                    </div>
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

export default ExamAdmitCardReport;
