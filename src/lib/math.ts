import type {
  CurrentWeekState,
  Transaction,
  TransactionCategory,
  UserSettings,
  WeekCloseSummary,
} from '../types';

/**
 * Rounds a number to standard 2 decimal currency places.
 */
export function roundCurrency(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a number as British Pounds (£).
 * Correctly formats negative numbers like -£6.00 or £-6.00.
 */
export function formatGBP(val: number, options?: { showPlus?: boolean }): string {
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absVal);

  if (isNegative) {
    return `-${formatted}`;
  }
  if (options?.showPlus && val > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

/**
 * RULE 2: Weekly budget = monthly spare money / 4.3
 */
export function weeklyBudget(monthlySpareMoney: number): number {
  if (monthlySpareMoney <= 0) return 0;
  return roundCurrency(monthlySpareMoney / 4.3);
}

/**
 * Computes 2% ISA savings contribution for a purchase
 */
export function calculateIsaFromPurchase(purchaseAmount: number): number {
  return roundCurrency(purchaseAmount * 0.02);
}

/**
 * RULE 3: Every purchase uses purchase amount + 2% from budget
 */
export function calculateBudgetDeduction(purchaseAmount: number): number {
  const savedToIsa = calculateIsaFromPurchase(purchaseAmount);
  return roundCurrency(purchaseAmount + savedToIsa);
}

/**
 * RULE 3 & 4:
 * Apply a purchase against the current week:
 * - 2% goes to ISA
 * - purchase + 2% deducted from budget
 * - If budgetRemaining drops below 0, isOverBudget = true and streak breaks to 0
 */
export function applyPurchase(
  currentState: CurrentWeekState,
  purchaseAmount: number,
  merchant: string,
  category: TransactionCategory = 'shopping',
  timestamp: string = new Date().toISOString()
): {
  nextState: CurrentWeekState;
  transaction: Transaction;
  deltaIsa: number;
} {
  const savedToIsa = calculateIsaFromPurchase(purchaseAmount);
  const deduction = calculateBudgetDeduction(purchaseAmount);
  const newBudgetRemaining = roundCurrency(currentState.budgetRemaining - deduction);
  const isOverBudget = newBudgetRemaining < 0;

  // RULE 4: Over budget: streak breaks (resets to 0)
  const streak = isOverBudget ? 0 : currentState.streak;

  const nextState: CurrentWeekState = {
    ...currentState,
    budgetRemaining: newBudgetRemaining,
    totalSpent: roundCurrency(currentState.totalSpent + purchaseAmount),
    totalSavedFromPurchases: roundCurrency(currentState.totalSavedFromPurchases + savedToIsa),
    isOverBudget,
    streak,
  };

  const transaction: Transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    merchant,
    category,
    amount: purchaseAmount,
    savedToIsa,
    budgetDeduction: deduction,
    timestamp,
    dateFormatted: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(timestamp)),
    timeFormatted: new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp)),
  };

  return {
    nextState,
    transaction,
    deltaIsa: savedToIsa,
  };
}

/**
 * RULE 1 & 5:
 * End of week:
 * - Any money left in budget goes to ISA
 * - If at or above £0: streak increases by 1
 * - If below £0: streak resets to 0, no leftover to move
 * - If user updated monthly spare money during the week, it now takes effect for the next week
 */
export function closeWeek(
  currentState: CurrentWeekState,
  settings: UserSettings
): {
  summary: WeekCloseSummary;
  nextWeekState: CurrentWeekState;
  updatedSettings: UserSettings;
} {
  const wasSuccessful = currentState.budgetRemaining >= 0;
  const leftoverMovedToIsa = wasSuccessful ? Math.max(0, currentState.budgetRemaining) : 0;
  const newStreak = wasSuccessful ? currentState.streak + 1 : 0;

  const headlineMessage = wasSuccessful
    ? `You stayed under by ${formatGBP(leftoverMovedToIsa)}. It's now in your ISA`
    : `You went ${formatGBP(Math.abs(currentState.budgetRemaining))} over, but you still saved ${formatGBP(
        currentState.totalSavedFromPurchases
      )} this week`;

  const subMessage = wasSuccessful
    ? `Awesome consistency! Your streak is now ${newStreak} week${newStreak === 1 ? '' : 's'}.`
    : `Don't worry, every week is a fresh slate. Your automatic 2% savings are safe in your pot.`;

  const summary: WeekCloseSummary = {
    weekNumber: currentState.weekNumber,
    weeklyBudget: currentState.weeklyBudget,
    totalSpent: currentState.totalSpent,
    totalSavedFromPurchases: currentState.totalSavedFromPurchases,
    leftoverMovedToIsa,
    finalBudgetRemaining: currentState.budgetRemaining,
    wasSuccessful,
    newStreak,
    headlineMessage,
    subMessage,
  };

  // RULE 1: Apply pending monthly spare money changes from next week
  let effectiveMonthlySpareMoney = settings.monthlySpareMoney;
  let updatedSettings: UserSettings = { ...settings };

  if (settings.hasPendingBudgetChange && settings.nextMonthSpareMoney !== undefined) {
    effectiveMonthlySpareMoney = settings.nextMonthSpareMoney;
    updatedSettings = {
      monthlySpareMoney: effectiveMonthlySpareMoney,
      nextMonthSpareMoney: undefined,
      hasPendingBudgetChange: false,
    };
  }

  const nextWeeklyBudget = weeklyBudget(effectiveMonthlySpareMoney);

  const nextWeekState: CurrentWeekState = {
    weekNumber: currentState.weekNumber + 1,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    weeklyBudget: nextWeeklyBudget,
    budgetRemaining: nextWeeklyBudget,
    totalSpent: 0,
    totalSavedFromPurchases: 0,
    streak: newStreak,
    isOverBudget: false,
  };

  return {
    summary,
    nextWeekState,
    updatedSettings,
  };
}
