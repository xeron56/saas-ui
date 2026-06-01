export type JsonMap = Record<string, any>;

export type PartnerKind = 'customer' | 'supplier';
export type PartnerSegment = 'retail' | 'dealer' | 'wholesale' | 'supplier';
export type OpeningBalanceMode = 'due' | 'advance';

export type RetailPartnerRequest = {
  partner_code?: string;
  display_name?: string;
  kind?: PartnerKind;
  segment?: PartnerSegment;
  contact_name?: string;
  email?: string;
  phone?: string;
  alternate_phone?: string;
  address?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country?: string;
  tax_number?: string;
  image_ref?: string;
  branch_ref?: string;
  credit_limit?: number;
  loyalty_points?: number;
  opening_balance?: number;
  opening_balance_mode?: OpeningBalanceMode;
  billing_profile?: JsonMap;
  shipping_profile?: JsonMap;
  meta?: JsonMap;
  active?: boolean;
};

export type RetailPartner = RetailPartnerRequest & {
  id: string;
  created_at?: string;
  updated_at?: string;
  due_balance?: number;
  wallet_balance?: number;
};

export type RetailPartnerListReply = {
  total_size?: number;
  filter_size?: number;
  total_due_balance?: number;
  total_wallet_balance?: number;
  items?: RetailPartner[];
};

export type RetailPartnerLedgerLine = {
  id?: string;
  date?: string;
  reference_no?: string;
  source_kind?: 'opening' | 'sale' | 'purchase' | 'payment' | 'adjustment';
  source_id?: string;
  debit_amount?: number;
  credit_amount?: number;
  balance?: number;
  memo?: string;
  created_at?: string;
};

export type RetailPartnerLedgerReply = {
  partner?: RetailPartner;
  items?: RetailPartnerLedgerLine[];
};
