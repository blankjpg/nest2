import { describe, it, expect } from 'vitest';
import {
  weeklyBudget,
  calculateIsaFromPurchase,
  calculateBudgetDeduction,
  applyPurchase,
  closeWeek,
  formatGBP,
  monthlySavingsTotal,
  investAmount,
} from './math';
import type { CurrentWeekState, UserSettings } from '../types';

describe('Rule 2: weeklyBudget calculations', () => {
  it('calculates weekly budget as monthly spare money / 4.3', () => {
    // 430 / 4.3 = 100
    expect(weeklyBudget(430)).toBe(100);
    // 500 / 4.3 = 116.279... -> 116.28
    expect(weeklyBudget(500)).toBe(116.28);
    // 0 returns 0
    expect(weeklyBudget(0)).toBe(0);
    // 258 / 4.3 = 60
    expect(weeklyBudget(258)).toBe(60);
  });
});

describe('Rule 3: Purchases and 2% ISA savings', () => {
  it('calculates 2% to ISA correctly', () => {
    expect(calculateIsaFromPurchase(50)).toBe(1.0);
    expect(calculateIsaFromPurchase(10)).toBe(0.2);
    expect(calculateIsaFromPurchase(3.45)).toBe(0.07);
  });

  it('calculates budget deduction as purchase + 2%', () => {
    // Example from spec: £50 purchase uses £51 of budget
    expect(calculateBudgetDeduction(50)).toBe(51.0);
    expect(calculateBudgetDeduction(100)).toBe(102.0);
    expect(calculateBudgetDeduction(25)).toBe(25.5);
  });

  it('deducts purchase + 2% from budget and credits ISA while staying in budget', () => {
    const initialState: CurrentWeekState = {
      weekNumber: 1,
      startDate: '2026-10-05T00:00:00.000Z',
      endDate: '2026-10-12T00:00:00.000Z',
      weeklyBudget: 100,
      budgetRemaining: 100,
      totalSpent: 0,
      totalSavedFromPurchases: 0,
      streak: 2,
      isOverBudget: false,
    };

    const { nextState, transaction, deltaIsa } = applyPurchase(
      initialState,
      50,
      'Sainsbury\'s',
      'supermarket'
    );

    expect(transaction.amount).toBe(50);
    expect(transaction.savedToIsa).toBe(1.0);
    expect(transaction.budgetDeduction).toBe(51.0);
    expect(deltaIsa).toBe(1.0);

    expect(nextState.budgetRemaining).toBe(49.0); // 100 - 51
    expect(nextState.totalSpent).toBe(50);
    expect(nextState.totalSavedFromPurchases).toBe(1.0);
    expect(nextState.isOverBudget).toBe(false);
    expect(nextState.streak).toBe(2); // Streak intact
  });
});

describe('Rule 4: Over budget handling', () => {
  it('still sends 2% to ISA, shows negative budget, and breaks streak to 0', () => {
    const currentState: CurrentWeekState = {
      weekNumber: 1,
      startDate: '2026-10-05T00:00:00.000Z',
      endDate: '2026-10-12T00:00:00.000Z',
      weeklyBudget: 100,
      budgetRemaining: 20, // Only £20 remaining
      totalSpent: 78.43,
      totalSavedFromPurchases: 1.57,
      streak: 4, // 4-week active streak
      isOverBudget: false,
    };

    // User makes a £50 purchase, which requires £51 deduction
    const { nextState, transaction, deltaIsa } = applyPurchase(
      currentState,
      50,
      'Deliveroo',
      'takeaway'
    );

    // 2% still goes to ISA!
    expect(deltaIsa).toBe(1.0);
    expect(transaction.savedToIsa).toBe(1.0);
    expect(nextState.totalSavedFromPurchases).toBe(2.57);

    // Budget shows negative number: 20 - 51 = -31
    expect(nextState.budgetRemaining).toBe(-31.0);
    expect(nextState.isOverBudget).toBe(true);

    // Streak breaks and resets to 0
    expect(nextState.streak).toBe(0);
  });
});

