import type { MonthlySummaryData } from '../types';
import { calculateIsaFromPurchase, roundCurrency } from '../lib/math';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));
const WEEKLY_BUDGET = 100;
const MOCK_WEEKLY_SPENDING = [42, 74, 96, 108, 63];

export async function getMonthlySummary(month: string): Promise<MonthlySummaryData> {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error('Month must use the YYYY-MM format.');
  }

  await delay();
  let streak = 0;
  const weeks = MOCK_WEEKLY_SPENDING.map((totalSpent, index) => {
    const fromPurchases = calculateIsaFromPurchase(totalSpent);
    const amountAfterPurchaseSavings = roundCurrency(totalSpent + fromPurchases);
    const wasSuccessful = amountAfterPurchaseSavings <= WEEKLY_BUDGET;
    const fromLeftover = wasSuccessful
      ? roundCurrency(WEEKLY_BUDGET - amountAfterPurchaseSavings)
      : 0;

    streak = wasSuccessful ? streak + 1 : 0;
    return {
      weekNumber: index + 1,
      totalSpent,
      fromPurchases,
      fromLeftover,
      wasSuccessful,
      streakResult: streak,
    };
  });

  return {
    weeks,
    spendingByMerchant: {
      Tesco: 42,
      Pret: 28,
      Amazon: 31,
      Deliveroo: 24,
    },
  };
}
