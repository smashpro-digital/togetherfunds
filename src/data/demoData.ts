import { Expense, PiggyBank } from "../types/funds";

export const demoExpenses: Expense[] = [
  {
    id: "rent",
    name: "Rent",
    amount: 1800,
    dueDay: 1,
    category: "Housing",
    partnerAContribution: 400,
    partnerBContribution: 350
  },
  {
    id: "utilities",
    name: "Utilities",
    amount: 260,
    dueDay: 15,
    category: "Home",
    partnerAContribution: 130,
    partnerBContribution: 130
  },
  {
    id: "groceries",
    name: "Groceries",
    amount: 700,
    dueDay: 5,
    category: "Food",
    partnerAContribution: 350,
    partnerBContribution: 350
  }
];

export const demoPiggyBanks: PiggyBank[] = [
  {
    id: "car-service",
    name: "Car Service",
    targetAmount: 600,
    savedAmount: 250,
    dueDate: "2026-06-20",
    partnerAContribution: 125,
    partnerBContribution: 125
  }
];
