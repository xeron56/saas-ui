export type AdminNotificationPayload = Record<string, any> & {
  id?: string;
  message?: string;
  url?: string;
  user?: string;
};

export type AdminNotification = {
  id: string;
  tenant_id?: string;
  tenantId?: string;
  type?: string;
  data?: AdminNotificationPayload;
  read_at?: string;
  readAt?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  has_read?: boolean;
  hasRead?: boolean;
  group?: string;
  title?: string;
  desc?: string;
  link?: string;
  source?: string;
  level?: number;
};

export type AdminNotificationListReply = {
  data?: AdminNotification[];
  meta?: {
    current_page?: number;
    currentPage?: number;
    last_page?: number;
    lastPage?: number;
    per_page?: number;
    perPage?: number;
    total?: number;
  };
  extra?: {
    unread_count?: number;
    unreadCount?: number;
  };
};

export type AdminNotificationReply = {
  message?: string;
  data?: AdminNotification;
  redirect_url?: string;
  redirectUrl?: string;
};

export type AdminNotificationReadAllReply = {
  message?: string;
  updated_count?: number;
  updatedCount?: number;
};
