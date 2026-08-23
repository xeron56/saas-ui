export type RetailTargetRecord = {
  id: string;
  slack?: string;
  month: string;
  month_label?: string;
  income: number;
  expense: number;
  sales: number;
  net_profit: number;
  income_target?: number;
  expense_target?: number;
  sales_target?: number;
  net_profit_target?: number;
  created_at?: string;
  updated_at?: string;
};

export type RetailTargetRequest = {
  month: string;
  income: number;
  expense: number;
  sales: number;
  net_profit: number;
};

export type RetailTargetListReply = {
  total_size?: number;
  filter_size?: number;
  items?: RetailTargetRecord[];
  data?: RetailTargetRecord[];
};
