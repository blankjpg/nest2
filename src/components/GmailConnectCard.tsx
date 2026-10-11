import React from 'react';
import { useEmail } from '../context/EmailContext';
import { Check, Loader2, Mail, RefreshCw } from 'lucide-react';

interface GmailConnectCardProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export const GmailConnectCard: React.FC<GmailConnectCardProps> = ({ onSuccess, compact = false }) => {
  const { gmailStatus, isConnecting, connect, changeAccount } = useEmail();

  const handleConnect = async () => {
    await connect();
    if (onSuccess) onSuccess();
  };

  const handleChange = async () => {
    await changeAccount();
    if (onSuccess) onSuccess();
  };

  // State 3 & 4: CONNECTED
  if (gmailStatus.isConnected) {
    return (
      <div className="rounded-lg bg-navy-900 border border-navy-800 p-4 sm:p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-100">
                  Successfully connected
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Email connected, receipts scanned
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {gmailStatus.emailAddress}
              </p>
            </div>
          </div>

          <button
            onClick={handleChange}
            disabled={isConnecting}
            className="inline-flex items-center gap-1.5 bg-navy-800 hover:bg-navy-750 disabled:opacity-50 text-slate-300 font-medium px-3 py-1.5 rounded-md border border-navy-700 text-xs transition-colors whitespace-nowrap"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Change account</span>
              </>
            )}
          </button>
        </div>

        {/* Small detail info line */}
        <div className="pt-2 border-t border-navy-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
          <span>Last scanned: {gmailStatus.lastScanned || 'just now'}</span>
          <span className="text-slate-300">
            {gmailStatus.receiptsCount} receipts and {gmailStatus.subscriptionsCount} subscriptions found
          </span>
        </div>
      </div>
    );
  }

  // State 1 & 2: NOT CONNECTED / CONNECTING
  return (
    <div className={`rounded-lg bg-navy-900 border border-navy-800 p-4 sm:p-5 space-y-3 ${compact ? 'text-left' : ''}`}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-md bg-navy-800 border border-navy-700 text-slate-300 flex items-center justify-center flex-shrink-0">
          <Mail className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-100">
            Connect your Gmail
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            Read-only receipt scanner
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        We scan your email for receipts and subscription notices (like Spotify or Netflix) to see what you spend. Read-only. We only look at receipt-type emails.
      </p>

      <div className="pt-1">
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-navy-950 font-bold px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors shadow-sm"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 stroke-[2.5]" />
              <span>Connect Gmail</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

