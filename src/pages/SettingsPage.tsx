import React, { useState, useEffect } from 'react';
import { useNest } from '../context/NestContext';
import { weeklyBudget, formatGBP } from '../lib/math';
import { Settings, Clock, Sparkles, Check, AlertCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateMonthlySpare, isLoading } = useNest();
  const [monthlyInput, setMonthlyInput] = useState<string>('430');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (settings) {
      const displayVal = settings.nextMonthSpareMoney ?? settings.monthlySpareMoney;
      setMonthlyInput(displayVal.toString());
    }
  }, [settings]);

  if (isLoading || !settings) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="h-64 rounded-3xl bg-navy-900/50 animate-pulse border border-navy-800" />
      </div>
    );
  }

  const parsedMonthly = Math.max(0, parseFloat(monthlyInput) || 0);
  const calculatedWeekly = weeklyBudget(parsedMonthly);

  const currentWeeklyBudget = weeklyBudget(settings.monthlySpareMoney);
  const pendingWeeklyBudget = settings.nextMonthSpareMoney
    ? weeklyBudget(settings.nextMonthSpareMoney)
    : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedMonthly <= 0) return;
    await updateMonthlySpare(parsedMonthly);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const presets = [300, 430, 500, 650];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-emerald-400" />
          <span>Budget Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Adjust your monthly spare money. nest automatically divides it into your weekly allowance.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="rounded-3xl bg-navy-900 border border-navy-700/80 p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Pending Change Alert Notice */}
        {settings.hasPendingBudgetChange && settings.nextMonthSpareMoney && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-300 block">Pending Budget Update</span>
              <p className="text-amber-200/80 mt-0.5">
                You have queued a new monthly amount of{' '}
                <strong>{formatGBP(settings.nextMonthSpareMoney)}</strong> ({formatGBP(pendingWeeklyBudget!)}
                /week). Under Rule 1, this change takes effect when the current week is closed.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-1.5">
              Monthly Spare Money (£)
            </label>
            <p className="text-xs text-slate-400 mb-3">
              The amount you have left after rent, bills, and fixed commitments.
            </p>

            <div className="relative max-w-sm">
              <span className="absolute left-4 top-3 text-slate-400 font-bold text-base">
                £
              </span>
              <input
                type="number"
                step="1"
                min="10"
                value={monthlyInput}
                onChange={(e) => setMonthlyInput(e.target.value)}
                placeholder="430"
                className="w-full bg-navy-950 border border-navy-700 rounded-2xl pl-9 pr-4 py-3 text-lg font-bold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 tabular-nums transition-colors"
                required
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-slate-400">Presets:</span>
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMonthlyInput(preset.toString())}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 transition-colors"
                >
                  {formatGBP(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Live Weekly Budget Preview Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-navy-950/80 border border-navy-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Weekly Budget Calculation
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Monthly ÷ 4.3
              </span>
            </div>

            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tabular-nums">
                {formatGBP(calculatedWeekly)}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ week</span>
            </div>

            <p className="text-xs text-slate-400 pt-1 border-t border-navy-800">
              Rule 2 divides your monthly spare money by <strong>4.3</strong> (the average number of weeks in a month) for consistent weekly allowances.
            </p>
          </div>

          {/* Important Rule Notice */}
          <div className="p-4 rounded-2xl bg-navy-950/40 border border-navy-800/80 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Note:</strong> Changes apply from next week. Your current active week remains budgeted at <strong>{formatGBP(currentWeeklyBudget)}/week</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Changes Queued for Next Week!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  <span>Update Monthly Amount</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

