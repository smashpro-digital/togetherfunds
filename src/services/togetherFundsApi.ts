import { BankAccount, BankTransaction, TransactionAssignmentType } from "../types/bank";
import { Expense, ExpenseInput, PiggyBank, PiggyBankInput } from "../types/funds";
import { apiClient, ApiResult } from "./apiClient";

const DEFAULT_COUPLE_ID = 1;

type ExpenseRow = {
  id: number;
  name: string;
  amount: string | number;
  due_day: number;
  category?: string | null;
};

type PiggyBankRow = {
  id: number;
  name: string;
  target_amount: string | number;
  saved_amount: string | number;
  due_date?: string | null;
};

type ContributionInput = {
  coupleId?: number;
  partnerId?: number;
  expenseId?: number;
  piggyBankId?: number;
  amount: number;
  contributedAt?: string;
  note?: string;
};

type TransactionAssignmentInput = {
  coupleId?: number;
  transactionId: number | string;
  assignedToType: TransactionAssignmentType;
  assignedToId?: number | string;
};

function toExpense(row: ExpenseRow): Expense {
  return {
    id: String(row.id),
    name: row.name,
    amount: Number(row.amount),
    dueDay: Number(row.due_day),
    category: row.category ?? "",
    partnerAContribution: 0,
    partnerBContribution: 0,
  };
}

function toPiggyBank(row: PiggyBankRow): PiggyBank {
  return {
    id: String(row.id),
    name: row.name,
    targetAmount: Number(row.target_amount),
    savedAmount: Number(row.saved_amount),
    dueDate: row.due_date ?? "",
    partnerAContribution: 0,
    partnerBContribution: 0,
  };
}

function expensePayload(input: ExpenseInput, coupleId = DEFAULT_COUPLE_ID) {
  return {
    couple_id: coupleId,
    name: input.name,
    amount: input.amount,
    due_day: input.dueDay,
    category: input.category,
  };
}

function piggyBankPayload(input: PiggyBankInput, coupleId = DEFAULT_COUPLE_ID) {
  return {
    couple_id: coupleId,
    name: input.name,
    target_amount: input.targetAmount,
    saved_amount: input.savedAmount,
    due_date: input.dueDate,
  };
}

export async function getExpenses(coupleId = DEFAULT_COUPLE_ID): Promise<ApiResult<Expense[]>> {
  const result = await apiClient.get<{ expenses: ExpenseRow[] }>(`expenses.get.php?couple_id=${coupleId}`, `expenses:${coupleId}`);
  return { ...result, data: result.data?.expenses.map(toExpense) ?? null };
}

export function createExpense(input: ExpenseInput, coupleId = DEFAULT_COUPLE_ID) {
  return apiClient.post<{ id: number }>("expenses.post.php", expensePayload(input, coupleId), `expenses:${coupleId}`);
}

export function updateExpense(id: string, input: ExpenseInput, coupleId = DEFAULT_COUPLE_ID) {
  return apiClient.put<{ id: number }>("expenses.put.php", { id: Number(id), ...expensePayload(input, coupleId) }, `expenses:${coupleId}`);
}

export function deleteExpense(id: string, coupleId = DEFAULT_COUPLE_ID) {
  return apiClient.delete<{ id: number }>("expenses.delete.php", { id: Number(id) }, `expenses:${coupleId}`);
}

export async function getPiggyBanks(coupleId = DEFAULT_COUPLE_ID): Promise<ApiResult<PiggyBank[]>> {
  const result = await apiClient.get<{ piggy_banks: PiggyBankRow[] }>(`piggy-banks.get.php?couple_id=${coupleId}`, `piggy-banks:${coupleId}`);
  return { ...result, data: result.data?.piggy_banks.map(toPiggyBank) ?? null };
}

export function createPiggyBank(input: PiggyBankInput, coupleId = DEFAULT_COUPLE_ID) {
  return apiClient.post<{ id: number }>("piggy-banks.post.php", piggyBankPayload(input, coupleId), `piggy-banks:${coupleId}`);
}

export function updatePiggyBank(id: string, input: PiggyBankInput, coupleId = DEFAULT_COUPLE_ID) {
  return apiClient.put<{ id: number }>("piggy-banks.put.php", { id: Number(id), ...piggyBankPayload(input, coupleId) }, `piggy-banks:${coupleId}`);
}

export function deletePiggyBank(id: string, coupleId = DEFAULT_COUPLE_ID) {
  return apiClient.delete<{ id: number }>("piggy-banks.delete.php", { id: Number(id) }, `piggy-banks:${coupleId}`);
}

export function getContributions(coupleId = DEFAULT_COUPLE_ID) {
  return apiClient.get<{ contributions: unknown[] }>(`contributions.get.php?couple_id=${coupleId}`, `contributions:${coupleId}`);
}

export function createContribution(input: ContributionInput) {
  const coupleId = input.coupleId ?? DEFAULT_COUPLE_ID;
  return apiClient.post<{ id: number }>(
    "contributions.post.php",
    {
      couple_id: coupleId,
      partner_id: input.partnerId,
      expense_id: input.expenseId,
      piggy_bank_id: input.piggyBankId,
      amount: input.amount,
      contributed_at: input.contributedAt,
      note: input.note,
    },
    `contributions:${coupleId}`
  );
}

export function getBankAccounts(coupleId = DEFAULT_COUPLE_ID) {
  return apiClient.get<{ bank_accounts: BankAccount[] }>(`bank-accounts.get.php?couple_id=${coupleId}`, `bank-accounts:${coupleId}`);
}

export function getTransactions(coupleId = DEFAULT_COUPLE_ID) {
  return apiClient.get<{ transactions: BankTransaction[] }>(`transactions.get.php?couple_id=${coupleId}`, `transactions:${coupleId}`);
}

export function assignTransaction(input: TransactionAssignmentInput) {
  const coupleId = input.coupleId ?? DEFAULT_COUPLE_ID;
  return apiClient.post<{ id: number }>(
    "transactions.assign.post.php",
    {
      couple_id: coupleId,
      transaction_id: Number(input.transactionId),
      assigned_to_type: input.assignedToType,
      assigned_to_id: input.assignedToId ? Number(input.assignedToId) : undefined,
    },
    `transactions:${coupleId}`
  );
}
