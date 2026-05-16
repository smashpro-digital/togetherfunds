export type Partner = "partnerA" | "partnerB";

export type Expense = {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  partnerAContribution: number;
  partnerBContribution: number;
};

export type PiggyBank = {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  dueDate: string;
  partnerAContribution: number;
  partnerBContribution: number;
};

export type ExpenseInput = Omit<Expense, "id">;
export type PiggyBankInput = Omit<PiggyBank, "id">;
