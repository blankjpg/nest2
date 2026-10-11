import React, { useState } from 'react';
import { useNest } from '../context/NestContext';
import { useEmail } from '../context/EmailContext';
import { weeklyBudget, formatGBP } from '../lib/math';
import { Check, Loader2, Mail, ArrowRight } from 'lucide-react';

export const OnboardingGate: React.FC = () => {
  const { settings, updateMonthlySpare } = useNest();
  const { gmailStatus, isConnecting, connect, completeOnboarding } = useEmail();

  const [monthlyInput, setMonthlyInput] = useState<string>(
    settings ? settings.monthlySpareMoney.toString() : '430'
  );

  const parsedMonthly = Math.max(0, parseFloat(monthlyInput) || 0);
  const weekly = weeklyBudget(parsedMonthly);

  const handleConnectEmail = async () => {
    // Save any entered monthly spare money
    if (parsedMonthly > 0) {
      await updateMonthlySpare(parsedMonthly);
    }
    await connect();
  };

  const handleFinish = async () => {
    if (parsedMonthly > 0) {
      await updateMonthlySpare(parsedMonthly);
    }
    completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-md bg-navy-900 border border-navy-800 rounded-xl p-6 sm:p-7 space-y-6 shadow-2xl">
        {/* Brand / Welcome Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-navy-950 font-black flex items-center justify-center text-sm shadow-sm">
              n
            </div>
            <span className="font-bold text-lg text-white tracking-tight">nest</span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700">
              Starling
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Welcome to nest
          </h1>
          <p className="text-xs text-slate-400">
            Set your weekly allowance and connect your email to scan receipts before entering.
          </p>
        </div>

        {/* 1. Monthly Spare Money Setup */}
        <div className="space-y-3 pt-1 border-t border-navy-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Monthly Spare Money (£)
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              The amount you have left for non-essential spending.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">
                £
              </span>
              <input
                type="number"
                step="1"
                min="10"
                value={monthlyInput}
                onChange={(e) => setMonthlyInput(e.target.value)}
                placeholder="430"
                className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-7 pr-3 py-2 text-sm font-bold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-navy-950/70 border border-navy-800 text-xs">
            <span className="text-slate-400">Weekly Budget (÷ 4.3):</span>
            <span className="font-bold text-emerald-400 text-sm tabular-nums">
              {formatGBP(weekly)} / week
            </span>
          </div>
        </div>

        {/* 2. Connect Email Step */}
        <div className="space-y-3 pt-3 border-t border-navy-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Email Receipt Scanner
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Read-only
            </span>
          </div>

          {gmailStatus.isConnected ? (
            <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Email connected, receipts scanned</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono pl-6">
                {gmailStatus.emailAddress}
              </p>
              <p className="text-[11px] text-slate-400 pl-6">
                12 receipts & 3 subscriptions found
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 leading-relaxed">
                We scan your email for receipts and subscription notices (like Spotify or Netflix) to see what you spend.
              </p>
              <button
                type="button"
                onClick={handleConnectEmail}
                disabled={isConnecting}
                className="w-full inline-flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-750 disabled:opacity-50 text-slate-200 font-semibold px-4 py-2.5 rounded-lg border border-navy-700 text-xs sm:text-sm transition-colors"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Connect Email</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Enter Platform Action */}
        <div className="pt-3 border-t border-navy-800 space-y-2">
          <button
            type="button"
            onClick={handleFinish}
            disabled={isConnecting}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-navy-950 font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-colors shadow-sm"
          >
            <span>Enter nest</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!gmailStatus.isConnected && (
            <button
              type="button"
              onClick={handleFinish}
              className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 transition-colors py-1"
            >
              Skip email connection for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

