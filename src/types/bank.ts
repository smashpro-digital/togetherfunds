export type BankAccountType = "checking" | "savings" | "credit" | "loan" | "investment" | "other";

export type BankAccount = {
  id: string;
  institutionName: string;
  accountName: string;
  accountType: BankAccountType;
  last4: string;
  currentBalance?: number;
  availableBalance?: number;
  lastSyncedAt: string;
};

export type TransactionAssignmentType = "monthlyExpense" | "piggyBank" | "partnerContribution";

export type BankTransaction = {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  accountId: string;
  assignedToType?: TransactionAssignmentType;
  assignedToId?: string;
};

export type BankSyncSnapshot = {
  accounts: BankAccount[];
  transactions: BankTransaction[];
};
