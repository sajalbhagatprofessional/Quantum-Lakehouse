import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Database,
  Code2,
  FileText,
  Search,
  Zap,
  ShieldAlert,
  Download,
  CheckCircle2,
  Sparkles,
  Server,
  Cpu,
  Sliders
} from 'lucide-react';
import { TickerMarketData, AISettingsConfig } from '../types';

interface NavbarProps {
  currentTicker: string;
  tickerData: TickerMarketData;
  activeTab: 'dossier' | 'signals' | 'lakehouse' | 'mcp' | 'code';
  setActiveTab: (tab: 'dossier' | 'signals' | 'lakehouse' | 'mcp' | 'code') => void;
  onSelectTicker: (ticker: string) => void;
  isStreaming: boolean;
  setIsStreaming: (val: boolean) => void;
  dataSource?: string;
  isLoadingMarket?: boolean;
  aiSettings: AISettingsConfig;
  onOpenAiSettings: () => void;
}

const PRESET_LIST = ['NVDA', 'MSFT', 'PLTR', 'AAPL', 'TSLA', 'AMD', 'IONQ'];

export const Navbar: React.FC<NavbarProps> = ({
  currentTicker,
  tickerData,
  activeTab,
  setActiveTab,
  onSelectTicker,
  isStreaming,
  setIsStreaming,
  dataSource = 'LIVE_EXCHANGE_FEED',
  isLoadingMarket = false,
  aiSettings,
  onOpenAiSettings,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSelectTicker(searchInput.trim().toUpperCase());
      setSearchInput('');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 50) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (score >= 20) return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    if (score <= -50) return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    if (score <= -20) return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
    return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Ticker Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-900/30 ring-1 ring-cyan-400/40">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white font-mono text-base">QUANTUM LAKEHOUSE</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono font-medium">v2.4 INSTITUTIONAL</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[11px] text-slate-400 hidden sm:block">Automated Data Pipeline & Confluence Signal Dossier</p>
                <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono">
                  <span className={`w-1.5 h-1.5 rounded-full ${isLoadingMarket ? 'bg-amber-400 animate-ping' : dataSource === 'LIVE_EXCHANGE_FEED' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`}></span>
                  <span className={dataSource === 'LIVE_EXCHANGE_FEED' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                    {isLoadingMarket ? 'SYNCING EXCHANGE...' : dataSource === 'LIVE_EXCHANGE_FEED' ? 'LIVE EXCHANGE FEED' : 'CACHED MARKET BASELINE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Buttons & Search */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
              {PRESET_LIST.map((sym) => (
                <button
                  key={sym}
                  onClick={() => onSelectTicker(sym)}
                  className={`px-2.5 py-1 text-xs font-mono font-semibold rounded transition-all ${
                    currentTicker === sym
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Ticker (e.g. MSFT, AMD)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-36 sm:w-44 bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
            </form>
          </div>

          {/* Live Status, AI Settings Button & Confluence Pill */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenAiSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono transition-all"
              title="Configure Ollama, LM Studio, OpenRouter, Gemini, and MCP"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-slate-200 hidden sm:inline">
                {aiSettings.provider === 'ollama' ? 'Ollama' :
                 aiSettings.provider === 'lmstudio' ? 'LM Studio' :
                 aiSettings.provider === 'openrouter' ? 'OpenRouter' :
                 aiSettings.provider === 'local_rule_engine' ? 'Quant Engine' :
                 'Gemini AI'}
              </span>
              <Sliders className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all ${
                isStreaming
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900/60'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
              title="Toggle simulated high-frequency lakehouse streaming feed"
            >
              <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {isStreaming ? 'STREAM' : 'PAUSED'}
            </button>

            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs ${getScoreColor(tickerData.confluence.totalScore)}`}>
              <Zap className="w-3 h-3" />
              <span className="font-bold">
                {tickerData.confluence.totalScore > 0 ? `+${tickerData.confluence.totalScore}` : tickerData.confluence.totalScore}
              </span>
            </div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-t border-slate-800/80 py-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('dossier')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
              activeTab === 'dossier'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Market Intelligence Dossier</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
              {tickerData.ticker}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('signals')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
              activeTab === 'signals'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Quantitative Signal Engine</span>
            {tickerData.confluence.isAdjustedWeight && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5" /> Adjusted Weight
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('lakehouse')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
              activeTab === 'lakehouse'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Lakehouse Architecture & SQL</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-mono">
              DuckDB / Delta
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mcp')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
              activeTab === 'mcp'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span>Model Context Protocol (MCP)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono">
              JSON-RPC 2.0
            </span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
              activeTab === 'code'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Production Pipeline & Export</span>
          </button>
        </div>

      </div>
    </header>
  );
};
