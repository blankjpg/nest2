import React, { useState } from 'react';
import { X, Coffee, ShoppingCart, Utensils, Train, ArrowRight } from 'lucide-react';
import type { TransactionCategory, CurrentWeekState } from '../types';
import { calculateIsaFromPurchase, calculateBudgetDeduction, formatGBP, roundCurrency } from '../lib/math';

interface SimulatePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekState: CurrentWeekState;
  onSimulate: (amount: number, merchant: string, category: TransactionCategory) => Promise<void>;
}

export const SimulatePurchaseModal: React.FC<SimulatePurchaseModalProps> = ({
  isOpen,
  onClose,
  weekState,
  onSimulate,
}) => {
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');
  const [merchant, setMerchant] = useState('Blank Street Coffee');
  const [amountStr, setAmountStr] = useState('3.90');
  const [category, setCategory] = useState<TransactionCategory>('coffee');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const parsedAmount = Math.max(0, parseFloat(amountStr) || 0);
  const previewIsa = calculateIsaFromPurchase(parsedAmount);
  const previewDeduction = calculateBudgetDeduction(parsedAmount);
  const newBudgetPreview = roundCurrency(weekState.budgetRemaining - previewDeduction);
  const willCauseOverBudget = newBudgetPreview < 0;

  // Amount needed to push over budget for demo
  const amountToOverBudget = Math.max(
    10,
    roundCurrency(Math.max(0, weekState.budgetRemaining) + 15)
  );

  const presets: Array<{
    merchant: string;
    amount: number;
    category: TransactionCategory;
    icon: React.ElementType;
    desc: string;
  }> = [
    {
      merchant: 'Blank Street Coffee',
      amount: 3.90,
      category: 'coffee',
      icon: Coffee,
      desc: 'Coffee run',
    },
    {
      merchant: 'Sainsbury\'s Local',
      amount: 6.50,
      category: 'supermarket',
      icon: ShoppingCart,
      desc: 'Meal deal & snack',
    },
    {
      merchant: 'Dishoom Takeaway',
      amount: 24.50,
      category: 'takeaway',
      icon: Utensils,
      desc: 'Dinner delivery',
    },
    {
      merchant: 'TfL Travel Charge',
      amount: 3.40,
      category: 'transport',
      icon: Train,
      desc: 'Tube fare',
    },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (parsedAmount <= 0 || !merchant.trim()) return;

    setIsSubmitting(true);
    try {
      await onSimulate(parsedAmount, merchant.trim(), category);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPreset = async (preset: {
    merchant: string;
    amount: number;
    category: TransactionCategory;
  }) => {
    setIsSubmitting(true);
    try {
      await onSimulate(preset.amount, preset.merchant, preset.category);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-navy-900 border border-navy-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-navy-800 bg-navy-950/40">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-100">Simulate Card Purchase</h3>
            <p className="text-xs text-slate-400">Tests automatic 2% ISA transfer and budget deduction</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex p-2 bg-navy-950/60 border-b border-navy-800 gap-1.5">
          <button
            type="button"
            onClick={() => setTab('presets')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tab === 'presets'
                ? 'bg-navy-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Presets
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tab === 'custom'
                ? 'bg-navy-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Purchase
          </button>
        </div>

        <div className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto">
          {tab === 'presets' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Tap a purchase to simulate a Starling card transaction:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  const isa = calculateIsaFromPurchase(preset.amount);
                  const deduction = calculateBudgetDeduction(preset.amount);
                  return (
                    <button
                      key={preset.merchant}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleQuickPreset(preset)}
                      className="flex flex-col text-left p-3 rounded-lg bg-navy-950/70 hover:bg-navy-800 border border-navy-800 hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-navy-900 flex items-center justify-center text-slate-300">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-slate-200">
                            {preset.merchant}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-100">
                          {formatGBP(preset.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 pt-1 border-t border-navy-800">
                        <span className="text-emerald-400">+{formatGBP(isa)} to ISA</span>
                        <span>Uses {formatGBP(deduction)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Hackathon Demo Trigger: Push Over Budget */}
              <div className="mt-3 pt-3 border-t border-navy-800">
                <div className="text-xs font-semibold text-rose-400 mb-1.5">
                  Over-budget demo (Rule 4):
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    handleQuickPreset({
                      merchant: 'Weekend Shopping',
                      amount: amountToOverBudget,
                      category: 'shopping',
                    })
                  }
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-rose-950/25 hover:bg-rose-950/50 border border-rose-500/40 text-left transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-rose-300">
                      Simulate Over-Budget Purchase ({formatGBP(amountToOverBudget)})
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Sets budget negative and breaks streak to 0. 2% is still saved to ISA.
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Merchant Name
                </label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g. Pret, Tesco, Uber"
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount (£)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">
                      £
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.10"
                      value={amountStr}
                      onChange={(e) => setAmountStr(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 tabular-nums"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="coffee">Coffee</option>
                    <option value="supermarket">Supermarket</option>
                    <option value="takeaway">Takeaway</option>
                    <option value="transport">Transport</option>
                    <option value="shopping">Shopping</option>
                    <option value="subscriptions">Subscriptions</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Math Preview Box */}
              <div
                className={`p-3 rounded-lg border text-xs ${
                  willCauseOverBudget
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-navy-950/70 border-navy-800'
                }`}
              >
                <div className="font-semibold text-slate-400 mb-1.5 uppercase text-[11px]">
                  Calculation breakdown:
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Card purchase:</span>
                    <span className="font-semibold tabular-nums">{formatGBP(parsedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>+ 2% sent to ISA:</span>
                    <span className="font-bold tabular-nums">+{formatGBP(previewIsa)}</span>
                  </div>
                  <div className="flex justify-between text-slate-200 pt-1 border-t border-navy-800 font-semibold">
                    <span>Budget deduction:</span>
                    <span className="tabular-nums">-{formatGBP(previewDeduction)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-navy-800">
                    <span className="text-slate-400">Remaining budget:</span>
                    <span
                      className={`font-bold tabular-nums ${
                        willCauseOverBudget ? 'text-rose-400' : 'text-slate-100'
                      }`}
                    >
                      {formatGBP(newBudgetPreview)}
                    </span>
                  </div>
                </div>

                {willCauseOverBudget && (
                  <p className="mt-2 pt-1 border-t border-rose-500/30 text-rose-300 text-[11px]">
                    This purchase exceeds your weekly budget and will reset your streak.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || parsedAmount <= 0}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-navy-950 font-bold py-2.5 rounded-lg transition-colors text-xs sm:text-sm"
              >
                Simulate Purchase
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
