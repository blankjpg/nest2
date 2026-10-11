import React, { useState } from 'react';
import { ShoppingBag, Receipt, Sparkles } from 'lucide-react';
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
    { id: 'coffee', label: '☕ Coffee' },
    { id: 'supermarket', label: '🛒 Supermarket' },
    { id: 'takeaway', label: '🍔 Takeaway' },
    { id: 'transport', label: '🚇 Transport' },
    { id: 'subscriptions', label: '🔁 Subscriptions' },
  ];

  return (
    <div className="space-y-4">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>This Week's Activity</span>
            <span className="text-xs font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-navy-800 border border-navy-700">
              {transactions.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every card purchase automatically sends 2% directly to your ISA
          </p>
        </div>

        {transactions.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+{formatGBP(totalSavedInFeed)} saved from card taps</span>
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
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-navy-950 font-bold shadow-sm'
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
        <div className="text-center py-12 px-4 rounded-3xl bg-navy-900/40 border border-navy-800/80">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-navy-800/80 border border-navy-700/80 flex items-center justify-center text-slate-400 mb-3">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-200 mb-1">
            {transactions.length === 0 ? 'No transactions yet this week' : 'No transactions in this category'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {transactions.length === 0
              ? 'Whenever you tap your Starling card, 2% is safely stashed away in your ISA Pot.'
              : 'Try switching to another filter or simulate a new purchase.'}
          </p>
          {transactions.length === 0 && (
            <button
              onClick={onSimulateClick}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate First Purchase</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
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
