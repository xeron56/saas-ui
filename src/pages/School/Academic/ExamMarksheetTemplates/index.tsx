import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, message, Space, Tag } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useState } from 'react';
import type { V1CreateExamMarksheetTemplateRequest, V1ExamMarksheetTemplate } from '@gosaas/api';
import { ExamMarksheetTemplateServiceApi } from '@gosaas/api';
import { uploadApi } from '@/utils/upload';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new ExamMarksheetTemplateServiceApi();

const visibilityDefaults = {
  showExamSession: true,
  showName: true,
  showFatherName: true,
  showMotherName: true,
  showDob: true,
  showAdmissionNo: true,
  showRollNo: true,
  showPhoto: true,
  showDivision: true,
  showRank: false,
  showCustomField: true,
  showClass: false,
  showTeacherRemark: true,
  showSection: false,
};

const legacyAssetFields = [
  'headerImage',
  'leftLogo',
  'rightLogo',
  'leftSign',
  'middleSign',
  'rightSign',
  'backgroundImage',
] as const;

type AssetFormValues = {
  headerImageUpload?: UploadFile[];
  leftLogoUpload?: UploadFile[];
  rightLogoUpload?: UploadFile[];
  leftSignUpload?: UploadFile[];
  middleSignUpload?: UploadFile[];
  rightSignUpload?: UploadFile[];
  backgroundImageUpload?: UploadFile[];
};

const assetFields = [
  {
    key: 'header-image',
    formName: 'headerImageUpload',
    valueKey: 'headerImageFile',
    locale: 'school.academic.examMarksheetTemplate.headerImage',
    defaultMessage: 'Header Image',
  },
  {
    key: 'left-logo',
    formName: 'leftLogoUpload',
    valueKey: 'leftLogoFile',
    locale: 'school.academic.examMarksheetTemplate.leftLogo',
    defaultMessage: 'Left Logo',
  },
  {
    key: 'right-logo',
    formName: 'rightLogoUpload',
    valueKey: 'rightLogoFile',
    locale: 'school.academic.examMarksheetTemplate.rightLogo',
    defaultMessage: 'Right Logo',
  },
  {
    key: 'left-sign',
    formName: 'leftSignUpload',
    valueKey: 'leftSignFile',
    locale: 'school.academic.examMarksheetTemplate.leftSign',
    defaultMessage: 'Left Signature',
  },
  {
    key: 'middle-sign',
    formName: 'middleSignUpload',
    valueKey: 'middleSignFile',
    locale: 'school.academic.examMarksheetTemplate.middleSign',
    defaultMessage: 'Middle Signature',
  },
  {
    key: 'right-sign',
    formName: 'rightSignUpload',
    valueKey: 'rightSignFile',
    locale: 'school.academic.examMarksheetTemplate.rightSign',
    defaultMessage: 'Right Signature',
  },
  {
    key: 'background-image',
    formName: 'backgroundImageUpload',
    valueKey: 'backgroundImageFile',
    locale: 'school.academic.examMarksheetTemplate.backgroundImage',
    defaultMessage: 'Background Image',
  },
] as const;

const getUploadFile = (files?: UploadFile[]) => {
  const item = files?.[0];
  return item?.originFileObj as File | undefined;
};

const payload = (
  fields: any,
  current?: V1ExamMarksheetTemplate,
): V1CreateExamMarksheetTemplateRequest => {
  const data: V1CreateExamMarksheetTemplateRequest = {
    ...visibilityDefaults,
    template: fields.template,
    heading: fields.heading,
    title: fields.title,
    examName: fields.examName,
    schoolName: fields.schoolName,
    examCenter: fields.examCenter,
    date: fields.date,
    content: fields.content,
    contentFooter: fields.contentFooter,
    showExamSession:
      fields.showExamSession ?? current?.showExamSession ?? visibilityDefaults.showExamSession,
    showName: fields.showName ?? current?.showName ?? visibilityDefaults.showName,
    showFatherName:
      fields.showFatherName ?? current?.showFatherName ?? visibilityDefaults.showFatherName,
    showMotherName:
      fields.showMotherName ?? current?.showMotherName ?? visibilityDefaults.showMotherName,
    showDob: fields.showDob ?? current?.showDob ?? visibilityDefaults.showDob,
    showAdmissionNo:
      fields.showAdmissionNo ?? current?.showAdmissionNo ?? visibilityDefaults.showAdmissionNo,
    showRollNo: fields.showRollNo ?? current?.showRollNo ?? visibilityDefaults.showRollNo,
    showPhoto: fields.showPhoto ?? current?.showPhoto ?? visibilityDefaults.showPhoto,
    showDivision: fields.showDivision ?? current?.showDivision ?? visibilityDefaults.showDivision,
    showRank: fields.showRank ?? current?.showRank ?? visibilityDefaults.showRank,
    showCustomField:
      fields.showCustomField ?? current?.showCustomField ?? visibilityDefaults.showCustomField,
    showClass: fields.showClass ?? current?.showClass ?? visibilityDefaults.showClass,
    showTeacherRemark:
      fields.showTeacherRemark ??
      current?.showTeacherRemark ??
      visibilityDefaults.showTeacherRemark,
    showSection: fields.showSection ?? current?.showSection ?? visibilityDefaults.showSection,
  };

  legacyAssetFields.forEach((name) => {
    data[name] = current?.[name];
  });

  return data;
};

