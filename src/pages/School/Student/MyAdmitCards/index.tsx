import { DownloadOutlined, EyeOutlined, PrinterOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Divider, Empty, Space, Spin, Table, Typography, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  V1ExamAdmitCardTemplate,
  V1ExamRankReportItem,
  V1ExamRankReportSubject,
  V1ExamResultCardSummary,
  V1ExamStudentAdmitCardReportReply,
} from '@gosaas/api';
import { ExamStudentServiceApi } from '@gosaas/api';

const examStudentService = new ExamStudentServiceApi();

type StudentName = Pick<
  V1ExamResultCardSummary | V1ExamRankReportItem,
  'firstName' | 'middleName' | 'lastName' | 'studentId'
>;

const studentName = (row?: StudentName) =>
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

const MyAdmitCards: React.FC = () => {
  const intl = useIntl();
  const [items, setItems] = useState<V1ExamResultCardSummary[]>([]);
  const [selected, setSelected] = useState<V1ExamResultCardSummary>();
  const [admitCard, setAdmitCard] = useState<V1ExamStudentAdmitCardReportReply>();
  const [loadingList, setLoadingList] = useState(false);
  const [loadingCard, setLoadingCard] = useState(false);

  const loadCard = useCallback(
    async (row?: V1ExamResultCardSummary) => {
      if (!row?.studentId || !row?.examId) {
        setSelected(undefined);
        setAdmitCard(undefined);
        return;
      }
      setSelected(row);
      setLoadingCard(true);
      try {
        const resp = await examStudentService.examStudentServiceGetMyPublishedExamAdmitCard({
          studentId: row.studentId,
          examId: row.examId,
        });
        setAdmitCard(resp.data);
      } catch (error) {
        message.error(
          intl.formatMessage({
            id: 'school.student.myAdmitCards.loadFailed',
            defaultMessage: 'Failed to load admit card.',
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
      const resp = await examStudentService.examStudentServiceListMyPublishedExamAdmitCards({
        query: { pageSize: 100 },
      });
      const nextItems = resp.data.items || [];
      setItems(nextItems);
      await loadCard(nextItems[0]);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.student.myAdmitCards.listFailed',
          defaultMessage: 'Failed to load published admit cards.',
        }),
      );
    } finally {
      setLoadingList(false);
    }
  }, [intl, loadCard]);

  const downloadAdmitCardPDF = useCallback(async () => {
    if (!selected?.studentId || !selected?.examId) {
      return;
    }
    setLoadingCard(true);
    try {
      const resp = await examStudentService.examStudentServiceDownloadMyPublishedExamAdmitCardPdf({
        studentId: selected.studentId,
        examId: selected.examId,
      });
      downloadBlob(resp.data, `${selected.examName || 'exam'}-admit-card.pdf`);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.student.myAdmitCards.downloadFailed',
          defaultMessage: 'Failed to download admit card PDF.',
        }),
      );
    } finally {
      setLoadingCard(false);
    }
  }, [intl, selected]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const item = admitCard?.item;
  const template = admitCard?.template;

  const visible = (key: keyof V1ExamAdmitCardTemplate, fallback = true) =>
    Boolean(template?.[key] ?? fallback);

  const leftLogoUrl = assetUrl(template?.leftLogo);
  const rightLogoUrl = assetUrl(template?.rightLogo);
  const signUrl = assetUrl(template?.sign);
  const backgroundImageUrl = assetUrl(template?.backgroundImage);

  const cardColumns = [
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

  const subjectColumns = useMemo(
    () => [
      {
        title: (
          <FormattedMessage id="school.report.examAdmitCard.subject" defaultMessage="Subject" />
        ),
        dataIndex: 'subjectName',
        render: (_: unknown, subject: V1ExamRankReportSubject) =>
          [subject.subjectName || subject.subjectId, subject.subjectCode]
            .filter(Boolean)
            .join(' - '),
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
    ],
    [],
  );

  return (
    <PageContainer>
      <style>
        {`@media print {
          body * { visibility: hidden; }
          .my-admit-card-print, .my-admit-card-print * { visibility: visible; }
          .my-admit-card-print { position: absolute; left: 0; top: 0; width: 100%; }
          .my-admit-card-controls, .ant-pro-page-container-children-content > .ant-space > .ant-table-wrapper { display: none !important; }
        }`}
      </style>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space className="my-admit-card-controls" wrap>
          <Button icon={<ReloadOutlined />} loading={loadingList} onClick={loadList}>
            <FormattedMessage id="pages.searchTable.refresh" defaultMessage="Refresh" />
          </Button>
          <Button icon={<PrinterOutlined />} disabled={!admitCard} onClick={() => window.print()}>
            <FormattedMessage id="school.report.examAdmitCard.print" defaultMessage="Print" />
          </Button>
          <Button
            icon={<DownloadOutlined />}
            disabled={!admitCard}
            loading={loadingCard}
            onClick={downloadAdmitCardPDF}
          >
            <FormattedMessage
              id="school.report.examAdmitCard.downloadPdf"
              defaultMessage="Download PDF"
            />
          </Button>
        </Space>

        <Table<V1ExamResultCardSummary>
          rowKey={(row) => row.examStudentId || `${row.studentId}-${row.examId}`}
          columns={cardColumns}
          dataSource={items}
          loading={loadingList}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          rowClassName={(row) =>
            row.examStudentId === selected?.examStudentId ? 'ant-table-row-selected' : ''
          }
          onRow={(row) => ({ onClick: () => loadCard(row) })}
        />

        <Spin spinning={loadingCard}>
          {admitCard ? (
            <div
              className="my-admit-card-print"
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
                      {template?.schoolName || admitCard.examName}
                    </Typography.Title>
                    {template?.heading ? (
                      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
                        {template.heading}
                      </Typography.Title>
                    ) : null}
                    <Typography.Text strong>
                      {template?.title || template?.examName || admitCard.examName || (
                        <FormattedMessage
                          id="school.student.myAdmitCards.admitCard"
                          defaultMessage="Admit Card"
                        />
                      )}
                    </Typography.Text>
                    {template?.examCenter ? (
                      <>
                        <br />
                        <Typography.Text>{template.examCenter}</Typography.Text>
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
                      {admitCard.classSectionId || '-'}
                    </Typography.Text>
                  ) : null}
                </Space>

                <Table<V1ExamRankReportSubject>
                  rowKey={(row) => row.examSubjectId || row.subjectId || ''}
                  columns={subjectColumns}
                  dataSource={admitCard.subjects || []}
                  pagination={false}
                  size="small"
                />

                {template?.contentFooter ? (
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    {template.contentFooter}
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
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={intl.formatMessage({
                id: 'school.student.myAdmitCards.empty',
                defaultMessage: 'No published admit cards are available.',
              })}
            />
          )}
        </Spin>
      </Space>
    </PageContainer>
  );
};

export default MyAdmitCards;
