import React, { useState, useEffect } from 'react';
import { useNest } from '../context/NestContext';
import { weeklyBudget, formatGBP } from '../lib/math';
import { Clock, Check } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="h-60 rounded-lg bg-navy-900/50 animate-pulse border border-navy-800" />
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-20 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure your monthly spare money and weekly budget allowance.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="rounded-xl bg-navy-900 border border-navy-800 p-5 sm:p-6 space-y-5">
        {/* Pending Change Alert Notice */}
        {settings.hasPendingBudgetChange && settings.nextMonthSpareMoney && (
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-300 block">Pending Budget Update</span>
              <p className="text-amber-200/80 mt-0.5">
                Queued new amount of <strong>{formatGBP(settings.nextMonthSpareMoney)}/month</strong> ({formatGBP(pendingWeeklyBudget!)}/week). Takes effect when current week is closed.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Monthly Spare Money (£)
            </label>
            <p className="text-xs text-slate-400 mb-2.5">
              Enter your monthly disposable income after fixed bills and rent.
            </p>

            <div className="relative max-w-xs">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                £
              </span>
              <input
                type="number"
                step="1"
                min="10"
                value={monthlyInput}
                onChange={(e) => setMonthlyInput(e.target.value)}
                placeholder="430"
                className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-8 pr-3.5 py-2 text-base font-bold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 tabular-nums"
                required
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="text-xs text-slate-400">Presets:</span>
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMonthlyInput(preset.toString())}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-navy-800 hover:bg-navy-750 text-slate-300 border border-navy-700"
                >
                  {formatGBP(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Live Weekly Budget Preview Box */}
          <div className="p-4 rounded-lg bg-navy-950/70 border border-navy-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Weekly Budget (Monthly ÷ 4.3)
              </span>
            </div>

            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-3xl font-extrabold text-emerald-400 tabular-nums">
                {formatGBP(calculatedWeekly)}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ week</span>
            </div>

            <p className="text-xs text-slate-400 pt-1.5 border-t border-navy-800/80">
              Changes apply from next week. Current active week stays at {formatGBP(currentWeeklyBudget)}/week.
            </p>
          </div>

          <div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Queued for next week</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
