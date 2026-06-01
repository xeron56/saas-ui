export type BusinessSegment = {
  id: string;
  name?: string;
  display_name?: string;
  displayName?: string;
  description?: string;
  status?: boolean;
  active?: boolean;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

export type BusinessSegmentListReply = {
  data?: BusinessSegment[];
  meta?: {
    current_page?: number;
    currentPage?: number;
    last_page?: number;
    lastPage?: number;
    per_page?: number;
    perPage?: number;
    total?: number;
    filter_size?: number;
    filterSize?: number;
  };
};

export type BusinessSegmentReply = {
  message?: string;
  data?: BusinessSegment;
};
