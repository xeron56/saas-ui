import { DeleteOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProFormUploadButton,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, message, Popconfirm, Space } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useEffect, useRef, useState } from 'react';
import { uploadApi } from '@/utils/upload';
import type {
  V1Student,
  V1StudentDocument,
  V1StudentDocumentFilter,
  V1ListStudentDocumentRequest,
} from '@gosaas/api';
import { StudentDocumentServiceApi, StudentServiceApi } from '@gosaas/api';
import { requestTransform } from '@gosaas/core';

const documentService = new StudentDocumentServiceApi();
const studentService = new StudentServiceApi();

type UploadFormValues = {
  studentId: string;
  title: string;
  file?: UploadFile[];
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

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);
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

  const handleUpload = async (fields: UploadFormValues) => {
    const file = getUploadFile(fields.file);
    if (!file) {
      message.error(
        intl.formatMessage({ id: 'school.student.document.file', defaultMessage: 'File' }),
      );
      return false;
    }
    const hide = message.loading(
      intl.formatMessage({
        id: 'school.student.document.uploading',
        defaultMessage: 'Uploading...',
      }),
    );
    try {
      await uploadApi('/v1/school/student/document/upload', {
        file,
        data: {
          student_id: fields.studentId,
          title: fields.title,
        },
      });
      hide();
      message.success(
        intl.formatMessage({
          id: 'school.student.document.uploaded',
          defaultMessage: 'Document Uploaded',
        }),
      );
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleRemove = async (record: V1StudentDocument) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await documentService.studentDocumentServiceDeleteStudentDocument({ id: record.id! });
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

  const handleDownload = async (record: V1StudentDocument) => {
    try {
      const resp = await documentService.studentDocumentServiceDownloadStudentDocument({
        id: record.id!,
      });
      const url = window.URL.createObjectURL(resp.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.file?.name || record.title || 'document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.student.document.downloadFailed',
          defaultMessage: 'Download Failed',
        }),
      );
    }
  };

  const columns: ProColumnType<V1StudentDocument>[] = [
    {
      title: <FormattedMessage id="school.student.document.title" defaultMessage="Title" />,
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
      title: <FormattedMessage id="school.student.document.fileName" defaultMessage="File Name" />,
      dataIndex: ['file', 'name'],
      valueType: 'text',
      ellipsis: true,
      search: false,
    },
    {
      title: <FormattedMessage id="school.student.document.size" defaultMessage="Size" />,
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
        <Space size="middle">
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            <FormattedMessage id="school.student.document.download" defaultMessage="Download" />
          </Button>
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

  const getData = requestTransform<V1StudentDocument, V1StudentDocumentFilter>(
    async (req: V1ListStudentDocumentRequest) => {
      const resp = await documentService.studentDocumentServiceListStudentDocument2({ body: req });
      return resp.data;
    },
  );

  return (
    <PageContainer>
      <ProTable<V1StudentDocument>
        actionRef={actionRef}
        rowKey="id"
        pagination={{ defaultPageSize: 10 }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => setUploadModalVisible(true)}>
            <PlusOutlined />{' '}
            <FormattedMessage
              id="school.student.document.upload"
              defaultMessage="Upload Document"
            />
          </Button>,
        ]}
        type="table"
        request={getData}
        columns={columns}
      />
      <ModalForm<UploadFormValues>
        title={intl.formatMessage({
          id: 'school.student.document.upload',
          defaultMessage: 'Upload Document',
        })}
        open={uploadModalVisible}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setUploadModalVisible(false),
        }}
        onFinish={async (value) => {
          const success = await handleUpload(value);
          if (success) {
            setUploadModalVisible(false);
          }
          return success;
        }}
      >
        <ProFormSelect
          name="studentId"
          label={intl.formatMessage({ id: 'school.student.name', defaultMessage: 'Name' })}
          rules={[{ required: true }]}
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
            id: 'school.student.document.title',
            defaultMessage: 'Title',
          })}
          rules={[{ required: true }]}
        />
        <ProFormUploadButton
          name="file"
          label={intl.formatMessage({
            id: 'school.student.document.file',
            defaultMessage: 'File',
          })}
          max={1}
          rules={[{ required: true }]}
          fieldProps={{
            beforeUpload: () => false,
          }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default TableList;
