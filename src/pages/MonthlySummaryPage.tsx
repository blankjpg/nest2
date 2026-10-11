import React, { useEffect, useState } from 'react';
import { Check, LoaderCircle, TrendingUp, X } from 'lucide-react';
import * as api from '../api';
import type {
  DemoOrder,
  MonthlySummaryData,
  StockIdea,
  Trading212DemoAccount,
} from '../types';
import { formatGBP, investAmount, monthlySavingsTotal } from '../lib/math';

type InvestmentChoice = '100' | '50' | '20' | 'custom';

const currencyDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function getMonthOptions(): Array<{ value: string; label: string }> {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat('en-GB', {
        month: 'long',
        year: 'numeric',
      }).format(date),
    };
  });
}

export const MonthlySummaryPage: React.FC = () => {
  const monthOptions = getMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [summary, setSummary] = useState<MonthlySummaryData | null>(null);
  const [account, setAccount] = useState<Trading212DemoAccount | null>(null);
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [ideas, setIdeas] = useState<StockIdea[] | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isAccountLoading, setIsAccountLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [choices, setChoices] = useState<Record<string, InvestmentChoice>>({});
  const [customPercents, setCustomPercents] = useState<Record<string, string>>({});
  const [reviewIdea, setReviewIdea] = useState<StockIdea | null>(null);
  const [filledOrder, setFilledOrder] = useState<DemoOrder | null>(null);

  useEffect(() => {
    let active = true;
    api
      .getMonthlySummary(selectedMonth)
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load the monthly summary.');
        }
      })
      .finally(() => {
        if (active) setIsSummaryLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedMonth]);

  useEffect(() => {
    let active = true;
    Promise.all([api.getDemoAccount(), api.getDemoOrders()])
      .then(([demoAccount, demoOrders]) => {
        if (active) {
          setAccount(demoAccount);
          setOrders(demoOrders);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load demo account data.');
        }
      })
      .finally(() => {
        if (active) setIsAccountLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!account || !summary) return;

    let active = true;
    api
      .getStockIdeas(summary.spendingByMerchant, monthlySavingsTotal(summary.weeks))
      .then((results) => {
        if (active) setIdeas(results);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load demo ideas.');
        }
      });

    return () => {
      active = false;
    };
  }, [account, summary]);

  const totalFromPurchases = summary?.weeks.reduce((total, week) => total + week.fromPurchases, 0) ?? 0;
  const totalFromLeftover = summary?.weeks.reduce((total, week) => total + week.fromLeftover, 0) ?? 0;
  const totalSaved = summary ? monthlySavingsTotal(summary.weeks) : 0;
  const streakAtMonthEnd = summary?.weeks.at(-1)?.streakResult ?? 0;
  const monthOrders = orders.filter((order) => order.date.slice(0, 7) === selectedMonth);

  const amountForIdea = (ticker: string): number => {
    const choice = choices[ticker] ?? '100';
    const percent = choice === 'custom'
      ? Number(customPercents[ticker] ?? '')
      : Number(choice);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) return 0;
    return investAmount(totalSaved, percent);
  };

  const handleConnect = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey.trim() || isConnecting) return;
    setIsConnecting(true);
    setError(null);
    try {
      const connectedAccount = await api.connectTrading212(apiKey);
      setIdeas(null);
      setAccount(connectedAccount);
      setApiKey('');
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : 'Could not connect the demo account.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    setError(null);
    try {
      await api.disconnectTrading212();
      setAccount(null);
      setIdeas([]);
    } catch (disconnectError) {
      setError(disconnectError instanceof Error ? disconnectError.message : 'Could not disconnect the demo account.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const confirmOrder = async () => {
    if (!reviewIdea || isOrdering) return;
    setIsOrdering(true);
    setError(null);
    try {
      const order = await api.placeDemoOrder(reviewIdea.ticker, amountForIdea(reviewIdea.ticker));
      setFilledOrder(order);
      setReviewIdea(null);
      setOrders(await api.getDemoOrders());
      setAccount(await api.getDemoAccount());
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : 'Could not place the demo order.');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-24 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Monthly Summary</h1>
          <p className="text-xs text-slate-400 mt-0.5">A demo recap of your savings and optional investing.</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          Month
          <select
            value={selectedMonth}
            onChange={(event) => {
              setSelectedMonth(event.target.value);
              setIsSummaryLoading(true);
              setSummary(null);
              setIdeas(null);
              setError(null);
            }}
            className="bg-navy-900 border border-navy-700 text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
            aria-label="Select summary month"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <section className="rounded-xl bg-navy-900 border border-navy-800 p-5 sm:p-6 space-y-5">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total saved this month</span>
          {isSummaryLoading ? (
            <div className="h-10 w-36 rounded bg-navy-800 animate-pulse mt-1" />
          ) : (
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tabular-nums mt-1">
              {formatGBP(totalSaved)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-navy-950/70 border border-navy-800 p-3.5">
            <span className="text-xs text-slate-400">From purchases (2%)</span>
            <p className="text-xl font-bold text-emerald-400 tabular-nums mt-1">{formatGBP(totalFromPurchases)}</p>
          </div>
          <div className="rounded-lg bg-navy-950/70 border border-navy-800 p-3.5">
            <span className="text-xs text-slate-400">From leftover weekly budget</span>
            <p className="text-xl font-bold text-teal-400 tabular-nums mt-1">{formatGBP(totalFromLeftover)}</p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-100 mb-2">Weekly breakdown</h2>
          {isSummaryLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((row) => <div key={row} className="h-12 rounded-lg bg-navy-950/70 animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {summary?.weeks.map((week) => (
                <div
                  key={week.weekNumber}
                  className="grid grid-cols-2 sm:grid-cols-6 gap-x-3 gap-y-1 rounded-lg bg-navy-950/70 border border-navy-800 px-3 py-2.5 text-xs"
                >
                  <span className="font-semibold text-slate-200">Week {week.weekNumber}</span>
                  <span className="text-slate-400">Spent <span className="text-slate-200">{formatGBP(week.totalSpent)}</span></span>
                  <span className="text-slate-400">2% saved <span className="text-emerald-400">{formatGBP(week.fromPurchases)}</span></span>
                  <span className="text-slate-400">Leftover <span className="text-teal-400">{formatGBP(week.fromLeftover)}</span></span>
                  <span className={week.wasSuccessful ? 'text-emerald-400' : 'text-rose-400'}>
                    {week.wasSuccessful ? 'Under budget' : 'Over budget'}
                  </span>
                  <span className="text-slate-400">Streak: <span className="text-slate-200">{week.streakResult}</span></span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-navy-800 bg-navy-950 px-3.5 py-3">
          <span className="text-sm font-semibold text-slate-300">Streak at the end of the month</span>
          <span className="text-sm font-bold text-amber-300">{streakAtMonthEnd} {streakAtMonthEnd === 1 ? 'week' : 'weeks'}</span>
        </div>
      </section>

      <section className="rounded-xl bg-navy-900 border border-navy-800 p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Trading 212 (Demo account)</h2>
            <p className="text-xs text-slate-400 mt-1">Demo environment, no real money</p>
          </div>
          {account && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400"><Check className="w-4 h-4" />Connected</span>}
        </div>

        {isAccountLoading ? (
          <div className="h-16 rounded-lg bg-navy-950/70 animate-pulse" />
        ) : account ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div>
              <p className="text-sm font-semibold text-emerald-300">Demo account connected</p>
              <p className="text-xs text-slate-400 mt-1">Mock demo cash balance: <span className="font-semibold text-slate-200">{formatGBP(account.cashBalance)}</span></p>
            </div>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-navy-750 disabled:opacity-50"
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="API key"
              aria-label="Demo API key"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-lg border border-navy-700 bg-navy-950 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!apiKey.trim() || isConnecting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-navy-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {isConnecting && <LoaderCircle className="w-4 h-4 animate-spin" />}
              {isConnecting ? 'Connecting...' : 'Connect demo account'}
            </button>
          </form>
        )}
      </section>

      {account && (
        <section className="space-y-3 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-white">Ideas for your {formatGBP(totalSaved)} saved this month</h2>
            <p className="text-xs text-slate-400 mt-0.5">Choose a demo amount from this month’s savings total.</p>
          </div>

          {ideas === null ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[0, 1, 2].map((card) => <div key={card} className="h-56 rounded-xl bg-navy-900 border border-navy-800 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ideas.map((idea) => {
                const choice = choices[idea.ticker] ?? '100';
                const amount = amountForIdea(idea.ticker);
                return (
                  <article key={idea.ticker} className="rounded-xl bg-navy-900 border border-navy-800 p-4 flex flex-col gap-3 transition-colors hover:border-emerald-500/30">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">{idea.companyName}</h3>
                        <span className="text-xs font-semibold text-emerald-400">{idea.ticker}</span>
                      </div>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300">{idea.reason}</p>
                    <p className="text-[11px] leading-relaxed text-amber-300/90"><span className="font-semibold">Risk:</span> {idea.riskNote}</p>

                    <label className="text-xs text-slate-400">
                      Amount
                      <select
                        value={choice}
                        onChange={(event) => setChoices((current) => ({
                          ...current,
                          [idea.ticker]: event.target.value as InvestmentChoice,
                        }))}
                        className="mt-1 w-full rounded-lg border border-navy-700 bg-navy-950 px-2.5 py-2 text-slate-100 outline-none focus:border-emerald-500"
                        aria-label={`Investment amount for ${idea.companyName}`}
                      >
                        <option value="100">100%</option>
                        <option value="50">50%</option>
                        <option value="20">20%</option>
                        <option value="custom">Custom %</option>
                      </select>
                    </label>
                    {choice === 'custom' && (
                      <label className="text-xs text-slate-400">
                        Custom percent (0–100)
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={customPercents[idea.ticker] ?? ''}
                          onChange={(event) => setCustomPercents((current) => ({
                            ...current,
                            [idea.ticker]: event.target.value,
                          }))}
                          className="mt-1 w-full rounded-lg border border-navy-700 bg-navy-950 px-2.5 py-2 text-slate-100 outline-none focus:border-emerald-500"
                          aria-label={`Custom investment percent for ${idea.companyName}`}
                        />
                      </label>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs font-semibold text-slate-200">{formatGBP(amount)}</span>
                      <button
                        type="button"
                        onClick={() => setReviewIdea(idea)}
                        disabled={amount <= 0}
                        className="rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-navy-950 hover:bg-emerald-400 disabled:opacity-50"
                      >
                        Buy
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <p className="text-[11px] text-slate-500">AI-generated ideas for a demo. Not financial advice. Investing carries risk.</p>

          <section className="rounded-xl bg-navy-900 border border-navy-800 p-5">
            <h2 className="text-sm font-bold text-white mb-3">Demo orders this month</h2>
            {monthOrders.length === 0 ? (
              <p className="text-xs text-slate-400">No demo orders this month.</p>
            ) : (
              <div className="space-y-2">
                {monthOrders.map((order) => (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-navy-950/70 border border-navy-800 px-3 py-2.5 text-xs">
                    <span className="font-bold text-slate-100">{order.ticker}</span>
                    <span className="text-slate-300">{formatGBP(order.amountGbp)}</span>
                    <span className="text-slate-400">{currencyDate.format(new Date(order.date))}</span>
                    <span className="text-emerald-400">{order.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      )}

      {(reviewIdea || filledOrder) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-order-title"
            className="w-full max-w-md rounded-xl border border-navy-700 bg-navy-900 p-5 shadow-2xl"
          >
            {filledOrder ? (
              <>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-5 h-5" />
                  <h2 id="demo-order-title" className="text-base font-bold">Demo order placed</h2>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-slate-400">Stock</dt><dd className="font-semibold text-slate-100">{filledOrder.ticker}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-slate-400">Amount</dt><dd className="font-semibold text-slate-100">{formatGBP(filledOrder.amountGbp)}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-slate-400">Status</dt><dd className="font-semibold text-emerald-400">{filledOrder.status}</dd></div>
                </dl>
                <button
                  type="button"
                  onClick={() => setFilledOrder(null)}
                  className="mt-5 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-navy-950 hover:bg-emerald-400"
                >
                  Done
                </button>
              </>
            ) : reviewIdea && (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 id="demo-order-title" className="text-base font-bold text-white">Review demo order</h2>
                    <p className="text-xs text-slate-400 mt-1">Nothing is placed until you confirm.</p>
                  </div>
                  <button type="button" onClick={() => setReviewIdea(null)} aria-label="Close order review" className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <dl className="mt-4 space-y-3 rounded-lg bg-navy-950/70 border border-navy-800 p-3.5 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-slate-400">Stock</dt><dd className="text-right font-semibold text-slate-100">{reviewIdea.companyName} ({reviewIdea.ticker})</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-slate-400">Amount</dt><dd className="font-semibold text-slate-100">{formatGBP(amountForIdea(reviewIdea.ticker))}</dd></div>
                  <div><dt className="text-slate-400">Risk reminder</dt><dd className="mt-1 text-xs leading-relaxed text-amber-300">{reviewIdea.riskNote}</dd></div>
                </dl>
                <p className="mt-3 text-[11px] text-slate-500">Demo environment, no real money.</p>
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewIdea(null)}
                    disabled={isOrdering}
                    className="flex-1 rounded-lg border border-navy-700 bg-navy-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-navy-750 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmOrder}
                    disabled={isOrdering}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-navy-950 hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isOrdering && <LoaderCircle className="w-4 h-4 animate-spin" />}
                    {isOrdering ? 'Confirming...' : 'Confirm'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
