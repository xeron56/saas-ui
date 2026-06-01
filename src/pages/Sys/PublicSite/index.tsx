import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Tooltip,
  Upload,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  createPublicSiteEntry,
  deleteComments,
  deleteComment,
  deleteMessages,
  deleteMessage,
  deletePublicSiteEntries,
  deletePublicSiteEntry,
  getLegalPage,
  getWebsiteSettings,
  listBlogComments,
  listMessages,
  listPublicSiteEntries,
  saveLegalPage,
  updatePublicSiteEntry,
  updatePublicSiteEntryStatus,
  updateWebsiteSettingsForm,
  uploadPublicSiteAsset,
} from './service';
import type {
  PublicSiteComment,
  PublicSiteEntry,
  PublicSiteEntryKind,
  PublicSiteMessage,
} from './types';

type KindConfig = {
  kind: PublicSiteEntryKind;
  label: string;
  titleLabel: string;
  mediaLabel: string;
  bodyLabel: string;
  requireTitle?: boolean;
  requireMedia?: boolean;
};

const field = <T,>(record: Record<string, any> | undefined, snake: string, camel: string) =>
  (record?.[snake] ?? record?.[camel]) as T | undefined;

const readActive = (record?: PublicSiteEntry) =>
  field<boolean>(record, 'active', 'active') ?? record?.status ?? false;
const readMedia = (record?: PublicSiteEntry) =>
  field<string>(record, 'media_ref', 'mediaRef') ??
  record?.imageUrl ??
  record?.image ??
  field<string>(record, 'client_image', 'clientImage') ??
  '';
const readTitle = (record?: PublicSiteEntry) =>
  field<string>(record, 'client_name', 'clientName') ?? record?.title ?? '';
const readBody = (record?: PublicSiteEntry) =>
  record?.text ?? record?.descriptions ?? record?.body ?? '';
const readCreatedAt = (record?: Record<string, any>) =>
  field<string>(record, 'created_at', 'createdAt');

const uploadedURL = (resp: { url?: string; data?: { url?: string } }) =>
  resp.url ?? resp.data?.url ?? '';

const uploadAssetToField = (form: any, fieldName: string) => (
  <Upload
    showUploadList={false}
    beforeUpload={async (file) => {
      const resp = await uploadPublicSiteAsset(file as File);
      const url = uploadedURL(resp);
      if (url) {
        form.setFieldValue(fieldName, url);
        message.success('Uploaded');
      }
      return Upload.LIST_IGNORE;
    }}
  >
    <Button icon={<UploadOutlined />}>Upload</Button>
  </Upload>
);

const statusTag = (active?: boolean) => (
  <Tag color={active ? 'green' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>
);

const websiteHeadingDefaults = [
  'slider_title',
  'slider_description',
  'watch_video_url',
  'about_us_title',
  'about_us_description',
  'blog_title',
  'blog_description',
  'pricing_title',
  'pricing_description',
  'contact_us_title',
  'contact_us_description',
  'email',
  'phone',
  'header_btn_text',
  'header_btn_link',
  'footer_short_title',
  'footer_scanner_title',
  'footer_google_play_app_link',
  'footer_apple_app_link',
  'middle_footer_title',
  'right_footer_title',
];

const websiteSingleAssetFields = [
  'slider_image',
  'scanner_image',
  'watch_image',
  'compatible_image',
  'firebase_image',
  'contact_us_icon',
  'footer_scanner_image',
  'footer_apple_app_image',
  'footer_google_app_image',
  'about_image',
  'evanto_logo',
  'slider_bg_img',
];

const websiteMultiAssetFields = ['card_icons', 'footer_socials_icons'];

const uploadListValue = (event: any) => (Array.isArray(event) ? event : event?.fileList ?? []);

const settingText = (value: any) => {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
};

const websiteHeadingRows = (value?: Record<string, any>) => {
  const headings =
    value?.headings && typeof value.headings === 'object' && !Array.isArray(value.headings)
      ? value.headings
      : {};
  const keys = Array.from(new Set([...websiteHeadingDefaults, ...Object.keys(headings)])).sort();
  return keys.map((key) => ({ key, value: settingText(headings[key]) }));
};

const currentAssetText = (value: any) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(', ');
  }
  return settingText(value);
};

