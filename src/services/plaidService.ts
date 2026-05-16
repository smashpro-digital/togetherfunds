import { BankAccount, BankTransaction } from "../types/bank";

type SandboxConnection = {
  accounts: BankAccount[];
  transactions: BankTransaction[];
};

function isoNow() {
  return new Date().toISOString();
}

function recentDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

export const plaidProductionNotes = [
  "Use Plaid Link on the client to create a public_token.",
  "Exchange public_token for access_token only on a secure backend.",
  "Never store Plaid access_token in AsyncStorage or on the device.",
  "Route all Plaid API calls through Firebase, Supabase, or a Node backend before production."
];

export async function connectSandboxBank(): Promise<SandboxConnection> {
  const syncedAt = isoNow();
  const accounts: BankAccount[] = [
    {
      id: "sandbox-chase-checking-0421",
      institutionName: "Chase",
      accountName: "Checking",
      accountType: "checking",
      last4: "0421",
      currentBalance: 2450.32,
      availableBalance: 2418.12,
      lastSyncedAt: syncedAt
    },
    {
      id: "sandbox-capital-one-savings-8891",
      institutionName: "Capital One",
      accountName: "Savings",
      accountType: "savings",
      last4: "8891",
      currentBalance: 1200,
      availableBalance: 1200,
      lastSyncedAt: syncedAt
    }
  ];

  return {
    accounts,
    transactions: createSandboxTransactions(accounts)
  };
}

export async function refreshSandboxBalances(accounts: BankAccount[]): Promise<BankAccount[]> {
  const syncedAt = isoNow();

  return accounts.map((account, index) => ({
    ...account,
    currentBalance:
      typeof account.currentBalance === "number" ? Number((account.currentBalance + (index === 0 ? -18.42 : 25)).toFixed(2)) : undefined,
    availableBalance:
      typeof account.availableBalance === "number"
        ? Number((account.availableBalance + (index === 0 ? -18.42 : 25)).toFixed(2))
        : undefined,
    lastSyncedAt: syncedAt
  }));
}

export async function importSandboxTransactions(accounts: BankAccount[]): Promise<BankTransaction[]> {
  return createSandboxTransactions(accounts);
}

function createSandboxTransactions(accounts: BankAccount[]): BankTransaction[] {
  const checking = accounts.find((account) => account.accountType === "checking") ?? accounts[0];
  const savings = accounts.find((account) => account.accountType === "savings") ?? accounts[0];

  if (!checking) {
    return [];
  }

  return [
    {
      id: "txn-sandbox-grocery-market",
      merchant: "Neighborhood Market",
      amount: -84.26,
      date: recentDate(1),
      category: "Groceries",
      accountId: checking.id
    },
    {
      id: "txn-sandbox-rent-transfer",
      merchant: "Rent Transfer",
      amount: -900,
      date: recentDate(2),
      category: "Housing",
      accountId: checking.id
    },
    {
      id: "txn-sandbox-partner-deposit",
      merchant: "Partner Deposit",
      amount: 350,
      date: recentDate(3),
      category: "Contribution",
      accountId: checking.id
    },
    {
      id: "txn-sandbox-car-savings",
      merchant: "Auto Repair Savings",
      amount: -75,
      date: recentDate(5),
      category: "Savings",
      accountId: savings?.id ?? checking.id
    }
  ];
}
