export type JsonMap = Record<string, any>;

export type InvoiceSize = 'a4' | '3_inch_80mm' | '2_inch_58mm';
export type CurrencyFormat = 'us' | 'european';
export type SaleRoundingMode =
  | 'none'
  | 'round_up'
  | 'nearest_whole_number'
  | 'nearest_0.05'
  | 'nearest_0.1'
  | 'nearest_0.5';

export type RetailSettings = {
  id?: string;
  invoice_size?: InvoiceSize;
  currency_format?: CurrencyFormat;
  invoice_language?: string;
  sale_rounding_mode?: SaleRoundingMode;
  receipt_content?: JsonMap;
  visibility_flags?: JsonMap;
  branding_refs?: JsonMap;
  product_modules?: JsonMap;
};

export type RetailSettingsRequest = {
  invoice_size?: InvoiceSize;
  currency_format?: CurrencyFormat;
  invoice_language?: string;
  sale_rounding_mode?: SaleRoundingMode;
  receipt_content?: JsonMap;
  visibility_flags?: JsonMap;
  branding_refs?: JsonMap;
  product_modules?: JsonMap;
};
