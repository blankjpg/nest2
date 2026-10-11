import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNest } from '../context/NestContext';
import { formatGBP } from '../lib/math';
import type { WeekCloseSummary } from '../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const WeekSummaryPage: React.FC = () => {
  const { weekState, executeCloseWeek, isLoading } = useNest();
  const [closedSummary, setClosedSummary] = useState<WeekCloseSummary | null>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const navigate = useNavigate();

  if (isLoading || !weekState) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="h-44 rounded-lg bg-navy-900/50 animate-pulse border border-navy-800" />
      </div>
    );
  }

  const handleCloseWeek = async () => {
    setIsClosing(true);
    try {
      const summary = await executeCloseWeek();
      setClosedSummary(summary);
    } finally {
      setIsClosing(false);
    }
  };

  // 1. POST-CLOSING SUCCESS / OVER-BUDGET STATE
  if (closedSummary) {
    const isUnder = closedSummary.wasSuccessful;
    const totalAddedToIsa = closedSummary.totalSavedFromPurchases + closedSummary.leftoverMovedToIsa;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 pb-20 space-y-5 animate-fade-in">
        {/* Header / Title */}
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                isUnder
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {isUnder ? 'Under budget' : 'Over budget'}
            </span>
            <span className="text-xs text-slate-400">Week {closedSummary.weekNumber} Closed</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5">
            {isUnder ? 'Under budget' : 'Over budget'}
          </h1>
        </div>

        {/* Main Headline Card */}
        <div
          className={`rounded-lg border p-5 space-y-2 ${
            isUnder
              ? 'bg-navy-900 border-emerald-500/40'
              : 'bg-navy-900 border-navy-800'
          }`}
        >
          <h2 className="text-lg sm:text-xl font-bold text-slate-100">
            {closedSummary.headlineMessage}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {closedSummary.subMessage}
          </p>
        </div>

        {/* Week Breakdown Summary */}
        <div className="rounded-lg bg-navy-900 border border-navy-800 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Week {closedSummary.weekNumber} Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-navy-950/70 rounded-md p-3 border border-navy-800">
              <span className="text-xs text-slate-400 block">Total Spent</span>
              <span className="text-base font-bold text-slate-200 tabular-nums">
                {formatGBP(closedSummary.totalSpent)}
              </span>
            </div>

            <div className="bg-navy-950/70 rounded-md p-3 border border-navy-800">
              <span className="text-xs text-emerald-400 block">2% From Purchases</span>
              <span className="text-base font-bold text-emerald-400 tabular-nums">
                +{formatGBP(closedSummary.totalSavedFromPurchases)}
              </span>
            </div>

            <div className="bg-navy-950/70 rounded-md p-3 border border-navy-800">
              <span className="text-xs text-teal-400 block">Leftover Moved to ISA</span>
              <span className="text-base font-bold text-teal-400 tabular-nums">
                +{formatGBP(closedSummary.leftoverMovedToIsa)}
              </span>
            </div>
          </div>

          {/* Total Stashed Row */}
          <div className="flex items-center justify-between p-3 rounded-md bg-navy-950 border border-navy-800 text-xs sm:text-sm">
            <span className="font-semibold text-slate-300">Total added to ISA this week:</span>
            <span className="font-bold text-emerald-400 text-base tabular-nums">
              +{formatGBP(totalAddedToIsa)}
            </span>
          </div>

          {/* Streak Status */}
          <div className="flex items-center justify-between p-3 rounded-md bg-navy-950 border border-navy-800 text-xs sm:text-sm">
            <span className="font-semibold text-slate-300">Streak:</span>
            <span
              className={`font-bold tabular-nums ${
                isUnder ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              {closedSummary.newStreak > 0
                ? `${closedSummary.newStreak} week${closedSummary.newStreak === 1 ? '' : 's'}`
                : '0 weeks (reset)'}
            </span>
          </div>
        </div>

        {/* Action Button: Start Next Week */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-navy-950 font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm transition-colors"
          >
            <span>Start Next Week</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/savings')}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-navy-800 hover:bg-navy-750 text-slate-200 font-medium px-4 py-2.5 rounded-lg border border-navy-700 text-xs sm:text-sm transition-colors"
          >
            View Savings Pot
          </button>
        </div>
      </div>
    );
  }

  // 2. BEFORE CLOSING (THE SUNDAY REVIEW STATE)
  const isCurrentUnder = weekState.budgetRemaining >= 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 pb-20 space-y-5 animate-fade-in">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              isCurrentUnder
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {isCurrentUnder ? 'Under budget' : 'Over budget'}
          </span>
          <span className="text-xs text-slate-400">Week {weekState.weekNumber} Review</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5">
          {isCurrentUnder ? 'Under budget' : 'Over budget'}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Review your current weekly totals before closing and transferring funds.
        </p>
      </div>

      {/* Week Review Card */}
      <div className="rounded-lg bg-navy-900 border border-navy-800 p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Current Totals
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="bg-navy-950/70 rounded-md p-3 border border-navy-800">
            <span className="text-xs text-slate-400 block">Total Spent</span>
            <span className="text-base font-bold text-slate-200 tabular-nums">
              {formatGBP(weekState.totalSpent)}
            </span>
          </div>

          <div className="bg-navy-950/70 rounded-md p-3 border border-navy-800">
            <span className="text-xs text-emerald-400 block">2% Saved (Purchases)</span>
            <span className="text-base font-bold text-emerald-400 tabular-nums">
              +{formatGBP(weekState.totalSavedFromPurchases)}
            </span>
          </div>

          <div className="bg-navy-950/70 rounded-md p-3 border border-navy-800">
            <span className="text-xs text-slate-400 block">
              {isCurrentUnder ? 'Leftover to Move to ISA' : 'Over Budget Amount'}
            </span>
            <span
              className={`text-base font-bold tabular-nums ${
                isCurrentUnder ? 'text-teal-400' : 'text-rose-400'
              }`}
            >
              {formatGBP(weekState.budgetRemaining)}
            </span>
          </div>
        </div>

        {/* Explanation of what closing will do */}
        <div className="p-3.5 rounded-md bg-navy-950/70 border border-navy-800 text-xs space-y-1">
          <span className="font-semibold text-slate-200 block">
            What happens when you close the week:
          </span>
          {isCurrentUnder ? (
            <p className="text-slate-400">
              Any remaining budget ({formatGBP(weekState.budgetRemaining)}) will be moved to your Starling ISA pot, and your streak will increase from {weekState.streak} to {weekState.streak + 1} weeks.
            </p>
          ) : (
            <p className="text-slate-400">
              No leftover budget is available to move, and your streak will reset to 0 weeks. Your {formatGBP(weekState.totalSavedFromPurchases)} saved from 2% purchases remains safe in your pot.
            </p>
          )}
        </div>

        {/* Action Button: Close Week */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleCloseWeek}
            disabled={isClosing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-navy-950 font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm transition-colors"
          >
            <span>{isClosing ? 'Closing week...' : 'Close Week'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-navy-800 hover:bg-navy-750 text-slate-300 font-medium px-4 py-2.5 rounded-lg border border-navy-700 text-xs sm:text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