const visibilityFields = [
  ['showExamSession', 'school.academic.examMarksheetTemplate.showExamSession', 'Exam Session'],
  ['showName', 'school.academic.examMarksheetTemplate.showName', 'Name'],
  ['showFatherName', 'school.academic.examMarksheetTemplate.showFatherName', 'Father Name'],
  ['showMotherName', 'school.academic.examMarksheetTemplate.showMotherName', 'Mother Name'],
  ['showDob', 'school.academic.examMarksheetTemplate.showDob', 'Date of Birth'],
  ['showAdmissionNo', 'school.academic.examMarksheetTemplate.showAdmissionNo', 'Admission No.'],
  ['showRollNo', 'school.academic.examMarksheetTemplate.showRollNo', 'Roll No.'],
  ['showPhoto', 'school.academic.examMarksheetTemplate.showPhoto', 'Photo'],
  ['showDivision', 'school.academic.examMarksheetTemplate.showDivision', 'Division'],
  ['showRank', 'school.academic.examMarksheetTemplate.showRank', 'Rank'],
  ['showClass', 'school.academic.examMarksheetTemplate.showClass', 'Class'],
  [
    'showTeacherRemark',
    'school.academic.examMarksheetTemplate.showTeacherRemark',
    'Teacher Remark',
  ],
  ['showSection', 'school.academic.examMarksheetTemplate.showSection', 'Section'],
] as const;

