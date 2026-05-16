import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useSyncExternalStore } from "react";
import {
  connectSandboxBank,
  importSandboxTransactions,
  refreshSandboxBalances
} from "../services/plaidService";
import { BankAccount, BankSyncSnapshot, BankTransaction, TransactionAssignmentType } from "../types/bank";

const STORAGE_KEY = "togetherfunds:bank-sync:v1";

type BankState = BankSyncSnapshot & {
  isHydrated: boolean;
  isSyncing: boolean;
  lastError?: string;
};

const initialState: BankState = {
  accounts: [],
  transactions: [],
  isHydrated: false,
  isSyncing: false
};

let state = initialState;
let hydratePromise: Promise<void> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(updater: BankState | ((current: BankState) => BankState)) {
  state = typeof updater === "function" ? updater(state) : updater;
  emit();
}

function persist(snapshot: BankSyncSnapshot) {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)).catch(() => undefined);
}

function safeSnapshot(current: BankState): BankSyncSnapshot {
  return {
    accounts: current.accounts,
    transactions: current.transactions
  };
}

export function hydrateBankStore() {
  if (hydratePromise) {
    return hydratePromise;
  }

  hydratePromise = AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => {
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as Partial<BankSyncSnapshot>;
      setState((current) => ({
        ...current,
        accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : []
      }));
    })
    .catch(() => undefined)
    .finally(() => {
      setState((current) => ({ ...current, isHydrated: true }));
    });

  return hydratePromise;
}

export function subscribeToBankStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBankSnapshot() {
  return state;
}

export function useBankStore() {
  useEffect(() => {
    hydrateBankStore();
  }, []);

  return useSyncExternalStore(subscribeToBankStore, getBankSnapshot, getBankSnapshot);
}

export async function connectSandboxBankAccounts() {
  setState((current) => ({ ...current, isSyncing: true, lastError: undefined }));

  try {
    const connection = await connectSandboxBank();
    setState((current) => {
      const next = {
        ...current,
        accounts: mergeAccounts(current.accounts, connection.accounts),
        transactions: mergeTransactions(current.transactions, connection.transactions),
        isSyncing: false
      };
      persist(safeSnapshot(next));
      return next;
    });
  } catch {
    setState((current) => ({ ...current, isSyncing: false, lastError: "Unable to connect sandbox bank." }));
  }
}

export async function refreshConnectedBankData() {
  if (state.accounts.length === 0) {
    return;
  }

  setState((current) => ({ ...current, isSyncing: true, lastError: undefined }));

  try {
    const refreshedAccounts = await refreshSandboxBalances(state.accounts);
    const importedTransactions = await importSandboxTransactions(refreshedAccounts);

    setState((current) => {
      const next = {
        ...current,
        accounts: refreshedAccounts,
        transactions: mergeTransactions(current.transactions, importedTransactions),
        isSyncing: false
      };
      persist(safeSnapshot(next));
      return next;
    });
  } catch {
    setState((current) => ({ ...current, isSyncing: false, lastError: "Unable to refresh sandbox balances." }));
  }
}

export function disconnectBankAccount(accountId: string) {
  setState((current) => {
    const next = {
      ...current,
      accounts: current.accounts.filter((account) => account.id !== accountId),
      transactions: current.transactions.filter((transaction) => transaction.accountId !== accountId)
    };
    persist(safeSnapshot(next));
    return next;
  });
}

export function assignBankTransaction(id: string, assignedToType: TransactionAssignmentType, assignedToId: string) {
  setState((current) => {
    const next = {
      ...current,
      transactions: current.transactions.map((transaction) =>
        transaction.id === id ? { ...transaction, assignedToType, assignedToId } : transaction
      )
    };
    persist(safeSnapshot(next));
    return next;
  });
}

function mergeAccounts(current: BankAccount[], incoming: BankAccount[]) {
  const byId = new Map(current.map((account) => [account.id, account]));
  incoming.forEach((account) => byId.set(account.id, account));
  return Array.from(byId.values());
}

function mergeTransactions(current: BankTransaction[], incoming: BankTransaction[]) {
  const byId = new Map(current.map((transaction) => [transaction.id, transaction]));

  incoming.forEach((transaction) => {
    byId.set(transaction.id, {
      ...transaction,
      assignedToType: byId.get(transaction.id)?.assignedToType,
      assignedToId: byId.get(transaction.id)?.assignedToId
    });
  });

  return Array.from(byId.values()).sort((a, b) => b.date.localeCompare(a.date));
}
