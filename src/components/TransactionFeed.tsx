import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import type { Transaction } from '../types';
import { TransactionItem } from './TransactionItem';
import { formatGBP } from '../lib/math';

interface TransactionFeedProps {
  transactions: Transaction[];
  lastSimulatedId?: string;
  onSimulateClick: () => void;
}

export const TransactionFeed: React.FC<TransactionFeedProps> = ({
  transactions,
  lastSimulatedId,
  onSimulateClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTransactions = transactions.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  const totalSavedInFeed = transactions.reduce((acc, t) => acc + t.savedToIsa, 0);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'supermarket', label: 'Supermarket' },
    { id: 'takeaway', label: 'Takeaway' },
    { id: 'transport', label: 'Transport' },
    { id: 'subscriptions', label: 'Subscriptions' },
  ];

  return (
    <div className="space-y-3">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100">
              Recent Transactions
            </h2>
            <span className="text-xs font-semibold text-slate-400 px-2 py-0.5 rounded bg-navy-800 border border-navy-700">
              {transactions.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            2% of each purchase is sent automatically to your ISA pot.
          </p>
        </div>

        {transactions.length > 0 && (
          <div className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md self-start sm:self-auto">
            <span>+{formatGBP(totalSavedInFeed)} auto-saved from purchases</span>
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      {transactions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-navy-950 font-bold'
                  : 'bg-navy-900 hover:bg-navy-850 text-slate-400 hover:text-slate-200 border border-navy-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* List / Empty State */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-lg bg-navy-900/40 border border-navy-800">
          <div className="w-12 h-12 mx-auto rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-400 mb-2.5">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            {transactions.length === 0 ? 'No transactions yet this week' : 'No transactions in this category'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
            {transactions.length === 0
              ? 'When card purchases occur, they appear here along with the 2% stashed into your ISA.'
              : 'Try selecting a different filter.'}
          </p>
          {transactions.length === 0 && (
            <button
              onClick={onSimulateClick}
              className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors"
            >
              Simulate Purchase
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((txn) => (
            <TransactionItem
              key={txn.id}
              transaction={txn}
              isNew={txn.id === lastSimulatedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
