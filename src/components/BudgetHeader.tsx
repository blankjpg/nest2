import React from 'react';
import { Flame, ShieldAlert, Sparkles, Wallet } from 'lucide-react';
import type { CurrentWeekState } from '../types';
import { formatGBP } from '../lib/math';

interface BudgetHeaderProps {
  weekState: CurrentWeekState;
  onOpenSimulateModal: () => void;
  onOpenCloseWeek: () => void;
}

export const BudgetHeader: React.FC<BudgetHeaderProps> = ({
  weekState,
  onOpenSimulateModal,
  onOpenCloseWeek,
}) => {
  const isOver = weekState.isOverBudget || weekState.budgetRemaining < 0;
  const budget = weekState.weeklyBudget > 0 ? weekState.weeklyBudget : 1;
  const totalDeducted = weekState.totalSpent + weekState.totalSavedFromPurchases;
  
  // Cap percentage for the bar but calculate actual ratio
  const percentageUsed = Math.min(Math.round((totalDeducted / budget) * 100), 100);
  const rawPercentage = Math.round((totalDeducted / budget) * 100);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-5 sm:p-7 transition-all duration-300 ${
        isOver
          ? 'bg-gradient-to-br from-rose-950/40 via-navy-900 to-navy-950 border-rose-500/40 shadow-xl shadow-rose-950/30'
          : 'bg-gradient-to-br from-navy-900 via-navy-900/90 to-navy-950 border-navy-700/80 shadow-xl shadow-black/40'
      }`}
    >
      {/* Background ambient glow */}
      <div
        className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isOver ? 'bg-rose-500' : 'bg-emerald-400'
        }`}
      />

      {/* Top row: Week info & Streak */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-navy-800 text-slate-300 border border-navy-700">
            Week {weekState.weekNumber}
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Mon – Sun Cycle
          </span>
        </div>

        {/* Streak Pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all ${
            weekState.streak > 0 && !isOver
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10'
              : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
          }`}
          title={
            weekState.streak > 0 && !isOver
              ? `${weekState.streak} consecutive weeks finished at or above £0`
              : 'Streak is 0. Finish this week at or above £0 to start building your streak!'
          }
        >
          <Flame
            className={`w-3.5 h-3.5 ${
              weekState.streak > 0 && !isOver ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-500'
            }`}
          />
          <span>
            {weekState.streak > 0 && !isOver
              ? `${weekState.streak} Week Streak`
              : '0 Streak (Broken)'}
          </span>
        </div>
      </div>

      {/* Central Budget Display */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs sm:text-sm font-medium text-slate-400">
              {isOver ? 'Over weekly budget by' : 'Budget remaining this week'}
            </span>
            {isOver ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                <ShieldAlert className="w-3 h-3" />
                Over Budget
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                <Sparkles className="w-3 h-3" />
                On Track
              </span>
            )}
          </div>

          <div
            className={`text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums transition-colors ${
              isOver ? 'text-rose-400' : 'text-white'
            }`}
          >
            {formatGBP(weekState.budgetRemaining)}
          </div>

          <p className="text-xs text-slate-400 mt-1">
            {isOver ? (
              <span className="text-rose-300/90 font-medium">
                Purchases still save 2% to your ISA, but your streak will reset at end of week.
              </span>
            ) : (
              <span>
                Finish Sunday with £0 or more to bank leftover budget and extend your streak!
              </span>
            )}
          </p>
        </div>

        {/* Demo Quick Action Buttons */}
        <div className="flex items-center gap-2 sm:self-center">
          <button
            onClick={onOpenSimulateModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-navy-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-150 transform hover:-translate-y-0.5"
          >
            <Wallet className="w-4 h-4 stroke-[2.5]" />
            <span>Simulate Purchase</span>
          </button>

          <button
            onClick={onOpenCloseWeek}
            className="inline-flex items-center justify-center gap-1.5 bg-navy-800 hover:bg-navy-700 active:bg-navy-850 text-slate-200 font-semibold px-3.5 py-2.5 rounded-xl border border-navy-700 transition-colors text-xs sm:text-sm"
            title="Close this week (demo the Sunday sweep to ISA)"
          >
            <span>Close Week</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & Budget Breakdown */}
      <div className="space-y-2 pt-2 border-t border-navy-800/80">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Used: {rawPercentage}% of weekly allowance</span>
          <span>Budget: {formatGBP(weekState.weeklyBudget)}</span>
        </div>

        {/* Bar */}
        <div className="h-2.5 w-full bg-navy-800/90 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isOver
                ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                : rawPercentage > 85
                ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                : 'bg-gradient-to-r from-emerald-500 to-teal-300 shadow-sm shadow-emerald-500/40'
            }`}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>

        {/* Bottom micro-stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center sm:text-left">
          <div className="bg-navy-950/60 rounded-xl p-2.5 border border-navy-800/60">
            <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">Card Spent</span>
            <span className="text-xs sm:text-sm font-bold text-slate-200 tabular-nums">
              {formatGBP(weekState.totalSpent)}
            </span>
          </div>
          <div className="bg-navy-950/60 rounded-xl p-2.5 border border-navy-800/60">
            <span className="text-[10px] sm:text-xs text-emerald-400/90 block font-medium">
              2% to ISA
            </span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 tabular-nums">
              +{formatGBP(weekState.totalSavedFromPurchases)}
            </span>
          </div>
          <div className="bg-navy-950/60 rounded-xl p-2.5 border border-navy-800/60">
            <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">Total Deducted</span>
            <span className="text-xs sm:text-sm font-bold text-slate-300 tabular-nums">
              {formatGBP(totalDeducted)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
