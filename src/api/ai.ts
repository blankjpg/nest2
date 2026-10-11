import type { StockIdea } from '../types';

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getStockIdeas(
  monthlySpendingByMerchant: Record<string, number>,
  totalSaved: number
): Promise<StockIdea[]> {
  await delay();
  const topMerchant = Object.entries(monthlySpendingByMerchant)
    .filter(([, amount]) => Number.isFinite(amount) && amount > 0)
    .sort((left, right) => right[1] - left[1])[0];
  const spendingReason = topMerchant
    ? `You spent £${topMerchant[1].toFixed(2)} at ${topMerchant[0]} this month.`
    : `You saved £${totalSaved.toFixed(2)} this month.`;

  return [
    {
      companyName: 'Tesco',
      ticker: 'TSCO',
      reason: spendingReason,
      riskNote: 'Share prices can fall, and retail margins can change.',
    },
    {
      companyName: 'Unilever',
      ticker: 'ULVR',
      reason: 'Everyday household brands feature in many people’s regular shopping.',
      riskNote: 'Global costs and currency movements can affect returns.',
    },
    {
      companyName: 'Deliveroo',
      ticker: 'ROO',
      reason: 'Food delivery is one part of changing takeaway and convenience habits.',
      riskNote: 'Growth companies can be volatile and may lose value.',
    },
  ];
}
