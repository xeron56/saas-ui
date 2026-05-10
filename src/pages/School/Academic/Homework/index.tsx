import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileDoneOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import {
  DrawerForm,
  PageContainer,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, history, useIntl } from '@umijs/max';
import { Button, message, Popconfirm, Space } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { uploadApi } from '@/utils/upload';
import type {
  HomeworkServiceUpdateHomeworkRequest,
  V1AcademicSession,
  V1ClassSection,
  V1CreateHomeworkRequest,
  V1Homework,
  V1HomeworkFilter,
  V1ListHomeworkRequest,
  V1Staff,
  V1Subject,
  V1SubjectGroup,
} from '@gosaas/api';
import {
  AcademicSessionServiceApi,
  ClassSectionServiceApi,
  HomeworkServiceApi,
  StaffServiceApi,
  SubjectGroupServiceApi,
  SubjectServiceApi,
} from '@gosaas/api';
import { dateUtil, requestTransform } from '@gosaas/core';

const homeworkService = new HomeworkServiceApi();
const sessionService = new AcademicSessionServiceApi();
const classSectionService = new ClassSectionServiceApi();
const subjectGroupService = new SubjectGroupServiceApi();
const subjectService = new SubjectServiceApi();
const staffService = new StaffServiceApi();

type HomeworkFormValues = V1CreateHomeworkRequest &
  V1Homework & {
    fileUpload?: UploadFile[];
  };

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const normalizeDate = (value?: string | null) => (value ? dateUtil(value).toISOString() : null);

const getUploadFile = (files?: UploadFile[]) => {
  const item = files?.[0];
  return item?.originFileObj as File | undefined;
};

const subjectLabel = (subject?: V1Subject, fallback?: string) =>
  subject
    ? [subject.code, subject.name].filter(Boolean).join(' - ') || subject.id
    : fallback || '-';

const staffLabel = (staff?: V1Staff, fallback?: string) =>
  staff
    ? [staff.employeeId, staff.firstName, staff.lastName].filter(Boolean).join(' ') || staff.id
    : fallback || '-';

