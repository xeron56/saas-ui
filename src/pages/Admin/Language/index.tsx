import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  PlusOutlined,
  SaveOutlined,
  TranslationOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation } from '@umijs/max';
import {
  Alert,
  Button,
  Checkbox,
  Drawer,
  Form,
  Image,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useMemo, useRef, useState } from 'react';

type LegacyLanguage = {
  id?: number | string;
  language?: string;
  language_name?: string;
  name?: string;
  iso_code?: string;
  flag?: string;
  flag_id?: number | string;
  font?: string | number;
  font_id?: number | string;
  rtl?: string | number;
  rtl_value?: string | number;
  default?: string | number;
  status?: string | number;
};

type LegacyLanguageResponse = {
  status?: boolean;
  message?: string;
  data?: LegacyLanguage[];
  recordsTotal?: number;
  recordsFiltered?: number;
};

type LanguageFormValues = {
  language?: string;
  iso_code?: string;
  rtl?: number;
  default?: boolean;
  flag?: UploadFile[];
  font?: UploadFile[];
};

type ImportFormValues = {
  import?: string;
  current?: string;
};

type TranslationFormValues = {
  key?: string;
  val?: string;
};

type LegacyTranslationPageResponse = {
  status?: boolean;
  message?: string;
  language?: LegacyLanguage;
  languages?: LegacyLanguage[];
  translations?: Record<string, string>;
  translators?: Record<string, string>;
  updateRoute?: string;
  importRoute?: string;
};

type TranslationRow = {
  clientKey: string;
  key: string;
  val: string;
  isNew?: boolean;
};

