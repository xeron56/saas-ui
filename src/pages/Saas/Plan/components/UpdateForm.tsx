import type { ProFormInstance } from '@ant-design/pro-components';
import {
  DrawerForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React, { useEffect, useRef } from 'react';
import { getAdminPlan } from '../service';
import type { LegacyPlanFormValues } from '../types';

export type FormValueType = LegacyPlanFormValues;

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
    if (props.values?.key && props.updateModalVisible) {
      getAdminPlan(props.values.key).then((resp) => {
        formRef?.current?.setFieldsValue(resp.data);
      });
    }
  }, [props]);

  return (
    <DrawerForm
      formRef={formRef}
      initialValues={{ status: true, currency_code: 'BDT', subdomain_limit: 0, ...props.values }}
      open={props.updateModalVisible}
      onFinish={async (formData) => {
        await props.onSubmit(formData);
      }}
      drawerProps={{
        onClose: () => {
          props.onCancel();
        },
        destroyOnClose: true,
      }}
    >
      {!props.values.key && (
        <ProFormText
          name="key"
          label={intl.formatMessage({
            id: 'saas.plan.key',
            defaultMessage: 'Plan Key',
          })}
          rules={[
            {
              required: true,
            },
          ]}
        />
      )}
      <ProFormText
        name="subscriptionName"
        label={intl.formatMessage({
          id: 'saas.plan.subscriptionName',
          defaultMessage: 'Subscription name',
        })}
        rules={[
          {
            required: true,
          },
        ]}
      />
      <ProFormDigit
        name="duration"
        label={intl.formatMessage({
          id: 'saas.plan.duration',
          defaultMessage: 'Duration in days',
        })}
        min={1}
        fieldProps={{ precision: 0 }}
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="subscriptionPrice"
        label={intl.formatMessage({
          id: 'saas.plan.subscriptionPrice',
          defaultMessage: 'Subscription price',
        })}
        min={0}
        fieldProps={{ precision: 2 }}
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="offerPrice"
        label={intl.formatMessage({
          id: 'saas.plan.offerPrice',
          defaultMessage: 'Offer price',
        })}
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormDigit
        name="affiliate_commission"
        label={intl.formatMessage({
          id: 'saas.plan.affiliateCommission',
          defaultMessage: 'Referral commission %',
        })}
        min={0}
        max={100}
        fieldProps={{ precision: 2 }}
      />
      <ProFormSelect
        name="currency_code"
        label={intl.formatMessage({
          id: 'saas.plan.currencyCode',
          defaultMessage: 'Currency',
        })}
        options={[
          { label: 'BDT', value: 'BDT' },
          { label: 'USD', value: 'USD' },
          { label: 'EUR', value: 'EUR' },
        ]}
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="subdomain_limit"
        label={intl.formatMessage({
          id: 'saas.plan.subdomainLimit',
          defaultMessage: 'Subdomain limit',
        })}
        min={0}
        fieldProps={{ precision: 0 }}
      />
      <ProFormSwitch
        name="allow_multibranch"
        label={intl.formatMessage({
          id: 'saas.plan.allowMultibranch',
          defaultMessage: 'Allow multi-branch',
        })}
      />
      <ProFormSwitch
        name="status"
        label={intl.formatMessage({
          id: 'saas.plan.active',
          defaultMessage: 'Active',
        })}
      />
    </DrawerForm>
  );
};

export default UpdateForm;
