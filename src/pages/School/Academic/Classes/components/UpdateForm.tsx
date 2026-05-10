import type { ProFormInstance } from '@ant-design/pro-components';
import { DrawerForm, ProFormDigit, ProFormText } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React, { useEffect, useRef } from 'react';
import type { V1CreateClassRequest, V1UpdateClass } from '@gosaas/api';
import { ClassServiceApi } from '@gosaas/api';

const service = new ClassServiceApi();

export type FormValueType = V1CreateClassRequest & V1UpdateClass;

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
      service.classServiceGetClass({ id: props.values.id }).then((resp) => {
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
        await props.onSubmit({ id: props.values?.id, ...formData });
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
      <ProFormDigit
        name="sequence"
        label={intl.formatMessage({
          id: 'school.academic.class.sequence',
          defaultMessage: 'Sequence',
        })}
        min={0}
        fieldProps={{ precision: 0 }}
      />
    </DrawerForm>
  );
};

export default UpdateForm;
