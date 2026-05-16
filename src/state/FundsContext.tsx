import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { demoExpenses, demoPiggyBanks } from "../data/demoData";
import { Expense, ExpenseInput, Partner, PiggyBank, PiggyBankInput } from "../types/funds";

const STORAGE_KEY = "togetherfunds:v1";

type PersistedState = {
  expenses: Expense[];
  piggyBanks: PiggyBank[];
};

type FundsContextValue = PersistedState & {
  isHydrated: boolean;
  addExpense: (input: ExpenseInput) => void;
  updateExpense: (id: string, input: ExpenseInput) => void;
  deleteExpense: (id: string) => void;
  addPiggyBank: (input: PiggyBankInput) => void;
  updatePiggyBank: (id: string, input: PiggyBankInput) => void;
  deletePiggyBank: (id: string) => void;
  addContribution: (piggyBankId: string, partner: Partner, amount: number) => void;
  resetDemoData: () => void;
};

const FundsContext = createContext<FundsContextValue | undefined>(undefined);

const demoState: PersistedState = {
  expenses: demoExpenses,
  piggyBanks: demoPiggyBanks
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function FundsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(demoState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && isMounted) {
          setState(JSON.parse(raw) as PersistedState);
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [isHydrated, state]);

  const addExpense = useCallback((input: ExpenseInput) => {
    setState((current) => ({
      ...current,
      expenses: [{ ...input, id: makeId("expense") }, ...current.expenses]
    }));
  }, []);

  const updateExpense = useCallback((id: string, input: ExpenseInput) => {
    setState((current) => ({
      ...current,
      expenses: current.expenses.map((expense) => (expense.id === id ? { ...input, id } : expense))
    }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      expenses: current.expenses.filter((expense) => expense.id !== id)
    }));
  }, []);

  const addPiggyBank = useCallback((input: PiggyBankInput) => {
    setState((current) => ({
      ...current,
      piggyBanks: [{ ...input, id: makeId("bank") }, ...current.piggyBanks]
    }));
  }, []);

  const updatePiggyBank = useCallback((id: string, input: PiggyBankInput) => {
    setState((current) => ({
      ...current,
      piggyBanks: current.piggyBanks.map((bank) => (bank.id === id ? { ...input, id } : bank))
    }));
  }, []);

  const deletePiggyBank = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      piggyBanks: current.piggyBanks.filter((bank) => bank.id !== id)
    }));
  }, []);

  const addContribution = useCallback((piggyBankId: string, partner: Partner, amount: number) => {
    setState((current) => ({
      ...current,
      piggyBanks: current.piggyBanks.map((bank) => {
        if (bank.id !== piggyBankId) {
          return bank;
        }

        const contributionKey = partner === "partnerA" ? "partnerAContribution" : "partnerBContribution";

        return {
          ...bank,
          savedAmount: bank.savedAmount + amount,
          [contributionKey]: bank[contributionKey] + amount
        };
      })
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    setState(demoState);
  }, []);

  const value = useMemo<FundsContextValue>(
    () => ({
      ...state,
      isHydrated,
      addExpense,
      updateExpense,
      deleteExpense,
      addPiggyBank,
      updatePiggyBank,
      deletePiggyBank,
      addContribution,
      resetDemoData
    }),
    [
      addContribution,
      addExpense,
      addPiggyBank,
      deleteExpense,
      deletePiggyBank,
      isHydrated,
      resetDemoData,
      state,
      updateExpense,
      updatePiggyBank
    ]
  );

  return <FundsContext.Provider value={value}>{children}</FundsContext.Provider>;
}

export function useFunds() {
  const context = useContext(FundsContext);
  if (!context) {
    throw new Error("useFunds must be used inside FundsProvider");
  }

  return context;
}
