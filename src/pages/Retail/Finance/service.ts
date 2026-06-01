import { request } from '@umijs/max';
import type {
  MoneyAccount,
  MoneyAccountListReply,
  MoneyAccountRequest,
  CashflowReason,
  CashflowReasonListReply,
  CashflowReasonRequest,
  CashflowRecord,
  CashflowRecordListReply,
  CashflowRecordRequest,
  FinanceCheque,
  FinanceChequeClearRequest,
  FinanceChequeListReply,
  FinanceChequeReopenRequest,
  MoneyMovement,
  MoneyMovementListReply,
  MoneyMovementRequest,
  PaymentTypeListReply,
} from './types';

const financeBase = '/v1/retail/finance';

export async function listMoneyAccounts(params: Record<string, any>) {
  return request<MoneyAccountListReply>(`${financeBase}/accounts`, { params });
}

export async function getMoneyAccount(id: string) {
  return request<MoneyAccount>(`${financeBase}/accounts/${encodeURIComponent(id)}`);
}

export async function createMoneyAccount(data: MoneyAccountRequest) {
  return request<MoneyAccount>(`${financeBase}/accounts`, {
    method: 'POST',
    data,
  });
}

export async function updateMoneyAccount(id: string, data: MoneyAccountRequest) {
  return request<MoneyAccount>(`${financeBase}/accounts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteMoneyAccount(id: string) {
  return request<{ id: string }>(`${financeBase}/accounts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function listPaymentTypes() {
  return request<PaymentTypeListReply>(`${financeBase}/payment-methods`);
}

export async function listMoneyMovements(params: Record<string, any>) {
  return request<MoneyMovementListReply>(`${financeBase}/movements`, { params });
}

export async function getMoneyMovement(id: string) {
  return request<MoneyMovement>(`${financeBase}/movements/${encodeURIComponent(id)}`);
}

export async function createMoneyMovement(data: MoneyMovementRequest) {
  return request<MoneyMovement>(`${financeBase}/movements`, {
    method: 'POST',
    data,
  });
}

export async function listCashflowReasons(params: Record<string, any>) {
  return request<CashflowReasonListReply>(`${financeBase}/cashflow/reasons`, { params });
}

export async function createCashflowReason(data: CashflowReasonRequest) {
  return request<CashflowReason>(`${financeBase}/cashflow/reasons`, {
    method: 'POST',
    data,
  });
}

export async function updateCashflowReason(id: string, data: CashflowReasonRequest) {
  return request<CashflowReason>(`${financeBase}/cashflow/reasons/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteCashflowReason(id: string) {
  return request<{ id: string }>(`${financeBase}/cashflow/reasons/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function listCashflowRecords(params: Record<string, any>) {
  return request<CashflowRecordListReply>(`${financeBase}/cashflow/records`, { params });
}

export async function getCashflowRecord(id: string) {
  return request<CashflowRecord>(`${financeBase}/cashflow/records/${encodeURIComponent(id)}`);
}

export async function createCashflowRecord(data: CashflowRecordRequest) {
  return request<CashflowRecord>(`${financeBase}/cashflow/records`, {
    method: 'POST',
    data,
  });
}

export async function voidCashflowRecord(id: string) {
  return request<CashflowRecord>(`${financeBase}/cashflow/records/${encodeURIComponent(id)}/void`, {
    method: 'POST',
  });
}

export async function listFinanceCheques(params: Record<string, any>) {
  return request<FinanceChequeListReply>(`${financeBase}/cheques`, { params });
}

export async function getFinanceCheque(id: string) {
  return request<FinanceCheque>(`${financeBase}/cheques/${encodeURIComponent(id)}`);
}

export async function clearFinanceCheque(id: string, data: FinanceChequeClearRequest) {
  return request<FinanceCheque>(`${financeBase}/cheques/${encodeURIComponent(id)}/clear`, {
    method: 'POST',
    data,
  });
}

export async function reopenFinanceCheque(id: string, data: FinanceChequeReopenRequest) {
  return request<FinanceCheque>(`${financeBase}/cheques/${encodeURIComponent(id)}/reopen`, {
    method: 'POST',
    data,
  });
}