const ExamMarksheetTemplates: React.FC = () => {
  const intl = useIntl();
  const [assetRow, setAssetRow] = useState<V1ExamMarksheetTemplate>();
  const [assetAction, setAssetAction] = useState<ActionType>();

  const columns: ProColumnType<V1ExamMarksheetTemplate>[] = [
    {
      title: (
        <FormattedMessage
          id="school.academic.examMarksheetTemplate.template"
          defaultMessage="Template"
        />
      ),
      dataIndex: 'template',
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.examMarksheetTemplate.schoolName"
          defaultMessage="School"
        />
      ),
      dataIndex: 'schoolName',
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.examMarksheetTemplate.examName"
          defaultMessage="Exam"
        />
      ),
      dataIndex: 'examName',
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.examMarksheetTemplate.showDivision"
          defaultMessage="Division"
        />
      ),
      dataIndex: 'showDivision',
      render: (_, record) =>
        record.showDivision ? (
          <Tag color="green">
            <FormattedMessage id="common.yes" defaultMessage="Yes" />
          </Tag>
        ) : (
          <Tag>
            <FormattedMessage id="common.no" defaultMessage="No" />
          </Tag>
        ),
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.examMarksheetTemplate.showRank"
          defaultMessage="Rank"
        />
      ),
      dataIndex: 'showRank',
      render: (_, record) =>
        record.showRank ? (
          <Tag color="green">
            <FormattedMessage id="common.yes" defaultMessage="Yes" />
          </Tag>
        ) : (
          <Tag>
            <FormattedMessage id="common.no" defaultMessage="No" />
          </Tag>
        ),
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.examMarksheetTemplate.assets"
          defaultMessage="Assets"
        />
      ),
      dataIndex: 'assets',
      render: (_, record) => {
        const count = assetFields.filter((item) => record[item.valueKey]?.id).length;
        return count ? (
          <Tag color="blue">{count}</Tag>
        ) : (
          <Tag>
            <FormattedMessage id="common.no" defaultMessage="No" />
          </Tag>
        );
      },
    },
  ];

  const downloadAsset = async (
    record: V1ExamMarksheetTemplate,
    asset: (typeof assetFields)[number],
  ) => {
    if (!record.id) {
      return;
    }
    const file = record[asset.valueKey];
    try {
      const resp = await service.examMarksheetTemplateServiceDownloadExamMarksheetTemplateAsset({
        id: record.id,
        asset: asset.key,
      });
      const url = window.URL.createObjectURL(resp.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = file?.name || asset.defaultMessage;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error(
        intl.formatMessage({ id: 'common.downloadFailed', defaultMessage: 'Download failed' }),
      );
    }
  };

  const uploadAssets = async (values: AssetFormValues) => {
    if (!assetRow?.id) {
      return false;
    }
    const hide = message.loading(
      intl.formatMessage({ id: 'common.uploading', defaultMessage: 'Uploading...' }),
    );
    try {
      for (const asset of assetFields) {
        const file = getUploadFile(values[asset.formName]);
        if (file) {
          await uploadApi(
            `/v1/school/exam-marksheet-template/${assetRow.id}/asset/${asset.key}/upload`,
            { file },
          );
        }
      }
      hide();
      message.success(
        intl.formatMessage({ id: 'common.uploaded', defaultMessage: 'Uploaded Successfully' }),
      );
      assetAction?.reload();
      setAssetRow(undefined);
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  return (
    <>
      <ReferencePage<V1ExamMarksheetTemplate>
        columns={columns}
        create={(fields) =>
          service.examMarksheetTemplateServiceCreateExamMarksheetTemplate({
            body: payload(fields),
          })
        }
        delete={(record) =>
          service.examMarksheetTemplateServiceDeleteExamMarksheetTemplate({ id: record.id! })
        }
        extraActions={(record, action) => [
          <a
            key="assets"
            onClick={() => {
              setAssetRow(record);
              setAssetAction(action);
            }}
          >
            <FormattedMessage
              id="school.academic.examMarksheetTemplate.assets"
              defaultMessage="Assets"
            />
          </a>,
        ]}
        formItems={
          <>
            <ProFormText
              name="template"
              label={
                <FormattedMessage
                  id="school.academic.examMarksheetTemplate.template"
                  defaultMessage="Template"
                />
              }
              rules={[{ required: true }]}
            />
            <ProFormText
              name="heading"
              label={
                <FormattedMessage
                  id="school.academic.examMarksheetTemplate.heading"
                  defaultMessage="Heading"
                />
              }
            />
            <ProFormText
              name="title"
              label={
                <FormattedMessage
                  id="school.academic.examMarksheetTemplate.title"
                  defaultMessage="Title"
                />
              }
            />
            <ProFormText
              name="examName"
              label={
                <FormattedMessage
                  id="school.academic.examMarksheetTemplate.examName"
                  defaultMessage="Exam"
                />
              }
            />
            <ProFormText
              name="schoolName"
              label={
                <FormattedMessage
                  id="school.academic.examMarksheetTemplate.schoolName"
                  defaultMessage="School"
                />
              }
            />
            <ProFormText
              name="examCenter"
              label={
                <FormattedMessage
                  id="school.academic.examMarksheetTemplate.examCenter"
                  defaultMessage="Exam Center"
                />
              }
            />
            <ProFormText
              name="date"
              label={
                <FormattedMessage
                  id="school.academic.examMarksheetTemplate.date"
                  defaultMessage="Date"
                />
              }
            />
            <ProFormTextArea
              name="content"
              label={
                <FormattedMessage
                  id="school.academic.examMarksheetTemplate.content"
                  defaultMessage="Content"
                />
              }
            />
            <ProFormTextArea
              name="contentFooter"
              label={
                <FormattedMessage
                  id="school.academic.examMarksheetTemplate.contentFooter"
                  defaultMessage="Footer"
                />
              }
            />
            {visibilityFields.map(([name, id, defaultMessage]) => (
              <ProFormSwitch
                key={name}
                name={name}
                label={<FormattedMessage id={id} defaultMessage={defaultMessage} />}
                initialValue={visibilityDefaults[name]}
              />
            ))}
          </>
        }
        get={async (id) =>
          (await service.examMarksheetTemplateServiceGetExamMarksheetTemplate({ id })).data
        }
        list={async (req) =>
          (await service.examMarksheetTemplateServiceListExamMarksheetTemplate2({ body: req })).data
        }
        title={(record) => record.template || ''}
        update={(record, fields) =>
          service.examMarksheetTemplateServiceUpdateExamMarksheetTemplate2({
            templateId: record.id!,
            body: {
              template: {
                id: record.id!,
                ...payload(fields, record),
              },
            },
          })
        }
      />
      <ModalForm<AssetFormValues>
        title={intl.formatMessage({
          id: 'school.academic.examMarksheetTemplate.uploadAssets',
          defaultMessage: 'Upload Assets',
        })}
        open={Boolean(assetRow)}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setAssetRow(undefined);
          },
        }}
        onOpenChange={(open) => {
          if (!open) {
            setAssetRow(undefined);
          }
        }}
        onFinish={uploadAssets}
      >
        {assetFields.map((asset) => {
          const existing = assetRow?.[asset.valueKey];
          return (
            <div key={asset.key}>
              <Space style={{ marginBottom: 8 }}>
                <span>
                  {intl.formatMessage({ id: asset.locale, defaultMessage: asset.defaultMessage })}
                </span>
                {existing?.id && (
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => downloadAsset(assetRow!, asset)}
                  >
                    <FormattedMessage
                      id="school.academic.examMarksheetTemplate.downloadAsset"
                      defaultMessage="Download"
                    />
                  </Button>
                )}
              </Space>
              <ProFormUploadButton
                name={asset.formName}
                max={1}
                label={intl.formatMessage({
                  id: asset.locale,
                  defaultMessage: asset.defaultMessage,
                })}
                icon={<UploadOutlined />}
                fieldProps={{
                  accept: 'image/*',
                  beforeUpload: () => false,
                }}
              />
            </div>
          );
        })}
      </ModalForm>
    </>
  );
};

export default ExamMarksheetTemplates;
