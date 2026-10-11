import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  CurrentWeekState,
  Transaction,
  SavingsPot,
  UserSettings,
  WeekCloseSummary,
  TransactionCategory,
} from '../types';
import * as api from '../api';

interface NestContextType {
  weekState: CurrentWeekState | null;
  transactions: Transaction[];
  savingsPot: SavingsPot | null;
  settings: UserSettings | null;
  isLoading: boolean;
  lastSimulatedTxn: Transaction | null;
  isSimulating: boolean;
  simulateNewPurchase: (amount: number, merchant: string, category?: TransactionCategory) => Promise<void>;
  executeCloseWeek: () => Promise<WeekCloseSummary>;
  updateMonthlySpare: (amount: number) => Promise<void>;
  resetDemo: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NestContext = createContext<NestContextType | undefined>(undefined);

export const NestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weekState, setWeekState] = useState<CurrentWeekState | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsPot, setSavingsPot] = useState<SavingsPot | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [lastSimulatedTxn, setLastSimulatedTxn] = useState<Transaction | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [w, t, p, s] = await Promise.all([
        api.getWeekSummary(),
        api.getTransactions(),
        api.getSavingsPot(),
        api.getSettings(),
      ]);
      setWeekState(w);
      setTransactions(t);
      setSavingsPot(p);
      setSettings(s);
    } catch (err) {
      console.error('Failed to load Nest data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const simulateNewPurchase = async (
    amount: number,
    merchant: string,
    category: TransactionCategory = 'shopping'
  ) => {
    setIsSimulating(true);
    try {
      const result = await api.simulatePurchase(amount, merchant, category);
      setWeekState(result.weekState);
      setSavingsPot(result.savingsPot);
      setTransactions((prev) => [result.transaction, ...prev]);
      setLastSimulatedTxn(result.transaction);

      // Clear the highlight after 4 seconds
      setTimeout(() => {
        setLastSimulatedTxn((curr) => (curr?.id === result.transaction.id ? null : curr));
      }, 4000);
    } finally {
      setIsSimulating(false);
    }
  };

  const executeCloseWeek = async (): Promise<WeekCloseSummary> => {
    setIsLoading(true);
    try {
      const result = await api.closeWeek();
      setWeekState(result.nextWeekState);
      setSavingsPot(result.savingsPot);
      setSettings(result.updatedSettings);
      setTransactions([]);
      return result.summary;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMonthlySpare = async (amount: number) => {
    const updated = await api.updateSettings(amount);
    setSettings(updated);
  };

  const resetDemo = async () => {
    setIsLoading(true);
    await api.resetDemoData();
    await loadData();
  };

  return (
    <NestContext.Provider
      value={{
        weekState,
        transactions,
        savingsPot,
        settings,
        isLoading,
        lastSimulatedTxn,
        isSimulating,
        simulateNewPurchase,
        executeCloseWeek,
        updateMonthlySpare,
        resetDemo,
        refresh: loadData,
      }}
    >
      {children}
    </NestContext.Provider>
  );
};

export function useNest(): NestContextType {
  const context = useContext(NestContext);
  if (!context) {
    throw new Error('useNest must be used within a NestProvider');
  }
  return context;
}