const appendWebsiteUpload = (formData: FormData, name: string, files: any[], multiple = false) => {
  (files ?? []).forEach((file) => {
    const raw = file?.originFileObj;
    if (raw) {
      formData.append(multiple ? `${name}[]` : name, raw);
    }
  });
};

const ContentEntryTable: React.FC<{ config: KindConfig }> = ({ config }) => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const commentActionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<PublicSiteEntry>();
  const [commentBlog, setCommentBlog] = useState<PublicSiteEntry>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedCommentKeys, setSelectedCommentKeys] = useState<React.Key[]>([]);

  const openEditor = (record?: PublicSiteEntry) => {
    setEditing(record);
    form.setFieldsValue({
      title: record?.title,
      client_name: readTitle(record),
      slug: record?.slug,
      media_ref: readMedia(record),
      status: record ? readActive(record) : true,
      sort_order: field<number>(record, 'sort_order', 'sortOrder') ?? 0,
      summary: record?.summary,
      body: readBody(record),
      bg_color: field<string>(record, 'bg_color', 'bgColor'),
      work_at: field<string>(record, 'work_at', 'workAt'),
      star: record?.star,
      tags: record?.tags,
      author_name: field<string>(record, 'author_name', 'authorName'),
    });
    setModalOpen(true);
  };

  const submitEditor = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        ...values,
        status: values.status,
        media_ref: values.media_ref,
      };
      if (config.kind === 'testimonial') {
        payload.text = values.body;
      }
      if (config.kind === 'blog') {
        payload.descriptions = values.body;
      }
      if (editing) {
        await updatePublicSiteEntry(config.kind, editing.id, payload);
      } else {
        await createPublicSiteEntry(config.kind, payload);
      }
      message.success(intl.formatMessage({ id: 'common.success', defaultMessage: 'Success' }));
      setModalOpen(false);
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSelectedEntries = () => {
    const ids = selectedRowKeys.map(String);
    if (!ids.length) {
      return;
    }
    Modal.confirm({
      title: intl.formatMessage({ id: 'common.confirm', defaultMessage: 'Confirm' }),
      onOk: async () => {
        await deletePublicSiteEntries(config.kind, ids);
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      },
    });
  };

  const deleteSelectedComments = () => {
    const ids = selectedCommentKeys.map(String);
    if (!ids.length) {
      return;
    }
    Modal.confirm({
      title: intl.formatMessage({ id: 'common.confirm', defaultMessage: 'Confirm' }),
      onOk: async () => {
        await deleteComments(ids);
        setSelectedCommentKeys([]);
        commentActionRef.current?.reload();
      },
    });
  };

  const columns: ProColumns<PublicSiteEntry>[] = [
    {
      title: config.titleLabel,
      dataIndex: config.kind === 'testimonial' ? 'client_name' : 'title',
      ellipsis: true,
      render: (_, record) => readTitle(record) || '-',
    },
    {
      title: config.mediaLabel,
      dataIndex: 'media_ref',
      search: false,
      ellipsis: true,
      render: (_, record) => readMedia(record) || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        active: { text: 'Active' },
        inactive: { text: 'Inactive' },
      },
      render: (_, record) => statusTag(readActive(record)),
    },
    {
      title: 'Order',
      dataIndex: 'sort_order',
      search: false,
      width: 88,
      render: (_, record) => field<number>(record, 'sort_order', 'sortOrder') ?? 0,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      search: false,
      renderText: (_, record) => readCreatedAt(record),
    },
    {
      title: 'Operate',
      valueType: 'option',
      width: config.kind === 'blog' ? 184 : 144,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditor(record)}
            />
          </Tooltip>
          <Tooltip title={readActive(record) ? 'Disable' : 'Enable'}>
            <Button
              type="text"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={async () => {
                await updatePublicSiteEntryStatus(config.kind, record.id, !readActive(record));
                actionRef.current?.reload();
              }}
            />
          </Tooltip>
          {config.kind === 'blog' && (
            <Tooltip title="Comments">
              <Button
                type="text"
                size="small"
                icon={<MessageOutlined />}
                onClick={() => {
                  setSelectedCommentKeys([]);
                  setCommentBlog(record);
                  commentActionRef.current?.reload();
                }}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Button
              danger
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: intl.formatMessage({ id: 'common.confirm', defaultMessage: 'Confirm' }),
                  onOk: async () => {
                    await deletePublicSiteEntry(config.kind, record.id);
                    actionRef.current?.reload();
                  },
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<PublicSiteEntry>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        request={async (params) => {
          const resp = await listPublicSiteEntries(config.kind, {
            page: params.current,
            per_page: params.pageSize,
            search: params.keyword ?? params.title ?? params.client_name,
            status: params.status,
          });
          return {
            data: resp.data ?? [],
            success: true,
            total: resp.meta?.filter_size ?? resp.meta?.filterSize ?? resp.meta?.total ?? 0,
          };
        }}
        pagination={{ defaultPageSize: 10 }}
        toolBarRender={() => [
          selectedRowKeys.length ? (
            <Button
              key="delete-selected"
              danger
              icon={<DeleteOutlined />}
              onClick={deleteSelectedEntries}
            >
              Delete selected
            </Button>
          ) : null,
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
            New
          </Button>,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          />,
        ]}
      />
      <Modal
        destroyOnClose
        open={modalOpen}
        title={editing ? 'Edit content' : 'New content'}
        confirmLoading={submitting}
        onOk={submitEditor}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical" initialValues={{ status: true, sort_order: 0 }}>
          {config.kind === 'testimonial' ? (
            <Form.Item
              name="client_name"
              label={config.titleLabel}
              rules={[{ required: config.requireTitle, whitespace: true, max: 255 }]}
            >
              <Input />
            </Form.Item>
          ) : (
            <Form.Item
              name="title"
              label={config.titleLabel}
              rules={[{ required: config.requireTitle, whitespace: true, max: 255 }]}
            >
              <Input />
            </Form.Item>
          )}
          {config.kind === 'blog' && (
            <Form.Item
              name="slug"
              label="Slug"
              rules={[{ pattern: /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/ }]}
            >
              <Input />
            </Form.Item>
          )}
          <Form.Item label={config.mediaLabel}>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="media_ref"
                noStyle
                rules={[{ required: config.requireMedia, whitespace: true, max: 512 }]}
              >
                <Input />
              </Form.Item>
              {uploadAssetToField(form, 'media_ref')}
            </Space.Compact>
          </Form.Item>
          {config.kind === 'feature' && (
            <Form.Item name="bg_color" label="Background color" rules={[{ max: 64 }]}>
              <Input />
            </Form.Item>
          )}
          {config.kind !== 'banner' && config.kind !== 'interface' && (
            <Form.Item name="summary" label="Summary" rules={[{ max: 2048 }]}>
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
            </Form.Item>
          )}
          {config.kind !== 'banner' && config.kind !== 'interface' && (
            <Form.Item name="body" label={config.bodyLabel}>
              <Input.TextArea autoSize={{ minRows: 4, maxRows: 10 }} />
            </Form.Item>
          )}
          {config.kind === 'testimonial' && (
            <>
              <Form.Item name="work_at" label="Work at" rules={[{ max: 255 }]}>
                <Input />
              </Form.Item>
              <Form.Item name="star" label="Rating">
                <InputNumber min={0} max={5} style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}
          {config.kind === 'blog' && (
            <>
              <Form.Item name="tags" label="Tags">
                <Select mode="tags" tokenSeparators={[',']} />
              </Form.Item>
              <Form.Item name="author_name" label="Author" rules={[{ max: 255 }]}>
                <Input />
              </Form.Item>
            </>
          )}
          <Form.Item name="sort_order" label="Order">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Status" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        destroyOnClose
        open={!!commentBlog}
        width={720}
        title={commentBlog?.title}
        onClose={() => {
          setSelectedCommentKeys([]);
          setCommentBlog(undefined);
        }}
      >
        {commentBlog && (
          <ProTable<PublicSiteComment>
            actionRef={commentActionRef}
            rowKey="id"
            search={{ labelWidth: 80 }}
            rowSelection={{
              selectedRowKeys: selectedCommentKeys,
              onChange: setSelectedCommentKeys,
            }}
            toolBarRender={() => [
              selectedCommentKeys.length ? (
                <Button
                  key="delete-selected-comments"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={deleteSelectedComments}
                >
                  Delete selected
                </Button>
              ) : null,
            ]}
            request={async (params) => {
              const resp = await listBlogComments(commentBlog.id, {
                page: params.current,
                per_page: params.pageSize,
                search: params.keyword ?? params.name ?? params.email,
              });
              return {
                data: resp.data ?? [],
                success: true,
                total: resp.meta?.filter_size ?? resp.meta?.filterSize ?? resp.meta?.total ?? 0,
              };
            }}
            columns={[
              { title: 'Name', dataIndex: 'name' },
              { title: 'Email', dataIndex: 'email' },
              { title: 'Comment', dataIndex: 'comment', ellipsis: true, search: false },
              {
                title: 'Created',
                dataIndex: 'created_at',
                valueType: 'dateTime',
                search: false,
                renderText: (_, record) => readCreatedAt(record),
              },
              {
                title: 'Operate',
                valueType: 'option',
                render: (_, record) => (
                  <Tooltip title="Delete">
                    <Button
                      danger
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={async () => {
                        await deleteComment(record.id);
                        commentActionRef.current?.reload();
                      }}
                    />
                  </Tooltip>
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </>
  );
};

const WebsiteSettingsEditor: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentValue, setCurrentValue] = useState<Record<string, any>>({});

  const load = async () => {
    setLoading(true);
    try {
      const resp = await getWebsiteSettings();
      const value = resp.data?.value ?? {};
      setCurrentValue(value);
      form.setFieldsValue({
        headings: websiteHeadingRows(value),
        files: {},
        multi_files: {},
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Form
      form={form}
      layout="vertical"
      style={{ maxWidth: 960 }}
      onFinish={async (values) => {
        setSaving(true);
        try {
          const formData = new FormData();
          (values.headings ?? []).forEach((row: { key?: string; value?: string }) => {
            const key = String(row?.key ?? '').trim();
            if (key) {
              formData.append(key, row?.value ?? '');
            }
          });
          websiteSingleAssetFields.forEach((fieldName) => {
            appendWebsiteUpload(formData, fieldName, values.files?.[fieldName] ?? []);
          });
          websiteMultiAssetFields.forEach((fieldName) => {
            appendWebsiteUpload(formData, fieldName, values.multi_files?.[fieldName] ?? [], true);
          });
          await updateWebsiteSettingsForm(formData);
          message.success('Saved');
          await load();
        } finally {
          setSaving(false);
        }
      }}
    >
      <Form.List name="headings">
        {(fields, { add, remove }) => (
          <>
            {fields.map((formField) => (
              <Space key={formField.key} align="start" style={{ display: 'flex', marginBottom: 8 }}>
                <Form.Item
                  {...formField}
                  name={[formField.name, 'key']}
                  rules={[{ required: true }]}
                >
                  <Input placeholder="key" disabled={loading} style={{ width: 260 }} />
                </Form.Item>
                <Form.Item {...formField} name={[formField.name, 'value']}>
                  <Input.TextArea
                    placeholder="value"
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    disabled={loading}
                    style={{ width: 520 }}
                  />
                </Form.Item>
                <Button
                  icon={<DeleteOutlined />}
                  disabled={loading}
                  onClick={() => remove(formField.name)}
                />
              </Space>
            ))}
            <Button icon={<PlusOutlined />} disabled={loading} onClick={() => add()}>
              Add heading
            </Button>
          </>
        )}
      </Form.List>
      <div style={{ marginTop: 24 }}>
        {websiteSingleAssetFields.map((fieldName) => (
          <Form.Item
            key={fieldName}
            name={['files', fieldName]}
            label={fieldName}
            valuePropName="fileList"
            getValueFromEvent={uploadListValue}
            extra={currentAssetText(currentValue[fieldName])}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        ))}
        {websiteMultiAssetFields.map((fieldName) => (
          <Form.Item
            key={fieldName}
            name={['multi_files', fieldName]}
            label={fieldName}
            valuePropName="fileList"
            getValueFromEvent={uploadListValue}
            extra={currentAssetText(currentValue[fieldName])}
          >
            <Upload beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        ))}
      </div>
      <Space>
        <Button type="primary" loading={saving} onClick={() => form.submit()}>
          Save
        </Button>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={load} />
      </Space>
    </Form>
  );
};

const LegalForm: React.FC<{ route: 'privacy-policy' | 'term-conditions'; titleField: string }> = ({
  route,
  titleField,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await getLegalPage(route);
      const key = route === 'privacy-policy' ? 'privacy_policy' : 'term_condition';
      const value = resp.data?.[key]?.value ?? {};
      form.setFieldsValue({
        title: value[titleField] ?? value.title,
        description_one: value.description_one,
        description_two: value.description_two,
        body: value.body,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [route]);

  return (
    <Form
      form={form}
      layout="vertical"
      style={{ maxWidth: 960 }}
      disabled={loading}
      onFinish={async (values) => {
        setSaving(true);
        try {
          await saveLegalPage(route, {
            [titleField]: values.title,
            description_one: values.description_one,
            description_two: values.description_two,
            body: values.body,
          });
          message.success('Saved');
        } finally {
          setSaving(false);
        }
      }}
    >
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, whitespace: true, max: 255 }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description_one" label="Description one" rules={[{ required: true }]}>
        <Input.TextArea autoSize={{ minRows: 4, maxRows: 8 }} />
      </Form.Item>
      <Form.Item name="description_two" label="Description two" rules={[{ required: true }]}>
        <Input.TextArea autoSize={{ minRows: 4, maxRows: 8 }} />
      </Form.Item>
      <Form.Item name="body" label="Body">
        <Input.TextArea autoSize={{ minRows: 6, maxRows: 12 }} />
      </Form.Item>
      <Space>
        <Button type="primary" loading={saving} onClick={() => form.submit()}>
          Save
        </Button>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={load} />
      </Space>
    </Form>
  );
};

const LegalEditor: React.FC = () => (
  <Tabs
    items={[
      {
        key: 'privacy',
        label: 'Privacy Policy',
        children: <LegalForm route="privacy-policy" titleField="privacy_title" />,
      },
      {
        key: 'terms',
        label: 'Terms',
        children: <LegalForm route="term-conditions" titleField="term_title" />,
      },
    ]}
  />
);

const MessagesTable: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const deleteSelected = () => {
    const ids = selectedRowKeys.map(String);
    if (!ids.length) {
      return;
    }
    Modal.confirm({
      title: 'Confirm',
      onOk: async () => {
        await deleteMessages(ids);
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      },
    });
  };

  const columns: ProColumns<PublicSiteMessage>[] = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    {
      title: 'Company',
      dataIndex: 'company_name',
      render: (_, record) => field<string>(record, 'company_name', 'companyName') || '-',
    },
    { title: 'Message', dataIndex: 'message', ellipsis: true, search: false },
    {
      title: 'Created',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      search: false,
      renderText: (_, record) => readCreatedAt(record),
    },
    {
      title: 'Operate',
      valueType: 'option',
      render: (_, record) => (
        <Tooltip title="Delete">
          <Button
            danger
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={async () => {
              await deleteMessage(record.id);
              actionRef.current?.reload();
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <ProTable<PublicSiteMessage>
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      rowSelection={{
        selectedRowKeys,
        onChange: setSelectedRowKeys,
      }}
      request={async (params) => {
        const resp = await listMessages({
          page: params.current,
          per_page: params.pageSize,
          search: params.keyword ?? params.name ?? params.email,
        });
        return {
          data: resp.data ?? [],
          success: true,
          total: resp.meta?.filter_size ?? resp.meta?.filterSize ?? resp.meta?.total ?? 0,
        };
      }}
      toolBarRender={() => [
        selectedRowKeys.length ? (
          <Button key="delete-selected" danger icon={<DeleteOutlined />} onClick={deleteSelected}>
            Delete selected
          </Button>
        ) : null,
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={() => actionRef.current?.reload()}
        />,
      ]}
    />
  );
};

const PublicSitePage: React.FC = () => {
  const intl = useIntl();
  const contentKinds = useMemo<KindConfig[]>(
    () => [
      {
        kind: 'banner',
        label: intl.formatMessage({ id: 'sys.publicSite.banners', defaultMessage: 'Banners' }),
        titleLabel: 'Title',
        mediaLabel: 'Image URL',
        bodyLabel: 'Body',
        requireMedia: true,
      },
      {
        kind: 'feature',
        label: intl.formatMessage({ id: 'sys.publicSite.features', defaultMessage: 'Features' }),
        titleLabel: 'Title',
        mediaLabel: 'Image URL',
        bodyLabel: 'Description',
        requireTitle: true,
      },
      {
        kind: 'interface',
        label: intl.formatMessage({
          id: 'sys.publicSite.interfaces',
          defaultMessage: 'Interfaces',
        }),
        titleLabel: 'Title',
        mediaLabel: 'Image URL',
        bodyLabel: 'Body',
      },
      {
        kind: 'testimonial',
        label: intl.formatMessage({
          id: 'sys.publicSite.testimonials',
          defaultMessage: 'Testimonials',
        }),
        titleLabel: 'Client name',
        mediaLabel: 'Client image',
        bodyLabel: 'Testimonial',
        requireTitle: true,
      },
      {
        kind: 'blog',
        label: intl.formatMessage({ id: 'sys.publicSite.blogs', defaultMessage: 'Blogs' }),
        titleLabel: 'Title',
        mediaLabel: 'Cover image',
        bodyLabel: 'Content',
        requireTitle: true,
      },
    ],
    [intl],
  );

  return (
    <PageContainer>
      <Tabs
        items={[
          ...contentKinds.map((config) => ({
            key: config.kind,
            label: config.label,
            children: <ContentEntryTable config={config} />,
          })),
          {
            key: 'legal',
            label: intl.formatMessage({ id: 'sys.publicSite.legal', defaultMessage: 'Legal' }),
            children: <LegalEditor />,
          },
          {
            key: 'settings',
            label: intl.formatMessage({
              id: 'sys.publicSite.settings',
              defaultMessage: 'Website Settings',
            }),
            children: <WebsiteSettingsEditor />,
          },
          {
            key: 'messages',
            label: intl.formatMessage({
              id: 'sys.publicSite.messages',
              defaultMessage: 'Messages',
            }),
            children: <MessagesTable />,
          },
        ]}
      />
    </PageContainer>
  );
};

export default PublicSitePage;
