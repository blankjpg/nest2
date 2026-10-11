import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNest } from '../context/NestContext';
import { BudgetHeader } from '../components/BudgetHeader';
import { TransactionFeed } from '../components/TransactionFeed';
import { SimulatePurchaseModal } from '../components/SimulatePurchaseModal';
import { ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { weekState, transactions, lastSimulatedTxn, simulateNewPurchase, isLoading } = useNest();
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading || !weekState) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="h-52 rounded-lg bg-navy-900/50 animate-pulse border border-navy-800" />
        <div className="h-72 rounded-lg bg-navy-900/30 animate-pulse border border-navy-800/60" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-20 space-y-5 animate-fade-in">
      {/* Hero Budget Header */}
      <BudgetHeader
        weekState={weekState}
        onOpenSimulateModal={() => setIsSimulateOpen(true)}
        onOpenCloseWeek={() => navigate('/summary')}
      />

      {/* Transaction Feed */}
      <TransactionFeed
        transactions={transactions}
        lastSimulatedId={lastSimulatedTxn?.id}
        onSimulateClick={() => setIsSimulateOpen(true)}
      />

      {/* Week Summary Callout Banner */}
      <div className="p-4 rounded-lg bg-navy-900/90 border border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">End of week preview</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Test the Sunday close: move leftover balance to your ISA pot and check your streak status.
          </p>
        </div>
        <button
          onClick={() => navigate('/summary')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-navy-800 hover:bg-navy-750 active:bg-navy-700 text-slate-200 font-medium text-xs px-3.5 py-2 rounded-lg border border-navy-700 transition-colors whitespace-nowrap"
        >
          <span>Go to Week Summary</span>
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
