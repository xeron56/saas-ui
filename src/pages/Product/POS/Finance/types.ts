export type JsonMap = Record<string, any>;

export type MoneyAccountRequest = {
  account_name?: string;
  branch_ref?: string;
  opening_balance?: number;
  opening_date?: string;
  show_on_invoice?: boolean;
  active?: boolean;
  meta?: JsonMap;
};

export type MoneyAccount = MoneyAccountRequest & {
  id: string;
  created_at?: string;
  updated_at?: string;
  account_kind?: 'bank';
  current_balance?: number;
};

export type MoneyAccountListReply = {
  total_size?: number;
  filter_size?: number;
  total_balance?: number;
  items?: MoneyAccount[];
};

export type PaymentType = {
  id: string;
  name?: string;
  branch_id?: string;
  opening_balance?: number;
  balance?: number;
  current_balance?: number;
  opening_date?: string;
  show_in_invoice?: boolean;
  show_on_invoice?: boolean;
  status?: boolean;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PaymentTypeListReply = {
  message?: string;
  data?: PaymentType[];
};

export type MoneyMovementType =
  | 'bank_to_bank'
  | 'bank_to_cash'
  | 'cash_to_bank'
  | 'adjust_bank'
  | 'adjust_cash'
  | 'sale'
  | 'purchase'
  | 'sale_return'
  | 'purchase_return'
  | 'due_collect'
  | 'due_pay'
  | 'cheque_clear'
  | 'income'
  | 'expense';

export type MoneyDirection = 'credit' | 'debit' | 'transfer';
export type CashflowKind = 'income' | 'expense';
export type CashflowRecordStatus = 'posted' | 'voided';

export type MoneyMovementRequest = {
  movement_type?: MoneyMovementType;
  direction?: MoneyDirection;
  amount?: number;
  occurred_at?: string;
  from_account_id?: string;
  to_account_id?: string;
  payment_account_id?: string;
  reference_kind?: string;
  reference_id?: string;
  reference_no?: string;
  image_ref?: string;
  note?: string;
  meta?: JsonMap;
};

export type MoneyMovement = MoneyMovementRequest & {
  id: string;
  created_at?: string;
  updated_at?: string;
  movement_no?: string;
  platform?: 'bank' | 'cash';
  from_account?: MoneyAccount;
  to_account?: MoneyAccount;
  payment_account?: MoneyAccount;
};

export type MoneyMovementListReply = {
  total_size?: number;
  filter_size?: number;
  cash_balance?: number;
  items?: MoneyMovement[];
};

export type CashflowReasonRequest = {
  reason_name?: string;
  reason_kind?: CashflowKind;
  description?: string;
  branch_ref?: string;
  active?: boolean;
  meta?: JsonMap;
};

export type CashflowReason = CashflowReasonRequest & {
  id: string;
  created_at?: string;
  updated_at?: string;
};

export type CashflowReasonListReply = {
  total_size?: number;
  filter_size?: number;
  items?: CashflowReason[];
};

export type CashflowTenderRequest = {
  tender_kind?: string;
  amount?: number;
  payment_account_id?: string;
  reference_no?: string;
  cheque_number?: string;
  meta?: JsonMap;
};

export type CashflowRecordRequest = {
  record_kind?: CashflowKind;
  reason_id?: string;
  branch_ref?: string;
  title?: string;
  reference_no?: string;
  recorded_at?: string;
  image_ref?: string;
  note?: string;
  tenders?: CashflowTenderRequest[];
  meta?: JsonMap;
};

export type CashflowTender = CashflowTenderRequest & {
  id: string;
  created_at?: string;
  updated_at?: string;
  record_id?: string;
  status?: 'settled' | 'pending';
  paid_at?: string;
  payment_account?: MoneyAccount;
};

export type CashflowRecord = CashflowRecordRequest & {
  id: string;
  created_at?: string;
  updated_at?: string;
  record_no?: string;
  status?: CashflowRecordStatus;
  reason?: CashflowReason;
  amount?: number;
  pending_amount?: number;
  tenders?: CashflowTender[];
};

export type CashflowRecordListReply = {
  total_size?: number;
  filter_size?: number;
  income_total?: number;
  expense_total?: number;
  pending_total?: number;
  items?: CashflowRecord[];
};

export type FinanceChequeStatus = 'pending' | 'cleared' | 'reopened';

export type FinanceChequeClearRequest = {
  clear_platform?: 'cash' | 'bank';
  payment_account_id?: string;
  cleared_at?: string;
  note?: string;
  meta?: JsonMap;
};

export type FinanceChequeReopenRequest = {
  reason?: string;
  note?: string;
  meta?: JsonMap;
};

export type FinanceCheque = {
  id: string;
  created_at?: string;
  updated_at?: string;
  instrument_no?: string;
  source_kind?: string;
  source_id?: string;
  source_no?: string;
  tender_id?: string;
  partner_id?: string;
  branch_ref?: string;
  direction?: MoneyDirection;
  amount?: number;
  status?: FinanceChequeStatus;
  received_at?: string;
  cleared_at?: string;
  reopened_at?: string;
  clear_platform?: 'cash' | 'bank' | '';
  payment_account_id?: string;
  payment_account?: MoneyAccount;
  movement_id?: string;
  movement?: MoneyMovement;
  note?: string;
  meta?: JsonMap;
};

export type FinanceChequeListReply = {
  total_size?: number;
  filter_size?: number;
  pending_amount?: number;
  cleared_amount?: number;
  items?: FinanceCheque[];
};
