import type {
  Transaction,
  CurrentWeekState,
  SavingsPot,
  UserSettings,
  WeekCloseSummary,
  TransactionCategory,
} from '../types';
import {
  generateInitialTransactions,
  generateInitialWeekState,
  INITIAL_SAVINGS_POT,
  INITIAL_SETTINGS,
} from './mockData';
import { applyPurchase as calculatePurchase, closeWeek as calculateCloseWeek, roundCurrency } from '../lib/math';

export {
  connectTrading212,
  disconnectTrading212,
  getDemoAccount,
  placeDemoOrder,
  getDemoOrders,
} from './trading212';
export { getStockIdeas } from './ai';
export { getMonthlySummary } from './monthly';

/**
 * =========================================================================
 * NEST API / DATA SERVICE LAYER
 * =========================================================================
 * This data service layer abstracts all data operations for the front end.
 * Currently backed by browser storage and realistic mock data.
 * 
 * TO SWAP IN REAL STARLING API:
 * 1. Replace getTransactions() with a call to:
 *    GET /api/v2/feed/account/{accountUid}/category/{categoryUid}/transactions-between
 * 2. Replace getSavingsPot() with calls to:
 *    GET /api/v2/account/{accountUid}/savings-goals (ISA Pot)
 * 3. Replace simulatePurchase() with a webhook listener or Starling transaction feed poller.
 * 4. Replace closeWeek() with transfer call to:
 *    PUT /api/v2/account/{accountUid}/savings-goals/{savingsGoalUid}/add-money
 * =========================================================================
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'nest_transactions_v2',
  WEEK_STATE: 'nest_week_state_v2',
  SAVINGS_POT: 'nest_savings_pot_v2',
  SETTINGS: 'nest_settings_v2',
};

// Internal in-memory store initialized from localStorage or defaults
class NestStore {
  private transactions: Transaction[];
  private weekState: CurrentWeekState;
  private savingsPot: SavingsPot;
  private settings: UserSettings;

  constructor() {
    this.settings = this.load(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const initialTxns = generateInitialTransactions();
    this.transactions = this.load(STORAGE_KEYS.TRANSACTIONS, initialTxns);
    const initialWeek = generateInitialWeekState(this.transactions, this.settings);
    this.weekState = this.load(STORAGE_KEYS.WEEK_STATE, initialWeek);
    this.savingsPot = this.load(STORAGE_KEYS.SAVINGS_POT, INITIAL_SAVINGS_POT);
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    return fallback;
  }

  private persist(key: string, data: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  getWeekState(): CurrentWeekState {
    return { ...this.weekState };
  }

  getSavingsPot(): SavingsPot {
    return JSON.parse(JSON.stringify(this.savingsPot));
  }

  getSettings(): UserSettings {
    return { ...this.settings };
  }

  updateSettings(newMonthlySpareMoney: number): UserSettings {
    // RULE 1: Change takes effect starting from NEXT week
    this.settings = {
      ...this.settings,
      nextMonthSpareMoney: newMonthlySpareMoney,
      hasPendingBudgetChange: true,
    };
    this.persist(STORAGE_KEYS.SETTINGS, this.settings);
    return { ...this.settings };
  }

  simulatePurchase(amount: number, merchant: string, category: TransactionCategory = 'shopping') {
    const { nextState, transaction, deltaIsa } = calculatePurchase(
      this.weekState,
      amount,
      merchant,
      category
    );

    this.weekState = nextState;
    this.transactions = [transaction, ...this.transactions];

    // Add 2% to savings pot
    this.savingsPot = {
      ...this.savingsPot,
      totalBalance: roundCurrency(this.savingsPot.totalBalance + deltaIsa),
      fromPurchases: roundCurrency(this.savingsPot.fromPurchases + deltaIsa),
    };

    this.persist(STORAGE_KEYS.WEEK_STATE, this.weekState);
    this.persist(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    this.persist(STORAGE_KEYS.SAVINGS_POT, this.savingsPot);

    return {
      transaction,
      weekState: { ...this.weekState },
      savingsPot: { ...this.savingsPot },
    };
  }

  closeWeek(): {
    summary: WeekCloseSummary;
    nextWeekState: CurrentWeekState;
    savingsPot: SavingsPot;
    updatedSettings: UserSettings;
  } {
    const { summary, nextWeekState, updatedSettings } = calculateCloseWeek(
      this.weekState,
      this.settings
    );

    // Update savings pot with leftover moved to ISA
    const updatedLeftover = roundCurrency(this.savingsPot.fromLeftoverBudget + summary.leftoverMovedToIsa);
    const updatedTotalBalance = roundCurrency(this.savingsPot.totalBalance + summary.leftoverMovedToIsa);

    const newHistoryPoint = {
      weekNumber: this.weekState.weekNumber,
      weekLabel: `Week ${this.weekState.weekNumber}`,
      fromPurchases: this.weekState.totalSavedFromPurchases,
      fromLeftover: summary.leftoverMovedToIsa,
      totalWeekSavings: roundCurrency(this.weekState.totalSavedFromPurchases + summary.leftoverMovedToIsa),
      cumulativeTotal: updatedTotalBalance,
    };

    this.savingsPot = {
      ...this.savingsPot,
      fromLeftoverBudget: updatedLeftover,
      totalBalance: updatedTotalBalance,
      history: [...this.savingsPot.history, newHistoryPoint],
    };

    this.weekState = nextWeekState;
    this.settings = updatedSettings;
    // For the demo new week, start with fresh transaction feed
    this.transactions = [];

    this.persist(STORAGE_KEYS.WEEK_STATE, this.weekState);
    this.persist(STORAGE_KEYS.SAVINGS_POT, this.savingsPot);
    this.persist(STORAGE_KEYS.SETTINGS, this.settings);
    this.persist(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    return {
      summary,
      nextWeekState: { ...this.weekState },
      savingsPot: { ...this.savingsPot },
      updatedSettings: { ...this.settings },
    };
  }

  resetAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.WEEK_STATE);
      localStorage.removeItem(STORAGE_KEYS.SAVINGS_POT);
    } catch {
      // Ignore
    }
    this.settings = INITIAL_SETTINGS;
    this.transactions = generateInitialTransactions();
    this.weekState = generateInitialWeekState(this.transactions, this.settings);
    this.savingsPot = INITIAL_SAVINGS_POT;

    this.persist(STORAGE_KEYS.SETTINGS, this.settings);
    this.persist(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    this.persist(STORAGE_KEYS.WEEK_STATE, this.weekState);
    this.persist(STORAGE_KEYS.SAVINGS_POT, this.savingsPot);
  }
}

const store = new NestStore();

// Artificial small latency to simulate network latency and verify loading UX
const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getTransactions(): Promise<Transaction[]> {
  await delay();
  return store.getTransactions();
}

export async function getWeekSummary(): Promise<CurrentWeekState> {
  await delay();
  return store.getWeekState();
}

export async function getSavingsPot(): Promise<SavingsPot> {
  await delay();
  return store.getSavingsPot();
}

export async function getSettings(): Promise<UserSettings> {
  await delay();
  return store.getSettings();
}

export async function updateSettings(monthlySpareMoney: number): Promise<UserSettings> {
  await delay(120);
  return store.updateSettings(monthlySpareMoney);
}

export async function simulatePurchase(
  amount: number,
  merchant: string,
  category: TransactionCategory = 'shopping'
): Promise<{
  transaction: Transaction;
  weekState: CurrentWeekState;
  savingsPot: SavingsPot;
}> {
  await delay(100);
  return store.simulatePurchase(amount, merchant, category);
}

export async function closeWeek(): Promise<{
  summary: WeekCloseSummary;
  nextWeekState: CurrentWeekState;
  savingsPot: SavingsPot;
  updatedSettings: UserSettings;
}> {
  await delay(150);
  return store.closeWeek();
}

export async function resetDemoData(): Promise<void> {
  await delay(100);
  store.resetAll();
}
