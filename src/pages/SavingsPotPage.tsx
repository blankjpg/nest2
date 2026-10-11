import React from 'react';
import { useNest } from '../context/NestContext';
import { formatGBP } from '../lib/math';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

export const SavingsPotPage: React.FC = () => {
  const { savingsPot, isLoading } = useNest();

  if (isLoading || !savingsPot) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="h-40 rounded-lg bg-navy-900/50 animate-pulse border border-navy-800" />
        <div className="h-64 rounded-lg bg-navy-900/30 animate-pulse border border-navy-800" />
      </div>
    );
  }

  const chartData = savingsPot.history.map((h) => ({
    name: h.weekLabel,
    purchases: h.fromPurchases,
    leftover: h.fromLeftover,
    total: h.totalWeekSavings,
  }));

  const purchasePercent = savingsPot.totalBalance > 0
    ? Math.round((savingsPot.fromPurchases / savingsPot.totalBalance) * 100)
    : 0;
  const leftoverPercent = savingsPot.totalBalance > 0
    ? 100 - purchasePercent
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-20 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Savings Pot
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Spaces savings account generated from card purchases and unspent budget.
        </p>
      </div>

      {/* Hero Balance Card */}
      <div className="rounded-xl bg-navy-900 border border-navy-800 p-5 sm:p-6 space-y-5">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total savings balance
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tabular-nums mt-1">
            {formatGBP(savingsPot.totalBalance)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Spaces savings account (cash only, no investments)
          </p>
        </div>

        {/* Split Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-navy-800">
          <div className="bg-navy-950/70 rounded-lg p-3.5 border border-navy-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-400">From purchases (2%)</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                {purchasePercent}%
              </span>
            </div>
            <div className="text-xl font-bold text-slate-100 tabular-nums">
              {formatGBP(savingsPot.fromPurchases)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Accumulated 2% from all card purchases.
            </p>
          </div>

          <div className="bg-navy-950/70 rounded-lg p-3.5 border border-navy-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-400">From leftover budget</span>
              <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                {leftoverPercent}%
              </span>
            </div>
            <div className="text-xl font-bold text-slate-100 tabular-nums">
              {formatGBP(savingsPot.fromLeftoverBudget)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Unspent budget swept into the pot at the end of each week.
            </p>
          </div>
        </div>
      </div>

      {/* Savings per Week Chart */}
      <div className="rounded-xl bg-navy-900 border border-navy-800 p-5 space-y-3">
        <div>
          <h3 className="font-bold text-sm text-slate-100">
            Savings per Week
          </h3>
          <p className="text-xs text-slate-400">
            Weekly 2% purchase savings and leftover budget swept into your savings account
          </p>
        </div>

        <div className="h-60 sm:h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `£${val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-navy-950 border border-navy-700 p-2.5 rounded-lg text-xs space-y-1 shadow-lg">
                        <p className="font-bold text-slate-200">{data.name}</p>
                        <p className="text-emerald-400">2% Purchases: {formatGBP(data.purchases)}</p>
                        <p className="text-teal-400">Leftover Swept: {formatGBP(data.leftover)}</p>
                        <p className="font-bold text-white pt-1 border-t border-navy-800">
                          Total: {formatGBP(data.total)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => (value === 'purchases' ? 'From purchases (2%)' : 'From leftover budget')}
              />
              <Bar dataKey="purchases" fill="#00d09c" radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="leftover" fill="#0ea5e9" radius={[2, 2, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
