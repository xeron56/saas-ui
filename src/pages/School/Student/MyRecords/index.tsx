import { DownloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Space, Tabs, message } from 'antd';
import React, { useRef } from 'react';
import type { V1StudentDocument, V1StudentTimeline } from '@gosaas/api';
import { StudentDocumentServiceApi, StudentTimelineServiceApi } from '@gosaas/api';
import { dateUtil } from '@gosaas/core';

const documentService = new StudentDocumentServiceApi();
const timelineService = new StudentTimelineServiceApi();

const formatSize = (size?: number) => {
  if (!size) {
    return '-';
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
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

const MyRecords: React.FC = () => {
  const intl = useIntl();
  const documentActionRef = useRef<ActionType>();
  const timelineActionRef = useRef<ActionType>();

  const handleDocumentDownload = async (record: V1StudentDocument) => {
    try {
      const resp = await documentService.studentDocumentServiceDownloadMyStudentDocument({
        id: record.id!,
      });
      downloadBlob(resp.data, record.file?.name || record.title || 'document');
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.student.document.downloadFailed',
          defaultMessage: 'Download Failed',
        }),
      );
    }
  };

  const handleTimelineDownload = async (record: V1StudentTimeline) => {
    try {
      const resp = await timelineService.studentTimelineServiceDownloadMyStudentTimeline({
        id: record.id!,
      });
      downloadBlob(resp.data, record.file?.name || record.title || 'timeline');
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.student.timeline.downloadFailed',
          defaultMessage: 'Download Failed',
        }),
      );
    }
  };

  const documentColumns: ProColumnType<V1StudentDocument>[] = [
    {
      title: <FormattedMessage id="school.student.document.title" defaultMessage="Title" />,
      dataIndex: 'title',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.student.document.fileName" defaultMessage="File Name" />,
      dataIndex: ['file', 'name'],
      valueType: 'text',
      ellipsis: true,
      render: (_, record) => record.file?.name || '-',
    },
    {
      title: <FormattedMessage id="school.student.document.size" defaultMessage="Size" />,
      dataIndex: ['file', 'size'],
      valueType: 'text',
      render: (_, record) => formatSize(record.file?.size),
    },
    {
      title: <FormattedMessage id="common.createdAt" defaultMessage="CreatedAt" />,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      render: (_, record) =>
        record.createdAt ? dateUtil(record.createdAt).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      key: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            disabled={!record.id || !record.file?.id}
            onClick={() => handleDocumentDownload(record)}
          >
            <FormattedMessage id="school.student.document.download" defaultMessage="Download" />
          </Button>
        </Space>
      ),
    },
  ];

  const timelineColumns: ProColumnType<V1StudentTimeline>[] = [
    {
      title: <FormattedMessage id="school.student.timeline.title" defaultMessage="Title" />,
      dataIndex: 'title',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.student.timeline.date" defaultMessage="Date" />,
      dataIndex: 'timelineDate',
      valueType: 'date',
      render: (_, record) =>
        record.timelineDate ? dateUtil(record.timelineDate).format('YYYY-MM-DD') : '-',
    },
    {
      title: (
        <FormattedMessage id="school.student.timeline.description" defaultMessage="Description" />
      ),
      dataIndex: 'description',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: <FormattedMessage id="school.student.timeline.fileName" defaultMessage="File Name" />,
      dataIndex: ['file', 'name'],
      valueType: 'text',
      ellipsis: true,
      render: (_, record) => record.file?.name || '-',
    },
    {
      title: <FormattedMessage id="school.student.timeline.size" defaultMessage="Size" />,
      dataIndex: ['file', 'size'],
      valueType: 'text',
      render: (_, record) => formatSize(record.file?.size),
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      key: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            disabled={!record.id || !record.file?.id}
            onClick={() => handleTimelineDownload(record)}
          >
            <FormattedMessage id="school.student.timeline.download" defaultMessage="Download" />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <Tabs
        items={[
          {
            key: 'documents',
            label: (
              <FormattedMessage id="school.student.documents" defaultMessage="Student Documents" />
            ),
            children: (
              <ProTable<V1StudentDocument>
                actionRef={documentActionRef}
                rowKey="id"
                search={false}
                pagination={{ defaultPageSize: 10 }}
                columns={documentColumns}
                request={async (params) => {
                  const resp = await documentService.studentDocumentServiceListMyStudentDocument({
                    query: {
                      pageOffset: ((params.current || 1) - 1) * (params.pageSize || 10),
                      pageSize: params.pageSize,
                    },
                  });
                  return {
                    data: resp.data.items || [],
                    total: resp.data.filterSize || resp.data.totalSize || 0,
                    success: true,
                  };
                }}
              />
            ),
          },
          {
            key: 'timelines',
            label: (
              <FormattedMessage id="school.student.timelines" defaultMessage="Student Timelines" />
            ),
            children: (
              <ProTable<V1StudentTimeline>
                actionRef={timelineActionRef}
                rowKey="id"
                search={false}
                pagination={{ defaultPageSize: 10 }}
                columns={timelineColumns}
                request={async (params) => {
                  const resp = await timelineService.studentTimelineServiceListMyStudentTimeline({
                    query: {
                      pageOffset: ((params.current || 1) - 1) * (params.pageSize || 10),
                      pageSize: params.pageSize,
                    },
                  });
                  return {
                    data: resp.data.items || [],
                    total: resp.data.filterSize || resp.data.totalSize || 0,
                    success: true,
                  };
                }}
              />
            ),
          },
        ]}
      />
    </PageContainer>
  );
};

export default MyRecords;
