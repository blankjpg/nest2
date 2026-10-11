import React from 'react';
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
  
  const percentageUsed = Math.min(Math.round((totalDeducted / budget) * 100), 100);
  const rawPercentage = Math.round((totalDeducted / budget) * 100);

  return (
    <div
      className={`rounded-xl border p-5 sm:p-6 transition-all ${
        isOver
          ? 'bg-navy-900 border-rose-500/50'
          : 'bg-navy-900 border-navy-800'
      }`}
    >
      {/* Top row: Week info & Streak */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700">
            Week {weekState.weekNumber}
          </span>
          <span className="text-xs text-slate-400">
            Mon – Sun
          </span>
        </div>

        {/* Streak Pill - no emojis, crisp border */}
        <div
          className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border transition-all ${
            weekState.streak > 0 && !isOver
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : 'bg-navy-800 text-slate-400 border-navy-700'
          }`}
        >
          {weekState.streak > 0 && !isOver
            ? `Streak: ${weekState.streak} week${weekState.streak === 1 ? '' : 's'}`
            : 'Streak: 0 weeks (reset)'}
        </div>
      </div>

      {/* Central Budget Display */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-400">
              {isOver ? 'Over budget by' : 'Budget remaining this week'}
            </span>
            {isOver ? (
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                Over budget
              </span>
            ) : (
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                On track
              </span>
            )}
          </div>

          <div
            className={`text-4xl sm:text-5xl font-bold tracking-tight tabular-nums ${
              isOver ? 'text-rose-400' : 'text-white'
            }`}
          >
            {formatGBP(weekState.budgetRemaining)}
          </div>

          <p className="text-xs text-slate-400 mt-1">
            {isOver ? (
              <span className="text-rose-300/90 font-medium">
                2% is still saved to your ISA, but your streak will reset when closing the week.
              </span>
            ) : (
              <span>
                Finish Sunday with £0 or more to deposit remaining budget into your ISA pot.
              </span>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSimulateModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-navy-950 font-bold px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors"
          >
            Simulate Purchase
          </button>

          <button
            onClick={onOpenCloseWeek}
            className="inline-flex items-center justify-center bg-navy-800 hover:bg-navy-750 text-slate-200 font-medium px-3.5 py-2 rounded-lg border border-navy-700 transition-colors text-xs sm:text-sm"
          >
            Close Week
          </button>
        </div>
      </div>

      {/* Progress Bar & Budget Breakdown */}
      <div className="space-y-2 pt-3 border-t border-navy-800">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Used: {rawPercentage}% of weekly budget</span>
          <span>Budget: {formatGBP(weekState.weeklyBudget)}</span>
        </div>

        {/* Bar */}
        <div className="h-2 w-full bg-navy-950 rounded overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isOver
                ? 'bg-rose-500'
                : rawPercentage > 85
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-left">
          <div className="bg-navy-950/70 rounded-md p-2.5 border border-navy-800">
            <span className="text-[11px] text-slate-400 block">Spent on Card</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200 tabular-nums">
              {formatGBP(weekState.totalSpent)}
            </span>
          </div>
          <div className="bg-navy-950/70 rounded-md p-2.5 border border-navy-800">
            <span className="text-[11px] text-emerald-400 block">
              2% to ISA
            </span>
            <span className="text-xs sm:text-sm font-semibold text-emerald-400 tabular-nums">
              +{formatGBP(weekState.totalSavedFromPurchases)}
            </span>
          </div>
          <div className="bg-navy-950/70 rounded-md p-2.5 border border-navy-800">
            <span className="text-[11px] text-slate-400 block">Total Deducted</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-300 tabular-nums">
              {formatGBP(totalDeducted)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
