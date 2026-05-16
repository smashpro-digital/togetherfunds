export type RootStackParamList = {
  Tabs: undefined;
  BankSync: undefined;
  ExpenseForm: { expenseId?: string } | undefined;
  PiggyBankForm: { piggyBankId?: string } | undefined;
  Contribution: { piggyBankId?: string } | undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Expenses: undefined;
  PiggyBanks: undefined;
  PartnerSummary: undefined;
  Settings: undefined;
};
