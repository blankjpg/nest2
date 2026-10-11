export type TransactionCategory = 
  | 'supermarket'
  | 'coffee'
  | 'takeaway'
  | 'transport'
  | 'subscriptions'
  | 'shopping'
  | 'entertainment'
  | 'other';

export interface Transaction {
  id: string;
  merchant: string;
  category: TransactionCategory;
  amount: number; // e.g. 50.00
  savedToIsa: number; // 2% e.g. 1.00
  budgetDeduction: number; // amount + savedToIsa e.g. 51.00
  timestamp: string; // ISO string
  dateFormatted?: string;
  timeFormatted?: string;
}

export interface UserSettings {
  monthlySpareMoney: number; // e.g. 430
  nextMonthSpareMoney?: number; // queued change for next week
  hasPendingBudgetChange: boolean;
}

export interface CurrentWeekState {
  weekNumber: number;
  startDate: string;
  endDate: string;
  weeklyBudget: number; // computed from current active monthly spare money / 4.3
  budgetRemaining: number; // can be negative when over budget
  totalSpent: number; // sum of transaction amounts
  totalSavedFromPurchases: number; // sum of 2%
  streak: number; // current consecutive weeks finished >= £0
  isOverBudget: boolean;
}

export interface WeekCloseSummary {
  weekNumber: number;
  weeklyBudget: number;
  totalSpent: number;
  totalSavedFromPurchases: number;
  leftoverMovedToIsa: number;
  finalBudgetRemaining: number;
  wasSuccessful: boolean; // budgetRemaining >= 0
  newStreak: number;
  headlineMessage: string;
  subMessage: string;
}

export interface SavingsWeeklyPoint {
  weekNumber: number;
  weekLabel: string;
  fromPurchases: number;
  fromLeftover: number;
  totalWeekSavings: number;
  cumulativeTotal: number;
}

export interface SavingsPot {
  totalBalance: number;
  fromPurchases: number;
  fromLeftoverBudget: number;
  history: SavingsWeeklyPoint[];
}

