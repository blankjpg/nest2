import React from 'react';
import { useNest } from '../context/NestContext';
import { formatGBP } from '../lib/math';
import { Sparkles, TrendingUp, Shield } from 'lucide-react';
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
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="h-48 rounded-3xl bg-navy-900/50 animate-pulse border border-navy-800" />
        <div className="h-64 rounded-3xl bg-navy-900/30 animate-pulse border border-navy-800/60" />
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            Starling Cash ISA Pot
          </span>
          <span className="text-xs text-slate-400">FDIC / FSCS Protected</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
          Savings Pot
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Pure savings generated purely from everyday spending habits. No stocks, no investments.
        </p>
      </div>

      {/* Hero Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-navy-950 border border-navy-700/80 p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total ISA Balance
            </span>
            <div className="text-4xl sm:text-5xl font-black text-emerald-400 tabular-nums mt-1">
              {formatGBP(savingsPot.totalBalance)}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Held in your Starling Cash ISA account</span>
            </p>
          </div>

          <div className="bg-navy-950/80 border border-navy-800 p-4 rounded-2xl flex items-center gap-3 self-start sm:self-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Automatic Accumulation</span>
              <span className="text-sm font-bold text-slate-200">
                Effortless micro-saving
              </span>
            </div>
          </div>
        </div>

        {/* Split Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-navy-800">
          <div className="bg-navy-950/60 rounded-2xl p-4 border border-navy-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">From purchases (2%)</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {purchasePercent}%
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-100 tabular-nums">
              {formatGBP(savingsPot.fromPurchases)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Automatic 2% stashed every time your card is tapped.
            </p>
          </div>

          <div className="bg-navy-950/60 rounded-2xl p-4 border border-navy-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">From leftover budget</span>
              <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                {leftoverPercent}%
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-100 tabular-nums">
              {formatGBP(savingsPot.fromLeftoverBudget)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Swept unspent money at the end of each week.
            </p>
          </div>
        </div>
      </div>

      {/* Savings per Week Chart */}
      <div className="rounded-3xl bg-navy-900/60 border border-navy-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Savings History per Week</span>
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown of 2% purchase savings and leftover budget swept each Sunday
            </p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      <div className="bg-navy-950 border border-navy-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-slate-200">{data.name}</p>
                        <p className="text-emerald-400">2% Purchases: {formatGBP(data.purchases)}</p>
                        <p className="text-teal-400">Leftover Swept: {formatGBP(data.leftover)}</p>
                        <p className="font-bold text-white pt-1 border-t border-navy-800">
                          Total Saved: {formatGBP(data.total)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => (value === 'purchases' ? 'From Purchases (2%)' : 'From Leftover Budget')}
              />
              <Bar dataKey="purchases" fill="#00d09c" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="leftover" fill="#0ea5e9" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
