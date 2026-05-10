import type { ProFormInstance } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Checkbox, message } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  V1StudentFieldSetting,
  V1StudentSettings,
  V1UpdateStudentFieldSetting,
  V1UpdateStudentSettingsRequest,
} from '@gosaas/api';
import { StudentSettingsServiceApi } from '@gosaas/api';

const service = new StudentSettingsServiceApi();

type FormValues = {
  admission?: V1UpdateStudentSettingsRequest['admission'];
  onlineAdmissionEnabledFields?: string[];
  studentEditEnabledFields?: string[];
};

const labelFromKey = (key: string) =>
  key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const enabledKeys = (fields?: V1StudentFieldSetting[]) =>
  fields
    ?.filter((item) => item.enabled)
    .map((item) => item.fieldKey!)
    .filter(Boolean) ?? [];

const fieldUpdates = (
  fields: V1StudentFieldSetting[] | undefined,
  enabled: string[] | undefined,
): V1UpdateStudentFieldSetting[] => {
  const enabledSet = new Set(enabled ?? []);
  return (
    fields?.map((item, index) => ({
      fieldKey: item.fieldKey!,
      enabled: enabledSet.has(item.fieldKey!),
      sequence: item.sequence || index + 1,
    })) ?? []
  );
};

const TableList: React.FC = () => {
  const intl = useIntl();
  const formRef = useRef<ProFormInstance<FormValues>>();
  const [settings, setSettings] = useState<V1StudentSettings>();

  const onlineAdmissionOptions = useMemo(
    () =>
      settings?.onlineAdmissionFields?.map((item) => ({
        label: labelFromKey(item.fieldKey ?? ''),
        value: item.fieldKey ?? '',
      })) ?? [],
    [settings],
  );

  const studentEditOptions = useMemo(
    () =>
      settings?.studentEditFields?.map((item) => ({
        label: labelFromKey(item.fieldKey ?? ''),
        value: item.fieldKey ?? '',
      })) ?? [],
    [settings],
  );

  const loadSettings = async () => {
    const resp = await service.studentSettingsServiceGetStudentSettings();
    setSettings(resp.data);
    formRef.current?.setFieldsValue({
      admission: resp.data.admission,
      onlineAdmissionEnabledFields: enabledKeys(resp.data.onlineAdmissionFields),
      studentEditEnabledFields: enabledKeys(resp.data.studentEditFields),
    });
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <PageContainer>
      <ProForm<FormValues>
        formRef={formRef}
        submitter={{
          searchConfig: {
            submitText: intl.formatMessage({ id: 'common.save', defaultMessage: 'Save' }),
          },
        }}
        onFinish={async (values) => {
          const hide = message.loading(
            intl.formatMessage({ id: 'common.updating', defaultMessage: 'Updating...' }),
          );
          try {
            await service.studentSettingsServiceUpdateStudentSettings2({
              body: {
                admission: values.admission!,
                onlineAdmissionFields: fieldUpdates(
                  settings?.onlineAdmissionFields,
                  values.onlineAdmissionEnabledFields,
                ),
                studentEditFields: fieldUpdates(
                  settings?.studentEditFields,
                  values.studentEditEnabledFields,
                ),
              },
            });
            hide();
            message.success(
              intl.formatMessage({ id: 'common.updated', defaultMessage: 'Update Successfully' }),
            );
            await loadSettings();
            return true;
          } catch (error) {
            hide();
            return false;
          }
        }}
      >
        <ProCard
          title={intl.formatMessage({
            id: 'school.student.settings.admission',
            defaultMessage: 'Admission',
          })}
          bordered
          direction="column"
        >
          <ProFormSwitch
            name={['admission', 'autoGenerateAdmissionNo']}
            label={intl.formatMessage({
              id: 'school.student.settings.autoGenerateAdmissionNo',
              defaultMessage: 'Auto Generate Admission No.',
            })}
          />
          <ProFormText
            name={['admission', 'admissionNoPrefix']}
            label={intl.formatMessage({
              id: 'school.student.settings.admissionNoPrefix',
              defaultMessage: 'Admission No. Prefix',
            })}
            rules={[{ required: true, max: 64 }]}
          />
          <ProFormText
            name={['admission', 'admissionNoStartFrom']}
            label={intl.formatMessage({
              id: 'school.student.settings.admissionNoStartFrom',
              defaultMessage: 'Admission No. Start From',
            })}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            name={['admission', 'admissionNoDigits']}
            label={intl.formatMessage({
              id: 'school.student.settings.admissionNoDigits',
              defaultMessage: 'Admission No. Digits',
            })}
            min={1}
            max={20}
            rules={[{ required: true }]}
          />
          <ProFormSwitch
            name={['admission', 'admissionNoSequenceInitialized']}
            label={intl.formatMessage({
              id: 'school.student.settings.admissionNoSequenceInitialized',
              defaultMessage: 'Sequence Initialized',
            })}
          />
          <ProFormSwitch
            name={['admission', 'allowMultiClassStudent']}
            label={intl.formatMessage({
              id: 'school.student.settings.allowMultiClassStudent',
              defaultMessage: 'Allow Multi-Class Student',
            })}
          />
          <ProFormSwitch
            name={['admission', 'publicExamResultEnabled']}
            label={intl.formatMessage({
              id: 'school.student.settings.publicExamResultEnabled',
              defaultMessage: 'Public Exam Result Lookup',
            })}
          />
          <ProFormSwitch
            name={['admission', 'admitCardDownloadEnabled']}
            label={intl.formatMessage({
              id: 'school.student.settings.admitCardDownloadEnabled',
              defaultMessage: 'Student Admit Card Download',
            })}
          />
        </ProCard>
        <ProCard
          title={intl.formatMessage({
            id: 'school.student.settings.onlineAdmission',
            defaultMessage: 'Online Admission',
          })}
          bordered
          direction="column"
        >
          <ProFormSwitch
            name={['admission', 'onlineAdmissionEnabled']}
            label={intl.formatMessage({
              id: 'school.student.settings.onlineAdmissionEnabled',
              defaultMessage: 'Online Admission Enabled',
            })}
          />
          <ProFormSwitch
            name={['admission', 'onlineAdmissionPaymentEnabled']}
            label={intl.formatMessage({
              id: 'school.student.settings.onlineAdmissionPaymentEnabled',
              defaultMessage: 'Online Admission Payment',
            })}
          />
          <ProFormDigit
            name={['admission', 'onlineAdmissionAmount']}
            label={intl.formatMessage({
              id: 'school.student.settings.onlineAdmissionAmount',
              defaultMessage: 'Online Admission Amount',
            })}
            min={0}
          />
          <ProFormTextArea
            name={['admission', 'onlineAdmissionInstruction']}
            label={intl.formatMessage({
              id: 'school.student.settings.onlineAdmissionInstruction',
              defaultMessage: 'Instructions',
            })}
          />
          <ProFormTextArea
            name={['admission', 'onlineAdmissionConditions']}
            label={intl.formatMessage({
              id: 'school.student.settings.onlineAdmissionConditions',
              defaultMessage: 'Terms and Conditions',
            })}
          />
          <ProForm.Item
            name="onlineAdmissionEnabledFields"
            label={intl.formatMessage({
              id: 'school.student.settings.onlineAdmissionFields',
              defaultMessage: 'Online Admission Fields',
            })}
          >
            <Checkbox.Group options={onlineAdmissionOptions} />
          </ProForm.Item>
        </ProCard>
        <ProCard
          title={intl.formatMessage({
            id: 'school.student.settings.profile',
            defaultMessage: 'Profile',
          })}
          bordered
          direction="column"
        >
          <ProFormSwitch
            name={['admission', 'studentProfileEditEnabled']}
            label={intl.formatMessage({
              id: 'school.student.settings.studentProfileEditEnabled',
              defaultMessage: 'Student Profile Edit',
            })}
          />
          <ProForm.Item
            name="studentEditEnabledFields"
            label={intl.formatMessage({
              id: 'school.student.settings.studentEditFields',
              defaultMessage: 'Student Edit Fields',
            })}
          >
            <Checkbox.Group options={studentEditOptions} />
          </ProForm.Item>
        </ProCard>
      </ProForm>
    </PageContainer>
  );
};

export default TableList;
