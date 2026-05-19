import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileImageOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import RichTextInput, { sanitizeRichText } from '@/components/RichTextInput';
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
  Tabs,
  Tag,
  Upload,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useMemo, useRef, useState } from 'react';

type ContentKind = 'news' | 'notice';
type TaxonomyKind = 'newsCategory' | 'newsTag' | 'noticeCategory';
type NewsNoticeTab = 'news' | 'notices' | 'news-categories' | 'news-tags' | 'notice-categories';

type LegacyContent = {
  id?: number | string;
  title?: string;
  slug?: string;
  details?: string;
  image?: string | number;
  image_id?: number | string;
  image_url?: string;
  news_category_id?: number | string;
  notice_category_id?: number | string;
  category?: string;
  category_name?: string;
  author?: string;
  author_name?: string;
  user?: string;
  user_name?: string;
  status?: string | number;
  status_id?: string | number;
  status_name?: string;
};

type LegacyTaxonomy = {
  id?: number | string;
  name?: string;
  slug?: string;
  status?: string | number;
  status_id?: string | number;
  status_name?: string;
};

type LegacyTableResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T[];
  recordsTotal?: number;
  recordsFiltered?: number;
};

type ContentFormValues = {
  title?: string;
  category_id?: number | string;
  tag_ids?: Array<number | string>;
  status?: number;
  details?: string;
  image?: UploadFile[];
};

type TaxonomyFormValues = {
  name?: string;
  status?: number;
};

const contentConfigs = {
  news: {
    label: 'News',
    list: '/admin/news/list',
    store: '/admin/news/store',
    update: '/admin/news/update',
    delete: '/admin/news/delete',
    edit: '/admin/news/info',
    categoryField: 'news_category_id',
    detailPath: '/news-details',
  },
  notice: {
    label: 'Notices',
    list: '/admin/notices/list',
    store: '/admin/notices/store',
    update: '/admin/notices/update',
    delete: '/admin/notices/delete',
    edit: '/admin/notices/info',
    categoryField: 'notice_category_id',
    detailPath: '/notice-details',
  },
} as const;

const taxonomyConfigs = {
  newsCategory: {
    label: 'News Categories',
    singleLabel: 'News Category',
    list: '/admin/news/categories/list',
    store: '/admin/news/categories/store',
    update: '/admin/news/categories/update',
    delete: '/admin/news/categories/delete',
    edit: '/admin/news/categories/info',
    hasStatus: true,
  },
  newsTag: {
    label: 'News Tags',
    singleLabel: 'News Tag',
    list: '/admin/news/tags/list',
    store: '/admin/news/tags/store',
    update: '/admin/news/tags/update',
    delete: '/admin/news/tags/delete',
    edit: '/admin/news/tags/info',
    hasStatus: false,
  },
  noticeCategory: {
    label: 'Notice Categories',
    singleLabel: 'Notice Category',
    list: '/admin/notices/categories/list',
    store: '/admin/notices/categories/store',
    update: '/admin/notices/categories/update',
    delete: '/admin/notices/categories/delete',
    edit: '/admin/notices/categories/info',
    hasStatus: true,
  },
} as const;

const tabRoutes: Record<NewsNoticeTab, string> = {
  news: '/admin/news/list',
  notices: '/admin/notices/list',
  'news-categories': '/admin/news/categories/list',
  'news-tags': '/admin/news/tags/list',
  'notice-categories': '/admin/notices/categories/list',
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

function imageSrc(record?: LegacyContent) {
  const raw = textValue(record?.image);
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('/') || raw.startsWith('data:')) {
    return raw;
  }
  return textValue(record?.image_url) || extractImageSrc(record?.image);
}

