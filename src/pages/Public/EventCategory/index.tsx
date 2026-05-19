import { Button, Form, Input, Popconfirm, Space, Table, Alert, message as toast } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { normalizePayload, recordsFromPayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent, postPublicContent } from '../services';
import type { LegacyRecord } from '../types';

function cleanDisplay(value: unknown) {
  return textValue(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function EventCategory() {
  const [form] = Form.useForm();
  const [rows, setRows] = useState<LegacyRecord[]>([]);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const body = normalizePayload(await fetchPublicContent('/admin/event/category?ajax=1'));
      setRows(recordsFromPayload(body, 'data'));
    } catch (err: any) {
      setError(err?.message || 'Unable to load event categories.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (values: LegacyRecord) => {
    setSubmitting(true);
    setError('');
    try {
      const response = normalizePayload(
        await postPublicContent(
          editingId ? `/admin/event/update/${encodeURIComponent(editingId)}` : '/admin/event/store',
          { name: textValue(values.name) },
        ),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Category could not be saved.');
        return;
      }
      toast.success(textValue(response.message) || 'Category saved.');
      setEditingId('');
      form.resetFields();
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Category could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = async (id: string) => {
    if (!id) {
      return;
    }
    setError('');
    try {
      const body = normalizePayload(
        await fetchPublicContent(`/admin/event/info/${encodeURIComponent(id)}?ajax=1`),
      );
      const item = body.eventCategory || body.item;
      if (!item || typeof item !== 'object') {
        setError('Category could not be loaded.');
        return;
      }
      setEditingId(id);
      form.setFieldsValue({ name: textValue((item as LegacyRecord).name) });
    } catch (err: any) {
      setError(err?.message || 'Category could not be loaded.');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!id) {
      return;
    }
    setError('');
    try {
      const response = normalizePayload(
        await postPublicContent(`/admin/event/delete/${encodeURIComponent(id)}`, {}),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Category could not be deleted.');
        return;
      }
      toast.success(textValue(response.message) || 'Category deleted.');
      if (editingId === id) {
        setEditingId('');
        form.resetFields();
      }
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Category could not be deleted.');
    }
  };

  return (
    <PublicShell title="Event Categories" description="Manage tenant event taxonomy">
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <div className="public-settings-grid">
        <section className="public-settings-panel">
          <div className="public-section-heading">
            <h2>Categories</h2>
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingId('');
                form.resetFields();
              }}
            >
              New
            </Button>
          </div>
          <Table
            rowKey={(record) => textValue(record.id)}
            loading={loading}
            dataSource={rows}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'Name', render: (_, record) => cleanDisplay(record.name) || '-' },
              {
                title: 'Action',
                key: 'action',
                render: (_, record) => {
                  const id = textValue(record.id);
                  return (
                    <Space wrap>
                      <Button size="small" icon={<EditOutlined />} onClick={() => startEdit(id)}>
                        Edit
                      </Button>
                      <Popconfirm
                        title="Delete this category?"
                        onConfirm={() => deleteCategory(id)}
                      >
                        <Button size="small" danger icon={<DeleteOutlined />}>
                          Delete
                        </Button>
                      </Popconfirm>
                    </Space>
                  );
                },
              },
            ]}
          />
        </section>
        <section className="public-settings-panel">
          <Form
            className="public-form public-settings-form"
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={submit}
          >
            <Form.Item name="name" label="Name" rules={[{ required: true, min: 2 }]}>
              <Input />
            </Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
                {editingId ? 'Update' : 'Create'}
              </Button>
              {editingId ? (
                <Button
                  onClick={() => {
                    setEditingId('');
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </Space>
          </Form>
        </section>
      </div>
    </PublicShell>
  );
}
