import { request } from '@umijs/max';
import type {
  PartyLedgerReport,
  PartyMetricReport,
  PartyProfitLossReport,
  PartyReportParams,
} from './types';

const partyReportBase = '/v1/retail/party-reports';

export async function getCustomerLedgerReport(params: PartyReportParams) {
  return request<PartyLedgerReport>(`${partyReportBase}/customer-ledger`, { params });
}

export async function getSupplierLedgerReport(params: PartyReportParams) {
  return request<PartyLedgerReport>(`${partyReportBase}/supplier-ledger`, { params });
}

export async function getTopCustomerReport(params: PartyReportParams) {
  return request<PartyMetricReport>(`${partyReportBase}/top-customers`, { params });
}

export async function getTopSupplierReport(params: PartyReportParams) {
  return request<PartyMetricReport>(`${partyReportBase}/top-suppliers`, { params });
}

export async function getPartyProfitLossReport(params: PartyReportParams) {
  return request<PartyProfitLossReport>(`${partyReportBase}/profit-loss`, { params });
}