type LanguageSettingsPageProps = {
  basePath?: string;
  title?: string;
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

function numericValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function rowName(row?: LegacyLanguage) {
  return textValue(row?.language_name) || cleanDisplay(row?.language) || textValue(row?.name);
}

function isDefaultLanguage(row?: LegacyLanguage) {
  return numericValue(row?.default) === 1 || cleanDisplay(row?.language).includes('(Default)');
}

function rtlValue(row?: LegacyLanguage) {
  const rawValue = row?.rtl_value ?? row?.rtl;
  const raw = textValue(rawValue).toLowerCase();
  if (raw === 'yes' || raw === 'true') {
    return 1;
  }
  return numericValue(rawValue) === 1 ? 1 : 0;
}

function extractImageSrc(html: unknown) {
  const match = textValue(html).match(/\bsrc=["']([^"']+)["']/i);
  return match?.[1] || '';
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

function decodeHTMLEntities(value: string) {
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
  }
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function legacyHTMLFieldValues(html: string, name: string) {
  if (typeof DOMParser !== 'undefined') {
    const documentValue = new DOMParser().parseFromString(html, 'text/html');
    const field = Array.from(documentValue.querySelectorAll('input, textarea, select')).find(
      (element) => element.getAttribute('name') === name,
    );
    if (!field) {
      return [];
    }
    if (field instanceof HTMLSelectElement) {
      return Array.from(field.selectedOptions).map((option) => option.value);
    }
    if (field instanceof HTMLInputElement && field.type === 'checkbox') {
      return field.checked ? [field.value || '1'] : [];
    }
    if (field instanceof HTMLTextAreaElement || field instanceof HTMLInputElement) {
      return [field.value || field.textContent || ''];
    }
    return [field.textContent || ''];
  }

  const escapedName = escapeRegExp(name);
  const select = html.match(
    new RegExp(`<select[^>]*name=["']${escapedName}["'][\\s\\S]*?<\\/select>`, 'i'),
  )?.[0];
  if (select) {
    return Array.from(
      select.matchAll(/<option[^>]*value=["']?([^"'\s>]+)["']?[^>]*selected[^>]*>/gi),
    ).map((match) => decodeHTMLEntities(match[1]));
  }

  const textarea = html.match(
    new RegExp(`<textarea[^>]*name=["']${escapedName}["'][^>]*>([\\s\\S]*?)<\\/textarea>`, 'i'),
  );
  if (textarea) {
    return [decodeHTMLEntities(textarea[1])];
  }

  const input = html.match(new RegExp(`<input[^>]*name=["']${escapedName}["'][^>]*>`, 'i'))?.[0];
  if (!input) {
    return [];
  }
  if (/\btype=["']checkbox["']/i.test(input) && !/\bchecked\b/i.test(input)) {
    return [];
  }
  const value = input.match(/\bvalue=["']([^"']*)["']/i)?.[1];
  return value === undefined ? [] : [decodeHTMLEntities(value)];
}

function legacyHTMLFieldValue(html: string, name: string) {
  return legacyHTMLFieldValues(html, name)[0] || '';
}

function buildLanguageFormData(values: LanguageFormValues, current?: LegacyLanguage) {
  const formData = new FormData();
  formData.append('language', textValue(values.language));
  formData.append('iso_code', textValue(values.iso_code));
  formData.append('rtl', String(values.rtl || 0));
  if (values.default) {
    formData.append('default', '1');
  }

  const flag = selectedFile(values.flag);
  const font = selectedFile(values.font);
  if (flag) {
    formData.append('flag', flag);
  } else if (current?.flag_id) {
    formData.append('flag_id', textValue(current.flag_id));
  }
  if (font) {
    formData.append('font', font);
  } else if (current?.font_id) {
    formData.append('font_id', textValue(current.font_id));
  }
  return formData;
}

function languageFromEditHTML(html: string, fallbackID: string): LegacyLanguage | undefined {
  const language = legacyHTMLFieldValue(html, 'language');
  const isoCode = legacyHTMLFieldValue(html, 'iso_code');
  if (!language && !isoCode) {
    return undefined;
  }
  return {
    id: legacyHTMLFieldValue(html, 'id') || fallbackID,
    language,
    language_name: language,
    name: language,
    iso_code: isoCode,
    flag_id: legacyHTMLFieldValue(html, 'flag_id'),
    font_id: legacyHTMLFieldValue(html, 'font_id'),
    font: legacyHTMLFieldValue(html, 'font_id'),
    rtl: legacyHTMLFieldValue(html, 'rtl'),
    rtl_value: legacyHTMLFieldValue(html, 'rtl'),
    default: legacyHTMLFieldValue(html, 'default') ? 1 : 0,
  };
}

async function mutateLanguage(
  endpoint: string,
  values: LanguageFormValues,
  current?: LegacyLanguage,
) {
  return request<LegacyLanguageResponse>(endpoint, {
    method: 'POST',
    data: buildLanguageFormData(values, current),
  });
}

async function postLegacy(endpoint: string, data: Record<string, unknown>) {
  return request<LegacyLanguageResponse>(endpoint, {
    method: 'POST',
    data,
  });
}

function LanguageListPage({
  basePath = '/admin/setting/language',
  title,
}: LanguageSettingsPageProps) {
  const location = useLocation();
  const openedTargetRef = useRef('');
  const [form] = Form.useForm<LanguageFormValues>();
  const [importForm] = Form.useForm<ImportFormValues>();
  const [rows, setRows] = useState<LegacyLanguage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<LegacyLanguage | undefined>();
  const [error, setError] = useState('');
  const targetEditID = useMemo(() => {
    const match = location.pathname.match(
      new RegExp(`^${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/edit/([^/]+)(?:/[^/]+)?/?$`),
    );
    if (!match?.[1]) {
      return '';
    }
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }, [basePath, location.pathname]);

  const languageOptions = useMemo(
    () =>
      rows.map((row) => ({
        label: `${rowName(row) || textValue(row.iso_code)} (${textValue(row.iso_code)})`,
        value: textValue(row.iso_code),
      })),
    [rows],
  );

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyLanguageResponse>(`${basePath}?ajax=1`);
      setRows(Array.isArray(body.data) ? body.data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load languages.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const openCreate = () => {
    setCurrent(undefined);
    form.resetFields();
    form.setFieldsValue({ rtl: 0, default: false, flag: [], font: [] });
    setDrawerOpen(true);
  };

  const openEdit = (row: LegacyLanguage) => {
    setCurrent(row);
    form.setFieldsValue({
      language: rowName(row),
      iso_code: textValue(row.iso_code),
      rtl: rtlValue(row),
      default: isDefaultLanguage(row),
      flag: [],
      font: [],
    });
    setDrawerOpen(true);
  };

  const openEditByID = async (id: string, fallback?: LegacyLanguage) => {
    const loaded = fallback || rows.find((row) => textValue(row.id) === id);
    if (loaded) {
      openEdit(loaded);
      return;
    }

    setError('');
    try {
      const html = await request<string>(`${basePath}/edit/${encodeURIComponent(id)}`, {
        responseType: 'text',
      });
      const item = languageFromEditHTML(textValue(html), id);
      if (!item) {
        setError('Language could not be loaded.');
        return;
      }
      openEdit(item);
    } catch (err: any) {
      setError(err?.message || 'Language could not be loaded.');
    }
  };

  const openEditRoute = (row: LegacyLanguage) => {
    const id = textValue(row.id);
    if (!id) {
      return;
    }
    openedTargetRef.current = id;
    history.push(`${basePath}/edit/${encodeURIComponent(id)}`);
    void openEditByID(id, row);
  };

  useEffect(() => {
    if (!targetEditID) {
      openedTargetRef.current = '';
      return;
    }
    if (openedTargetRef.current === targetEditID) {
      return;
    }
    openedTargetRef.current = targetEditID;
    void openEditByID(targetEditID);
  }, [targetEditID, rows]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrent(undefined);
    form.resetFields();
    if (targetEditID) {
      history.replace(basePath);
    }
  };

  const submitLanguage = async (values: LanguageFormValues) => {
    setSaving(true);
    setError('');
    try {
      const id = textValue(current?.id);
      const response = await mutateLanguage(
        id ? `${basePath}/update/${encodeURIComponent(id)}` : `${basePath}/store`,
        values,
        current,
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Language could not be saved.');
        return;
      }
      toast.success(textValue(response.message) || 'Language saved.');
      closeDrawer();
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Language could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const deleteLanguage = async (row: LegacyLanguage) => {
    const id = textValue(row.id);
    if (!id) {
      return;
    }
    setError('');
    try {
      const response = await postLegacy(`${basePath}/delete/${encodeURIComponent(id)}`, {});
      if (response.status === false) {
        setError(textValue(response.message) || 'Language could not be deleted.');
        return;
      }
      toast.success(textValue(response.message) || 'Language deleted.');
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Language could not be deleted.');
    }
  };

  const importTranslations = async (values: ImportFormValues) => {
    setImporting(true);
    setError('');
    try {
      const response = await postLegacy(`${basePath}/import`, {
        import: values.import,
        current: values.current,
      });
      if (response.status === false) {
        setError(textValue(response.message) || 'Translations could not be imported.');
        return;
      }
      toast.success(textValue(response.message) || 'Translations imported.');
      importForm.resetFields();
    } catch (err: any) {
      setError(err?.message || 'Translations could not be imported.');
    } finally {
      setImporting(false);
    }
  };

  const columns: ColumnsType<LegacyLanguage> = [
    {
      title: 'Flag',
      width: 82,
      render: (_, row) => {
        const src = extractImageSrc(row.flag);
        return src ? (
          <Image width={36} height={36} src={src} preview={false} />
        ) : (
          <GlobalOutlined />
        );
      },
    },
    {
      title: 'Language',
      render: (_, row) => (
        <Space wrap>
          <span>{rowName(row) || '-'}</span>
          {isDefaultLanguage(row) ? <Tag color="green">Default</Tag> : null}
        </Space>
      ),
    },
    {
      title: 'ISO',
      dataIndex: 'iso_code',
      width: 120,
    },
    {
      title: 'RTL',
      width: 100,
      render: (_, row) => (
        <Tag color={rtlValue(row) === 1 ? 'blue' : 'default'}>
          {rtlValue(row) === 1 ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Font',
      width: 110,
      render: (_, row) => (
        <Tag color={numericValue(row.font_id) > 0 ? 'purple' : 'default'}>
          {numericValue(row.font_id) > 0 ? 'Uploaded' : 'None'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 280,
      render: (_, row) => (
        <Space wrap>
          <Button
            size="small"
            icon={<TranslationOutlined />}
            onClick={() =>
              history.push(`${basePath}/translate/${encodeURIComponent(textValue(row.id))}`)
            }
          >
            Translate
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditRoute(row)}>
            Edit
          </Button>
          <Popconfirm title="Delete this language?" onConfirm={() => deleteLanguage(row)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title={title}>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Form
          form={importForm}
          layout="inline"
          requiredMark={false}
          onFinish={importTranslations}
          style={{ gap: 8 }}
        >
          <Form.Item name="import" label="Import from" rules={[{ required: true }]}>
            <Select
              style={{ width: 220 }}
              loading={loading}
              options={languageOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="current" label="Target" rules={[{ required: true }]}>
            <Select
              style={{ width: 220 }}
              loading={loading}
              options={languageOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Button htmlType="submit" icon={<SaveOutlined />} loading={importing}>
            Import
          </Button>
        </Form>

        <Table<LegacyLanguage>
          rowKey={(row) => textValue(row.id) || textValue(row.iso_code)}
          loading={loading}
          dataSource={rows}
          columns={columns}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 760 }}
          title={() => (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <strong>Languages</strong>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                New
              </Button>
            </div>
          )}
        />
      </Space>

      <Drawer
        width={520}
        title={current ? 'Edit Language' : 'New Language'}
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={submitLanguage}
          initialValues={{ rtl: 0, default: false, flag: [], font: [] }}
        >
          <Form.Item name="language" label="Language" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="iso_code" label="ISO Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="rtl" label="RTL" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'No', value: 0 },
                { label: 'Yes', value: 1 },
              ]}
            />
          </Form.Item>
          <Form.Item name="default" valuePropName="checked">
            <Checkbox>Default language</Checkbox>
          </Form.Item>

          {current?.flag_id ? (
            <Alert
              type="info"
              showIcon
              message={`Current flag file #${textValue(current.flag_id)}`}
              style={{ marginBottom: 16 }}
            />
          ) : null}
          <Form.Item
            name="flag"
            label="Flag"
            valuePropName="fileList"
            getValueFromEvent={normalizeUploadEvent}
            rules={current ? [] : [{ required: true, message: 'Flag is required.' }]}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".jpg,.jpeg,.png,.svg,.webp,image/jpeg,image/png,image/svg+xml,image/webp"
            >
              <Button icon={<UploadOutlined />}>Choose flag</Button>
            </Upload>
          </Form.Item>

          {current?.font_id ? (
            <Alert
              type="info"
              showIcon
              message={`Current font file #${textValue(current.font_id)}`}
              style={{ marginBottom: 16 }}
            />
          ) : null}
          <Form.Item
            name="font"
            label="Font"
            valuePropName="fileList"
            getValueFromEvent={normalizeUploadEvent}
          >
            <Upload beforeUpload={() => false} maxCount={1} accept=".ttf,font/ttf">
              <Button icon={<UploadOutlined />}>Choose font</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
            {current ? 'Update' : 'Create'}
          </Button>
        </Form>
      </Drawer>
    </PageContainer>
  );
}

function translationRowsFromPayload(payload?: LegacyTranslationPageResponse): TranslationRow[] {
  const translations = payload?.translations || payload?.translators || {};
  return Object.keys(translations)
    .sort((left, right) => left.localeCompare(right))
    .map((key) => ({
      clientKey: key,
      key,
      val: textValue(translations[key]),
    }));
}

function LanguageTranslationPage({
  basePath,
  id,
  title,
}: LanguageSettingsPageProps & { id: string }) {
  const [importForm] = Form.useForm<ImportFormValues>();
  const [addForm] = Form.useForm<TranslationFormValues>();
  const [payload, setPayload] = useState<LegacyTranslationPageResponse>();
  const [rows, setRows] = useState<TranslationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const updateRoute = textValue(payload?.updateRoute) || `${basePath}/update-translate/${id}`;
  const importRoute = textValue(payload?.importRoute) || `${basePath}/import`;
  const targetISO = textValue(payload?.language?.iso_code);
  const pageTitle = `Translate ${rowName(payload?.language) || targetISO || title || 'Language'}`;

  const importOptions = useMemo(
    () =>
      (payload?.languages || []).map((row) => ({
        label: `${rowName(row) || textValue(row.iso_code)} (${textValue(row.iso_code)})`,
        value: textValue(row.iso_code),
      })),
    [payload?.languages],
  );

  const loadTranslations = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyTranslationPageResponse>(
        `${basePath}/translate/${encodeURIComponent(id)}`,
      );
      if (body.status === false) {
        setError(textValue(body.message) || 'Translations could not be loaded.');
        setPayload(body);
        setRows([]);
        return;
      }
      setPayload(body);
      setRows(translationRowsFromPayload(body));
      importForm.setFieldsValue({ current: textValue(body.language?.iso_code) });
    } catch (err: any) {
      setError(err?.message || 'Translations could not be loaded.');
      setPayload(undefined);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTranslations();
  }, [basePath, id]);

  const updateRow = (clientKey: string, patch: Partial<TranslationRow>) => {
    setRows((currentRows) =>
      currentRows.map((row) => (row.clientKey === clientKey ? { ...row, ...patch } : row)),
    );
  };

  const submitTranslation = async (row: TranslationRow) => {
    const key = textValue(row.key);
    const val = textValue(row.val);
    if (!key || !val) {
      setError('Key and value are required.');
      return;
    }
    setSavingKey(row.clientKey);
    setError('');
    try {
      const response = await request<LegacyLanguageResponse>(updateRoute, {
        method: 'POST',
        data: {
          key,
          val,
          is_new: row.isNew ? '1' : '0',
        },
      });
      if (response.status === false) {
        setError(textValue(response.message) || 'Translation could not be saved.');
        return;
      }
      toast.success(textValue(response.message) || 'Translation saved.');
      await loadTranslations();
    } catch (err: any) {
      setError(err?.message || 'Translation could not be saved.');
    } finally {
      setSavingKey('');
    }
  };

  const addTranslation = async (values: TranslationFormValues) => {
    await submitTranslation({
      clientKey: `new-${Date.now()}`,
      key: textValue(values.key),
      val: textValue(values.val),
      isNew: true,
    });
    addForm.resetFields();
  };

  const importTranslationsForLanguage = async (values: ImportFormValues) => {
    setImporting(true);
    setError('');
    try {
      const response = await request<LegacyLanguageResponse>(importRoute, {
        method: 'POST',
        data: {
          import: values.import,
          current: targetISO,
        },
      });
      if (response.status === false) {
        setError(textValue(response.message) || 'Translations could not be imported.');
        return;
      }
      toast.success(textValue(response.message) || 'Translations imported.');
      importForm.resetFields(['import']);
      await loadTranslations();
    } catch (err: any) {
      setError(err?.message || 'Translations could not be imported.');
    } finally {
      setImporting(false);
    }
  };

  const columns: ColumnsType<TranslationRow> = [
    {
      title: 'Key',
      width: 320,
      render: (_, row) => (
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 4 }}
          readOnly={!row.isNew}
          value={row.key}
          onChange={(event) => updateRow(row.clientKey, { key: event.target.value })}
        />
      ),
    },
    {
      title: 'Value',
      render: (_, row) => (
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 5 }}
          value={row.val}
          onChange={(event) => updateRow(row.clientKey, { val: event.target.value })}
        />
      ),
    },
    {
      title: 'Action',
      width: 120,
      render: (_, row) => (
        <Button
          icon={<SaveOutlined />}
          loading={savingKey === row.clientKey}
          onClick={() => submitTranslation(row)}
        >
          Save
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title={pageTitle}
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => history.push(basePath || '')}>
          Back
        </Button>
      }
    >
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Form
          form={importForm}
          layout="inline"
          requiredMark={false}
          onFinish={importTranslationsForLanguage}
          style={{ gap: 8 }}
        >
          <Form.Item name="import" label="Import from" rules={[{ required: true }]}>
            <Select
              style={{ width: 260 }}
              loading={loading}
              options={importOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Button htmlType="submit" icon={<SaveOutlined />} loading={importing}>
            Import
          </Button>
        </Form>

        <Form
          form={addForm}
          layout="inline"
          requiredMark={false}
          onFinish={addTranslation}
          style={{ gap: 8 }}
        >
          <Form.Item name="key" label="Key" rules={[{ required: true }]}>
            <Input style={{ width: 260 }} />
          </Form.Item>
          <Form.Item name="val" label="Value" rules={[{ required: true }]}>
            <Input style={{ width: 360 }} />
          </Form.Item>
          <Button htmlType="submit" type="primary" icon={<PlusOutlined />}>
            Add
          </Button>
        </Form>

        <Table<TranslationRow>
          rowKey={(row) => row.clientKey}
          loading={loading}
          dataSource={rows}
          columns={columns}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 820 }}
        />
      </Space>
    </PageContainer>
  );
}

export function LanguageSettingsPage({
  basePath = '/admin/setting/language',
  title,
}: LanguageSettingsPageProps) {
  const location = useLocation();
  const cleanBasePath = basePath.replace(/\/$/, '');
  const translatePrefix = `${cleanBasePath}/translate/`;
  const translateID = location.pathname.startsWith(translatePrefix)
    ? decodeURIComponent(location.pathname.slice(translatePrefix.length).split('/')[0] || '')
    : '';

  if (translateID) {
    return <LanguageTranslationPage basePath={cleanBasePath} id={translateID} title={title} />;
  }

  return <LanguageListPage basePath={cleanBasePath} title={title} />;
}

export default function AdminLanguageSettings() {
  return <LanguageSettingsPage />;
}
