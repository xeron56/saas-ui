export type RetailBookingType = 'BOOKING' | 'EVENT';

export type RetailBookingRecord = {
  id: string;
  slack?: string;
  event_code: string;
  event_type: RetailBookingType | string;
  start_at?: string;
  end_at?: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  start_date_raw?: string;
  end_date_raw?: string;
  name?: string;
  email?: string;
  phone?: string;
  description?: string;
  party_size?: number;
  no_of_persons?: number;
  created_at?: string;
  updated_at?: string;
};

export type RetailBookingRequest = {
  event_code?: string;
  event_type: RetailBookingType | string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  name?: string;
  email?: string;
  phone?: string;
  description?: string;
  no_of_persons?: number;
};

export type RetailBookingListReply = {
  total_size?: number;
  filter_size?: number;
  items?: RetailBookingRecord[];
  data?: RetailBookingRecord[];
};
