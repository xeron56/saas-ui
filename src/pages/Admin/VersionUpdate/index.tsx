import {
  DeleteOutlined,
  DownloadOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation, useParams } from '@umijs/max';
import {
  Alert,
  Button,
  Descriptions,
  Empty,
  Form,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useMemo, useRef, useState } from 'react';

type LegacyRecord = Record<string, any>;

type VersionAddonPayload = LegacyRecord & {
  addons?: LegacyRecord[];
  buildVersion?: string;
  code?: string;
  deleteRoute?: string;
  dryRun?: boolean;
  executeRoute?: string;
  latestBuildVersion?: string;
  latestVersion?: string;
  licenseStatus?: boolean | number | string;
  pageTitle?: string;
  requiredVersion?: string;
  route?: string;
  storeRoute?: string;
  title?: string;
  uploadedFile?: string;
};

type LegacyActionResponse = {
  status?: boolean;
  message?: string;
  data?: LegacyRecord;
};

type UpdateFormValues = {
  email?: string;
  purchase_code?: string;
  update_file?: UploadFile[];
};

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function cleanDisplay(value: unknown) {
  return textValue(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUploadEvent(event: any) {
  if (Array.isArray(event)) {
    return event;
  }
  return event?.fileList || [];
}

function selectedFile(files?: UploadFile[]) {
  return files?.[0]?.originFileObj as File | undefined;
}

function isZipFile(file: UploadFile | File) {
  const name = textValue(file.name).toLowerCase();
  return name.endsWith('.zip');
}

function actionURL(url: unknown, fallback: string) {
  return textValue(url) || fallback;
}

function needsLicenseCredentials(value: unknown) {
  if (value === true || value === 1) {
    return true;
  }
  return ['1', 'true', 'yes', 'required'].includes(textValue(value).toLowerCase());
}

function routeCodeFromPath(pathname: string) {
  const match = pathname.match(/\/(?:admin|super-admin)\/addon\/(?:details|delete)\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function sideEffectTags(result?: LegacyActionResponse) {
  const skipped = result?.data?.sideEffectsSkipped;
  if (!Array.isArray(skipped) || skipped.length === 0) {
    return null;
  }
  return (
    <Space wrap>
      {skipped.map((item) => (
        <Tag key={textValue(item)}>{cleanDisplay(item)}</Tag>
      ))}
    </Space>
  );
}

function addonDescription(addon: LegacyRecord) {
  return cleanDisplay(addon.details?.description || addon.description);
}

export default function AdminVersionUpdate() {
  const location = useLocation();
  const params = useParams();
  const [form] = Form.useForm<UpdateFormValues>();
  const [payload, setPayload] = useState<VersionAddonPayload>();
  const [actionResult, setActionResult] = useState<LegacyActionResponse>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState('');
  const [error, setError] = useState('');
  const directActionRef = useRef('');

  const basePrefix = location.pathname.startsWith('/super-admin/')
    ? '/super-admin'
    : location.pathname.startsWith('/admin/')
    ? '/admin'
    : '';
  const mode = location.pathname.includes(`${basePrefix}/addon/`) ? 'addon' : 'version';
  const routeCode = textValue(params.id) || routeCodeFromPath(location.pathname);
  const addonCode = textValue(payload?.code) || routeCode;
  const licenseRequired = needsLicenseCredentials(payload?.licenseStatus);

  const directAction = useMemo(() => {
    if (location.pathname === `${basePrefix}/version-update-execute`) {
      return {
        key: `${location.pathname}:execute`,
        redirectPath: `${basePrefix}/version-update`,
        type: 'execute',
      };
    }
    if (location.pathname === `${basePrefix}/version-delete`) {
      return {
        key: `${location.pathname}:delete`,
        redirectPath: `${basePrefix}/version-update`,
        type: 'delete',
      };
    }
    if (basePrefix === '/admin' && location.pathname === '/admin/script-') {
      return {
        actionRoute: '/admin/script-',
        key: `${location.pathname}:script`,
        redirectPath: `${basePrefix}/version-update`,
        type: 'execute',
      };
    }
    if (location.pathname.startsWith(`${basePrefix}/addon/delete/`) && routeCode) {
      return {
        key: `${location.pathname}:delete`,
        redirectPath: `${basePrefix}/addon/details/${encodeURIComponent(routeCode)}`,
        type: 'delete',
      };
    }
    return undefined;
  }, [basePrefix, location.pathname, routeCode]);

  const loadURL = useMemo(() => {
    if (mode === 'addon') {
      return `${basePrefix}/addon/details/${encodeURIComponent(routeCode)}`;
    }
    return `${basePrefix}/version-update`;
  }, [basePrefix, mode, routeCode]);

  const loadPayload = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<VersionAddonPayload>(loadURL);
      setPayload(body);
    } catch (err: any) {
      setError(err?.message || 'Unable to load version update details.');
      setPayload(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.resetFields();
    setActionResult(undefined);
    loadPayload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadURL]);

  const submitUpload = async (values: UpdateFormValues) => {
    const file = selectedFile(values.update_file);
    if (!file || !isZipFile(file)) {
      setError('Choose a .zip package before uploading.');
      return;
    }
    const formData = new FormData();
    formData.append('update_file', file);
    if (mode === 'addon') {
      formData.append('code', addonCode);
    }

    setSubmitting('upload');
    setError('');
    try {
      const response = await request<LegacyActionResponse>(
        actionURL(
          payload?.storeRoute,
          mode === 'addon' ? `${basePrefix}/addon/store` : `${basePrefix}/version-update`,
        ),
        {
          method: 'POST',
          data: formData,
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Package could not be uploaded.');
        return;
      }
      setActionResult(response);
      toast.success(textValue(response.message) || 'Package uploaded.');
      form.setFieldValue('update_file', []);
      await loadPayload();
    } catch (err: any) {
      setError(err?.message || 'Package could not be uploaded.');
    } finally {
      setSubmitting('');
    }
  };

  const executeUpdate = async (redirectPath?: string, actionRoute?: string) => {
    setSubmitting('execute');
    setError('');
    try {
      const values = licenseRequired
        ? await form.validateFields(['email', 'purchase_code'])
        : form.getFieldsValue(['email', 'purchase_code']);
      const executeRoute = actionURL(
        actionRoute || payload?.executeRoute,
        mode === 'addon' ? `${basePrefix}/addon/execute` : `${basePrefix}/version-update-execute`,
      );
      const response = await request<LegacyActionResponse>(executeRoute, {
        method: mode === 'addon' ? 'POST' : 'GET',
        data:
          mode === 'addon'
            ? {
                code: addonCode,
                email: textValue(values.email),
                licenseStatus: licenseRequired ? 1 : 0,
                purchase_code: textValue(values.purchase_code),
              }
            : undefined,
      });
      if (response.status === false) {
        setError(textValue(response.message) || 'Update action could not be processed.');
        return;
      }
      setActionResult(response);
      toast.success(textValue(response.message) || 'Update action processed.');
      await loadPayload();
      if (redirectPath && location.pathname !== redirectPath) {
        history.replace(redirectPath);
      }
    } catch (err: any) {
      setError(err?.message || 'Update action could not be processed.');
    } finally {
      setSubmitting('');
    }
  };

  const deleteUpload = async (redirectPath?: string) => {
    setSubmitting('delete');
    setError('');
    try {
      const response = await request<LegacyActionResponse>(
        actionURL(
          payload?.deleteRoute,
          mode === 'addon'
            ? `${basePrefix}/addon/delete/${encodeURIComponent(addonCode)}`
            : `${basePrefix}/version-delete`,
        ),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Uploaded package could not be deleted.');
        return;
      }
      setActionResult(response);
      toast.success(textValue(response.message) || 'Uploaded package deleted.');
      await loadPayload();
      if (redirectPath && location.pathname !== redirectPath) {
        history.replace(redirectPath);
      }
    } catch (err: any) {
      setError(err?.message || 'Uploaded package could not be deleted.');
    } finally {
      setSubmitting('');
    }
  };

  useEffect(() => {
    if (!directAction) {
      directActionRef.current = '';
      return;
    }
    if (loading) {
      return;
    }
    if (directActionRef.current === directAction.key) {
      return;
    }
    directActionRef.current = directAction.key;
    if (directAction.type === 'execute') {
      void executeUpdate(directAction.redirectPath, directAction.actionRoute);
    } else {
      void deleteUpload(directAction.redirectPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directAction?.key, loading]);

  const pageTitle =
    textValue(payload?.pageTitle) ||
    textValue(payload?.title) ||
    (mode === 'addon' ? `${addonCode || 'Addon'} Install` : 'Version Update');
  const addons = Array.isArray(payload?.addons) ? payload.addons : [];
  const uploadedFile = textValue(payload?.uploadedFile);

  const systemItems =
    mode === 'addon'
      ? [
          { key: 'code', label: 'Addon Code', children: addonCode || '-' },
          {
            key: 'latest',
            label: 'Latest Version',
            children: cleanDisplay(payload?.latestVersion) || '-',
          },
          {
            key: 'build',
            label: 'Build Version',
            children: cleanDisplay(payload?.buildVersion) || '-',
          },
          {
            key: 'required',
            label: 'Required App Version',
            children: cleanDisplay(payload?.requiredVersion) || '-',
          },
          {
            key: 'license',
            label: 'License Status',
            children: cleanDisplay(payload?.licenseStatus) || '-',
          },
          { key: 'uploaded', label: 'Uploaded File', children: uploadedFile || 'None' },
          {
            key: 'mode',
            label: 'Execution Mode',
            children: payload?.dryRun ? (
              <Tag color="blue">Dry run</Tag>
            ) : (
              <Tag color="green">Live</Tag>
            ),
          },
        ]
      : [
          {
            key: 'current',
            label: 'Current Version',
            children: cleanDisplay(payload?.currentVersion) || '-',
          },
          {
            key: 'latest',
            label: 'Latest Version',
            children: cleanDisplay(payload?.latestVersion) || '-',
          },
          {
            key: 'latestBuild',
            label: 'Latest Build Version',
            children: cleanDisplay(payload?.latestBuildVersion) || '-',
          },
          {
            key: 'database',
            label: cleanDisplay(payload?.databaseType) || 'Database Version',
            children: cleanDisplay(payload?.mysql_version) || '-',
          },
          { key: 'uploaded', label: 'Uploaded File', children: uploadedFile || 'None' },
          {
            key: 'mode',
            label: 'Execution Mode',
            children: payload?.dryRun ? (
              <Tag color="blue">Dry run</Tag>
            ) : (
              <Tag color="green">Live</Tag>
            ),
          },
        ];

  const routeItems = [
    { key: 'page', label: 'Page Route', children: cleanDisplay(payload?.route) || loadURL },
    {
      key: 'store',
      label: 'Upload Route',
      children:
        cleanDisplay(payload?.storeRoute) ||
        (mode === 'addon' ? `${basePrefix}/addon/store` : `${basePrefix}/version-update`),
    },
    {
      key: 'execute',
      label: 'Execute Route',
      children:
        cleanDisplay(payload?.executeRoute) ||
        (mode === 'addon' ? `${basePrefix}/addon/execute` : `${basePrefix}/version-update-execute`),
    },
    {
      key: 'delete',
      label: 'Delete Route',
      children:
        cleanDisplay(payload?.deleteRoute) ||
        (mode === 'addon'
          ? `${basePrefix}/addon/delete/${addonCode}`
          : `${basePrefix}/version-delete`),
    },
  ];

  const addonColumns: ColumnsType<LegacyRecord> = [
    {
      title: 'Addon',
      render: (_, record) => cleanDisplay(record.title) || cleanDisplay(record.code) || '-',
    },
    {
      title: 'Code',
      width: 160,
      render: (_, record) => cleanDisplay(record.code) || '-',
    },
    {
      title: 'Description',
      render: (_, record) => addonDescription(record) || '-',
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => {
        const code = textValue(record.code);
        return (
          <Button
            size="small"
            icon={<DownloadOutlined />}
            disabled={!code}
            onClick={() => history.push(`${basePrefix}/addon/details/${encodeURIComponent(code)}`)}
          >
            Details
          </Button>
        );
      },
    },
  ];

  return (
    <PageContainer title={pageTitle}>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      {payload?.dryRun ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Compatibility dry run"
          description="Actions return the Laravel-compatible response shape while external license calls, filesystem writes, zip extraction, shell commands, migrations, and cache clearing are skipped."
        />
      ) : null}

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 1, md: 2, lg: 2 }}
          title="System Details"
          items={systemItems}
        />

        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 1, md: 2, lg: 2 }}
          title="Route Details"
          items={routeItems}
        />

        <Form<UpdateFormValues> form={form} layout="vertical" onFinish={submitUpload}>
          <Form.Item
            label={mode === 'addon' ? 'Upload Addon' : 'Upload File'}
            name="update_file"
            valuePropName="fileList"
            getValueFromEvent={normalizeUploadEvent}
            rules={[{ required: true, message: 'Choose a .zip package.' }]}
          >
            <Upload
              accept=".zip,application/zip"
              maxCount={1}
              beforeUpload={(file) => {
                if (!isZipFile(file)) {
                  toast.error('Only .zip packages are supported.');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>
                {mode === 'addon' ? 'Choose addon package' : 'Choose update package'}
              </Button>
            </Upload>
          </Form.Item>

          {mode === 'addon' ? (
            <Space wrap align="start">
              <Form.Item
                label="Email"
                name="email"
                rules={
                  licenseRequired
                    ? [
                        { required: true, message: 'Email is required.' },
                        { type: 'email', message: 'Enter a valid email.' },
                      ]
                    : [{ type: 'email', message: 'Enter a valid email.' }]
                }
              >
                <Input style={{ width: 260 }} />
              </Form.Item>
              <Form.Item
                label="Purchase Code"
                name="purchase_code"
                rules={
                  licenseRequired ? [{ required: true, message: 'Purchase code is required.' }] : []
                }
              >
                <Input style={{ width: 260 }} />
              </Form.Item>
            </Space>
          ) : null}

          <Space wrap>
            <Button
              type="primary"
              htmlType="submit"
              icon={<UploadOutlined />}
              loading={submitting === 'upload'}
            >
              Upload
            </Button>
            <Popconfirm
              title={mode === 'addon' ? 'Install addon?' : 'Execute version update?'}
              description="Confirm that backup and customization checks are complete."
              onConfirm={() => executeUpdate()}
            >
              <Button icon={<DownloadOutlined />} loading={submitting === 'execute'}>
                {mode === 'addon' ? 'Install' : 'Update'}
              </Button>
            </Popconfirm>
            <Popconfirm title="Delete uploaded package?" onConfirm={() => deleteUpload()}>
              <Button danger icon={<DeleteOutlined />} loading={submitting === 'delete'}>
                Delete
              </Button>
            </Popconfirm>
            <Button icon={<ReloadOutlined />} loading={loading} onClick={loadPayload}>
              Refresh
            </Button>
            {uploadedFile ? <Tag color="processing">{uploadedFile}</Tag> : null}
          </Space>
        </Form>

        {actionResult ? (
          <Descriptions
            bordered
            size="small"
            column={1}
            title="Last Action"
            items={[
              {
                key: 'status',
                label: 'Status',
                children: actionResult.status === false ? 'Failed' : 'Success',
              },
              {
                key: 'message',
                label: 'Message',
                children: cleanDisplay(actionResult.message) || '-',
              },
              {
                key: 'action',
                label: 'Action',
                children: cleanDisplay(actionResult.data?.action) || '-',
              },
              {
                key: 'code',
                label: 'Code',
                children: cleanDisplay(actionResult.data?.code) || '-',
              },
              {
                key: 'email',
                label: 'Email Provided',
                children: actionResult.data?.emailProvided ? 'Yes' : 'No',
              },
              {
                key: 'purchase',
                label: 'Purchase Code Provided',
                children: actionResult.data?.purchaseCodeProvided ? 'Yes' : 'No',
              },
              {
                key: 'skipped',
                label: 'Skipped Side Effects',
                children: sideEffectTags(actionResult) || '-',
              },
            ]}
          />
        ) : null}

        {mode === 'version' ? (
          <Table<LegacyRecord>
            rowKey={(record) => textValue(record.code) || textValue(record.title)}
            loading={loading}
            dataSource={addons}
            columns={addonColumns}
            pagination={false}
            locale={{ emptyText: <Empty description="No official addons reported." /> }}
            title={() => <strong>Official Addons</strong>}
          />
        ) : (
          <Typography.Link onClick={() => history.push(`${basePrefix}/version-update`)}>
            Back to version update
          </Typography.Link>
        )}
      </Space>
    </PageContainer>
  );
}
