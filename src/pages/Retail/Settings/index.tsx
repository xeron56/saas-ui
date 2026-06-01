import {
  AppstoreOutlined,
  FileTextOutlined,
  GlobalOutlined,
  PictureOutlined,
  ReloadOutlined,
  SaveOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Col, Input, message, Row, Segmented, Select, Space, Switch, Tag } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { getRetailSettings, updateRetailSettings } from './service';
import type {
  CurrencyFormat,
  InvoiceSize,
  JsonMap,
  RetailSettings,
  SaleRoundingMode,
} from './types';

const sectionStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 16,
  background: '#fff',
  border: '1px solid #f0f0f0',
  borderRadius: 8,
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 12,
};

const fieldStyle: React.CSSProperties = {
  minHeight: 76,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  color: '#595959',
  fontSize: 13,
};

type ToggleConfig = {
  key: string;
  label: string;
};

const moduleToggles: ToggleConfig[] = [
  { key: 'show_item_code', label: 'Code' },
  { key: 'show_barcode', label: 'Barcode' },
  { key: 'show_stock', label: 'Stock' },
  { key: 'show_unit', label: 'Unit' },
  { key: 'show_brand', label: 'Brand' },
  { key: 'show_group', label: 'Group' },
  { key: 'show_image', label: 'Image' },
  { key: 'show_alert_quantity', label: 'Alert qty' },
  { key: 'show_sale_price', label: 'Sale price' },
  { key: 'show_wholesale_price', label: 'Wholesale' },
  { key: 'show_dealer_price', label: 'Dealer' },
  { key: 'show_batch', label: 'Batch' },
  { key: 'show_expire_date', label: 'Expiry' },
  { key: 'show_storage', label: 'Storage' },
  { key: 'show_serial', label: 'Serial' },
];

const visibilityToggles: ToggleConfig[] = [
  { key: 'show_note', label: 'Note' },
  { key: 'show_gratitude_msg', label: 'Gratitude' },
  { key: 'show_a4_invoice_logo', label: 'A4 logo' },
  { key: 'show_thermal_invoice_logo', label: 'Thermal logo' },
  { key: 'show_invoice_scanner_logo', label: 'Scanner logo' },
  { key: 'show_warranty', label: 'Warranty' },
];

const brandingInputs: ToggleConfig[] = [
  { key: 'invoice_logo', label: 'Invoice logo' },
  { key: 'a4_invoice_logo', label: 'A4 logo' },
  { key: 'thermal_invoice_logo', label: 'Thermal logo' },
  { key: 'invoice_scanner_logo', label: 'Scanner logo' },
];

const receiptInputs: ToggleConfig[] = [
  { key: 'note_label', label: 'Note label' },
  { key: 'note', label: 'Note' },
  { key: 'gratitude_message', label: 'Gratitude message' },
  { key: 'warranty_void_label', label: 'Warranty label' },
  { key: 'warranty_void', label: 'Warranty text' },
];

const enabled = (value: unknown) => value === '1' || value === true || value === 1;

