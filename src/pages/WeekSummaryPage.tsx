import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';

export const WeekSummaryPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center space-y-6 animate-fade-in">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
        <Award className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Coming Up Next
        </span>
        <h1 className="text-3xl font-extrabold text-white">Week Summary Page</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The main showpiece page featuring celebratory animations, leftover sweep to ISA pot, streak building, and calm encouragement when over budget will be built in the next step.
        </p>
      </div>

      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-slate-200 font-semibold px-5 py-2.5 rounded-xl border border-navy-700 text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to This Week Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
