import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  Bot,
  ShieldAlert,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Sliders,
  Sparkles,
  Lock,
  Unlock,
  Building,
  Landmark,
  Eye,
  FileCheck,
  Send,
  HelpCircle
} from 'lucide-react';
import {
  TickerMarketData,
  AISettingsConfig,
  RobinhoodAccount,
  AutomatedTradingStrategy,
  StrategyCondition,
  GovernmentDisclosureFeedStatus,
  PoliticalInsiderTrade
} from '../types';

interface AutomatedTradingViewProps {
  currentTickerData: TickerMarketData;
  aiSettings: AISettingsConfig;
  onOpenAiSettings: () => void;
  onSelectTicker: (ticker: string) => void;
}

const AI_STRATEGY_PRESETS = [
  {
    title: '🏛️ Congress & SEC Insider Follower',
    prompt: 'Automatically buy $2,500 of NVDA whenever an official SEC Form 4 or US Congressional STOCK Act purchase is ingested from government portals and Lakehouse Confluence Score is >= 50. Set a 4.5% stop loss and 9% take profit target.'
  },
  {
    title: '⚡ High Confluence Momentum Breakout',
    prompt: 'Execute a 5% portfolio position on MSFT when the Confluence Score reaches STRONG BULLISH (>= 75) with Supertrend BULLISH confirmation. Set a 3.5% stop loss and 7.5% take profit.'
  },
  {
    title: '🌊 Dark Pool Surge & RSI Dip Buyer',
    prompt: 'Detect unusual off-exchange dark pool prints on PLTR (> 2.0σ Volume Z-Score) while 14-day RSI is under 50. Allocate $3,000 via limit order with a 3.0% stop loss.'
  },
  {
    title: '🛡️ Asymmetric Risk/Reward Swing Entry',
    prompt: 'Buy 25 shares of AAPL when price tests the Ideal Entry Zone ($220-$225) and EMA20 > EMA50. Invalidate position with a 3% stop loss, target 1 at +6%, target 2 at +12%.'
  }
];

