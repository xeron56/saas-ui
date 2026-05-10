import type { ProFormInstance } from '@ant-design/pro-components';
import {
  DrawerForm,
  ProFormDateTimePicker,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React, { useEffect, useRef } from 'react';
import type { V1CreateAcademicSessionRequest, V1UpdateAcademicSession } from '@gosaas/api';
import { AcademicSessionServiceApi } from '@gosaas/api';
import { dateUtil } from '@gosaas/core';

const service = new AcademicSessionServiceApi();

export type FormValueType = V1CreateAcademicSessionRequest & V1UpdateAcademicSession;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalVisible: boolean;
  values: FormValueType;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    if (props.values?.id && props.updateModalVisible) {
      service.academicSessionServiceGetAcademicSession({ id: props.values.id }).then((resp) => {
        formRef?.current?.setFieldsValue(resp.data);
      });
    }
  }, [props]);

  return (
    <DrawerForm
      formRef={formRef}
      initialValues={props.values}
      open={props.updateModalVisible}
      onFinish={async (formData) => {
        const { startsAt, endsAt, ...data } = formData;
        await props.onSubmit({
          id: props.values?.id,
          startsAt: startsAt ? dateUtil(startsAt).toISOString() : undefined,
          endsAt: endsAt ? dateUtil(endsAt).toISOString() : undefined,
          ...data,
        });
      }}
      drawerProps={{
        onClose: () => {
          props.onCancel();
        },
        destroyOnClose: true,
      }}
    >
      <ProFormText
        name="code"
        label={intl.formatMessage({ id: 'school.academic.code', defaultMessage: 'Code' })}
        rules={[{ required: true }]}
      />
      <ProFormText
        name="name"
        label={intl.formatMessage({ id: 'school.academic.name', defaultMessage: 'Name' })}
        rules={[{ required: true }]}
      />
      <ProFormDateTimePicker
        name="startsAt"
        label={intl.formatMessage({
          id: 'school.academic.session.startsAt',
          defaultMessage: 'Starts At',
        })}
      />
      <ProFormDateTimePicker
        name="endsAt"
        label={intl.formatMessage({
          id: 'school.academic.session.endsAt',
          defaultMessage: 'Ends At',
        })}
      />
      <ProFormSwitch
        name="isActive"
        label={intl.formatMessage({
          id: 'school.academic.session.isActive',
          defaultMessage: 'Active',
        })}
      />
    </DrawerForm>
  );
};

export default UpdateForm;
