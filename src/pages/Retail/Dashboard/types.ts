export type DashboardDuration =
  | 'today'
  | 'yesterday'
  | 'last_seven_days'
  | 'last_thirty_days'
  | 'current_month'
  | 'last_month'
  | 'current_year'
  | 'custom_date';

export type DashboardSummary = {
  date?: string;
  sales?: number;
  income?: number;
  expense?: number;
  purchase?: number;
};

export type DashboardSeriesPoint = {
  date: string;
  amount?: number;
};

export type DashboardReport = {
  from_date?: string;
  to_date?: string;
  bucket?: 'hour' | 'day' | 'month';
  total_expense?: number;
  total_income?: number;
  total_items?: number;
  total_categories?: number;
  stock_value?: number;
  total_due?: number;
  total_profit?: number;
  total_loss?: number;
  net_profit?: number;
  sales?: DashboardSeriesPoint[];
  purchases?: DashboardSeriesPoint[];
};
