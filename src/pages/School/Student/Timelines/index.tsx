import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import {
  DrawerForm,
  PageContainer,
  ProFormDatePicker,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, message, Popconfirm, Space } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useEffect, useRef, useState } from 'react';
import { uploadApi } from '@/utils/upload';
import type {
  StudentTimelineServiceUpdateStudentTimelineRequest,
  V1CreateStudentTimelineRequest,
  V1ListStudentTimelineRequest,
  V1Student,
  V1StudentTimeline,
  V1StudentTimelineFilter,
} from '@gosaas/api';
import { StudentServiceApi, StudentTimelineServiceApi } from '@gosaas/api';
import { dateUtil, requestTransform } from '@gosaas/core';

const service = new StudentTimelineServiceApi();
const studentService = new StudentServiceApi();

type TimelineFormValues = V1CreateStudentTimelineRequest &
  V1StudentTimeline & {
    fileUpload?: UploadFile[];
  };

const studentLabel = (student?: V1Student) => {
  if (!student) {
    return '-';
  }
  return [student.admissionNo, [student.firstName, student.lastName].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(' - ');
};

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

const getUploadFile = (files?: UploadFile[]) => {
  const item = files?.[0];
  return item?.originFileObj as File | undefined;
};

const normalizeDate = (value?: string | null) => (value ? dateUtil(value).toISOString() : null);

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<V1StudentTimeline | undefined>();
  const [students, setStudents] = useState<Record<string, V1Student>>({});
  const intl = useIntl();

  const loadStudents = async (search?: string) => {
    const resp = await studentService.studentServiceListStudent2({
      body: { pageSize: 100, search, sort: ['admission_no'] },
    });
    return resp.data.items || [];
  };

  useEffect(() => {
    loadStudents().then((items) => {
      setStudents(
        items.reduce<Record<string, V1Student>>((ret, item) => {
          if (item.id) {
            ret[item.id] = item;
          }
          return ret;
        }, {}),
      );
    });
  }, []);

  const handleSave = async (fields: TimelineFormValues) => {
    const file = getUploadFile(fields.fileUpload);
    const timelineDate = normalizeDate(fields.timelineDate);
    const hide = message.loading(
      intl.formatMessage({
        id: 'school.student.timeline.uploading',
        defaultMessage: 'Saving...',
      }),
    );
    try {
      if (file) {
        await uploadApi(
          currentRow
            ? `/v1/school/student/timeline/${currentRow.id}/upload`
            : '/v1/school/student/timeline/upload',
          {
            file,
            data: {
              student_id: fields.studentId,
              title: fields.title,
              timeline_date: timelineDate,
              description: fields.description || '',
              visible_to_student: fields.visibleToStudent ? 'true' : 'false',
            },
          },
        );
      } else if (currentRow) {
        const body: StudentTimelineServiceUpdateStudentTimelineRequest = {
          timeline: {
            id: currentRow.id!,
            title: fields.title,
            timelineDate,
            description: fields.description,
            visibleToStudent: fields.visibleToStudent,
          },
        };
        await service.studentTimelineServiceUpdateStudentTimeline2({
          timelineId: currentRow.id!,
          body,
        });
      } else {
        await service.studentTimelineServiceCreateStudentTimeline({
          body: {
            studentId: fields.studentId,
            title: fields.title,
            timelineDate,
            description: fields.description,
            visibleToStudent: fields.visibleToStudent,
          },
        });
      }
      hide();
      message.success(
        intl.formatMessage({
          id: 'school.student.timeline.uploaded',
          defaultMessage: 'Timeline Saved',
        }),
      );
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleRemove = async (record: V1StudentTimeline) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await service.studentTimelineServiceDeleteStudentTimeline({ id: record.id! });
      hide();
      message.success(
        intl.formatMessage({ id: 'common.deleted', defaultMessage: 'Delete Successfully' }),
      );
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleDownload = async (record: V1StudentTimeline) => {
    try {
      const resp = await service.studentTimelineServiceDownloadStudentTimeline({ id: record.id! });
      const url = window.URL.createObjectURL(resp.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.file?.name || record.title || 'timeline';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.student.timeline.downloadFailed',
          defaultMessage: 'Download Failed',
        }),
      );
    }
  };

  const columns: ProColumnType<V1StudentTimeline>[] = [
    {
      title: <FormattedMessage id="school.student.timeline.title" defaultMessage="Title" />,
      dataIndex: 'title',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.student.name" defaultMessage="Name" />,
      dataIndex: 'studentId',
      valueType: 'text',
      ellipsis: true,
      render: (_, entity) => studentLabel(students[entity.studentId || '']) || entity.studentId,
    },
    {
      title: <FormattedMessage id="school.student.timeline.date" defaultMessage="Date" />,
      dataIndex: 'timelineDate',
      valueType: 'date',
    },
    {
      title: (
        <FormattedMessage
          id="school.student.timeline.visibleToStudent"
          defaultMessage="Visible To Student"
        />
      ),
      dataIndex: 'visibleToStudent',
      valueType: 'switch',
      search: false,
    },
    {
      title: <FormattedMessage id="school.student.timeline.fileName" defaultMessage="File Name" />,
      dataIndex: ['file', 'name'],
      valueType: 'text',
      ellipsis: true,
      search: false,
      render: (_, entity) => entity.file?.name || '-',
    },
    {
      title: <FormattedMessage id="school.student.timeline.size" defaultMessage="Size" />,
      dataIndex: ['file', 'size'],
      valueType: 'text',
      search: false,
      render: (_, entity) => formatSize(entity.file?.size),
    },
    {
      title: <FormattedMessage id="common.createdAt" defaultMessage="CreatedAt" />,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      key: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentRow(record);
              setFormVisible(true);
            }}
          >
            <FormattedMessage id="common.edit" defaultMessage="Edit" />
          </Button>
          {record.file?.id && (
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            >
              <FormattedMessage id="school.student.timeline.download" defaultMessage="Download" />
            </Button>
          )}
          <Popconfirm
            title={intl.formatMessage({ id: 'common.delete', defaultMessage: 'Delete' })}
            onConfirm={() => handleRemove(record)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              <FormattedMessage id="common.delete" defaultMessage="Delete" />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const getData = requestTransform<V1StudentTimeline, V1StudentTimelineFilter>(
    async (req: V1ListStudentTimelineRequest) => {
      const resp = await service.studentTimelineServiceListStudentTimeline2({ body: req });
      return resp.data;
    },
  );

  return (
    <PageContainer>
      <ProTable<V1StudentTimeline>
        actionRef={actionRef}
        rowKey="id"
        pagination={{ defaultPageSize: 10 }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRow(undefined);
              setFormVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        type="table"
        request={getData}
        columns={columns}
      />
      <DrawerForm<TimelineFormValues>
        title={intl.formatMessage({
          id: 'school.student.timeline',
          defaultMessage: 'Student Timeline',
        })}
        open={formVisible}
        initialValues={{
          ...currentRow,
          visibleToStudent: currentRow?.visibleToStudent ?? false,
        }}
        drawerProps={{
          destroyOnClose: true,
          onClose: () => {
            setFormVisible(false);
            setCurrentRow(undefined);
          },
        }}
        onFinish={async (value) => {
          const success = await handleSave(value);
          if (success) {
            setFormVisible(false);
            setCurrentRow(undefined);
          }
          return success;
        }}
      >
        <ProFormSelect
          name="studentId"
          label={intl.formatMessage({ id: 'school.student.name', defaultMessage: 'Name' })}
          rules={[{ required: true }]}
          disabled={!!currentRow}
          showSearch
          request={async ({ keyWords }) => {
            const items = await loadStudents(keyWords);
            return items.map((item) => ({
              label: studentLabel(item),
              value: item.id,
            }));
          }}
        />
        <ProFormText
          name="title"
          label={intl.formatMessage({
            id: 'school.student.timeline.title',
            defaultMessage: 'Title',
          })}
          rules={[{ required: true }]}
        />
        <ProFormDatePicker
          name="timelineDate"
          label={intl.formatMessage({
            id: 'school.student.timeline.date',
            defaultMessage: 'Date',
          })}
          rules={[{ required: true }]}
        />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({
            id: 'school.student.timeline.description',
            defaultMessage: 'Description',
          })}
        />
        <ProFormSwitch
          name="visibleToStudent"
          label={intl.formatMessage({
            id: 'school.student.timeline.visibleToStudent',
            defaultMessage: 'Visible To Student',
          })}
        />
        <ProFormUploadButton
          name="fileUpload"
          label={intl.formatMessage({
            id: 'school.student.timeline.file',
            defaultMessage: 'Attachment',
          })}
          max={1}
          fieldProps={{
            beforeUpload: () => false,
          }}
        />
      </DrawerForm>
    </PageContainer>
  );
};

export default TableList;
