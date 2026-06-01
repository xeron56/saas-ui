import { SaveOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Drawer, Form, Input, InputNumber, Row, Select, Switch } from 'antd';
import React, { useEffect } from 'react';
import type { RetailPartner, RetailPartnerRequest } from './types';

type PartyEditorProps = {
  open: boolean;
  item?: RetailPartner;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: RetailPartnerRequest) => Promise<void>;
};

const normalizeForForm = (item?: RetailPartner): RetailPartnerRequest => ({
  kind: 'customer',
  segment: 'retail',
  opening_balance_mode: 'due',
  opening_balance: 0,
  active: true,
  country: 'Bangladesh',
  ...item,
});

const PartyEditor: React.FC<PartyEditorProps> = ({ open, item, submitting, onClose, onSubmit }) => {
  const [form] = Form.useForm<RetailPartnerRequest>();
  const kind = Form.useWatch('kind', form);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(normalizeForForm(item));
    } else {
      form.resetFields();
    }
  }, [form, item, open]);

  useEffect(() => {
    if (kind === 'supplier') {
      form.setFieldValue('segment', 'supplier');
    } else if (!form.getFieldValue('segment') || form.getFieldValue('segment') === 'supplier') {
      form.setFieldValue('segment', 'retail');
    }
  }, [form, kind]);

  return (
    <Drawer
      width={900}
      open={open}
      title={item?.id ? 'Edit partner' : 'New partner'}
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
      <Form<RetailPartnerRequest>
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          await onSubmit({
            ...values,
            active: values.active ?? false,
            segment: values.kind === 'supplier' ? 'supplier' : values.segment,
          });
        }}
      >
        <Divider orientation="left">Identity</Divider>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="display_name"
              label="Display name"
              rules={[{ required: true, whitespace: true }]}
            >
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="partner_code" label="Code">
              <Input maxLength={128} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="tax_number" label="Tax/VAT no.">
              <Input maxLength={128} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="kind" label="Role" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: 'Customer', value: 'customer' },
                  { label: 'Supplier', value: 'supplier' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="segment" label="Tier">
              <Select
                disabled={kind === 'supplier'}
                options={[
                  { label: 'Retail', value: 'retail' },
                  { label: 'Dealer', value: 'dealer' },
                  { label: 'Wholesale', value: 'wholesale' },
                  { label: 'Supplier', value: 'supplier' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="branch_ref" label="Branch ref">
              <Input maxLength={128} />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="active" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Contact</Divider>
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item name="contact_name" label="Contact person">
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="phone" label="Phone">
              <Input maxLength={80} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="alternate_phone" label="Alt. phone">
              <Input maxLength={80} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="image_ref" label="Image ref">
              <Input maxLength={512} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Address</Divider>
        <Row gutter={12}>
          <Col xs={24}>
            <Form.Item name="address" label="Address">
              <Input maxLength={512} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="city" label="City">
              <Input maxLength={128} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="region" label="Region">
              <Input maxLength={128} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="postal_code" label="Postal code">
              <Input maxLength={64} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="country" label="Country">
              <Input maxLength={128} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Balance</Divider>
        <Row gutter={12}>
          <Col xs={24} md={6}>
            <Form.Item name="opening_balance_mode" label="Opening mode">
              <Select
                options={[
                  { label: 'Due', value: 'due' },
                  { label: 'Advance', value: 'advance' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="opening_balance" label="Opening balance">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="credit_limit" label="Credit limit">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="loyalty_points" label="Loyalty points">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default PartyEditor;
