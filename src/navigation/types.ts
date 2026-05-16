export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Tabs: undefined;
  BankSync: undefined;
  ExpenseForm: { expenseId?: string } | undefined;
  PiggyBankForm: { piggyBankId?: string } | undefined;
  Contribution: { piggyBankId?: string } | undefined;
  Profile: undefined;
  AppCustomization: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Expenses: undefined;
  PiggyBanks: undefined;
  PartnerSummary: undefined;
  Settings: undefined;
};
