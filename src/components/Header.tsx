import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useNest } from '../context/NestContext';
import { formatGBP } from '../lib/math';

export const Header: React.FC = () => {
  const { savingsPot, resetDemo, isSimulating } = useNest();

  return (
    <header className="sticky top-0 z-30 bg-navy-950/95 backdrop-blur-sm border-b border-navy-800 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-navy-950 font-black flex items-center justify-center text-sm shadow-sm">
            n
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-white tracking-tight">nest</span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700">
              Starling
            </span>
          </div>
        </Link>

        {/* Action / Pot pill */}
        <div className="flex items-center gap-2">
          <Link
            to="/savings"
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-850 border border-navy-700 px-3 py-1.5 rounded-lg transition-colors"
            title="View ISA Savings Pot"
          >
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">ISA:</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 tabular-nums">
              {savingsPot ? formatGBP(savingsPot.totalBalance) : '£0.00'}
            </span>
          </Link>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo transactions and budget to initial state?')) {
                resetDemo();
              }
            }}
            disabled={isSimulating}
            className="p-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-slate-400 hover:text-slate-200 border border-navy-800 transition-colors"
            title="Reset demo data"
            aria-label="Reset demo data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
