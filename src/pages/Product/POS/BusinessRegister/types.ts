import type { RetailBillingCounterRecord } from '../BillingCounter/types';

export type RetailBusinessRegisterStatus = 'open' | 'closed';

export type RetailBusinessRegisterRecord = {
  id: string;
  slack?: string;
  user_id: string;
  billing_counter_id: string;
  billing_counter?: RetailBillingCounterRecord;
  current_register: boolean;
  opening_at?: string;
  closing_at?: string;
  opening_date?: string;
  closing_date?: string;
  opening_date_label?: string;
  closing_date_label?: string;
  opening_amount: number;
  closing_amount: number;
  credit_card_slips: number;
  cheques: number;
  status: RetailBusinessRegisterStatus;
  created_at?: string;
  updated_at?: string;
};

export type RetailBusinessRegisterOpenRequest = {
  user_id: string;
  billing_counter_id: string;
  opening_amount: number;
};

export type RetailBusinessRegisterCloseRequest = {
  user_id: string;
  closing_amount: number;
  credit_card_slips?: number;
  cheques?: number;
};

export type RetailBusinessRegisterListReply = {
  total_size?: number;
  filter_size?: number;
  items?: RetailBusinessRegisterRecord[];
  data?: RetailBusinessRegisterRecord[];
};
