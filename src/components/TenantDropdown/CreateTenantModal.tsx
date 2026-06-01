import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import type { V1Tenant } from '@gosaas/api';
import { request as umiRequest, useIntl } from '@umijs/max';
import { uploadApi } from '@/utils/upload';
import { uploadConvertValue, uploadTransformSingle } from '@gosaas/core';

type FormValueType = {
  logo?: string;
  companyName?: string;
  business_category_id?: string;
  phoneNumber?: string;
  address?: string;
  shopOpeningBalance?: number;
};

type BusinessCategoryOption = {
  id: string;
  name?: string;
  display_name?: string;
  displayName?: string;
};

type BusinessCategoryListReply = {
  data?: BusinessCategoryOption[];
};

type BusinessSetupReply = {
  tenant?: V1Tenant;
  data?: {
    tenant?: V1Tenant;
  };
};

export type CreateTenantModalPros = {
  open: boolean;
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onFinish: (tenant: V1Tenant) => void;
};

export default (props: CreateTenantModalPros) => {
  const intl = useIntl();

  return (
    <ModalForm<FormValueType>
      open={props.open}
      title={intl.formatMessage({
        id: 'saas.businessSetup.create',
        defaultMessage: 'Create Business',
      })}
      onFinish={async (formData) => {
        const resp = await umiRequest<BusinessSetupReply>('/v1/business', {
          method: 'POST',
          data: formData,
        });
        const tenant = resp.data?.tenant ?? resp.tenant;
        if (tenant) {
          props.onFinish(tenant);
        }
        return true;
      }}
      modalProps={{
        onCancel: () => {
          props.onCancel();
        },
        destroyOnClose: true,
      }}
    >
      <ProFormUploadButton
        name="logo"
        max={1}
        label={intl.formatMessage({
          id: 'saas.tenant.logo',
          defaultMessage: 'Tenant Logo',
        })}
        transform={uploadTransformSingle}
        convertValue={uploadConvertValue}
        fieldProps={{
          customRequest: (opt) => {
            const { onProgress, onError, onSuccess, file, filename } = opt;
            uploadApi(
              '/v1/saas/tenant/logo',
              {
                file: file as any,
                filename: filename,
              },
              onProgress,
            )
              .then((e) => {
                onSuccess?.(e.data);
              })
              .catch((e: any) => {
                onError?.(e);
              });
          },
        }}
      />

      <ProFormText
        name="companyName"
        label={intl.formatMessage({
          id: 'saas.businessSetup.companyName',
          defaultMessage: 'Company Name',
        })}
        rules={[
          {
            required: true,
          },
          {
            max: 250,
          },
        ]}
      />

      <ProFormSelect
        name="business_category_id"
        label={intl.formatMessage({
          id: 'saas.businessSetup.category',
          defaultMessage: 'Business Category',
        })}
        showSearch
        request={async () => {
          const resp = await umiRequest<BusinessCategoryListReply>('/v1/business-categories');
          return (resp.data ?? []).map((item) => ({
            label: item.display_name ?? item.displayName ?? item.name ?? item.id,
            value: item.id,
          }));
        }}
        rules={[
          {
            required: true,
          },
        ]}
      />

      <ProFormText
        name="phoneNumber"
        label={intl.formatMessage({
          id: 'saas.businessSetup.phoneNumber',
          defaultMessage: 'Phone Number',
        })}
        rules={[
          {
            required: true,
          },
          {
            max: 20,
          },
        ]}
      />

      <ProFormTextArea
        name="address"
        label={intl.formatMessage({
          id: 'saas.businessSetup.address',
          defaultMessage: 'Address',
        })}
        fieldProps={{ maxLength: 250, showCount: true }}
      />

      <ProFormDigit
        name="shopOpeningBalance"
        label={intl.formatMessage({
          id: 'saas.businessSetup.shopOpeningBalance',
          defaultMessage: 'Opening Balance',
        })}
        fieldProps={{ precision: 2 }}
      />
    </ModalForm>
  );
};
