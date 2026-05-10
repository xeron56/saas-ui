import type { ProFormInstance } from '@ant-design/pro-components';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React, { useEffect, useRef } from 'react';
import type { V1CreateSectionRequest, V1UpdateSection } from '@gosaas/api';
import { SectionServiceApi } from '@gosaas/api';

const service = new SectionServiceApi();

export type FormValueType = V1CreateSectionRequest & V1UpdateSection;

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
      service.sectionServiceGetSection({ id: props.values.id }).then((resp) => {
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
    </DrawerForm>
  );
};

export default UpdateForm;
