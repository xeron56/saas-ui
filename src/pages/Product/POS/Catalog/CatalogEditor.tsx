import { AppstoreAddOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  message,
} from 'antd';
import React, { useEffect, useMemo } from 'react';
import type {
  CatalogAddonGroup,
  CatalogItem,
  CatalogItemRequest,
  CatalogLookupReply,
  CatalogOption,
  CatalogStockLot,
} from './types';

type CatalogEditorFormValues = CatalogItemRequest & {
  variation_option_ids?: string[];
  warranty_duration?: number;
  warranty_unit?: string;
  warranty_terms?: string;
};

type CatalogEditorProps = {
  open: boolean;
  initialValues?: Partial<CatalogItemRequest>;
  item?: CatalogItem;
  lookups?: CatalogLookupReply;
  addonGroups?: CatalogAddonGroup[];
  stockLots?: CatalogStockLot[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: CatalogItemRequest) => Promise<void>;
};

const selectOptions = (items?: { id: string; label: string }[]) =>
  (items || []).map((item) => ({
    label: item.label,
    value: item.id,
  }));

const dateOnly = (value?: string) => (value ? String(value).slice(0, 10) : undefined);

const optionValues = (option?: CatalogOption) => {
  const raw = option?.values?.values ?? option?.values?.items;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item) => String(item).trim()).filter(Boolean);
};

const optionKind = (option: CatalogOption) => {
  if (option.kind) {
    return option.kind;
  }
  return optionValues(option).length > 0 ? 'variation' : 'product_model';
};

const variationIDsFromRefs = (refs?: any) => {
  let raw: any[] = [];
  if (Array.isArray(refs?.items)) {
    raw = refs.items;
  } else if (Array.isArray(refs)) {
    raw = refs;
  }
  return raw.map((item: any) => String(item?.id || item).trim()).filter(Boolean);
};

const normalizeForForm = (item?: Partial<CatalogItem>): CatalogEditorFormValues => {
  const warranty = item?.warranty_profile || {};
  const lots = item?.lots?.length ? item.lots : [{ quantity: 0, active: true }];
  return {
    item_kind: 'single',
    tax_mode: 'exclusive',
    active: true,
    is_addon_product: false,
    ...item,
    addon_group_ids: item?.addon_group_ids || item?.addon_groups?.map((group) => group.id) || [],
    lots: lots.map((lot) => ({
      ...lot,
      mfg_date: dateOnly(lot.mfg_date),
      expire_date: dateOnly(lot.expire_date),
    })),
    bundle_lines: item?.bundle_lines || [],
    variation_option_ids: variationIDsFromRefs(item?.variation_refs),
    warranty_duration: warranty.duration,
    warranty_unit: warranty.unit,
    warranty_terms: warranty.terms,
  };
};

const stockLotLabel = (lot: CatalogStockLot) =>
  [
    lot.item_name,
    lot.item_code,
    lot.variant_name,
    lot.batch_code,
    typeof lot.quantity === 'number' ? `qty ${lot.quantity}` : undefined,
  ]
    .filter(Boolean)
    .join(' / ');

