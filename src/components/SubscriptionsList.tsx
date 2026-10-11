import React from 'react';
import { useEmail } from '../context/EmailContext';
import { formatGBP } from '../lib/math';
import { Calendar, CreditCard, Mail } from 'lucide-react';

export const SubscriptionsList: React.FC = () => {
  const { subscriptions, gmailStatus } = useEmail();

  if (!gmailStatus.isConnected || subscriptions.length === 0) {
    return null;
  }

  const totalMonthlySubscriptions = subscriptions.reduce((acc, sub) => acc + sub.amount, 0);

  return (
    <div className="rounded-lg bg-navy-900 border border-navy-800 p-4 sm:p-5 space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-navy-800 text-slate-300 flex items-center justify-center">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>Subscriptions Found</span>
              <span className="text-xs font-semibold px-2 py-0.2 rounded bg-navy-800 text-slate-300 border border-navy-700">
                {subscriptions.length}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Scanned from {gmailStatus.emailAddress} • Display only
            </p>
          </div>
        </div>

        <div className="text-xs font-medium text-slate-300 bg-navy-950/70 border border-navy-800 px-2.5 py-1 rounded-md self-start sm:self-auto">
          <span>Est. monthly: {formatGBP(totalMonthlySubscriptions)}</span>
        </div>
      </div>

      {/* Subscription Items */}
      <div className="space-y-2">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between p-3 rounded-md bg-navy-950/60 border border-navy-800/80"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded bg-navy-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-xs sm:text-sm text-slate-200 truncate block">
                  {sub.name}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Next charge: {sub.nextBillingDate}</span>
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0 pl-3">
              <span className="text-xs sm:text-sm font-bold text-slate-100 tabular-nums">
                {formatGBP(sub.amount)}
              </span>
              <span className="text-[10px] text-slate-400 block">/ month</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