describe('Rule 5: End of week (closeWeek)', () => {
  const dummySettings: UserSettings = {
    monthlySpareMoney: 430, // 430 / 4.3 = 100 weekly
    hasPendingBudgetChange: false,
  };

  it('handles ending week at or above £0 (success case): moves leftover to ISA and increments streak', () => {
    const currentState: CurrentWeekState = {
      weekNumber: 3,
      startDate: '2026-10-05T00:00:00.000Z',
      endDate: '2026-10-12T00:00:00.000Z',
      weeklyBudget: 100,
      budgetRemaining: 18.0,
      totalSpent: 80.39,
      totalSavedFromPurchases: 1.61,
      streak: 3,
      isOverBudget: false,
    };

    const { summary, nextWeekState } = closeWeek(currentState, dummySettings);

    expect(summary.wasSuccessful).toBe(true);
    expect(summary.leftoverMovedToIsa).toBe(18.0);
    expect(summary.newStreak).toBe(4); // Incremented from 3 to 4
    expect(summary.headlineMessage).toContain('You stayed under by £18.00');

    // Next week initialized cleanly
    expect(nextWeekState.weekNumber).toBe(4);
    expect(nextWeekState.weeklyBudget).toBe(100);
    expect(nextWeekState.budgetRemaining).toBe(100);
    expect(nextWeekState.totalSpent).toBe(0);
    expect(nextWeekState.streak).toBe(4);
    expect(nextWeekState.isOverBudget).toBe(false);
  });

  it('handles ending week below £0 (over-budget case): no leftover moved, streak resets to 0, shows supportive message', () => {
    const currentState: CurrentWeekState = {
      weekNumber: 2,
      startDate: '2026-10-05T00:00:00.000Z',
      endDate: '2026-10-12T00:00:00.000Z',
      weeklyBudget: 100,
      budgetRemaining: -6.0,
      totalSpent: 103.92,
      totalSavedFromPurchases: 3.2,
      streak: 0,
      isOverBudget: true,
    };

    const { summary, nextWeekState } = closeWeek(currentState, dummySettings);

    expect(summary.wasSuccessful).toBe(false);
    expect(summary.leftoverMovedToIsa).toBe(0);
    expect(summary.newStreak).toBe(0);
    expect(summary.headlineMessage).toContain('You went £6.00 over, but you still saved £3.20 this week');

    // Next week reset
    expect(nextWeekState.weekNumber).toBe(3);
    expect(nextWeekState.weeklyBudget).toBe(100);
    expect(nextWeekState.budgetRemaining).toBe(100);
    expect(nextWeekState.streak).toBe(0);
  });
});

describe('Rule 1: New monthly amount applies next week', () => {
  it('applies pending monthly budget change only when closing the week', () => {
    const currentState: CurrentWeekState = {
      weekNumber: 1,
      startDate: '2026-10-05T00:00:00.000Z',
      endDate: '2026-10-12T00:00:00.000Z',
      weeklyBudget: 100, // based on original 430
      budgetRemaining: 15.0,
      totalSpent: 83.33,
      totalSavedFromPurchases: 1.67,
      streak: 1,
      isOverBudget: false,
    };

    // User changed monthly spare money in settings to £516 (which will be 516 / 4.3 = 120 weekly)
    const settingsWithPendingChange: UserSettings = {
      monthlySpareMoney: 430,
      nextMonthSpareMoney: 516,
      hasPendingBudgetChange: true,
    };

    // During this week, budget is still 100
    expect(currentState.weeklyBudget).toBe(100);

    // Closing the week activates the new monthly amount
    const { nextWeekState, updatedSettings } = closeWeek(
      currentState,
      settingsWithPendingChange
    );

    // Settings now reflect the new active monthly spare money
    expect(updatedSettings.monthlySpareMoney).toBe(516);
    expect(updatedSettings.nextMonthSpareMoney).toBeUndefined();
    expect(updatedSettings.hasPendingBudgetChange).toBe(false);

    // Next week budget is now 516 / 4.3 = 120
    expect(nextWeekState.weeklyBudget).toBe(120);
    expect(nextWeekState.budgetRemaining).toBe(120);
  });
});

describe('Currency formatters', () => {
  it('formats positive and negative currency properly', () => {
    expect(formatGBP(50)).toBe('£50.00');
    expect(formatGBP(-6)).toBe('-£6.00');
    expect(formatGBP(1.5, { showPlus: true })).toBe('+£1.50');
  });
});

describe('Monthly savings calculations', () => {
  it('totals purchase and leftover savings across the month', () => {
    expect(
      monthlySavingsTotal([
        { fromPurchases: 2.25, fromLeftover: 15 },
        { fromPurchases: 1.5, fromLeftover: 0 },
        { fromPurchases: 3.14, fromLeftover: 8.5 },
        { fromPurchases: 0.61, fromLeftover: 11 },
      ])
    ).toBe(42);
  });

  it('includes purchase savings but no leftover for an over-budget week', () => {
    expect(
      monthlySavingsTotal([
        { fromPurchases: 2.4, fromLeftover: 10 },
        { fromPurchases: 3.1, fromLeftover: 0 },
      ])
    ).toBe(15.5);
  });

  it('returns zero when the month has no completed weeks', () => {
    expect(monthlySavingsTotal([])).toBe(0);
  });
});

describe('Demo investment amount calculations', () => {
  it('calculates 100%, 50%, 20%, and a custom percentage of savings', () => {
    expect(investAmount(125.55, 100)).toBe(125.55);
    expect(investAmount(125.55, 50)).toBe(62.78);
    expect(investAmount(125.55, 20)).toBe(25.11);
    expect(investAmount(125.55, 35)).toBe(43.94);
  });

  it('rejects invalid totals and percentages', () => {
    expect(() => investAmount(-1, 50)).toThrow(RangeError);
    expect(() => investAmount(100, 101)).toThrow(RangeError);
  });
});
