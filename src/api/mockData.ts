import type { Transaction, CurrentWeekState, SavingsPot, UserSettings } from '../types';
import { roundCurrency, weeklyBudget, calculateIsaFromPurchase, calculateBudgetDeduction } from '../lib/math';

export const INITIAL_SETTINGS: UserSettings = {
  monthlySpareMoney: 430, // 430 / 4.3 = £100/week
  hasPendingBudgetChange: false,
};

// 14 realistic UK transactions spread across the week totaling ~£72.95 spent,
// which uses ~£74.41 of the £100 weekly allowance, leaving ~£25.59 in budget.
const RAW_MOCK_TRANSACTIONS = [
  { merchant: 'Pret A Manger', category: 'coffee' as const, amount: 3.85, daysAgo: 6, hour: 8, min: 25 },
  { merchant: 'TfL Travel Charge', category: 'transport' as const, amount: 2.80, daysAgo: 6, hour: 8, min: 55 },
  { merchant: 'Tesco Express', category: 'supermarket' as const, amount: 7.40, daysAgo: 5, hour: 13, min: 10 },
  { merchant: 'Blank Street Coffee', category: 'coffee' as const, amount: 3.90, daysAgo: 5, hour: 16, min: 20 },
  { merchant: 'TfL Travel Charge', category: 'transport' as const, amount: 2.80, daysAgo: 4, hour: 9, min: 10 },
  { merchant: 'Boots UK', category: 'shopping' as const, amount: 5.20, daysAgo: 4, hour: 12, min: 45 },
  { merchant: 'Sainsbury\'s Local', category: 'supermarket' as const, amount: 11.50, daysAgo: 3, hour: 17, min: 30 },
  { merchant: 'TfL Travel Charge', category: 'transport' as const, amount: 3.40, daysAgo: 3, hour: 18, min: 40 },
  { merchant: 'Gail\'s Bakery', category: 'coffee' as const, amount: 4.20, daysAgo: 2, hour: 9, min: 15 },
  { merchant: 'Deliveroo (Nando\'s)', category: 'takeaway' as const, amount: 14.50, daysAgo: 2, hour: 19, min: 30 },
  { merchant: 'Costa Coffee', category: 'coffee' as const, amount: 3.60, daysAgo: 1, hour: 10, min: 15 },
  { merchant: 'Greggs', category: 'takeaway' as const, amount: 2.90, daysAgo: 1, hour: 13, min: 5 },
  { merchant: 'TfL Travel Charge', category: 'transport' as const, amount: 2.80, daysAgo: 0, hour: 8, min: 45 },
  { merchant: 'M&S Food', category: 'supermarket' as const, amount: 4.10, daysAgo: 0, hour: 12, min: 30 },
];

export function generateInitialTransactions(): Transaction[] {
  const now = new Date();

  return RAW_MOCK_TRANSACTIONS.map((item, index) => {
    const txnDate = new Date(now);
    txnDate.setDate(now.getDate() - item.daysAgo);
    txnDate.setHours(item.hour, item.min, 0, 0);

    const savedToIsa = calculateIsaFromPurchase(item.amount);
    const budgetDeduction = calculateBudgetDeduction(item.amount);

    return {
      id: `txn_mock_${index + 1}`,
      merchant: item.merchant,
      category: item.category,
      amount: item.amount,
      savedToIsa,
      budgetDeduction,
      timestamp: txnDate.toISOString(),
      dateFormatted: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(txnDate),
      timeFormatted: new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(txnDate),
    };
  }).reverse(); // Most recent first
}

export function generateInitialWeekState(
  transactions: Transaction[],
  settings: UserSettings = INITIAL_SETTINGS
): CurrentWeekState {
  const weekly = weeklyBudget(settings.monthlySpareMoney);
  const totalSpent = roundCurrency(transactions.reduce((acc, t) => acc + t.amount, 0));
  const totalSavedFromPurchases = roundCurrency(transactions.reduce((acc, t) => acc + t.savedToIsa, 0));
  const totalDeducted = roundCurrency(transactions.reduce((acc, t) => acc + t.budgetDeduction, 0));
  const budgetRemaining = roundCurrency(weekly - totalDeducted);

  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);

  return {
    weekNumber: 4,
    startDate: start.toISOString(),
    endDate: now.toISOString(),
    weeklyBudget: weekly,
    budgetRemaining,
    totalSpent,
    totalSavedFromPurchases,
    streak: budgetRemaining >= 0 ? 3 : 0,
    isOverBudget: budgetRemaining < 0,
  };
}

export const INITIAL_SAVINGS_POT: SavingsPot = {
  totalBalance: 176.36,
  fromPurchases: 47.66,
  fromLeftoverBudget: 128.70,
  history: [
    {
      weekNumber: 1,
      weekLabel: 'Week 1',
      fromPurchases: 14.20,
      fromLeftover: 42.50,
      totalWeekSavings: 56.70,
      cumulativeTotal: 56.70,
    },
    {
      weekNumber: 2,
      weekLabel: 'Week 2',
      fromPurchases: 15.60,
      fromLeftover: 38.00,
      totalWeekSavings: 53.60,
      cumulativeTotal: 110.30,
    },
    {
      weekNumber: 3,
      weekLabel: 'Week 3',
      fromPurchases: 16.40,
      fromLeftover: 48.20,
      totalWeekSavings: 64.60,
      cumulativeTotal: 174.90,
    },
    {
      weekNumber: 4,
      weekLabel: 'Week 4 (Current)',
      fromPurchases: 1.46,
      fromLeftover: 0,
      totalWeekSavings: 1.46,
      cumulativeTotal: 176.36,
    },
  ],
};
