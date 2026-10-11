import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useNest } from '../context/NestContext';
import { useEmail } from '../context/EmailContext';
import { formatGBP } from '../lib/math';

export const Header: React.FC = () => {
  const { savingsPot, resetDemo, isSimulating } = useNest();
  const { disconnect, resetOnboarding } = useEmail();

  return (
    <header className="sticky top-0 z-30 bg-navy-950/95 backdrop-blur-sm border-b border-navy-800 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center" aria-label="nest by Starling Engine home">
          <img
            src="/nest-mascot.png"
            alt="nest by Starling Engine"
            className="h-12 w-auto max-w-[112px] object-contain"
          />
        </Link>

        {/* Action / Pot pill */}
        <div className="flex items-center gap-2">
          <Link
            to="/savings"
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-850 border border-navy-700 px-3 py-1.5 rounded-lg transition-colors"
            title="View Spaces savings account"
          >
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Savings:</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 tabular-nums">
              {savingsPot ? formatGBP(savingsPot.totalBalance) : '£0.00'}
            </span>
          </Link>

          <button
            onClick={async () => {
              if (window.confirm('Reset all demo transactions and budget to initial state?')) {
                await disconnect();
                resetOnboarding();
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
