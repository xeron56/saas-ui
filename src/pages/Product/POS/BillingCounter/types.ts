export type RetailBillingCounterStatus = 'active' | 'inactive';

export type RetailBillingCounterRecord = {
  id: string;
  slack?: string;
  counter_code: string;
  billing_counter_code?: string;
  counter_name: string;
  billing_counter_name?: string;
  description?: string;
  status: RetailBillingCounterStatus;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type RetailBillingCounterRequest = {
  counter_code: string;
  counter_name: string;
  description?: string;
  status?: RetailBillingCounterStatus;
};

export type RetailBillingCounterListReply = {
  total_size?: number;
  filter_size?: number;
  items?: RetailBillingCounterRecord[];
  data?: RetailBillingCounterRecord[];
};
