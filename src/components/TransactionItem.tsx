import React from 'react';
import {
  Coffee,
  ShoppingBag,
  UtensilsCrossed,
  Train,
  Repeat,
  CreditCard,
  Film,
} from 'lucide-react';
import type { Transaction, TransactionCategory } from '../types';
import { formatGBP } from '../lib/math';

interface TransactionItemProps {
  transaction: Transaction;
  isNew?: boolean;
}

const CATEGORY_ICONS: Record<TransactionCategory, React.ElementType> = {
  supermarket: ShoppingBag,
  coffee: Coffee,
  takeaway: UtensilsCrossed,
  transport: Train,
  subscriptions: Repeat,
  shopping: ShoppingBag,
  entertainment: Film,
  other: CreditCard,
};

const CATEGORY_COLORS: Record<TransactionCategory, { bg: string; text: string }> = {
  coffee: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  supermarket: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  takeaway: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  transport: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  subscriptions: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  shopping: { bg: 'bg-pink-500/10', text: 'text-pink-400' },
  entertainment: { bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
  other: { bg: 'bg-slate-500/10', text: 'text-slate-400' },
};

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, isNew }) => {
  const Icon = CATEGORY_ICONS[transaction.category] || CreditCard;
  const colors = CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS.other;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
        isNew
          ? 'bg-emerald-950/40 border-emerald-500/70'
          : 'bg-navy-900/80 hover:bg-navy-850 border-navy-800'
      }`}
    >
      {/* Left: Icon + Merchant Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${colors.bg} ${colors.text} border border-white/5`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-slate-100 truncate block">
              {transaction.merchant}
            </span>
            {isNew && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded">
                New
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
            <span className="capitalize">{transaction.category}</span>
            <span>•</span>
            <span>{transaction.dateFormatted || 'Today'}</span>
            {transaction.timeFormatted && (
              <>
                <span>•</span>
                <span>{transaction.timeFormatted}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Amount & savings badge */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-3">
        <span className="text-sm font-bold text-slate-100 tabular-nums">
          -{formatGBP(transaction.amount)}
        </span>

        {/* The 2% saved tag */}
        <div
          className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tabular-nums"
          title={`2% automatically sent to your savings account: +${formatGBP(transaction.savedToIsa)} (Budget deducted: ${formatGBP(
            transaction.budgetDeduction
          )})`}
        >
          <span>+{formatGBP(transaction.savedToIsa)} saved</span>
        </div>
      </div>
    </div>
  );
};
