import type { ProFormInstance } from '@ant-design/pro-components';
import { DrawerForm, ProFormDigit, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React, { useEffect, useRef } from 'react';
import type { V1CreateClassSectionRequest, V1UpdateClassSection } from '@gosaas/api';
import {
  AcademicSessionServiceApi,
  ClassServiceApi,
  ClassSectionServiceApi,
  SectionServiceApi,
} from '@gosaas/api';

const service = new ClassSectionServiceApi();
const sessionService = new AcademicSessionServiceApi();
const classService = new ClassServiceApi();
const sectionService = new SectionServiceApi();

export type FormValueType = V1CreateClassSectionRequest & V1UpdateClassSection;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalVisible: boolean;
  values: FormValueType;
};

const toSelectOptions = (items: Array<{ id?: string; code?: string; name?: string }> = []) =>
  items.map((item) => ({
    label: item.name ? `${item.code} - ${item.name}` : item.code,
    value: item.id,
  }));

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    if (props.values?.id && props.updateModalVisible) {
      service.classSectionServiceGetClassSection({ id: props.values.id }).then((resp) => {
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
      <ProFormSelect
        name="academicSessionId"
        label={intl.formatMessage({
          id: 'school.academic.classSection.academicSession',
          defaultMessage: 'Academic Session',
        })}
        rules={[{ required: true }]}
        request={async () => {
          const resp = await sessionService.academicSessionServiceListAcademicSession2({
            body: { pageSize: 100, sort: ['-created_at'] },
          });
          return toSelectOptions(resp.data.items);
        }}
      />
      <ProFormSelect
        name="classId"
        label={intl.formatMessage({
          id: 'school.academic.classSection.class',
          defaultMessage: 'Class',
        })}
        rules={[{ required: true }]}
        request={async () => {
          const resp = await classService.classServiceListClass2({
            body: { pageSize: 100, sort: ['sequence', 'code'] },
          });
          return toSelectOptions(resp.data.items);
        }}
      />
      <ProFormSelect
        name="sectionId"
        label={intl.formatMessage({
          id: 'school.academic.classSection.section',
          defaultMessage: 'Section',
        })}
        rules={[{ required: true }]}
        request={async () => {
          const resp = await sectionService.sectionServiceListSection2({
            body: { pageSize: 100, sort: ['code'] },
          });
          return toSelectOptions(resp.data.items);
        }}
      />
      <ProFormText
        name="code"
        label={intl.formatMessage({ id: 'school.academic.code', defaultMessage: 'Code' })}
      />
      <ProFormDigit
        name="capacity"
        label={intl.formatMessage({
          id: 'school.academic.classSection.capacity',
          defaultMessage: 'Capacity',
        })}
        min={0}
        fieldProps={{ precision: 0 }}
      />
    </DrawerForm>
  );
};

export default UpdateForm;
