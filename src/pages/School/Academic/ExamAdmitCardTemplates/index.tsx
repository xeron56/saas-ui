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
import type { V1CreateExamAdmitCardTemplateRequest, V1ExamAdmitCardTemplate } from '@gosaas/api';
import { ExamAdmitCardTemplateServiceApi } from '@gosaas/api';
import { uploadApi } from '@/utils/upload';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new ExamAdmitCardTemplateServiceApi();

const visibilityDefaults = {
  showName: true,
  showFatherName: true,
  showMotherName: true,
  showDob: true,
  showAdmissionNo: true,
  showRollNo: true,
  showAddress: true,
  showGender: true,
  showPhoto: true,
  showClass: false,
  showSection: false,
  isActive: false,
};

const payload = (fields: any): V1CreateExamAdmitCardTemplateRequest => ({
  ...visibilityDefaults,
  template: fields.template,
  heading: fields.heading,
  title: fields.title,
  examName: fields.examName,
  schoolName: fields.schoolName,
  examCenter: fields.examCenter,
  contentFooter: fields.contentFooter,
  showName: fields.showName ?? visibilityDefaults.showName,
  showFatherName: fields.showFatherName ?? visibilityDefaults.showFatherName,
  showMotherName: fields.showMotherName ?? visibilityDefaults.showMotherName,
  showDob: fields.showDob ?? visibilityDefaults.showDob,
  showAdmissionNo: fields.showAdmissionNo ?? visibilityDefaults.showAdmissionNo,
  showRollNo: fields.showRollNo ?? visibilityDefaults.showRollNo,
  showAddress: fields.showAddress ?? visibilityDefaults.showAddress,
  showGender: fields.showGender ?? visibilityDefaults.showGender,
  showPhoto: fields.showPhoto ?? visibilityDefaults.showPhoto,
  showClass: fields.showClass ?? visibilityDefaults.showClass,
  showSection: fields.showSection ?? visibilityDefaults.showSection,
  isActive: fields.isActive ?? visibilityDefaults.isActive,
});

const visibilityFields = [
  ['showName', 'school.academic.examAdmitCardTemplate.showName', 'Name'],
  ['showFatherName', 'school.academic.examAdmitCardTemplate.showFatherName', 'Father Name'],
  ['showMotherName', 'school.academic.examAdmitCardTemplate.showMotherName', 'Mother Name'],
  ['showDob', 'school.academic.examAdmitCardTemplate.showDob', 'Date of Birth'],
  ['showAdmissionNo', 'school.academic.examAdmitCardTemplate.showAdmissionNo', 'Admission No.'],
  ['showRollNo', 'school.academic.examAdmitCardTemplate.showRollNo', 'Roll No.'],
  ['showAddress', 'school.academic.examAdmitCardTemplate.showAddress', 'Address'],
  ['showGender', 'school.academic.examAdmitCardTemplate.showGender', 'Gender'],
  ['showPhoto', 'school.academic.examAdmitCardTemplate.showPhoto', 'Photo'],
  ['showClass', 'school.academic.examAdmitCardTemplate.showClass', 'Class'],
  ['showSection', 'school.academic.examAdmitCardTemplate.showSection', 'Section'],
] as const;

type AssetFormValues = {
  leftLogoUpload?: UploadFile[];
  rightLogoUpload?: UploadFile[];
  signUpload?: UploadFile[];
  backgroundImageUpload?: UploadFile[];
};

const assetFields = [
  {
    key: 'left-logo',
    formName: 'leftLogoUpload',
    valueKey: 'leftLogo',
    locale: 'school.academic.examAdmitCardTemplate.leftLogo',
    defaultMessage: 'Left Logo',
  },
  {
    key: 'right-logo',
    formName: 'rightLogoUpload',
    valueKey: 'rightLogo',
    locale: 'school.academic.examAdmitCardTemplate.rightLogo',
    defaultMessage: 'Right Logo',
  },
  {
    key: 'sign',
    formName: 'signUpload',
    valueKey: 'sign',
    locale: 'school.academic.examAdmitCardTemplate.sign',
    defaultMessage: 'Signature',
  },
  {
    key: 'background-image',
    formName: 'backgroundImageUpload',
    valueKey: 'backgroundImage',
    locale: 'school.academic.examAdmitCardTemplate.backgroundImage',
    defaultMessage: 'Background Image',
  },
] as const;

const getUploadFile = (files?: UploadFile[]) => {
  const item = files?.[0];
  return item?.originFileObj as File | undefined;
};

