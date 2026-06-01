import type { MoneyAccount, PaymentType } from './types';

export const financeTenderNeedsAccount = (kind?: string) =>
  !!kind && !['cash', 'wallet', 'cheque'].includes(kind);

export const moneyAccountOptions = (accounts?: MoneyAccount[]) =>
  (accounts || []).map((account) => ({
    label: `${account.account_name} · ${Number(account.current_balance || 0).toFixed(2)}`,
    value: account.id,
  }));

export const moneyAccountLabel = (accounts: MoneyAccount[], id?: string) =>
  accounts.find((account) => account.id === id)?.account_name || id || '-';

export const paymentTypeOptions = (types?: PaymentType[]) =>
  (types || [])
    .filter((type) => type.active !== false && type.status !== false)
    .map((type) => ({
      label: type.name || type.id,
      value: type.id,
    }));

export const paymentTypeLabel = (types: PaymentType[], id?: string) =>
  types.find((type) => type.id === id)?.name || id || '-';
