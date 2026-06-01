import { request } from '@umijs/max';
import type {
  ReportBalanceSheet,
  ReportBillWiseProfit,
  ReportCashFlow,
  ReportCustomTemplateList,
  ReportCustomTemplateReply,
  ReportFieldCatalog,
  ReportOverview,
  ReportProductHistory,
  ReportProductHistoryDetail,
  ReportProfitLoss,
  ReportSubscriptionReport,
  ReportTaxReport,
} from './types';

const reportBase = '/v1/retail/reports';

export async function getReportOverview(params: Record<string, any>) {
  return request<ReportOverview>(`${reportBase}/overview`, { params });
}

export async function getTaxReport(params: Record<string, any>) {
  return request<ReportTaxReport>(`${reportBase}/tax`, { params });
}

export async function getCashFlowReport(params: Record<string, any>) {
  return request<ReportCashFlow>(`${reportBase}/cashflow`, { params });
}

export async function getBalanceSheetReport(params: Record<string, any>) {
  return request<ReportBalanceSheet>(`${reportBase}/balance-sheet`, { params });
}

export async function getProfitLossReport(params: Record<string, any>) {
  return request<ReportProfitLoss>(`${reportBase}/loss-profit`, { params });
}

export async function getBillWiseProfitReport(params: Record<string, any>) {
  return request<ReportBillWiseProfit>(`${reportBase}/bill-wise-profit`, { params });
}

export async function getReportFieldCatalog() {
  return request<ReportFieldCatalog>(`${reportBase}/field-catalog`);
}

export async function listCustomReports() {
  return request<ReportCustomTemplateList>(`${reportBase}/custom-reports`);
}

export async function getCustomReport(slug: string) {
  return request<ReportCustomTemplateReply>(
    `${reportBase}/custom-reports/${encodeURIComponent(slug)}`,
  );
}

export async function getSubscriptionReport(params: Record<string, any>) {
  return request<ReportSubscriptionReport>('/v1/reports/subscription', { params });
}

export async function listProductSaleHistory(params: Record<string, any>) {
  return request<ReportProductHistory>(`${reportBase}/product-sale-history`, { params });
}

export async function getProductSaleHistory(id: string, params: Record<string, any>) {
  return request<ReportProductHistoryDetail>(
    `${reportBase}/product-sale-history/${encodeURIComponent(id)}`,
    { params },
  );
}

export async function listProductPurchaseHistory(params: Record<string, any>) {
  return request<ReportProductHistory>(`${reportBase}/product-purchase-history`, { params });
}

export async function getProductPurchaseHistory(id: string, params: Record<string, any>) {
  return request<ReportProductHistoryDetail>(
    `${reportBase}/product-purchase-history/${encodeURIComponent(id)}`,
    { params },
  );
}
