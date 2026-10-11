import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';

export const WeekSummaryPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center space-y-5 animate-fade-in">
      <div className="w-12 h-12 mx-auto rounded-lg bg-navy-850 border border-navy-750 text-emerald-400 flex items-center justify-center">
        <Award className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
          Coming Up Next
        </span>
        <h1 className="text-2xl font-bold text-white">Week Summary Page</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          The main showpiece page featuring celebratory animations, leftover sweep to ISA pot, streak building, and calm encouragement when over budget.
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-750 text-slate-200 font-medium px-4 py-2 rounded-lg border border-navy-700 text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
