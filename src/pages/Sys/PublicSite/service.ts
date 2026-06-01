import { request } from '@umijs/max';
import type {
  PublicSiteComment,
  PublicSiteAssetReply,
  PublicSiteDeleteReply,
  PublicSiteEntry,
  PublicSiteEntryKind,
  PublicSiteEntryReply,
  PublicSiteListReply,
  PublicSiteMessage,
  PublicSitePageReply,
  PublicSiteSettingReply,
} from './types';

export const publicSiteKindRoutes: Record<PublicSiteEntryKind, string> = {
  banner: 'banners',
  feature: 'features',
  interface: 'interfaces',
  testimonial: 'testimonials',
  blog: 'blogs',
};

const adminUrl = (path: string) => `/v1/sys/public-site/${path}`;

export async function listPublicSiteEntries(
  kind: PublicSiteEntryKind,
  params?: Record<string, any>,
) {
  return request<PublicSiteListReply<PublicSiteEntry>>(adminUrl(publicSiteKindRoutes[kind]), {
    params,
  });
}

export async function createPublicSiteEntry(kind: PublicSiteEntryKind, data: Record<string, any>) {
  return request<PublicSiteEntryReply>(adminUrl(publicSiteKindRoutes[kind]), {
    method: 'POST',
    data,
  });
}

export async function updatePublicSiteEntry(
  kind: PublicSiteEntryKind,
  id: string,
  data: Record<string, any>,
) {
  return request<PublicSiteEntryReply>(adminUrl(`${publicSiteKindRoutes[kind]}/${id}`), {
    method: 'PUT',
    data,
  });
}

export async function updatePublicSiteEntryStatus(
  kind: PublicSiteEntryKind,
  id: string,
  status: boolean,
) {
  return request<PublicSiteEntryReply>(adminUrl(`${publicSiteKindRoutes[kind]}/status/${id}`), {
    method: 'POST',
    data: { status },
  });
}

export async function deletePublicSiteEntry(kind: PublicSiteEntryKind, id: string) {
  return request<PublicSiteDeleteReply>(adminUrl(`${publicSiteKindRoutes[kind]}/${id}`), {
    method: 'DELETE',
  });
}

export async function deletePublicSiteEntries(kind: PublicSiteEntryKind, ids: string[]) {
  return request<PublicSiteDeleteReply>(adminUrl(`${publicSiteKindRoutes[kind]}/delete-all`), {
    method: 'POST',
    data: { ids },
  });
}

export async function uploadPublicSiteAsset(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<PublicSiteAssetReply>(adminUrl('assets'), {
    method: 'POST',
    data: formData,
  });
}

export async function getWebsiteSettings() {
  return request<PublicSiteSettingReply>(adminUrl('settings'));
}

export async function updateWebsiteSettings(value: Record<string, any>) {
  return request<PublicSiteSettingReply>(adminUrl('settings/manage-pages'), {
    method: 'PUT',
    data: { value },
  });
}

export async function updateWebsiteSettingsForm(data: FormData) {
  return request<PublicSiteSettingReply>(adminUrl('settings/manage-pages'), {
    method: 'PUT',
    data,
  });
}

export async function getLegalPage(route: 'privacy-policy' | 'term-conditions') {
  return request<PublicSitePageReply>(adminUrl(`pages/${route}`));
}

export async function saveLegalPage(
  route: 'privacy-policy' | 'term-conditions',
  data: Record<string, any>,
) {
  return request<PublicSitePageReply>(adminUrl(`pages/${route}`), {
    method: 'POST',
    data,
  });
}

export async function listMessages(params?: Record<string, any>) {
  return request<PublicSiteListReply<PublicSiteMessage>>(adminUrl('messages'), { params });
}

export async function deleteMessage(id: string) {
  return request<PublicSiteDeleteReply>(adminUrl(`messages/${id}`), { method: 'DELETE' });
}

export async function deleteMessages(ids: string[]) {
  return request<PublicSiteDeleteReply>(adminUrl('messages/delete-all'), {
    method: 'POST',
    data: { ids },
  });
}

export async function listBlogComments(blogId: string, params?: Record<string, any>) {
  return request<PublicSiteListReply<PublicSiteComment>>(adminUrl(`blogs/${blogId}/comments`), {
    params,
  });
}

export async function deleteComment(id: string) {
  return request<PublicSiteDeleteReply>(adminUrl(`comments/${id}`), { method: 'DELETE' });
}

export async function deleteComments(ids: string[]) {
  return request<PublicSiteDeleteReply>(adminUrl('comments/delete-all'), {
    method: 'POST',
    data: { ids },
  });
}