const SettingsPage: React.FC = () => {
  const intl = useIntl();
  const [settings, setSettings] = useState<RetailSettings>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      setSettings(await getRetailSettings());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const patchSettings = (patch: Partial<RetailSettings>) => {
    setSettings((current) => ({ ...(current || {}), ...patch }));
  };

  const patchMap = (field: keyof RetailSettings, key: string, value: unknown) => {
    setSettings((current) => ({
      ...(current || {}),
      [field]: {
        ...(((current || {})[field] as JsonMap) || {}),
        [key]: value,
      },
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const saved = await updateRetailSettings(settings || {});
      setSettings(saved);
      message.success(t('retail.settings.saved', 'Settings saved'));
    } finally {
      setSaving(false);
    }
  };

  const productModules = settings?.product_modules || {};
  const visibilityFlags = settings?.visibility_flags || {};

  const renderMapInput = (field: keyof RetailSettings, item: ToggleConfig) => (
    <Col key={item.key} xs={24} md={12}>
      <div style={fieldStyle}>
        <span style={labelStyle}>{item.label}</span>
        <Input
          value={String(((settings || {})[field] as JsonMap)?.[item.key] || '')}
          onChange={(event) => patchMap(field, item.key, event.target.value)}
        />
      </div>
    </Col>
  );

  return (
    <PageContainer>
      <div style={sectionStyle}>
        <Space size={12} wrap>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={loadSettings} />
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={saveSettings}>
            {t('retail.settings.save', 'Save settings')}
          </Button>
          <Tag icon={<SettingOutlined />}>
            {t('retail.settings.scope', 'Tenant retail preferences')}
          </Tag>
        </Space>
      </div>

      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <FileTextOutlined />
            <strong>{t('retail.settings.invoice', 'Invoice')}</strong>
          </Space>
        </div>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <div style={fieldStyle}>
              <span style={labelStyle}>{t('retail.settings.invoiceSize', 'Invoice size')}</span>
              <Segmented
                value={settings?.invoice_size || 'a4'}
                onChange={(value) => patchSettings({ invoice_size: value as InvoiceSize })}
                options={[
                  { label: 'A4', value: 'a4' },
                  { label: '80mm', value: '3_inch_80mm' },
                  { label: '58mm', value: '2_inch_58mm' },
                ]}
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={fieldStyle}>
              <span style={labelStyle}>
                {t('retail.settings.invoiceLanguage', 'Invoice language')}
              </span>
              <Input
                value={settings?.invoice_language || ''}
                maxLength={64}
                onChange={(event) => patchSettings({ invoice_language: event.target.value })}
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={fieldStyle}>
              <span style={labelStyle}>{t('retail.settings.currency', 'Currency format')}</span>
              <Segmented
                value={settings?.currency_format || 'us'}
                onChange={(value) => patchSettings({ currency_format: value as CurrencyFormat })}
                options={[
                  { label: 'US', value: 'us' },
                  { label: 'European', value: 'european' },
                ]}
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={fieldStyle}>
              <span style={labelStyle}>{t('retail.settings.rounding', 'Sale rounding')}</span>
              <Select<SaleRoundingMode>
                style={{ width: '100%' }}
                value={settings?.sale_rounding_mode || 'none'}
                onChange={(value) => patchSettings({ sale_rounding_mode: value })}
                options={[
                  { label: 'None', value: 'none' },
                  { label: 'Round up', value: 'round_up' },
                  { label: 'Nearest whole', value: 'nearest_whole_number' },
                  { label: 'Nearest 0.05', value: 'nearest_0.05' },
                  { label: 'Nearest 0.1', value: 'nearest_0.1' },
                  { label: 'Nearest 0.5', value: 'nearest_0.5' },
                ]}
              />
            </div>
          </Col>
        </Row>
      </div>

      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <GlobalOutlined />
            <strong>{t('retail.settings.receiptCopy', 'Receipt copy')}</strong>
          </Space>
        </div>
        <Row gutter={[16, 12]}>
          {receiptInputs.map((item) => renderMapInput('receipt_content', item))}
        </Row>
        <Row gutter={[16, 12]} style={{ marginTop: 4 }}>
          {visibilityToggles.map((item) => (
            <Col key={item.key} xs={24} sm={12} lg={8}>
              <Space>
                <Switch
                  checked={enabled(visibilityFlags[item.key])}
                  onChange={(checked) => patchMap('visibility_flags', item.key, checked)}
                />
                <span>{item.label}</span>
              </Space>
            </Col>
          ))}
        </Row>
      </div>

      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <PictureOutlined />
            <strong>{t('retail.settings.branding', 'Branding refs')}</strong>
          </Space>
        </div>
        <Row gutter={[16, 12]}>
          {brandingInputs.map((item) => renderMapInput('branding_refs', item))}
        </Row>
      </div>

      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <AppstoreOutlined />
            <strong>{t('retail.settings.productModules', 'Product modules')}</strong>
          </Space>
          <Select
            style={{ width: 160 }}
            value={String(productModules.default_item_kind || 'single')}
            onChange={(value) => patchMap('product_modules', 'default_item_kind', value)}
            options={[
              { label: 'Single', value: 'single' },
              { label: 'Variant', value: 'variant' },
              { label: 'Bundle', value: 'bundle' },
            ]}
          />
        </div>
        <Row gutter={[16, 12]}>
          {moduleToggles.map((item) => (
            <Col key={item.key} xs={24} sm={12} lg={8}>
              <Space>
                <Switch
                  checked={enabled(productModules[item.key])}
                  onChange={(checked) => patchMap('product_modules', item.key, checked ? '1' : '0')}
                />
                <span>{item.label}</span>
              </Space>
            </Col>
          ))}
        </Row>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
