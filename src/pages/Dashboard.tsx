import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNest } from '../context/NestContext';
import { BudgetHeader } from '../components/BudgetHeader';
import { TransactionFeed } from '../components/TransactionFeed';
import { SimulatePurchaseModal } from '../components/SimulatePurchaseModal';
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { weekState, transactions, lastSimulatedTxn, simulateNewPurchase, isLoading } = useNest();
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading || !weekState) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="h-64 rounded-3xl bg-navy-900/50 animate-pulse border border-navy-800" />
        <div className="h-80 rounded-3xl bg-navy-900/30 animate-pulse border border-navy-800/60" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6 animate-fade-in">
      {/* Hero Budget Header */}
      <BudgetHeader
        weekState={weekState}
        onOpenSimulateModal={() => setIsSimulateOpen(true)}
        onOpenCloseWeek={() => navigate('/summary')}
      />

      {/* Explanatory Banner: The 3 Simple Rules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-navy-900/50 border border-navy-800/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="font-bold text-xs">2%</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Auto 2% to ISA</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Every card tap deposits 2% directly into your savings pot.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-navy-900/50 border border-navy-800/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Sunday Leftover Sweep</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Any budget left at the end of the week is moved to your ISA.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-navy-900/50 border border-navy-800/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Streak at £0+</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Finishing the week at or above £0 builds your consecutive streak.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Feed */}
      <TransactionFeed
        transactions={transactions}
        lastSimulatedId={lastSimulatedTxn?.id}
        onSimulateClick={() => setIsSimulateOpen(true)}
      />

      {/* Week Summary Callout Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">Ready to demo Week End?</h4>
            <p className="text-xs text-slate-400">
              Trigger "Close Week" to see the celebration, sweep leftover money to ISA, and increment streak.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/summary')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-navy-600 transition-colors"
        >
          <span>Open Week Summary</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal for Card Purchase Simulation */}
      <SimulatePurchaseModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        weekState={weekState}
        onSimulate={async (amount, merchant, category) => {
          await simulateNewPurchase(amount, merchant, category);
        }}
      />
    </div>
  );
};
