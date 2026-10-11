import React from 'react';
import { Link } from 'react-router-dom';
import { PiggyBank, RotateCcw, Sparkles } from 'lucide-react';
import { useNest } from '../context/NestContext';
import { formatGBP } from '../lib/math';

export const Header: React.FC = () => {
  const { savingsPot, resetDemo, isSimulating } = useNest();

  return (
    <header className="sticky top-0 z-30 bg-navy-950/85 backdrop-blur-md border-b border-navy-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-nest-green to-teal-300 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-navy-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight text-white">nest</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Starling
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline -mt-0.5">
              Smart weekly budgeting & auto-ISA
            </span>
          </div>
        </Link>

        {/* Action / Pot pill */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/savings"
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-850 border border-navy-700/70 hover:border-emerald-500/40 px-3 py-1.5 rounded-full transition-all duration-200 shadow-sm group"
            title="View ISA Savings Pot"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-right sm:flex-row sm:items-center sm:gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">ISA Pot:</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 tabular-nums">
                {savingsPot ? formatGBP(savingsPot.totalBalance) : '£0.00'}
              </span>
            </div>
          </Link>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo transactions and budget to initial state?')) {
                resetDemo();
              }
            }}
            disabled={isSimulating}
            className="p-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-slate-400 hover:text-slate-200 border border-navy-800 transition-colors"
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