const ExamAdmitCardTemplates: React.FC = () => {
  const intl = useIntl();
  const [assetRow, setAssetRow] = useState<V1ExamAdmitCardTemplate>();
  const [assetAction, setAssetAction] = useState<ActionType>();

  const columns: ProColumnType<V1ExamAdmitCardTemplate>[] = [
    {
      title: (
        <FormattedMessage
          id="school.academic.examAdmitCardTemplate.template"
          defaultMessage="Template"
        />
      ),
      dataIndex: 'template',
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.examAdmitCardTemplate.schoolName"
          defaultMessage="School"
        />
      ),
      dataIndex: 'schoolName',
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.examAdmitCardTemplate.examName"
          defaultMessage="Exam"
        />
      ),
      dataIndex: 'examName',
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.examAdmitCardTemplate.isActive"
          defaultMessage="Active"
        />
      ),
      dataIndex: 'isActive',
      render: (_, record) =>
        record.isActive ? (
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
          id="school.academic.examAdmitCardTemplate.assets"
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

  const activate = async (record: V1ExamAdmitCardTemplate, action?: ActionType) => {
    if (!record.id) {
      return;
    }
    const hide = message.loading(
      intl.formatMessage({ id: 'common.updating', defaultMessage: 'Updating...' }),
    );
    try {
      await service.examAdmitCardTemplateServiceActivateExamAdmitCardTemplate({
        id: record.id,
        body: { id: record.id },
      });
      hide();
      message.success(
        intl.formatMessage({ id: 'common.updated', defaultMessage: 'Update Successfully' }),
      );
      action?.reload();
    } catch (error) {
      hide();
    }
  };

  const downloadAsset = async (
    record: V1ExamAdmitCardTemplate,
    asset: (typeof assetFields)[number],
  ) => {
    if (!record.id) {
      return;
    }
    const file = record[asset.valueKey];
    try {
      const resp = await service.examAdmitCardTemplateServiceDownloadExamAdmitCardTemplateAsset({
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
            `/v1/school/exam-admit-card-template/${assetRow.id}/asset/${asset.key}/upload`,
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
      <ReferencePage<V1ExamAdmitCardTemplate>
        columns={columns}
        create={(fields) =>
          service.examAdmitCardTemplateServiceCreateExamAdmitCardTemplate({
            body: payload(fields),
          })
        }
        delete={(record) =>
          service.examAdmitCardTemplateServiceDeleteExamAdmitCardTemplate({ id: record.id! })
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
              id="school.academic.examAdmitCardTemplate.assets"
              defaultMessage="Assets"
            />
          </a>,
          ...(record.isActive
            ? []
            : [
                <a key="activate" onClick={() => activate(record, action)}>
                  <FormattedMessage id="common.activate" defaultMessage="Activate" />
                </a>,
              ]),
        ]}
        formItems={
          <>
            <ProFormText
              name="template"
              label={
                <FormattedMessage
                  id="school.academic.examAdmitCardTemplate.template"
                  defaultMessage="Template"
                />
              }
              rules={[{ required: true }]}
            />
            <ProFormText
              name="heading"
              label={
                <FormattedMessage
                  id="school.academic.examAdmitCardTemplate.heading"
                  defaultMessage="Heading"
                />
              }
            />
            <ProFormText
              name="title"
              label={
                <FormattedMessage
                  id="school.academic.examAdmitCardTemplate.title"
                  defaultMessage="Title"
                />
              }
            />
            <ProFormText
              name="examName"
              label={
                <FormattedMessage
                  id="school.academic.examAdmitCardTemplate.examName"
                  defaultMessage="Exam"
                />
              }
            />
            <ProFormText
              name="schoolName"
              label={
                <FormattedMessage
                  id="school.academic.examAdmitCardTemplate.schoolName"
                  defaultMessage="School"
                />
              }
            />
            <ProFormText
              name="examCenter"
              label={
                <FormattedMessage
                  id="school.academic.examAdmitCardTemplate.examCenter"
                  defaultMessage="Exam Center"
                />
              }
            />
            <ProFormTextArea
              name="contentFooter"
              label={
                <FormattedMessage
                  id="school.academic.examAdmitCardTemplate.contentFooter"
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
            <ProFormSwitch
              name="isActive"
              label={
                <FormattedMessage
                  id="school.academic.examAdmitCardTemplate.isActive"
                  defaultMessage="Active"
                />
              }
              initialValue={visibilityDefaults.isActive}
            />
          </>
        }
        get={async (id) =>
          (await service.examAdmitCardTemplateServiceGetExamAdmitCardTemplate({ id })).data
        }
        list={async (req) =>
          (await service.examAdmitCardTemplateServiceListExamAdmitCardTemplate2({ body: req })).data
        }
        title={(record) => record.template || ''}
        update={(record, fields) =>
          service.examAdmitCardTemplateServiceUpdateExamAdmitCardTemplate2({
            templateId: record.id!,
            body: {
              template: {
                id: record.id!,
                ...payload(fields),
              },
            },
          })
        }
      />
      <ModalForm<AssetFormValues>
        title={intl.formatMessage({
          id: 'school.academic.examAdmitCardTemplate.uploadAssets',
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
                      id="school.academic.examAdmitCardTemplate.downloadAsset"
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

export default ExamAdmitCardTemplates;