function statusValue(record?: Pick<LegacyContent | LegacyTaxonomy, 'status' | 'status_id'>) {
  const rawStatus = record?.status_id ?? record?.status;
  const raw = cleanDisplay(rawStatus).toLowerCase();
  if (raw.includes('published') || raw.includes('active')) {
    return 1;
  }
  if (raw.includes('deactivate') || raw.includes('disabled')) {
    return 0;
  }
  const parsed = numericValue(rawStatus);
  if (parsed === 3) {
    return 3;
  }
  return parsed === 1 ? 1 : 0;
}

function statusTag(value: number, category = false) {
  if (value === 1) {
    return <Tag color="green">{category ? 'Active' : 'Published'}</Tag>;
  }
  if (value === 3) {
    return <Tag color="red">Deactivate</Tag>;
  }
  return <Tag color="gold">{category ? 'Deactivate' : 'Deactivate'}</Tag>;
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
  const value = input?.match(/\bvalue=["']([^"']*)["']/i)?.[1];
  return value === undefined ? [] : [decodeHTMLEntities(value)];
}

function legacyHTMLFieldValue(html: string, name: string) {
  return legacyHTMLFieldValues(html, name)[0] || '';
}

function isAllowedImage(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension === 'jpg' || extension === 'jpeg' || extension === 'png';
}

function rowID(record?: { id?: string | number }) {
  return textValue(record?.id);
}

function categoryID(kind: ContentKind, record?: LegacyContent) {
  if (kind === 'news') {
    return textValue(record?.news_category_id);
  }
  return textValue(record?.notice_category_id);
}

function buildContentFormData(
  kind: ContentKind,
  values: ContentFormValues,
  current?: LegacyContent,
) {
  const formData = new FormData();
  formData.append('title', textValue(values.title));
  formData.append('category_id', textValue(values.category_id));
  formData.append('status', String(values.status ?? 1));
  formData.append('details', sanitizeRichText(textValue(values.details)));
  if (kind === 'news') {
    (values.tag_ids || []).forEach((tagID) => formData.append('tag_ids[]', textValue(tagID)));
  }
  const image = selectedFile(values.image);
  if (image) {
    formData.append('image', image);
  } else if (current?.image_id) {
    formData.append('image_id', textValue(current.image_id));
  }
  return formData;
}

function extractSelectedTagIDs(html: string) {
  return legacyHTMLFieldValues(html, 'tag_ids[]');
}

type DirectEditRoute =
  | {
      key: string;
      mode: 'content';
      kind: ContentKind;
      id: string;
      endpoint: string;
      listPath: string;
      tab: NewsNoticeTab;
    }
  | {
      key: string;
      mode: 'taxonomy';
      kind: TaxonomyKind;
      id: string;
      endpoint: string;
      listPath: string;
      tab: NewsNoticeTab;
    };

