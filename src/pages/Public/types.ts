export type LegacyRecord = Record<string, any>;

export type PublicListConfig = {
  path: string;
  endpoint: string;
  responseKey: string;
  title: string;
  description: string;
  detailBase?: string;
  dateKey?: string;
};

export type PublicDetailConfig = {
  match: RegExp;
  endpointBase: string;
  responseKey: string;
  title: string;
  listPath: string;
};

export type LegacyPayload = LegacyRecord | LegacyRecord[] | undefined;
