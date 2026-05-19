import {
  DeleteOutlined,
  EditOutlined,
  PictureOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation } from '@umijs/max';
import {
  Alert,
  Button,
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
import { useEffect, useRef, useState } from 'react';

const galleryEndpoint = '/admin/setting/website-settings/image-galleries';

type ImageGallery = {
  id?: number | string;
  caption?: string;
  photo?: string | number;
  photo_id?: number | string;
  photo_url?: string;
  status?: string | number;
};

type LegacyTableResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T[];
  recordsTotal?: number;
  recordsFiltered?: number;
};

type GalleryFormValues = {
  caption?: string;
  status?: number;
  photo?: UploadFile[];
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
  const plain = cleanDisplay(value).replace(/[^0-9.-]/g, '');
  const parsed = Number(plain);
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractImageSrc(html: unknown) {
  const match = textValue(html).match(/\bsrc=["']([^"']+)["']/i);
  return match?.[1] || '';
}

function directEditIDFromPath(pathname: string) {
  const match = pathname.match(
    /\/admin\/setting\/website-settings\/image-galleries\/edit\/([^/?#]+)/,
  );
  if (!match?.[1]) {
    return '';
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function legacyHTMLInputValue(html: string, name: string) {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const field = doc.querySelector(`[name="${name}"]`) as HTMLInputElement | null;
    return textValue(field?.value);
  }
  const input = html.match(new RegExp(`<input[^>]*name=["']${name}["'][^>]*>`, 'i'))?.[0] || '';
  return input.match(/\bvalue=["']([^"']*)["']/i)?.[1] || '';
}

function galleryFromEditHTML(html: string, fallbackID: string): ImageGallery | undefined {
  const id = legacyHTMLInputValue(html, 'id') || fallbackID;
  const caption = legacyHTMLInputValue(html, 'caption');
  const photo = extractImageSrc(html);
  if (!caption && !photo) {
    return undefined;
  }
  return { id, caption, photo_url: photo, status: 1 };
}

function photoSrc(record?: ImageGallery) {
  return textValue(record?.photo_url) || extractImageSrc(record?.photo) || textValue(record?.photo);
}

function statusValue(record?: ImageGallery) {
  const raw = cleanDisplay(record?.status).toLowerCase();
  if (raw.includes('active') && !raw.includes('deactivate')) {
    return 1;
  }
  const parsed = numericValue(record?.status);
  return parsed === 0 ? 0 : 1;
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

function isAllowedPhoto(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension === 'jpg' || extension === 'jpeg' || extension === 'png';
}

function buildGalleryFormData(values: GalleryFormValues, current?: ImageGallery) {
  const formData = new FormData();
  formData.append('caption', textValue(values.caption));
  formData.append('status', String(values.status ?? 1));

  const photo = selectedFile(values.photo);
  if (photo) {
    formData.append('photo', photo);
  } else if (current?.photo_id) {
    formData.append('photo_id', textValue(current.photo_id));
  }
  return formData;
}

async function mutateGallery(
  endpoint: string,
  values: GalleryFormValues,
  current: ImageGallery | undefined,
  method: 'POST' | 'PATCH',
) {
  return request<LegacyTableResponse<ImageGallery>>(endpoint, {
    method,
    data: buildGalleryFormData(values, current),
  });
}

async function postLegacy(endpoint: string, data: Record<string, unknown>) {
  return request<LegacyTableResponse<ImageGallery>>(endpoint, {
    method: 'POST',
    data,
  });
}

export default function AdminImageGallery() {
  const location = useLocation();
  const directEditID = directEditIDFromPath(location.pathname);
  const openedDirectEditRef = useRef('');
  const [form] = Form.useForm<GalleryFormValues>();
  const [rows, setRows] = useState<ImageGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<ImageGallery | undefined>();
  const [error, setError] = useState('');

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyTableResponse<ImageGallery>>(`${galleryEndpoint}?ajax=1`);
      setRows(Array.isArray(body.data) ? body.data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load gallery images.');
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
    form.setFieldsValue({ status: 1, photo: [] });
    setDrawerOpen(true);
  };

  const openEdit = (record: ImageGallery) => {
    setCurrent(record);
    form.setFieldsValue({
      caption: cleanDisplay(record.caption),
      status: statusValue(record),
      photo: [],
    });
    setDrawerOpen(true);
  };

  const openEditRoute = (record: ImageGallery) => {
    const id = textValue(record.id);
    if (!id) {
      openEdit(record);
      return;
    }
    openedDirectEditRef.current = id;
    history.push(`${galleryEndpoint}/edit/${encodeURIComponent(id)}`);
    openEdit(record);
  };

  const openDirectEdit = async (id: string) => {
    const record = rows.find((item) => textValue(item.id) === id);
    if (record) {
      openEdit(record);
      return;
    }
    setError('');
    try {
      const html = await request<string>(`${galleryEndpoint}/edit/${encodeURIComponent(id)}`, {
        responseType: 'text',
      });
      const item = galleryFromEditHTML(textValue(html), id);
      if (!item) {
        setError('Gallery image could not be loaded.');
        return;
      }
      openEdit(item);
    } catch (err: any) {
      setError(err?.message || 'Gallery image could not be loaded.');
    }
  };

  useEffect(() => {
    if (!directEditID) {
      openedDirectEditRef.current = '';
      return;
    }
    if (loading) {
      return;
    }
    if (openedDirectEditRef.current === directEditID) {
      return;
    }
    openedDirectEditRef.current = directEditID;
    openDirectEdit(directEditID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directEditID, loading, rows]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrent(undefined);
    form.resetFields();
    if (directEditID) {
      history.replace(galleryEndpoint);
    }
  };

  const submitGallery = async (values: GalleryFormValues) => {
    setSaving(true);
    setError('');
    try {
      const id = textValue(current?.id);
      const response = await mutateGallery(
        id ? `${galleryEndpoint}/update/${encodeURIComponent(id)}` : galleryEndpoint,
        values,
        current,
        id ? 'PATCH' : 'POST',
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Gallery image could not be saved.');
        return;
      }
      toast.success(textValue(response.message) || 'Gallery image saved.');
      closeDrawer();
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Gallery image could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const deleteGallery = async (record: ImageGallery) => {
    const id = textValue(record.id);
    if (!id) {
      return;
    }
    setError('');
    try {
      const response = await postLegacy(`${galleryEndpoint}/delete/${encodeURIComponent(id)}`, {});
      if (response.status === false) {
        setError(textValue(response.message) || 'Gallery image could not be deleted.');
        return;
      }
      toast.success(textValue(response.message) || 'Gallery image deleted.');
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Gallery image could not be deleted.');
    }
  };

  const columns: ColumnsType<ImageGallery> = [
    {
      title: 'Photo',
      width: 96,
      render: (_, record) => {
        const src = photoSrc(record);
        return src ? (
          <Image width={44} height={44} src={src} preview={false} />
        ) : (
          <PictureOutlined />
        );
      },
    },
    {
      title: 'Caption',
      render: (_, record) => cleanDisplay(record.caption) || '-',
    },
    {
      title: 'Status',
      width: 120,
      render: (_, record) => (
        <Tag color={statusValue(record) === 1 ? 'green' : 'gold'}>
          {statusValue(record) === 1 ? 'Active' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditRoute(record)}>
            Edit
          </Button>
          <Popconfirm title="Delete this gallery image?" onConfirm={() => deleteGallery(record)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const currentPhoto = photoSrc(current);

  return (
    <PageContainer>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Table<ImageGallery>
        rowKey={(record) => textValue(record.id)}
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 640 }}
        title={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <strong>Image Gallery</strong>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadRows}>
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                New
              </Button>
            </Space>
          </div>
        )}
      />

      <Drawer
        width={520}
        title={current ? 'Edit Gallery Image' : 'New Gallery Image'}
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
      >
        {currentPhoto ? (
          <Image
            width={96}
            height={72}
            src={currentPhoto}
            preview={false}
            style={{ marginBottom: 16, objectFit: 'cover' }}
          />
        ) : null}
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={submitGallery}
          initialValues={{ status: 1, photo: [] }}
        >
          <Form.Item name="caption" label="Caption" rules={[{ required: true, max: 195 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Active', value: 1 },
                { label: 'Pending', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="photo"
            label="Photo"
            valuePropName="fileList"
            getValueFromEvent={normalizeUploadEvent}
            rules={current ? [] : [{ required: true, message: 'Photo is required.' }]}
          >
            <Upload
              beforeUpload={(file) => {
                if (!isAllowedPhoto(file)) {
                  toast.error('Photo must be JPG or PNG.');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              maxCount={1}
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            >
              <Button icon={<UploadOutlined />}>Choose photo</Button>
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