const CatalogEditor: React.FC<CatalogEditorProps> = ({
  open,
  initialValues,
  item,
  lookups,
  addonGroups,
  stockLots,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm<CatalogEditorFormValues>();

  const productModelOptions = useMemo(
    () =>
      (lookups?.options || [])
        .filter((option) => option.active !== false && optionKind(option) === 'product_model')
        .map((option) => ({ label: option.label, value: option.label })),
    [lookups?.options],
  );

  const variationOptions = useMemo(
    () =>
      (lookups?.options || []).filter(
        (option) => option.active !== false && optionKind(option) === 'variation',
      ),
    [lookups?.options],
  );

  const bundleLotOptions = useMemo(
    () =>
      (stockLots || [])
        .filter((lot) => lot.id && lot.item_id !== item?.id)
        .map((lot) => ({
          label: stockLotLabel(lot),
          value: lot.id,
        })),
    [item?.id, stockLots],
  );

  const addonGroupOptions = useMemo(
    () =>
      (addonGroups || [])
        .filter((group) => group.active !== false)
        .map((group) => ({
          label: `${group.label}${
            group.addon_group_code || group.code ? ` (${group.addon_group_code || group.code})` : ''
          }`,
          value: group.id,
        })),
    [addonGroups],
  );

  useEffect(() => {
    if (open) {
      form.setFieldsValue(normalizeForForm(item || initialValues));
    } else {
      form.resetFields();
    }
  }, [form, initialValues, item, open]);

  const buildVariationRefs = (ids?: string[]) => {
    const selected = variationOptions.filter((option) => ids?.includes(option.id));
    if (!selected.length) {
      return undefined;
    }
    return {
      items: selected.map((option) => ({
        id: option.id,
        label: option.label,
        values: optionValues(option),
      })),
    };
  };

  const buildWarrantyProfile = (values: CatalogEditorFormValues) => {
    if (!values.warranty_duration && !values.warranty_unit && !values.warranty_terms) {
      return undefined;
    }
    return {
      duration: values.warranty_duration,
      unit: values.warranty_unit,
      terms: values.warranty_terms,
    };
  };

  const generateVariantLots = () => {
    const ids = form.getFieldValue('variation_option_ids') || [];
    const selected = variationOptions.filter((option) => ids.includes(option.id));
    if (!selected.length || selected.some((option) => optionValues(option).length === 0)) {
      message.warning('Select variation sets with values first');
      return;
    }

    type VariantChoice = { id: string; label: string; value: string };
    const combinations = selected.reduce<VariantChoice[][]>(
      (acc, option) =>
        acc.flatMap((combo) =>
          optionValues(option).map((value) => [
            ...combo,
            { id: option.id, label: option.label, value },
          ]),
        ),
      [[]],
    );

    if (combinations.length > 100) {
      message.warning('Generated variants are limited to 100 rows');
      return;
    }

    const values = form.getFieldsValue();
    form.setFieldsValue({
      item_kind: 'variant',
      lots: combinations.map((combo) => ({
        variant_name: combo.map((entry) => `${entry.label}: ${entry.value}`).join(' / '),
        variation_data: { items: combo },
        quantity: 0,
        storage_site_id: values.storage_site_id,
        purchase_cost: values.purchase_cost,
        sale_price: values.sale_price,
        wholesale_price: values.wholesale_price,
        dealer_price: values.dealer_price,
        profit_percent: values.profit_percent,
        active: true,
      })),
    });
  };

  return (
    <Drawer
      width={1100}
      open={open}
      title={item?.id ? 'Edit catalog item' : 'New catalog item'}
      onClose={onClose}
      destroyOnClose
      extra={
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={() => form.submit()}
        >
          Save
        </Button>
      }
    >
      <Form<CatalogEditorFormValues>
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          const {
            variation_option_ids,
            warranty_duration,
            warranty_unit,
            warranty_terms,
            ...rest
          } = values;
          await onSubmit({
            ...rest,
            active: values.active ?? false,
            variation_refs: buildVariationRefs(variation_option_ids),
            warranty_profile: buildWarrantyProfile({
              ...values,
              warranty_duration,
              warranty_unit,
              warranty_terms,
            }),
            lots: values.lots || [],
            bundle_lines: values.bundle_lines || [],
            addon_group_ids: values.is_addon_product ? [] : values.addon_group_ids || [],
          });
        }}
      >
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="display_name"
              label="Name"
              rules={[{ required: true, whitespace: true }]}
            >
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="item_code" label="Item code">
              <Input maxLength={128} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="barcode" label="Barcode">
              <Input maxLength={128} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="item_kind" label="Type" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: 'Single', value: 'single' },
                  { label: 'Variant', value: 'variant' },
                  { label: 'Bundle', value: 'bundle' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="unit_id" label="Unit">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                options={selectOptions(lookups?.units)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="brand_id" label="Brand">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                options={selectOptions(lookups?.brands)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="group_id" label="Group">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                options={selectOptions(lookups?.groups)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="storage_site_id" label="Storage site">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                options={selectOptions(lookups?.sites)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="storage_bin_id" label="Storage bin">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                options={selectOptions(lookups?.bins)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="model_name" label="Model">
              <AutoComplete options={productModelOptions}>
                <Input maxLength={255} />
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="manufacturer" label="Manufacturer">
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="image_ref" label="Image ref">
              <Input maxLength={512} />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="active" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="has_serial" label="Serials" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="is_addon_product" label="Add-on" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          noStyle
          shouldUpdate={(prev, next) => prev.is_addon_product !== next.is_addon_product}
        >
          {({ getFieldValue }) =>
            getFieldValue('is_addon_product') ? null : (
              <>
                <Divider orientation="left">Add-on groups</Divider>
                <Form.Item name="addon_group_ids" label="Assigned groups">
                  <Select
                    allowClear
                    mode="multiple"
                    optionFilterProp="label"
                    options={addonGroupOptions}
                  />
                </Form.Item>
              </>
            )
          }
        </Form.Item>

        <Divider orientation="left">Pricing</Divider>
        <Row gutter={12}>
          {[
            ['purchase_cost', 'Purchase'],
            ['sale_price', 'Sale'],
            ['wholesale_price', 'Wholesale'],
            ['dealer_price', 'Dealer'],
            ['profit_percent', 'Profit %'],
            ['alert_quantity', 'Alert qty'],
          ].map(([name, label]) => (
            <Col xs={12} md={4} key={name}>
              <Form.Item name={name as keyof CatalogEditorFormValues} label={label}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          ))}
          <Col xs={12} md={4}>
            <Form.Item name="tax_mode" label="Tax mode">
              <Select
                options={[
                  { label: 'Exclusive', value: 'exclusive' },
                  { label: 'Inclusive', value: 'inclusive' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="tax_rate" label="Tax %">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Attributes</Divider>
        <Row gutter={12}>
          {[
            ['size_label', 'Size'],
            ['color_label', 'Color'],
            ['weight_label', 'Weight'],
            ['capacity_label', 'Capacity'],
            ['type_label', 'Style'],
          ].map(([name, label]) => (
            <Col xs={24} md={6} key={name}>
              <Form.Item name={name as keyof CatalogEditorFormValues} label={label}>
                <Input maxLength={128} />
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Divider orientation="left">Variations</Divider>
        <Row gutter={12}>
          <Col xs={24} md={18}>
            <Form.Item name="variation_option_ids" label="Variation sets">
              <Select
                allowClear
                mode="multiple"
                optionFilterProp="label"
                options={variationOptions.map((option) => ({
                  label: `${option.label} (${optionValues(option).join(', ')})`,
                  value: option.id,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="Variants">
              <Button icon={<AppstoreAddOutlined />} onClick={generateVariantLots}>
                Generate variants
              </Button>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Warranty</Divider>
        <Row gutter={12}>
          <Col xs={12} md={5}>
            <Form.Item name="warranty_duration" label="Duration">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={5}>
            <Form.Item name="warranty_unit" label="Unit">
              <Select
                allowClear
                options={[
                  { label: 'Days', value: 'days' },
                  { label: 'Months', value: 'months' },
                  { label: 'Years', value: 'years' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={14}>
            <Form.Item name="warranty_terms" label="Terms">
              <Input maxLength={255} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Stock lots</Divider>
        <Form.List name="lots">
          {(fields, { add, remove }) => (
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {fields.map((field) => (
                <Row gutter={8} key={field.key} align="middle">
                  <Col xs={24} md={4}>
                    <Form.Item name={[field.name, 'batch_code']} label="Batch">
                      <Input maxLength={128} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={4}>
                    <Form.Item name={[field.name, 'variant_name']} label="Variant">
                      <Input maxLength={255} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={4}>
                    <Form.Item name={[field.name, 'storage_site_id']} label="Storage">
                      <Select
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        options={selectOptions(lookups?.sites)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name={[field.name, 'quantity']} label="Qty">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name={[field.name, 'purchase_cost']} label="Cost">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name={[field.name, 'sale_price']} label="Sale">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name={[field.name, 'wholesale_price']} label="Wholesale">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name={[field.name, 'dealer_price']} label="Dealer">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name={[field.name, 'profit_percent']} label="Profit %">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name={[field.name, 'mfg_date']} label="Mfg">
                      <Input type="date" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name={[field.name, 'expire_date']} label="Expiry">
                      <Input type="date" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={2}>
                    <Form.Item name={[field.name, 'active']} label="Active" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={1}>
                    <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                  </Col>
                </Row>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add({ quantity: 0, active: true })}>
                Add lot
              </Button>
            </Space>
          )}
        </Form.List>

        <Form.Item noStyle shouldUpdate={(prev, next) => prev.item_kind !== next.item_kind}>
          {({ getFieldValue }) =>
            getFieldValue('item_kind') === 'bundle' ? (
              <>
                <Divider orientation="left">Bundle components</Divider>
                <Form.List name="bundle_lines">
                  {(fields, { add, remove }) => (
                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                      {fields.map((field) => (
                        <Row gutter={8} key={field.key} align="middle">
                          <Col xs={24} md={14}>
                            <Form.Item
                              name={[field.name, 'component_lot_id']}
                              label="Component lot"
                              rules={[{ required: true }]}
                            >
                              <Select
                                showSearch
                                optionFilterProp="label"
                                options={bundleLotOptions}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={4}>
                            <Form.Item name={[field.name, 'purchase_cost']} label="Cost">
                              <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={4}>
                            <Form.Item
                              name={[field.name, 'quantity']}
                              label="Qty"
                              rules={[{ required: true }]}
                            >
                              <InputNumber min={0.0001} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={2}>
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(field.name)}
                            />
                          </Col>
                        </Row>
                      ))}
                      <Button
                        icon={<PlusOutlined />}
                        onClick={() => add({ quantity: 1, purchase_cost: 0 })}
                      >
                        Add component
                      </Button>
                    </Space>
                  )}
                </Form.List>
              </>
            ) : null
          }
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CatalogEditor;