function safeDecodePathSegment(value?: string) {
  if (!value) {
    return '';
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function directEditRouteFromPath(pathname: string): DirectEditRoute | undefined {
  const routePatterns: Array<{
    pattern: RegExp;
    route: Omit<DirectEditRoute, 'id' | 'key'>;
  }> = [
    {
      pattern: /^\/admin\/news\/info\/([^/]+)\/?$/,
      route: {
        mode: 'content',
        kind: 'news',
        endpoint: contentConfigs.news.edit,
        listPath: tabRoutes.news,
        tab: 'news',
      },
    },
    {
      pattern: /^\/admin\/notices\/info\/([^/]+)\/?$/,
      route: {
        mode: 'content',
        kind: 'notice',
        endpoint: contentConfigs.notice.edit,
        listPath: tabRoutes.notices,
        tab: 'notices',
      },
    },
    {
      pattern: /^\/admin\/news\/categories\/info\/([^/]+)\/?$/,
      route: {
        mode: 'taxonomy',
        kind: 'newsCategory',
        endpoint: taxonomyConfigs.newsCategory.edit,
        listPath: tabRoutes['news-categories'],
        tab: 'news-categories',
      },
    },
    {
      pattern: /^\/admin\/news\/tags\/info\/([^/]+)\/?$/,
      route: {
        mode: 'taxonomy',
        kind: 'newsTag',
        endpoint: taxonomyConfigs.newsTag.edit,
        listPath: tabRoutes['news-tags'],
        tab: 'news-tags',
      },
    },
    {
      pattern: /^\/admin\/notices\/categories\/info\/([^/]+)\/?$/,
      route: {
        mode: 'taxonomy',
        kind: 'noticeCategory',
        endpoint: taxonomyConfigs.noticeCategory.edit,
        listPath: tabRoutes['notice-categories'],
        tab: 'notice-categories',
      },
    },
  ];

  for (const item of routePatterns) {
    const match = pathname.match(item.pattern);
    const id = safeDecodePathSegment(match?.[1]);
    if (id) {
      return { ...item.route, id, key: `${item.route.mode}:${item.route.kind}:${id}` };
    }
  }
  return undefined;
}

function contentFromEditHTML(
  html: string,
  kind: ContentKind,
  fallbackID: string,
): LegacyContent | undefined {
  const title = legacyHTMLFieldValue(html, 'title');
  const categoryIDValue = legacyHTMLFieldValue(html, 'category_id');
  const details = legacyHTMLFieldValue(html, 'details');
  if (!title && !details) {
    return undefined;
  }
  return {
    id: fallbackID,
    title,
    details,
    status: legacyHTMLFieldValue(html, 'status'),
    ...(kind === 'news'
      ? { news_category_id: categoryIDValue }
      : { notice_category_id: categoryIDValue }),
  };
}

function taxonomyFromEditHTML(html: string, fallbackID: string): LegacyTaxonomy | undefined {
  const name = legacyHTMLFieldValue(html, 'name');
  if (!name) {
    return undefined;
  }
  return {
    id: fallbackID,
    name,
    status: legacyHTMLFieldValue(html, 'status'),
  };
}

async function fetchSelectedNewsTags(id: string) {
  const html = await request<string>(`${contentConfigs.news.edit}/${encodeURIComponent(id)}`, {
    responseType: 'text',
  });
  return extractSelectedTagIDs(textValue(html));
}

async function postLegacy<T>(endpoint: string, data: Record<string, unknown> | FormData) {
  return request<LegacyTableResponse<T>>(endpoint, {
    method: 'POST',
    data,
  });
}

function tabFromPath(pathname: string): NewsNoticeTab {
  if (pathname.includes('/admin/news/categories')) {
    return 'news-categories';
  }
  if (pathname.includes('/admin/news/tags')) {
    return 'news-tags';
  }
  if (pathname.includes('/admin/notices/categories')) {
    return 'notice-categories';
  }
  if (pathname.includes('/admin/notices')) {
    return 'notices';
  }
  return 'news';
}

export default function AdminNewsNotice() {
  const location = useLocation();
  const openedDirectRef = useRef('');
  const [contentForm] = Form.useForm<ContentFormValues>();
  const [taxonomyForm] = Form.useForm<TaxonomyFormValues>();
  const [activeTab, setActiveTab] = useState<NewsNoticeTab>(tabFromPath(location.pathname));
  const [newsRows, setNewsRows] = useState<LegacyContent[]>([]);
  const [noticeRows, setNoticeRows] = useState<LegacyContent[]>([]);
  const [newsCategories, setNewsCategories] = useState<LegacyTaxonomy[]>([]);
  const [newsTags, setNewsTags] = useState<LegacyTaxonomy[]>([]);
  const [noticeCategories, setNoticeCategories] = useState<LegacyTaxonomy[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [contentDrawerOpen, setContentDrawerOpen] = useState(false);
  const [taxonomyDrawerOpen, setTaxonomyDrawerOpen] = useState(false);
  const [contentKind, setContentKind] = useState<ContentKind>('news');
  const [taxonomyKind, setTaxonomyKind] = useState<TaxonomyKind>('newsCategory');
  const [currentContent, setCurrentContent] = useState<LegacyContent | undefined>();
  const [currentTaxonomy, setCurrentTaxonomy] = useState<LegacyTaxonomy | undefined>();
  const [error, setError] = useState('');
  const directRoute = useMemo(
    () => directEditRouteFromPath(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    setActiveTab(tabFromPath(location.pathname));
  }, [location.pathname]);

  const setTableLoading = (key: string, value: boolean) => {
    setLoading((current) => ({ ...current, [key]: value }));
  };

  const loadContent = async (kind: ContentKind) => {
    const config = contentConfigs[kind];
    setTableLoading(kind, true);
    setError('');
    try {
      const body = await request<LegacyTableResponse<LegacyContent>>(`${config.list}?ajax=1`);
      if (kind === 'news') {
        setNewsRows(Array.isArray(body.data) ? body.data : []);
      } else {
        setNoticeRows(Array.isArray(body.data) ? body.data : []);
      }
    } catch (err: any) {
      setError(err?.message || `${config.label} could not be loaded.`);
      if (kind === 'news') {
        setNewsRows([]);
      } else {
        setNoticeRows([]);
      }
    } finally {
      setTableLoading(kind, false);
    }
  };

  const loadTaxonomy = async (kind: TaxonomyKind) => {
    const config = taxonomyConfigs[kind];
    setTableLoading(kind, true);
    setError('');
    try {
      const body = await request<LegacyTableResponse<LegacyTaxonomy>>(
        `${config.list}?ajax=1&length=1000`,
      );
      const rows = Array.isArray(body.data) ? body.data : [];
      if (kind === 'newsCategory') {
        setNewsCategories(rows);
      } else if (kind === 'newsTag') {
        setNewsTags(rows);
      } else {
        setNoticeCategories(rows);
      }
    } catch (err: any) {
      setError(err?.message || `${config.label} could not be loaded.`);
      if (kind === 'newsCategory') {
        setNewsCategories([]);
      } else if (kind === 'newsTag') {
        setNewsTags([]);
      } else {
        setNoticeCategories([]);
      }
    } finally {
      setTableLoading(kind, false);
    }
  };

  const loadAll = async () => {
    await Promise.all([
      loadContent('news'),
      loadContent('notice'),
      loadTaxonomy('newsCategory'),
      loadTaxonomy('newsTag'),
      loadTaxonomy('noticeCategory'),
    ]);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const contentCategoryOptions = (kind: ContentKind) =>
    (kind === 'news' ? newsCategories : noticeCategories).map((item) => ({
      label: cleanDisplay(item.name),
      value: rowID(item),
    }));

  const tagOptions = newsTags.map((item) => ({
    label: cleanDisplay(item.name),
    value: rowID(item),
  }));

  const contentRows = (kind: ContentKind) => (kind === 'news' ? newsRows : noticeRows);

  const taxonomyRows = (kind: TaxonomyKind) => {
    if (kind === 'newsCategory') {
      return newsCategories;
    }
    if (kind === 'newsTag') {
      return newsTags;
    }
    return noticeCategories;
  };

  const findRow = <T extends { id?: string | number }>(rows: T[], id: string) =>
    rows.find((row) => rowID(row) === id);

  const openCreateContent = (kind: ContentKind) => {
    setContentKind(kind);
    setCurrentContent(undefined);
    contentForm.resetFields();
    contentForm.setFieldsValue({ status: 1, tag_ids: [], image: [] });
    setContentDrawerOpen(true);
  };

  const openEditContent = async (kind: ContentKind, record: LegacyContent) => {
    setContentKind(kind);
    setCurrentContent(record);
    contentForm.setFieldsValue({
      title: cleanDisplay(record.title),
      category_id: categoryID(kind, record),
      status: statusValue(record),
      details: sanitizeRichText(textValue(record.details)),
      tag_ids: [],
      image: [],
    });
    setContentDrawerOpen(true);
    if (kind === 'news') {
      const id = rowID(record);
      if (!id) {
        return;
      }
      try {
        const tagIDs = await fetchSelectedNewsTags(id);
        contentForm.setFieldsValue({ tag_ids: tagIDs });
      } catch {
        contentForm.setFieldsValue({ tag_ids: [] });
      }
    }
  };

  const openEditContentRoute = (kind: ContentKind, record: LegacyContent) => {
    const id = rowID(record);
    if (!id) {
      return;
    }
    openedDirectRef.current = `content:${kind}:${id}`;
    history.push(`${contentConfigs[kind].edit}/${encodeURIComponent(id)}`);
    void openEditContent(kind, record);
  };

  const closeContentDrawer = () => {
    setContentDrawerOpen(false);
    setCurrentContent(undefined);
    contentForm.resetFields();
    if (directRoute?.mode === 'content') {
      history.replace(directRoute.listPath);
    }
  };

  const openDirectContent = async (route: Extract<DirectEditRoute, { mode: 'content' }>) => {
    const loaded = findRow(contentRows(route.kind), route.id);
    if (loaded) {
      await openEditContent(route.kind, loaded);
      return;
    }

    setContentKind(route.kind);
    setError('');
    try {
      const html = await request<string>(`${route.endpoint}/${encodeURIComponent(route.id)}`, {
        responseType: 'text',
      });
      const item = contentFromEditHTML(textValue(html), route.kind, route.id);
      if (!item) {
        setError(`${contentConfigs[route.kind].label} could not be loaded.`);
        return;
      }
      setCurrentContent(item);
      contentForm.setFieldsValue({
        title: cleanDisplay(item.title),
        category_id: categoryID(route.kind, item),
        status: statusValue(item),
        details: sanitizeRichText(textValue(item.details)),
        tag_ids: route.kind === 'news' ? extractSelectedTagIDs(textValue(html)) : [],
        image: [],
      });
      setContentDrawerOpen(true);
    } catch (err: any) {
      setError(err?.message || `${contentConfigs[route.kind].label} could not be loaded.`);
    }
  };

  const submitContent = async (values: ContentFormValues) => {
    const config = contentConfigs[contentKind];
    const id = rowID(currentContent);
    setSaving(true);
    setError('');
    try {
      const response = await postLegacy<LegacyContent>(
        id ? `${config.update}/${encodeURIComponent(id)}` : config.store,
        buildContentFormData(contentKind, values, currentContent),
      );
      if (response.status === false) {
        setError(textValue(response.message) || `${config.label} could not be saved.`);
        return;
      }
      toast.success(textValue(response.message) || `${config.label} saved.`);
      closeContentDrawer();
      await loadContent(contentKind);
    } catch (err: any) {
      setError(err?.message || `${config.label} could not be saved.`);
    } finally {
      setSaving(false);
    }
  };

  const deleteContent = async (kind: ContentKind, record: LegacyContent) => {
    const id = rowID(record);
    if (!id) {
      return;
    }
    const config = contentConfigs[kind];
    setError('');
    try {
      const response = await postLegacy<LegacyContent>(
        `${config.delete}/${encodeURIComponent(id)}`,
        {},
      );
      if (response.status === false) {
        setError(textValue(response.message) || `${config.label} could not be deleted.`);
        return;
      }
      toast.success(textValue(response.message) || `${config.label} deleted.`);
      await loadContent(kind);
    } catch (err: any) {
      setError(err?.message || `${config.label} could not be deleted.`);
    }
  };

  const openCreateTaxonomy = (kind: TaxonomyKind) => {
    setTaxonomyKind(kind);
    setCurrentTaxonomy(undefined);
    taxonomyForm.resetFields();
    taxonomyForm.setFieldsValue({ status: 1 });
    setTaxonomyDrawerOpen(true);
  };

  const openEditTaxonomy = (kind: TaxonomyKind, record: LegacyTaxonomy) => {
    setTaxonomyKind(kind);
    setCurrentTaxonomy(record);
    taxonomyForm.setFieldsValue({
      name: cleanDisplay(record.name),
      status: statusValue(record),
    });
    setTaxonomyDrawerOpen(true);
  };

  const openEditTaxonomyRoute = (kind: TaxonomyKind, record: LegacyTaxonomy) => {
    const id = rowID(record);
    if (!id) {
      return;
    }
    openedDirectRef.current = `taxonomy:${kind}:${id}`;
    history.push(`${taxonomyConfigs[kind].edit}/${encodeURIComponent(id)}`);
    openEditTaxonomy(kind, record);
  };

  const closeTaxonomyDrawer = () => {
    setTaxonomyDrawerOpen(false);
    setCurrentTaxonomy(undefined);
    taxonomyForm.resetFields();
    if (directRoute?.mode === 'taxonomy') {
      history.replace(directRoute.listPath);
    }
  };

  const openDirectTaxonomy = async (route: Extract<DirectEditRoute, { mode: 'taxonomy' }>) => {
    const loaded = findRow(taxonomyRows(route.kind), route.id);
    if (loaded) {
      openEditTaxonomy(route.kind, loaded);
      return;
    }

    setTaxonomyKind(route.kind);
    setError('');
    try {
      const html = await request<string>(`${route.endpoint}/${encodeURIComponent(route.id)}`, {
        responseType: 'text',
      });
      const item = taxonomyFromEditHTML(textValue(html), route.id);
      if (!item) {
        setError(`${taxonomyConfigs[route.kind].singleLabel} could not be loaded.`);
        return;
      }
      setCurrentTaxonomy(item);
      taxonomyForm.setFieldsValue({
        name: cleanDisplay(item.name),
        status: statusValue(item),
      });
      setTaxonomyDrawerOpen(true);
    } catch (err: any) {
      setError(err?.message || `${taxonomyConfigs[route.kind].singleLabel} could not be loaded.`);
    }
  };

  useEffect(() => {
    if (!directRoute) {
      openedDirectRef.current = '';
      return;
    }
    if (openedDirectRef.current === directRoute.key) {
      return;
    }
    openedDirectRef.current = directRoute.key;
    setActiveTab(directRoute.tab);
    if (directRoute.mode === 'content') {
      void openDirectContent(directRoute);
    } else {
      void openDirectTaxonomy(directRoute);
    }
  }, [directRoute]);

  const submitTaxonomy = async (values: TaxonomyFormValues) => {
    const config = taxonomyConfigs[taxonomyKind];
    const id = rowID(currentTaxonomy);
    const data: Record<string, unknown> = { name: textValue(values.name) };
    if (config.hasStatus) {
      data.status = values.status ?? 1;
    }
    setSaving(true);
    setError('');
    try {
      const response = await postLegacy<LegacyTaxonomy>(
        id ? `${config.update}/${encodeURIComponent(id)}` : config.store,
        data,
      );
      if (response.status === false) {
        setError(textValue(response.message) || `${config.singleLabel} could not be saved.`);
        return;
      }
      toast.success(textValue(response.message) || `${config.singleLabel} saved.`);
      closeTaxonomyDrawer();
      await loadTaxonomy(taxonomyKind);
    } catch (err: any) {
      setError(err?.message || `${config.singleLabel} could not be saved.`);
    } finally {
      setSaving(false);
    }
  };

  const deleteTaxonomy = async (kind: TaxonomyKind, record: LegacyTaxonomy) => {
    const id = rowID(record);
    if (!id) {
      return;
    }
    const config = taxonomyConfigs[kind];
    setError('');
    try {
      const response = await postLegacy<LegacyTaxonomy>(
        `${config.delete}/${encodeURIComponent(id)}`,
        {},
      );
      if (response.status === false) {
        setError(textValue(response.message) || `${config.singleLabel} could not be deleted.`);
        return;
      }
      toast.success(textValue(response.message) || `${config.singleLabel} deleted.`);
      await loadTaxonomy(kind);
    } catch (err: any) {
      setError(err?.message || `${config.singleLabel} could not be deleted.`);
    }
  };

  const contentColumns = (kind: ContentKind): ColumnsType<LegacyContent> => {
    const config = contentConfigs[kind];
    return [
      {
        title: 'Image',
        width: 92,
        render: (_, record) => {
          const src = imageSrc(record);
          return src ? (
            <Image width={44} height={44} src={src} preview={false} />
          ) : (
            <FileImageOutlined />
          );
        },
      },
      {
        title: 'Title',
        render: (_, record) => cleanDisplay(record.title) || '-',
      },
      {
        title: 'Category',
        width: 160,
        render: (_, record) =>
          cleanDisplay(record.category) || cleanDisplay(record.category_name) || '-',
      },
      {
        title: kind === 'news' ? 'Author' : 'User',
        width: 150,
        render: (_, record) =>
          cleanDisplay(record.author) ||
          cleanDisplay(record.author_name) ||
          cleanDisplay(record.user) ||
          cleanDisplay(record.user_name) ||
          '-',
      },
      {
        title: 'Status',
        width: 128,
        render: (_, record) => statusTag(statusValue(record)),
      },
      {
        title: 'Action',
        key: 'action',
        width: 240,
        render: (_, record) => {
          const slug = textValue(record.slug);
          return (
            <Space wrap>
              {slug ? (
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  href={`${config.detailPath}/${encodeURIComponent(slug)}`}
                >
                  View
                </Button>
              ) : null}
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEditContentRoute(kind, record)}
              >
                Edit
              </Button>
              <Popconfirm
                title={`Delete this ${kind === 'news' ? 'news item' : 'notice'}?`}
                onConfirm={() => deleteContent(kind, record)}
              >
                <Button size="small" danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            </Space>
          );
        },
      },
    ];
  };

  const taxonomyColumns = (kind: TaxonomyKind): ColumnsType<LegacyTaxonomy> => {
    const config = taxonomyConfigs[kind];
    return [
      {
        title: 'Name',
        render: (_, record) => cleanDisplay(record.name) || '-',
      },
      ...(config.hasStatus
        ? [
            {
              title: 'Status',
              width: 128,
              render: (_: unknown, record: LegacyTaxonomy) => statusTag(statusValue(record), true),
            },
          ]
        : []),
      {
        title: 'Action',
        key: 'action',
        width: 180,
        render: (_, record) => (
          <Space wrap>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditTaxonomyRoute(kind, record)}
            >
              Edit
            </Button>
            <Popconfirm
              title={`Delete this ${config.singleLabel.toLowerCase()}?`}
              onConfirm={() => deleteTaxonomy(kind, record)}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];
  };

  const renderContentTable = (kind: ContentKind, rows: LegacyContent[]) => {
    const config = contentConfigs[kind];
    return (
      <Table<LegacyContent>
        rowKey={(record) => rowID(record)}
        loading={loading[kind]}
        dataSource={rows}
        columns={contentColumns(kind)}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 960 }}
        title={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <strong>{config.label}</strong>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => loadContent(kind)}>
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openCreateContent(kind)}
              >
                New
              </Button>
            </Space>
          </div>
        )}
      />
    );
  };

  const renderTaxonomyTable = (kind: TaxonomyKind, rows: LegacyTaxonomy[]) => {
    const config = taxonomyConfigs[kind];
    return (
      <Table<LegacyTaxonomy>
        rowKey={(record) => rowID(record)}
        loading={loading[kind]}
        dataSource={rows}
        columns={taxonomyColumns(kind)}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 520 }}
        title={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <strong>{config.label}</strong>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => loadTaxonomy(kind)}>
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openCreateTaxonomy(kind)}
              >
                New
              </Button>
            </Space>
          </div>
        )}
      />
    );
  };

  const currentImage = imageSrc(currentContent);
  const currentTaxonomyConfig = taxonomyConfigs[taxonomyKind];

  return (
    <PageContainer>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          const nextTab = key as NewsNoticeTab;
          setActiveTab(nextTab);
          history.push(tabRoutes[nextTab]);
        }}
        items={[
          {
            key: 'news',
            label: 'News',
            children: renderContentTable('news', newsRows),
          },
          {
            key: 'notices',
            label: 'Notices',
            children: renderContentTable('notice', noticeRows),
          },
          {
            key: 'news-categories',
            label: 'News Categories',
            children: renderTaxonomyTable('newsCategory', newsCategories),
          },
          {
            key: 'news-tags',
            label: 'News Tags',
            children: renderTaxonomyTable('newsTag', newsTags),
          },
          {
            key: 'notice-categories',
            label: 'Notice Categories',
            children: renderTaxonomyTable('noticeCategory', noticeCategories),
          },
        ]}
      />

      <Drawer
        width={560}
        title={`${currentContent ? 'Edit' : 'New'} ${contentKind === 'news' ? 'News' : 'Notice'}`}
        open={contentDrawerOpen}
        onClose={closeContentDrawer}
        destroyOnClose
      >
        {currentImage ? (
          <Image
            width={104}
            height={76}
            src={currentImage}
            preview={false}
            style={{ marginBottom: 16, objectFit: 'cover' }}
          />
        ) : null}
        <Form
          form={contentForm}
          layout="vertical"
          requiredMark={false}
          onFinish={submitContent}
          initialValues={{ status: 1, tag_ids: [], image: [] }}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category_id" label="Category" rules={[{ required: true }]}>
            <Select
              options={contentCategoryOptions(contentKind)}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          {contentKind === 'news' ? (
            <Form.Item name="tag_ids" label="Tags" rules={[{ required: true }]}>
              <Select mode="multiple" options={tagOptions} showSearch optionFilterProp="label" />
            </Form.Item>
          ) : null}
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: contentKind === 'news' ? 'Published' : 'Publish', value: 1 },
                { label: 'Deactivate', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="details" label="Details" rules={[{ required: true }]}>
            <RichTextInput rows={8} />
          </Form.Item>
          <Form.Item
            name="image"
            label="Image"
            valuePropName="fileList"
            getValueFromEvent={normalizeUploadEvent}
            rules={currentContent ? [] : [{ required: true, message: 'Image is required.' }]}
          >
            <Upload
              beforeUpload={(file) => {
                if (!isAllowedImage(file)) {
                  toast.error('Image must be JPG or PNG.');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              maxCount={1}
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            >
              <Button icon={<UploadOutlined />}>Choose image</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
            {currentContent ? 'Update' : 'Create'}
          </Button>
        </Form>
      </Drawer>

      <Drawer
        width={440}
        title={`${currentTaxonomy ? 'Edit' : 'New'} ${currentTaxonomyConfig.singleLabel}`}
        open={taxonomyDrawerOpen}
        onClose={closeTaxonomyDrawer}
        destroyOnClose
      >
        <Form
          form={taxonomyForm}
          layout="vertical"
          requiredMark={false}
          onFinish={submitTaxonomy}
          initialValues={{ status: 1 }}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {currentTaxonomyConfig.hasStatus ? (
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: 'Active', value: 1 },
                  { label: 'Deactivate', value: 0 },
                ]}
              />
            </Form.Item>
          ) : null}
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
            {currentTaxonomy ? 'Update' : 'Create'}
          </Button>
        </Form>
      </Drawer>
    </PageContainer>
  );
}