const Homework: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<V1Homework | undefined>();
  const [sessions, setSessions] = useState<Record<string, V1AcademicSession>>({});
  const [classSections, setClassSections] = useState<Record<string, V1ClassSection>>({});
  const [subjectGroups, setSubjectGroups] = useState<Record<string, V1SubjectGroup>>({});
  const [subjects, setSubjects] = useState<Record<string, V1Subject>>({});
  const [staff, setStaff] = useState<Record<string, V1Staff>>({});
  const intl = useIntl();

  useEffect(() => {
    Promise.all([
      sessionService.academicSessionServiceListAcademicSession2({
        body: { pageSize: 100, sort: ['code'] },
      }),
      classSectionService.classSectionServiceListClassSection2({
        body: { pageSize: 300, sort: ['code'] },
      }),
      subjectGroupService.subjectGroupServiceListSubjectGroup2({
        body: { pageSize: 300, sort: ['name'] },
      }),
      subjectService.subjectServiceListSubject2({ body: { pageSize: 300, sort: ['name'] } }),
      staffService.staffServiceListStaff2({
        body: {
          pageSize: 300,
          sort: ['roleName', 'employeeId'],
          filter: { isActive: { $eq: true } },
        },
      }),
    ]).then(([sessionResp, classSectionResp, subjectGroupResp, subjectResp, staffResp]) => {
      setSessions(keyedById(sessionResp.data.items));
      setClassSections(keyedById(classSectionResp.data.items));
      setSubjectGroups(keyedById(subjectGroupResp.data.items));
      setSubjects(keyedById(subjectResp.data.items));
      setStaff(keyedById(staffResp.data.items));
    });
  }, []);

  const sessionOptions = useMemo(
    () =>
      Object.values(sessions).map((item) => ({
        label: item.code || item.name || item.id,
        value: item.id,
      })),
    [sessions],
  );
  const classSectionOptions = useMemo(
    () =>
      Object.values(classSections).map((item) => ({
        label: item.code || item.id,
        value: item.id,
      })),
    [classSections],
  );
  const subjectGroupOptions = useMemo(
    () =>
      Object.values(subjectGroups).map((item) => ({
        label: item.name || item.id,
        value: item.id,
      })),
    [subjectGroups],
  );
  const subjectOptions = useMemo(
    () =>
      Object.values(subjects).map((item) => ({
        label: subjectLabel(item),
        value: item.id,
      })),
    [subjects],
  );
  const staffOptions = useMemo(
    () =>
      Object.values(staff).map((item) => ({
        label: staffLabel(item),
        value: item.id,
      })),
    [staff],
  );

  const handleSave = async (fields: HomeworkFormValues) => {
    const file = getUploadFile(fields.fileUpload);
    const body = {
      academicSessionId: fields.academicSessionId!,
      classSectionId: fields.classSectionId!,
      subjectGroupId: fields.subjectGroupId!,
      subjectId: fields.subjectId!,
      staffId: fields.staffId!,
      title: fields.title!,
      description: fields.description,
      homeworkDate: normalizeDate(fields.homeworkDate),
      submitDate: normalizeDate(fields.submitDate),
      maxMarks: Number(fields.maxMarks || 0),
      visibleToStudent: Boolean(fields.visibleToStudent),
    };
    const hide = message.loading(
      intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
    );
    try {
      let homeworkID = currentRow?.id;
      if (currentRow) {
        const updateBody: HomeworkServiceUpdateHomeworkRequest = {
          homework: {
            id: currentRow.id!,
            ...body,
          },
        };
        await homeworkService.homeworkServiceUpdateHomework2({
          homeworkId: currentRow.id!,
          body: updateBody,
        });
      } else {
        const resp = await homeworkService.homeworkServiceCreateHomework({ body });
        homeworkID = resp.data.id;
      }
      if (file && homeworkID) {
        await uploadApi(`/v1/school/homework/${homeworkID}/upload`, { file });
      }
      hide();
      message.success(intl.formatMessage({ id: 'common.saved', defaultMessage: 'Saved' }));
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleRemove = async (record: V1Homework) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await homeworkService.homeworkServiceDeleteHomework({ id: record.id! });
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

  const handleDownload = async (record: V1Homework) => {
    try {
      const resp = await homeworkService.homeworkServiceDownloadHomeworkAttachment({
        id: record.id!,
      });
      const url = window.URL.createObjectURL(resp.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.file?.name || record.title || 'homework';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.academic.homework.downloadFailed',
          defaultMessage: 'Download Failed',
        }),
      );
    }
  };

  const columns: ProColumnType<V1Homework>[] = [
    {
      title: <FormattedMessage id="school.academic.homework.title" defaultMessage="Title" />,
      dataIndex: 'title',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.homework.academicSession"
          defaultMessage="Academic Session"
        />
      ),
      dataIndex: 'academicSessionId',
      render: (_, record) =>
        sessions[record.academicSessionId || '']?.code || record.academicSessionId || '-',
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.homework.classSection"
          defaultMessage="Class Section"
        />
      ),
      dataIndex: 'classSectionId',
      render: (_, record) =>
        classSections[record.classSectionId || '']?.code || record.classSectionId || '-',
    },
    {
      title: <FormattedMessage id="school.academic.homework.subject" defaultMessage="Subject" />,
      dataIndex: 'subjectId',
      render: (_, record) => subjectLabel(subjects[record.subjectId || ''], record.subjectId),
    },
    {
      title: <FormattedMessage id="school.academic.homework.staff" defaultMessage="Staff" />,
      dataIndex: 'staffId',
      render: (_, record) => staffLabel(staff[record.staffId || ''], record.staffId),
    },
    {
      title: (
        <FormattedMessage id="school.academic.homework.homeworkDate" defaultMessage="Assigned" />
      ),
      dataIndex: 'homeworkDate',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="school.academic.homework.submitDate" defaultMessage="Due" />,
      dataIndex: 'submitDate',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="school.academic.homework.maxMarks" defaultMessage="Marks" />,
      dataIndex: 'maxMarks',
      valueType: 'digit',
      search: false,
    },
    {
      title: (
        <FormattedMessage id="school.academic.homework.attachment" defaultMessage="Attachment" />
      ),
      dataIndex: ['file', 'name'],
      ellipsis: true,
      search: false,
      render: (_, record) => record.file?.name || '-',
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      key: 'option',
      valueType: 'option',
      width: 220,
      render: (_, record) => (
        <Space size="small" wrap>
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
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            disabled={!record.file?.id}
            onClick={() => handleDownload(record)}
          >
            <FormattedMessage id="school.academic.homework.download" defaultMessage="Download" />
          </Button>
          <Button
            type="link"
            size="small"
            icon={<FileDoneOutlined />}
            onClick={() => history.push(`/school/academic/homework/${record.id}/submissions`)}
          >
            <FormattedMessage
              id="school.academic.homework.submissions"
              defaultMessage="Submissions"
            />
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

  const getData = requestTransform<V1Homework, V1HomeworkFilter>(
    async (req: V1ListHomeworkRequest) => {
      const resp = await homeworkService.homeworkServiceListHomework2({ body: req });
      return resp.data;
    },
  );

  return (
    <PageContainer>
      <ProTable<V1Homework>
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
            <PlusOutlined />{' '}
            <FormattedMessage id="school.academic.homework.create" defaultMessage="New Homework" />
          </Button>,
        ]}
        type="table"
        request={getData}
        columns={columns}
      />
      <DrawerForm<HomeworkFormValues>
        title={intl.formatMessage({
          id: currentRow ? 'school.academic.homework.edit' : 'school.academic.homework.create',
          defaultMessage: currentRow ? 'Edit Homework' : 'New Homework',
        })}
        open={formVisible}
        drawerProps={{
          destroyOnClose: true,
          onClose: () => {
            setCurrentRow(undefined);
            setFormVisible(false);
          },
        }}
        initialValues={currentRow || { visibleToStudent: true, maxMarks: 0 }}
        onOpenChange={setFormVisible}
        onFinish={async (values) => {
          const ok = await handleSave(values);
          if (ok) {
            setCurrentRow(undefined);
          }
          return ok;
        }}
      >
        <ProFormText
          name="title"
          label={intl.formatMessage({
            id: 'school.academic.homework.title',
            defaultMessage: 'Title',
          })}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="academicSessionId"
          label={intl.formatMessage({
            id: 'school.academic.homework.academicSession',
            defaultMessage: 'Academic Session',
          })}
          rules={[{ required: true }]}
          options={sessionOptions}
          showSearch
        />
        <ProFormSelect
          name="classSectionId"
          label={intl.formatMessage({
            id: 'school.academic.homework.classSection',
            defaultMessage: 'Class Section',
          })}
          rules={[{ required: true }]}
          options={classSectionOptions}
          showSearch
        />
        <ProFormSelect
          name="subjectGroupId"
          label={intl.formatMessage({
            id: 'school.academic.homework.subjectGroup',
            defaultMessage: 'Subject Group',
          })}
          rules={[{ required: true }]}
          options={subjectGroupOptions}
          showSearch
        />
        <ProFormSelect
          name="subjectId"
          label={intl.formatMessage({
            id: 'school.academic.homework.subject',
            defaultMessage: 'Subject',
          })}
          rules={[{ required: true }]}
          options={subjectOptions}
          showSearch
        />
        <ProFormSelect
          name="staffId"
          label={intl.formatMessage({
            id: 'school.academic.homework.staff',
            defaultMessage: 'Staff',
          })}
          rules={[{ required: true }]}
          options={staffOptions}
          showSearch
        />
        <ProFormDatePicker
          name="homeworkDate"
          label={intl.formatMessage({
            id: 'school.academic.homework.homeworkDate',
            defaultMessage: 'Assigned Date',
          })}
          rules={[{ required: true }]}
        />
        <ProFormDatePicker
          name="submitDate"
          label={intl.formatMessage({
            id: 'school.academic.homework.submitDate',
            defaultMessage: 'Due Date',
          })}
          rules={[{ required: true }]}
        />
        <ProFormDigit
          name="maxMarks"
          label={intl.formatMessage({
            id: 'school.academic.homework.maxMarks',
            defaultMessage: 'Max Marks',
          })}
          min={0}
          fieldProps={{ precision: 2 }}
        />
        <ProFormSwitch
          name="visibleToStudent"
          label={intl.formatMessage({
            id: 'school.academic.homework.visibleToStudent',
            defaultMessage: 'Visible To Student',
          })}
        />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({
            id: 'school.academic.homework.description',
            defaultMessage: 'Description',
          })}
          fieldProps={{ rows: 4, maxLength: 1000, showCount: true }}
        />
        <ProFormUploadButton
          name="fileUpload"
          label={intl.formatMessage({
            id: 'school.academic.homework.attachment',
            defaultMessage: 'Attachment',
          })}
          max={1}
          icon={<UploadOutlined />}
          fieldProps={{
            beforeUpload: () => false,
          }}
        />
      </DrawerForm>
    </PageContainer>
  );
};

export default Homework;