export const AutomatedTradingView: React.FC<AutomatedTradingViewProps> = ({
  currentTickerData,
  aiSettings,
  onOpenAiSettings,
  onSelectTicker
}) => {
  // State
  const [account, setAccount] = useState<RobinhoodAccount | null>(null);
  const [strategies, setStrategies] = useState<AutomatedTradingStrategy[]>([]);
  const [disclosureFeed, setDisclosureFeed] = useState<GovernmentDisclosureFeedStatus | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSyncingGov, setIsSyncingGov] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // AI Strategy Builder State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isParsingAi, setIsParsingAi] = useState<boolean>(false);
  const [parsedStrategyPreview, setParsedStrategyPreview] = useState<AutomatedTradingStrategy | null>(null);
  const [activeTabSub, setActiveTabSub] = useState<'strategies' | 'positions' | 'orders' | 'disclosures'>('strategies');

  // Manual Order State
  const [showManualOrderModal, setShowManualOrderModal] = useState<boolean>(false);
  const [orderTicker, setOrderTicker] = useState<string>(currentTickerData.ticker);
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [orderShares, setOrderShares] = useState<number>(10);
  const [orderLimitPrice, setOrderLimitPrice] = useState<number>(currentTickerData.currentPrice);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Robinhood Credentials Modal
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [rhUsername, setRhUsername] = useState<string>('institutional_trader');
  const [rhApiKey, setRhApiKey] = useState<string>('');

  // Fetch account data
  const fetchAccountData = async () => {
    try {
      const res = await fetch('/api/trading/account');
      const data = await res.json();
      if (data.success && data.account) {
        setAccount(data.account);
      }
    } catch (e: any) {
      console.error('Error fetching account:', e);
    }
  };

  // Fetch strategies
  const fetchStrategies = async () => {
    try {
      const res = await fetch('/api/trading/strategies');
      const data = await res.json();
      if (data.success && data.strategies) {
        setStrategies(data.strategies);
      }
    } catch (e: any) {
      console.error('Error fetching strategies:', e);
    }
  };

  // Fetch government disclosures feed
  const fetchDisclosures = async () => {
    try {
      const res = await fetch('/api/government-disclosures/feed');
      const data = await res.json();
      if (data.success && data.feed) {
        setDisclosureFeed(data.feed);
      }
    } catch (e: any) {
      console.error('Error fetching disclosures:', e);
    }
  };

  // Initial and periodic refresh
  useEffect(() => {
    const init = async () => {
      setIsLoadingAccount(true);
      await Promise.all([fetchAccountData(), fetchStrategies(), fetchDisclosures()]);
      setIsLoadingAccount(false);
    };
    init();

    const interval = setInterval(() => {
      fetchAccountData();
      fetchDisclosures();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Update order limit price when ticker changes
  useEffect(() => {
    setOrderTicker(currentTickerData.ticker);
    setOrderLimitPrice(currentTickerData.currentPrice);
  }, [currentTickerData]);

  // Flash message helper
  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Toggle Demo vs Live mode
  const handleToggleMode = async () => {
    try {
      const res = await fetch('/api/trading/account/toggle-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success && data.account) {
        setAccount(data.account);
        showNotification(`Switched trading execution mode to ${data.mode}.`);
      }
    } catch (e: any) {
      showNotification('Failed to toggle mode: ' + e.message, true);
    }
  };

  // Reset Demo Portfolio
  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/trading/account/reset-demo', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.account) {
        setAccount(data.account);
        showNotification('Demo Robinhood Sandbox reset to $100,000 baseline.');
      }
    } catch (e: any) {
      showNotification('Failed to reset demo: ' + e.message, true);
    }
  };

  // Connect Robinhood Credentials
  const handleConnectRobinhood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/trading/account/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: rhUsername, apiKey: rhApiKey })
      });
      const data = await res.json();
      if (data.success && data.account) {
        setAccount(data.account);
        setShowConnectModal(false);
        showNotification('Robinhood Account successfully linked with active trade routing.');
      }
    } catch (e: any) {
      showNotification('Failed to link credentials: ' + e.message, true);
    }
  };

  // Parse strategy with AI
  const handleParseAiStrategy = async () => {
    if (!aiPrompt.trim()) return;
    setIsParsingAi(true);
    setParsedStrategyPreview(null);
    try {
      const res = await fetch('/api/trading/ai/parse-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          defaultTicker: currentTickerData.ticker,
          settings: aiSettings
        })
      });
      const data = await res.json();
      if (data.success && data.strategy) {
        setParsedStrategyPreview(data.strategy);
        showNotification(`Strategy successfully structured via ${data.source}.`);
      } else {
        showNotification(data.error || 'Failed to parse strategy with AI.', true);
      }
    } catch (e: any) {
      showNotification('AI Parser error: ' + e.message, true);
    } finally {
      setIsParsingAi(false);
    }
  };

  // Save / Activate strategy
  const handleSaveStrategy = async (strategy: AutomatedTradingStrategy) => {
    try {
      const res = await fetch('/api/trading/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strategy)
      });
      const data = await res.json();
      if (data.success && data.strategies) {
        setStrategies(data.strategies);
        setParsedStrategyPreview(null);
        setAiPrompt('');
        showNotification(`Automated Strategy "${strategy.name}" is now ACTIVE on Robinhood.`);
      }
    } catch (e: any) {
      showNotification('Failed to save strategy: ' + e.message, true);
    }
  };

  // Toggle strategy active/pause
  const handleToggleStrategy = async (id: string) => {
    try {
      const res = await fetch(`/api/trading/strategies/${id}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.strategies) {
        setStrategies(data.strategies);
        const updated = data.strategies.find((s: any) => s.id === id);
        showNotification(`Strategy "${updated?.name}" is now ${updated?.isActive ? 'ACTIVE' : 'PAUSED'}.`);
      }
    } catch (e: any) {
      showNotification('Failed to toggle strategy: ' + e.message, true);
    }
  };

  // Delete strategy
  const handleDeleteStrategy = async (id: string) => {
    try {
      const res = await fetch(`/api/trading/strategies/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && data.strategies) {
        setStrategies(data.strategies);
        showNotification('Strategy deleted from execution engine.');
      }
    } catch (e: any) {
      showNotification('Failed to delete strategy: ' + e.message, true);
    }
  };

  // Test execute strategy now
  const handleTestExecuteStrategy = async (id: string) => {
    try {
      const res = await fetch(`/api/trading/strategies/${id}/execute-now`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        if (data.account) setAccount(data.account);
        fetchStrategies();
      } else {
        showNotification(data.error || 'Execution failed.', true);
      }
    } catch (e: any) {
      showNotification('Execution failed: ' + e.message, true);
    }
  };

  // Place manual order
  const handlePlaceManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOrder(true);
    try {
      const res = await fetch('/api/trading/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: orderTicker,
          side: orderSide,
          orderType,
          shares: orderShares,
          price: orderType === 'LIMIT' ? orderLimitPrice : currentTickerData.currentPrice,
          triggeredBy: 'User Manual Order Entry via Trading Console'
        })
      });
      const data = await res.json();
      if (data.success && data.account) {
        setAccount(data.account);
        setShowManualOrderModal(false);
        showNotification(`Order placed: ${orderSide} ${orderShares} shares of ${orderTicker.toUpperCase()} filled.`);
      } else {
        showNotification(data.error || 'Order placement failed.', true);
      }
    } catch (e: any) {
      showNotification('Order error: ' + e.message, true);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Force sync government disclosures
  const handleForceSyncGov = async () => {
    setIsSyncingGov(true);
    try {
      const res = await fetch('/api/government-disclosures/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.feed) {
        setDisclosureFeed(data.feed);
        showNotification('Official SEC EDGAR and US Congressional disclosure portals synced.');
      }
    } catch (e: any) {
      showNotification('Sync failed: ' + e.message, true);
    } finally {
      setIsSyncingGov(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Notifications */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200 text-xs">Dismiss</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200 text-xs">Dismiss</button>
        </div>
      )}

      {/* Main Execution Header & Robinhood Status Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Account Identity */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white font-mono">ROBINHOOD AUTOMATED TRADING ENGINE</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border ${
                  account?.mode === 'DEMO'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${account?.mode === 'DEMO' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`}></span>
                  {account?.mode === 'DEMO' ? 'DEMO SANDBOX SIMULATOR' : 'LIVE ROBINHOOD ROUTING'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Account ID: <span className="text-slate-200">{account?.accountNumber || 'RH-DEMO-88492018'}</span> • Multi-Factor Quantitative Trigger Routing
              </p>
            </div>
          </div>

          {/* Execution Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mode Switcher */}
            <button
              id="btn-toggle-demo-live"
              onClick={handleToggleMode}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-semibold text-slate-200 flex items-center gap-2 transition-all"
              title="Toggle between Safe Demo Sandbox Simulator and Live Robinhood Order Routing"
            >
              {account?.mode === 'DEMO' ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
              <span>{account?.mode === 'DEMO' ? 'Switch to Live Mode' : 'Switch to Demo Sandbox'}</span>
            </button>

            {/* Quick Manual Trade */}
            <button
              id="btn-open-manual-order"
              onClick={() => setShowManualOrderModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Place Manual Order</span>
            </button>

            {/* Account Settings / Connect */}
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2 transition-all"
            >
              <Sliders className="w-4 h-4 text-slate-400" />
              <span>Account Credentials</span>
            </button>

            {/* Demo Reset */}
            {account?.mode === 'DEMO' && (
              <button
                onClick={handleResetDemo}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-all"
                title="Reset Demo sandbox cash & positions to baseline $100,000"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Government Disclosure Sync Sub-Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Landmark className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong className="text-cyan-300">Government Disclosure Pipeline:</strong> SEC Form 4 (EDGAR) & US Congressional STOCK Act auto-syncing every 45s
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 text-[10px]">
              {disclosureFeed?.totalFilingsCount || 142} Ingested
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">
              Last Synced: <span className="text-slate-300">{disclosureFeed?.lastSyncedAt ? new Date(disclosureFeed.lastSyncedAt).toLocaleTimeString() : 'Just now'}</span>
            </span>
            <button
              onClick={handleForceSyncGov}
              disabled={isSyncingGov}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingGov ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isSyncingGov ? 'Syncing...' : 'Sync from Source'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Financial Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Total Portfolio Value */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Total Portfolio Value</span>
          <div className="text-xl font-bold font-mono text-white">
            ${account?.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '109,028.00'}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs font-mono text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{account?.todaysReturnPct || 2.4}% today</span>
          </div>
        </div>

        {/* Buying Power */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Available Buying Power</span>
          <div className="text-xl font-bold font-mono text-cyan-400">
            ${account?.buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '54,320.00'}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">Cash Balance: ${account?.cashBalance.toLocaleString() || '54,320'}</div>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Unrealized P&L</span>
          <div className={`text-xl font-bold font-mono ${(account?.unrealizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {(account?.unrealizedPnL || 0) >= 0 ? '+' : ''}${account?.unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '+3,229.00'}
          </div>
          <div className="text-[11px] font-mono text-emerald-400/80 mt-1">
            +{(account?.unrealizedPnLPct || 5.8).toFixed(2)}% on open equity
          </div>
        </div>

        {/* Realized P&L */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Realized Net Profit</span>
          <div className="text-xl font-bold font-mono text-emerald-300">
            +${account?.realizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '+3,420.50'}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">From automated triggers</div>
        </div>

        {/* Active Automated Strategies */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Active Quant Rules</span>
          <div className="text-xl font-bold font-mono text-purple-400 flex items-center gap-2">
            <span>{strategies.filter((s) => s.isActive).length} Active</span>
            <span className="text-xs text-slate-500 font-normal">/ {strategies.length} Total</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Real-time monitoring active</span>
          </div>
        </div>

      </div>

      {/* AI Strategy Builder Card */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                AI NATURAL LANGUAGE STRATEGY ARCHITECT
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {aiSettings.provider.toUpperCase()} ENGINE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Describe your investment rules, indicators, or government insider triggers in plain English. The AI compiler will structure and deploy the live execution pipeline.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAiSettings}
            className="text-xs font-mono text-purple-300 hover:text-purple-100 flex items-center gap-1.5 bg-purple-950/40 px-3 py-1.5 rounded-lg border border-purple-800/40"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure AI Model</span>
          </button>
        </div>

        {/* Strategy Prompt Input */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              id="input-ai-strategy-prompt"
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={`Describe your trading strategy (e.g. "Buy $2000 of ${currentTickerData.ticker} whenever Congress members disclose purchases and Lakehouse Confluence Score > 60 with a 4% stop loss and 8% profit target")...`}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
            />
            
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                id="btn-compile-ai-strategy"
                onClick={handleParseAiStrategy}
                disabled={isParsingAi || !aiPrompt.trim()}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all disabled:opacity-50"
              >
                {isParsingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Structuring Strategy with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Compile & Structure Strategy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset Prompts Chips */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span className="text-slate-500 text-[11px]">Instant Presets:</span>
            {AI_STRATEGY_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAiPrompt(preset.prompt);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition-all text-[11px]"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Parsed Strategy Live Preview */}
        {parsedStrategyPreview && (
          <div className="mt-4 pt-4 border-t border-purple-500/20 bg-purple-950/20 rounded-xl p-4 border border-purple-500/30 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-purple-300 font-bold block">
                  AI Structured Strategy Specification
                </span>
                <h3 className="text-base font-bold text-white font-mono mt-0.5">{parsedStrategyPreview.name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{parsedStrategyPreview.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-deploy-parsed-strategy"
                  onClick={() => handleSaveStrategy(parsedStrategyPreview)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deploy to Robinhood Engine</span>
                </button>
                <button
                  onClick={() => setParsedStrategyPreview(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Condition Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400 text-[10px] block">Target Ticker</span>
                <span className="text-white font-bold">{parsedStrategyPreview.ticker}</span>
              </div>
              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400 text-[10px] block">Action & Sizing</span>
                <span className="text-emerald-400 font-bold">
                  {parsedStrategyPreview.action} {parsedStrategyPreview.sizingType === 'FIXED_DOLLARS' ? `$${parsedStrategyPreview.sizingValue}` : `${parsedStrategyPreview.sizingValue}% Port`}
                </span>
              </div>
              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400 text-[10px] block">Stop Loss / Invalidation</span>
                <span className="text-rose-400 font-bold">{parsedStrategyPreview.stopLossPct}% Stop Loss</span>
              </div>
              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400 text-[10px] block">Take Profit Target</span>
                <span className="text-emerald-300 font-bold">+{parsedStrategyPreview.takeProfitPct}% Profit Target</span>
              </div>
            </div>

            {/* Trigger Conditions */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
              <span className="text-[11px] font-mono text-slate-400 self-center">Trigger Conditions:</span>
              {parsedStrategyPreview.conditions.map((cond, i) => (
                <span key={i} className="px-2.5 py-1 rounded bg-slate-800 text-purple-300 text-xs font-mono border border-purple-800/40">
                  {cond.label} ({cond.operator} {cond.threshold})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTabSub('strategies')}
            className={`px-4 py-2.5 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTabSub === 'strategies'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Active Automated Strategies ({strategies.length})</span>
          </button>

          <button
            onClick={() => setActiveTabSub('positions')}
            className={`px-4 py-2.5 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTabSub === 'positions'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Robinhood Positions ({account?.positions.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTabSub('orders')}
            className={`px-4 py-2.5 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTabSub === 'orders'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Execution Audit Trail ({account?.orders.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTabSub('disclosures')}
            className={`px-4 py-2.5 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTabSub === 'disclosures'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Government Insider Feed ({disclosureFeed?.recentDisclosures.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Active Automated Strategies */}
      {activeTabSub === 'strategies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map((strat) => (
              <div
                key={strat.id}
                className={`bg-slate-900/90 border rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                  strat.isActive ? 'border-slate-700 ring-1 ring-emerald-500/20' : 'border-slate-800 opacity-60'
                }`}
              >
                <div>
                  {/* Top Status & Controls */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                        {strat.ticker} • {strat.action}
                      </span>
                      <h4 className="text-sm font-bold text-white font-mono mt-1.5">{strat.name}</h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStrategy(strat.id)}
                        className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
                          strat.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                        title={strat.isActive ? 'Pause Strategy' : 'Activate Strategy'}
                      >
                        {strat.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteStrategy(strat.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700 transition-all"
                        title="Delete Strategy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">{strat.description}</p>

                  {/* Conditions checklist */}
                  <div className="space-y-1.5 bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80 mb-3">
                    <span className="text-[10px] font-mono text-slate-400 block font-semibold">TRIGGERS & MONITORING:</span>
                    {strat.conditions.map((cond, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 truncate max-w-[200px]">{cond.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          ACTIVE
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Parameters Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 mb-3">
                    <div>
                      <span>Sizing: </span>
                      <strong className="text-slate-200">
                        {strat.sizingType === 'FIXED_DOLLARS' ? `$${strat.sizingValue}` : `${strat.sizingValue}% Port`}
                      </strong>
                    </div>
                    <div>
                      <span>Stop Loss: </span>
                      <strong className="text-rose-400">{strat.stopLossPct}%</strong>
                    </div>
                    <div>
                      <span>Profit Target: </span>
                      <strong className="text-emerald-400">+{strat.takeProfitPct}%</strong>
                    </div>
                    <div>
                      <span>Executions: </span>
                      <strong className="text-slate-200">{strat.currentExecutions} / {strat.maxExecutions}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {strat.lastExecutedAt ? `Last: ${new Date(strat.lastExecutedAt).toLocaleTimeString()}` : 'Waiting for trigger'}
                  </span>
                  
                  <button
                    onClick={() => handleTestExecuteStrategy(strat.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1 border border-slate-700 transition-all"
                  >
                    <Play className="w-3 h-3 text-emerald-400" />
                    <span>Test Trigger</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Robinhood Positions */}
      {activeTabSub === 'positions' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>LIVE ROBINHOOD POSITIONS</span>
              <span className="text-xs text-slate-400 font-normal">({account?.positions.length || 0} Open Assets)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Total Equity Value: <strong className="text-white">${account?.portfolioValue.toLocaleString()}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Shares</th>
                  <th className="py-3 px-4">Avg Cost</th>
                  <th className="py-3 px-4">Current Price</th>
                  <th className="py-3 px-4">Total Value</th>
                  <th className="py-3 px-4">Unrealized P&L</th>
                  <th className="py-3 px-4">Port %</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {account?.positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectTicker(pos.ticker)}
                        className="text-left font-bold text-cyan-400 hover:underline flex items-center gap-1.5"
                      >
                        <span>{pos.ticker}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({pos.companyName})</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 font-bold">{pos.shares}</td>
                    <td className="py-3 px-4">${pos.avgCost.toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold">${pos.currentPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold">${pos.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${pos.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toFixed(2)} ({pos.unrealizedPnLPct > 0 ? '+' : ''}{pos.unrealizedPnLPct}%)
                      </span>
                    </td>
                    <td className="py-3 px-4">{pos.equityPct}%</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setOrderTicker(pos.ticker);
                            setOrderSide('BUY');
                            setOrderShares(10);
                            setShowManualOrderModal(true);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-[11px] font-mono"
                        >
                          Buy More
                        </button>
                        <button
                          onClick={() => {
                            setOrderTicker(pos.ticker);
                            setOrderSide('SELL');
                            setOrderShares(pos.shares);
                            setShowManualOrderModal(true);
                          }}
                          className="px-2.5 py-1 rounded bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30 text-[11px] font-mono"
                        >
                          Close / Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Execution Audit Trail */}
      {activeTabSub === 'orders' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>TRADE EXECUTION & ORDER AUDIT TRAIL</span>
              <span className="text-xs text-slate-400 font-normal">({account?.orders.length || 0} Records)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Deterministic Robinhood Routing Log</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Side</th>
                  <th className="py-3 px-4">Order Type</th>
                  <th className="py-3 px-4">Shares</th>
                  <th className="py-3 px-4">Fill Price</th>
                  <th className="py-3 px-4">Total Value</th>
                  <th className="py-3 px-4">Trigger Source / Strategy</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {account?.orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{new Date(ord.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 font-bold text-cyan-400">{ord.ticker}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {ord.side}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{ord.orderType}</td>
                    <td className="py-3 px-4 font-bold">{ord.shares}</td>
                    <td className="py-3 px-4">${ord.executionPrice?.toFixed(2) || ord.requestedPrice?.toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold">${ord.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[240px]" title={ord.triggeredBy}>
                      {ord.strategyName || ord.triggeredBy}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Government Insider Disclosures Feed */}
      {activeTabSub === 'disclosures' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>OFFICIAL GOVERNMENT DISCLOSURES FEED (SEC FORM 4 & US CONGRESS STOCK ACT)</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Live stream of executive C-Suite open-market purchases and Congressional committee members buying equities
              </p>
            </div>

            <button
              onClick={handleForceSyncGov}
              disabled={isSyncingGov}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGov ? 'animate-spin' : ''}`} />
              <span>Fetch Latest Disclosures</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Filing Date</th>
                  <th className="py-3 px-4">Official / Filer</th>
                  <th className="py-3 px-4">Role / Committee</th>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Volume Bracket</th>
                  <th className="py-3 px-4">Delay Lag</th>
                  <th className="py-3 px-4">Official Source</th>
                  <th className="py-3 px-4 text-right">Automate Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {disclosureFeed?.recentDisclosures.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{item.filingDate}</td>
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                      {item.role === 'SENATOR' || item.role === 'REPRESENTATIVE' ? (
                        <Landmark className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : (
                        <Building className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      )}
                      <span>{item.filerName}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.committee || item.role}
                    </td>
                    <td className="py-3 px-4 font-bold text-cyan-400">{item.asset}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.transactionType === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">{item.volumeBracket}</td>
                    <td className="py-3 px-4">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        item.disclosureLagDays <= 3 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {item.disclosureLagDays}d lag
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{item.sourceFiling}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setAiPrompt(`Automatically buy $2,500 of ${item.asset} whenever ${item.filerName} or Capitol Hill officials disclose stock purchases and Lakehouse Confluence Score > 55 with a 4% stop loss.`);
                          window.scrollTo({ top: 100, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1 rounded bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 text-[11px] font-mono"
                      >
                        Auto-Copy Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Order Modal */}
      {showManualOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span>Place Order on Robinhood</span>
              </h3>
              <button onClick={() => setShowManualOrderModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handlePlaceManualOrder} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Ticker Symbol</label>
                <input
                  type="text"
                  value={orderTicker}
                  onChange={(e) => setOrderTicker(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Side</label>
                  <select
                    value={orderSide}
                    onChange={(e: any) => setOrderSide(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                  >
                    <option value="BUY">BUY (Long)</option>
                    <option value="SELL">SELL (Close)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Order Type</label>
                  <select
                    value={orderType}
                    onChange={(e: any) => setOrderType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                  >
                    <option value="MARKET">MARKET</option>
                    <option value="LIMIT">LIMIT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Number of Shares</label>
                  <input
                    type="number"
                    min="1"
                    value={orderShares}
                    onChange={(e) => setOrderShares(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Est. Price / Share</label>
                  <input
                    type="number"
                    step="0.01"
                    value={orderLimitPrice}
                    onChange={(e) => setOrderLimitPrice(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span>Estimated Total:</span>
                  <strong className="text-white text-sm">${(orderShares * orderLimitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Execution Mode:</span>
                  <span className="text-amber-400">{account?.mode === 'DEMO' ? 'Demo Sandbox (Zero Risk)' : 'Live Robinhood Account'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualOrderModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className={`px-5 py-2 rounded-lg text-white font-bold ${
                    orderSide === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {isSubmittingOrder ? 'Submitting...' : `Confirm ${orderSide} Order`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Robinhood Account Credentials Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <span>Robinhood Account Configuration</span>
              </h3>
              <button onClick={() => setShowConnectModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConnectRobinhood} className="space-y-3 font-mono text-xs">
              <p className="text-slate-400">
                Connect your Robinhood API credentials or use the built-in Sandbox Simulator with realistic fills and position tracking.
              </p>

              <div>
                <label className="block text-slate-400 mb-1">Robinhood Username / ID</label>
                <input
                  type="text"
                  value={rhUsername}
                  onChange={(e) => setRhUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  placeholder="e.g. your_robinhood_account"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Robinhood API Key / OAuth Token (Optional)</label>
                <input
                  type="password"
                  value={rhApiKey}
                  onChange={(e) => setRhApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  placeholder="sk_rh_..."
                />
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-300 text-[11px]">
                💡 <strong>Demo Sandbox is Active:</strong> You can place unlimited automated trades, test triggers, and simulate government disclosure copy-trading without real monetary risk.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
