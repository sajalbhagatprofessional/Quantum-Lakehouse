import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Crosshair,
  Sliders,
  DollarSign,
  AlertTriangle,
  Building2,
  Landmark,
  Scale,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Info,
  Calendar,
  Compass
} from 'lucide-react';
import { TickerMarketData, AISettingsConfig } from '../types';
import { Cpu, Server } from 'lucide-react';

interface ExecutiveDossierProps {
  data: TickerMarketData;
  onRefreshData?: () => void;
  dataSource?: string;
  isLoadingMarket?: boolean;
  aiSettings?: AISettingsConfig;
  onOpenAiSettings?: () => void;
}

function formatMarketCap(cap: number): string {
  if (!cap || isNaN(cap)) return 'N/A';
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
  return `$${cap.toLocaleString()}`;
}

export const ExecutiveDossierView: React.FC<ExecutiveDossierProps> = ({
  data,
  onRefreshData,
  dataSource = 'LIVE_EXCHANGE_FEED',
  isLoadingMarket = false,
  aiSettings,
  onOpenAiSettings
}) => {
  // Chart Toggle States
  const [showEMA, setShowEMA] = useState(true);
  const [showSupertrend, setShowSupertrend] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showVWAP, setShowVWAP] = useState(true);
  const [activeSubchart, setActiveSubchart] = useState<'rsi' | 'macd'>('rsi');

  // Position Size Calculator
  const [portfolioSize, setPortfolioSize] = useState<number>(100000);
  const [riskTolerancePercent, setRiskTolerancePercent] = useState<number>(1.0);

  // AI Synthesis State
  const [aiSynthesis, setAiSynthesis] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSource, setAiSource] = useState<string>('');
  const [copiedDossier, setCopiedDossier] = useState(false);

  // Reset AI synthesis when ticker changes
  React.useEffect(() => {
    setAiSynthesis(null);
    setCopiedDossier(false);
  }, [data.ticker]);

  const bullishSetup = data.tradeSetups.bullish;
  const bearishSetup = data.tradeSetups.bearish;

  // Position sizing math
  const maxDollarRisk = (portfolioSize * riskTolerancePercent) / 100;
  const dollarRiskPerShare = Math.max(0.1, bullishSetup.idealEntry - bullishSetup.stopLoss);
  const recommendedShares = Math.floor(maxDollarRisk / dollarRiskPerShare);
  const totalPositionCost = recommendedShares * bullishSetup.idealEntry;

  const handleGenerateAiReport = async () => {
    setIsGeneratingAi(true);
    try {
      // Fetch dynamic MCP tool context if enabled
      let mcpToolContext = [];
      if (aiSettings?.mcpEnabled) {
        try {
          const mcpCallRes = await fetch('/api/mcp/call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toolName: 'get_ticker_confluence',
              arguments: { ticker: data.ticker }
            })
          });
          const mcpData = await mcpCallRes.json();
          if (mcpData.success) {
            mcpToolContext.push(mcpData);
          }
        } catch {
          // continue
        }
      }

      const res = await fetch('/api/generate-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickerData: data,
          settings: aiSettings,
          mcpToolContext
        }),
      });
      const json = await res.json();
      if (json.analysis) {
        setAiSynthesis(json.analysis);
        setAiSource(json.source || (aiSettings?.provider ? `${aiSettings.provider.toUpperCase()} (${aiSettings.model})` : 'GEMINI_3_7_FLASH'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const copyDossierToClipboard = () => {
    const text = `# STOCK MARKET INTELLIGENCE DOSSIER: ${data.ticker} (${data.companyName})
Price: $${data.currentPrice.toFixed(2)} (${data.changePercent > 0 ? '+' : ''}${data.changePercent}%)
Confluence Score: ${data.confluence.totalScore}/100 (${data.confluence.regime})
Conviction: ${data.confluence.convictionLevel}

---
## 1. Executive Summary & Market Regime
- Sector: ${data.sector} | Industry: ${data.industry}
- Market Cap: $${(data.marketCap / 1e9).toFixed(1)}B | Beta: ${data.beta}
- Primary Trend: ${data.multiTimeframe.tf1d} on 1-Day, ${data.multiTimeframe.tf1w} on 1-Week
- Moving Averages: Price vs EMA20: ${data.candles[data.candles.length-1]?.ema20} | EMA50: ${data.candles[data.candles.length-1]?.ema50} | EMA200: ${data.candles[data.candles.length-1]?.ema200}

## 2. Fundamental Valuation & Solvency
- P/E TTM: ${data.fundamentals.peRatio}x (Sector Median: ${data.fundamentals.sectorMedianPe}x)
- EV/EBITDA: ${data.fundamentals.evToEbitda}x (Sector Median: ${data.fundamentals.sectorMedianEvEbitda}x)
- Revenue Growth YoY: +${data.fundamentals.revenueGrowthYoy}% | FCF Yield: ${data.fundamentals.freeCashFlowYield}%
- Debt to Equity: ${data.fundamentals.debtToEquity} | Piotroski F-Score: ${data.fundamentals.piotroskiFScore}/9

## 3. Institutional Order Flow & Dark Pools
- Recent Prints: ${data.institutionalFlow.length} monitored block orders
- Net Institutional Sentiment: ${data.confluence.pillars.institutionalFlow.status}

## 4. Regulatory & Congressional Disclosures
- Insider Status: ${data.hasInsiderData ? `${data.politicalInsiderTrades.length} confirmed disclosures` : '[NO CONFIRMED DATA AVAILABLE]'}
${data.politicalInsiderTrades.map(t => `- ${t.filerName} (${t.role}): ${t.transactionType} ${t.asset} (~$${(t.estimatedAmount/1e3).toFixed(0)}k, Lag: ${t.disclosureLagDays}d)`).join('\n')}

## 5. Quantitative Trade Scenarios
- Long Setup: Entry $${bullishSetup.idealEntry} | Stop $${bullishSetup.stopLoss} | Target 1 $${bullishSetup.target1} (R:R ${bullishSetup.riskRewardRatioT1}x) | Target 2 $${bullishSetup.target2} (R:R ${bullishSetup.riskRewardRatioT2}x)
- Invalidation: ${bullishSetup.invalidationTrigger}
`;
    navigator.clipboard.writeText(text);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 50) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    if (score >= 20) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score <= -50) return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    if (score <= -20) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* 1. EXECUTIVE METRIC RIBBON */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">{data.ticker}</h1>
              <span className="text-sm sm:text-base text-slate-300 font-medium">{data.companyName}</span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                {data.sector} • {data.industry}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 font-mono">
              <span className="text-2xl font-extrabold text-white">${data.currentPrice.toFixed(2)}</span>
              <span className={`flex items-center text-sm font-semibold px-2 py-0.5 rounded ${data.changeAmount >= 0 ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'}`}>
                {data.changeAmount >= 0 ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                {data.changeAmount >= 0 ? `+${data.changeAmount.toFixed(2)}` : data.changeAmount.toFixed(2)} ({data.changePercent >= 0 ? `+${data.changePercent.toFixed(2)}%` : `${data.changePercent.toFixed(2)}%`})
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">Volume: {(data.currentVolume / 1e6).toFixed(1)}M shares</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {isLoadingMarket ? 'SYNCING REAL EXCHANGE...' : 'EXCHANGE VERIFIED PRICE'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenAiSettings && (
              <button
                onClick={onOpenAiSettings}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono border border-slate-700 transition-all"
                title="Configure Ollama, LM Studio, OpenRouter, Gemini, and MCP tools"
              >
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">
                  {aiSettings?.provider === 'ollama' ? 'Ollama' :
                   aiSettings?.provider === 'lmstudio' ? 'LM Studio' :
                   aiSettings?.provider === 'openrouter' ? 'OpenRouter' :
                   aiSettings?.provider === 'local_rule_engine' ? 'Quant Engine' :
                   'Gemini AI'}
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Settings</span>
              </button>
            )}

            <button
              onClick={handleGenerateAiReport}
              disabled={isGeneratingAi}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-900/30 transition-all disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing ({aiSettings?.model || 'Dossier'})...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>AI Quantitative Synthesis</span>
                </>
              )}
            </button>

            <button
              onClick={copyDossierToClipboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
              title="Copy complete dossier in institutional markdown format"
            >
              {copiedDossier ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedDossier ? 'Copied Markdown' : 'Copy Dossier'}</span>
            </button>
          </div>
        </div>

        {/* Quick Quantitative Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 font-mono">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Confluence Score</span>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-base font-bold px-2 py-0.5 rounded border ${getScoreBadgeClass(data.confluence.totalScore)}`}>
                {data.confluence.totalScore > 0 ? `+${data.confluence.totalScore}` : data.confluence.totalScore}/100
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block truncate">
              {data.confluence.regime.replace('_', ' ')}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Market Cap</span>
            <span className="text-base font-bold text-white block mt-1">{formatMarketCap(data.marketCap)}</span>
            <span className="text-[10px] text-slate-400 block">Beta: {data.beta}</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">52-Week Range</span>
            <span className="text-xs font-semibold text-slate-200 block mt-1.5">
              ${data.yearLow.toFixed(1)} – ${data.yearHigh.toFixed(1)}
            </span>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(5, ((data.currentPrice - data.yearLow) / (data.yearHigh - data.yearLow || 1)) * 100))}%`
                }}
              />
            </div>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Valuation (P/E)</span>
            <span className="text-base font-bold text-white block mt-1">{data.fundamentals.peRatio.toFixed(1)}x</span>
            <span className="text-[10px] text-slate-400 block">Sec Med: {data.fundamentals.sectorMedianPe}x</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Piotroski Quality</span>
            <span className="text-base font-bold text-emerald-400 block mt-1">{data.fundamentals.piotroskiFScore}/9 F-Score</span>
            <span className="text-[10px] text-slate-400 block">Rev YoY: +{data.fundamentals.revenueGrowthYoy}%</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Next Earnings</span>
            <span className="text-xs font-semibold text-slate-200 block mt-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              {data.nextEarningsDate}
            </span>
            <span className="text-[10px] text-slate-400 block">FCF Yield: {data.fundamentals.freeCashFlowYield}%</span>
          </div>
        </div>
      </div>

      {/* 2. AI SYNTHESIS DRAWER / CONTAINER (WHEN GENERATED) */}
      {aiSynthesis && (
        <div className="bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-900 border border-blue-500/30 rounded-xl p-5 shadow-2xl relative">
          <div className="flex items-center justify-between pb-3 border-b border-blue-500/20 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-sm font-mono text-cyan-200 uppercase tracking-wider">
                Institutional Executive Synthesis ({aiSource})
              </h2>
            </div>
            <button
              onClick={() => setAiSynthesis(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close Synthesis
            </button>
          </div>
          <div className="text-xs leading-relaxed text-slate-200 font-sans space-y-3 whitespace-pre-line bg-slate-950/70 p-4 rounded-lg border border-slate-800/80 max-h-96 overflow-y-auto font-mono">
            {aiSynthesis}
          </div>
        </div>
      )}

      {/* 3. MULTI-TIMEFRAME TECHNICAL STRUCTURE & INTERACTIVE CHART */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        
        {/* Chart Header & Overlay Toggles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-200">Multi-Timeframe Structure & Indicators</h2>
            
            {/* Multi-Timeframe Pills */}
            <div className="hidden sm:flex items-center gap-1 font-mono text-[11px]">
              {(['15m', '1h', '4h', '1d', '1w'] as const).map((tf) => {
                const key = `tf${tf}` as keyof typeof data.multiTimeframe;
                const status = data.multiTimeframe[key];
                return (
                  <span
                    key={tf}
                    className={`px-1.5 py-0.5 rounded border ${
                      status === 'BULLISH'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                        : status === 'BEARISH'
                        ? 'bg-rose-950/60 text-rose-400 border-rose-800/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {tf.toUpperCase()}: {status}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Indicator Toggle Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2 py-1 rounded border transition-all ${
                showEMA ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 font-bold' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              EMA 20/50/200
            </button>
            <button
              onClick={() => setShowSupertrend(!showSupertrend)}
              className={`px-2 py-1 rounded border transition-all ${
                showSupertrend ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 font-bold' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Supertrend (10,3)
            </button>
            <button
              onClick={() => setShowVWAP(!showVWAP)}
              className={`px-2 py-1 rounded border transition-all ${
                showVWAP ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 font-bold' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              VWAP
            </button>
            <button
              onClick={() => setShowBB(!showBB)}
              className={`px-2 py-1 rounded border transition-all ${
                showBB ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/50 font-bold' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Bollinger Bands
            </button>
          </div>
        </div>

        {/* Primary Candlestick / Price Chart Container */}
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.candles} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} orientation="right" tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
              />
              
              {/* Key Price Levels */}
              <ReferenceLine y={data.keyLevels.resistance1} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `R1: $${data.keyLevels.resistance1}`, fill: '#f87171', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={data.keyLevels.support1} stroke="#10b981" strokeDasharray="3 3" label={{ value: `S1: $${data.keyLevels.support1}`, fill: '#34d399', fontSize: 10, position: 'insideBottomRight' }} />

              {/* Price Area */}
              <Area type="monotone" dataKey="close" stroke="#60a5fa" strokeWidth={2} fillOpacity={1} fill="url(#priceGradient)" name="Close Price" />

              {/* Overlays */}
              {showEMA && <Line type="monotone" dataKey="ema20" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="EMA 20" />}
              {showEMA && <Line type="monotone" dataKey="ema50" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="EMA 50" />}
              {showEMA && <Line type="monotone" dataKey="ema200" stroke="#a855f7" strokeWidth={2} dot={false} name="EMA 200" />}

              {showSupertrend && (
                <Line
                  type="stepAfter"
                  dataKey="supertrend"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Supertrend (10,3)"
                />
              )}

              {showVWAP && (
                <Line type="monotone" dataKey="vwap" stroke="#c084fc" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="VWAP" />
              )}

              {showBB && (
                <>
                  <Line type="monotone" dataKey="upperBB" stroke="#06b6d4" strokeWidth={1} strokeDasharray="2 2" dot={false} name="Upper BB" />
                  <Line type="monotone" dataKey="lowerBB" stroke="#06b6d4" strokeWidth={1} strokeDasharray="2 2" dot={false} name="Lower BB" />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Sub-Chart with 2-Sigma Spikes */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-cyan-400" />
              Volume Tape (<span className="text-amber-400">Gold Bars</span> = Institutional Vol Spikes &gt; 2.0σ)
            </span>
          </div>
          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.candles} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="timestamp" hide />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} orientation="right" tickFormatter={(v) => `${(v/1e6).toFixed(0)}M`} />
                <Bar
                  dataKey="volume"
                  shape={(props: any) => {
                    const { fill, x, y, width, height, payload } = props;
                    const isSpike = payload.isVolumeSpike;
                    return (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={isSpike ? '#f59e0b' : '#334155'}
                        stroke={isSpike ? '#fbbf24' : 'none'}
                      />
                    );
                  }}
                  name="Volume"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subchart Selector: Dynamic RSI or MACD */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubchart('rsi')}
                className={`text-xs font-mono font-semibold px-2.5 py-1 rounded transition-all ${
                  activeSubchart === 'rsi' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                RSI (14) Dynamic Bands
              </button>
              <button
                onClick={() => setActiveSubchart('macd')}
                className={`text-xs font-mono font-semibold px-2.5 py-1 rounded transition-all ${
                  activeSubchart === 'macd' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                MACD (12, 26, 9)
              </button>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {activeSubchart === 'rsi' ? `Current RSI: ${data.candles[data.candles.length-1]?.rsi || 50}` : 'MACD Histogram Momentum'}
            </span>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeSubchart === 'rsi' ? (
                <ComposedChart data={data.candles} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={[10, 90]} stroke="#64748b" tick={{ fontSize: 9 }} orientation="right" ticks={[30, 50, 70]} />
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="2 2" />
                  <ReferenceLine y={50} stroke="#475569" strokeDasharray="1 1" />
                  <ReferenceLine y={30} stroke="#10b981" strokeDasharray="2 2" />
                  <Line type="monotone" dataKey="rsi" stroke="#38bdf8" strokeWidth={1.5} dot={false} name="RSI" />
                  <Line type="monotone" dataKey="rsiUpperBand" stroke="#f87171" strokeDasharray="3 3" dot={false} name="Upper Dynamic Band" />
                  <Line type="monotone" dataKey="rsiLowerBand" stroke="#4ade80" strokeDasharray="3 3" dot={false} name="Lower Dynamic Band" />
                </ComposedChart>
              ) : (
                <ComposedChart data={data.candles} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis stroke="#64748b" tick={{ fontSize: 9 }} orientation="right" />
                  <ReferenceLine y={0} stroke="#475569" />
                  <Bar dataKey="macdHist" fill="#3b82f6" name="MACD Hist" />
                  <Line type="monotone" dataKey="macd" stroke="#38bdf8" strokeWidth={1.5} dot={false} name="MACD" />
                  <Line type="monotone" dataKey="macdSignal" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Signal" />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. FUNDAMENTAL VALUATION & SECTOR RELATIVE MATRIX */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-200">Fundamental Health & Sector Benchmarks</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Sector: {data.sector} Median</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Valuation Multiples */}
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-2.5 font-mono text-xs">
            <span className="font-bold text-slate-300 uppercase text-[11px] block border-b border-slate-800 pb-1">Valuation Multiples</span>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">P/E (TTM):</span>
              <span className="font-semibold text-white">{data.fundamentals.peRatio.toFixed(1)}x <span className="text-slate-500 font-normal">vs {data.fundamentals.sectorMedianPe}x</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Forward P/E:</span>
              <span className="font-semibold text-white">{data.fundamentals.forwardPe.toFixed(1)}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">EV / EBITDA:</span>
              <span className="font-semibold text-white">{data.fundamentals.evToEbitda.toFixed(1)}x <span className="text-slate-500 font-normal">vs {data.fundamentals.sectorMedianEvEbitda}x</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Price / Sales:</span>
              <span className="font-semibold text-white">{data.fundamentals.priceToSales.toFixed(1)}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Price / Book:</span>
              <span className="font-semibold text-white">{data.fundamentals.priceToBook.toFixed(1)}x</span>
            </div>
          </div>

          {/* Growth & Cash Generation */}
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-2.5 font-mono text-xs">
            <span className="font-bold text-slate-300 uppercase text-[11px] block border-b border-slate-800 pb-1">Growth & Cash Flow</span>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Revenue Growth YoY:</span>
              <span className={`font-semibold ${data.fundamentals.revenueGrowthYoy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                +{data.fundamentals.revenueGrowthYoy.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">FCF Yield:</span>
              <span className="font-semibold text-emerald-400">{data.fundamentals.freeCashFlowYield.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">EBITDA Margin:</span>
              <span className="font-semibold text-white">{data.fundamentals.ebitdaMargin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Net Profit Margin:</span>
              <span className="font-semibold text-white">{data.fundamentals.netProfitMargin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">ROIC:</span>
              <span className="font-semibold text-cyan-400">{data.fundamentals.roic.toFixed(1)}%</span>
            </div>
          </div>

          {/* Balance Sheet Quality & Solvency */}
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-2.5 font-mono text-xs">
            <span className="font-bold text-slate-300 uppercase text-[11px] block border-b border-slate-800 pb-1">Solvency & Quality</span>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Piotroski F-Score:</span>
              <span className="font-bold text-emerald-400">{data.fundamentals.piotroskiFScore}/9 (Elite)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Altman Z-Score:</span>
              <span className="font-semibold text-emerald-400">{data.fundamentals.altmanZScore.toFixed(1)} (Safe)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Debt / Equity:</span>
              <span className="font-semibold text-white">{data.fundamentals.debtToEquity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current Ratio:</span>
              <span className="font-semibold text-white">{data.fundamentals.currentRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Quick Ratio:</span>
              <span className="font-semibold text-white">{data.fundamentals.quickRatio.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 5. DUAL CARDS: INSTITUTIONAL FLOW & REGULATORY INSIDER TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Smart Money & Dark Pool Footprint */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-200">Institutional Order Flow & Dark Pool</h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Score: {data.confluence.pillars.institutionalFlow.score > 0 ? `+${data.confluence.pillars.institutionalFlow.score}` : data.confluence.pillars.institutionalFlow.score}
            </span>
          </div>

          <div className="space-y-2.5">
            {data.institutionalFlow.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 font-mono text-xs flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.sentiment === 'BULLISH' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {item.type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-300 font-semibold">{item.exchange}</span>
                    <span className="text-slate-500 text-[10px]">{item.timeAgo}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {item.shares.toLocaleString()} shares @ ${item.price.toFixed(2)}
                    {item.strike && ` • Strike $${item.strike} (${item.expiration})`}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-white block">${(item.notionalValue / 1e6).toFixed(2)}M</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    z: +{item.zScore.toFixed(2)}σ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Regulatory Insider & Congressional Trading */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-purple-400" />
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-200">SEC Form 4 & Capitol Hill Trades</h2>
            </div>
            
            {data.hasInsiderData ? (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Score: {data.confluence.pillars.politicalInsider.score > 0 ? `+${data.confluence.pillars.politicalInsider.score}` : data.confluence.pillars.politicalInsider.score}
              </span>
            ) : (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                [NO CONFIRMED DATA AVAILABLE]
              </span>
            )}
          </div>

          {!data.hasInsiderData || data.politicalInsiderTrades.length === 0 ? (
            <div className="bg-slate-950/60 p-6 rounded-lg border border-amber-500/20 text-center space-y-2 font-mono">
              <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">[NO CONFIRMED DATA AVAILABLE]</h3>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                No recent SEC Form 4 filings or Congressional STOCK Act disclosures detected for {data.ticker}.
                The lakehouse engine dynamically redistributed the 15% weight to Technicals (40%), Fundamentals (30%), and Order Flow (30%).
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.politicalInsiderTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 font-mono text-xs space-y-1.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{trade.filerName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {trade.role} {trade.party ? `(${trade.party})` : ''}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      trade.transactionType === 'BUY' || trade.transactionType === 'EXERCISE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {trade.transactionType}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex flex-wrap justify-between gap-2">
                    <span>{trade.asset}</span>
                    <span className="font-semibold text-slate-200">Bracket: {trade.volumeBracket}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-1">
                    <span>Filing: {trade.sourceFiling} ({trade.filingDate})</span>
                    <span className={`font-semibold ${trade.disclosureLagDays > 30 ? 'text-amber-400' : 'text-slate-400'}`}>
                      Filing Lag: {trade.disclosureLagDays} days
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 6. QUANTITATIVE ASYMMETRIC TRADE SCENARIOS & POSITION SIZER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-200">Quantitative Trade Scenarios & Asymmetric R/R</h2>
          </div>
          
          {/* Interactive Account Size Input for Sizing */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400">Account:</span>
              <input
                type="number"
                value={portfolioSize}
                onChange={(e) => setPortfolioSize(Number(e.target.value))}
                className="w-20 bg-transparent text-white font-bold focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400">Risk%:</span>
              <select
                value={riskTolerancePercent}
                onChange={(e) => setRiskTolerancePercent(Number(e.target.value))}
                className="bg-transparent text-white font-bold focus:outline-none"
              >
                <option value={0.5}>0.5% ($500)</option>
                <option value={1.0}>1.0% ($1,000)</option>
                <option value={2.0}>2.0% ($2,000)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
          
          {/* Bullish Long Scenario */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-emerald-500/30 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/10 text-emerald-400 border-b border-l border-emerald-500/30 text-[10px] font-bold uppercase rounded-bl-lg">
              Primary High-Conviction Long
            </div>

            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Bullish Long Setup</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-sans">{bullishSetup.rationale}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Ideal Entry</span>
                <span className="font-bold text-white text-sm">${bullishSetup.idealEntry.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 block">${bullishSetup.entryZone.min} - ${bullishSetup.entryZone.max}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-rose-400 block">Stop Loss</span>
                <span className="font-bold text-rose-400 text-sm">${bullishSetup.stopLoss.toFixed(2)}</span>
                <span className="text-[10px] text-rose-500/80 block">-{bullishSetup.riskPercentage}% risk</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-emerald-400 block">Target 1 (R1)</span>
                <span className="font-bold text-emerald-400 text-sm">${bullishSetup.target1.toFixed(2)}</span>
                <span className="text-[10px] text-emerald-400 block">{bullishSetup.riskRewardRatioT1}x R:R</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-cyan-400 block">Target 2 (R2)</span>
                <span className="font-bold text-cyan-400 text-sm">${bullishSetup.target2.toFixed(2)}</span>
                <span className="text-[10px] text-cyan-400 block">{bullishSetup.riskRewardRatioT2}x R:R</span>
              </div>
            </div>

            {/* Invalidation Trigger */}
            <div className="bg-rose-950/20 border border-rose-900/40 p-2.5 rounded-lg text-[11px] text-rose-300 flex items-start gap-2 font-sans">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Invalidation Zone: </span>
                <span>{bullishSetup.invalidationTrigger}</span>
              </div>
            </div>

            {/* Position Sizer Readout */}
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">Calculated Position Size:</span>
                <span className="font-bold text-white text-sm">{recommendedShares.toLocaleString()} Shares</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[11px] block">Capital Committed:</span>
                <span className="font-bold text-emerald-400 text-sm">${totalPositionCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Bearish Short / Tactical Hedge Scenario */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-rose-500/30 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-rose-500/10 text-rose-400 border-b border-l border-rose-500/30 text-[10px] font-bold uppercase rounded-bl-lg">
              Tactical Short / Hedge Setup
            </div>

            <div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-base text-white">Bearish Invalidation Scenario</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-sans">{bearishSetup.rationale}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Short Entry</span>
                <span className="font-bold text-white text-sm">${bearishSetup.idealEntry.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 block">${bearishSetup.entryZone.min} - ${bearishSetup.entryZone.max}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-rose-400 block">Cover Stop</span>
                <span className="font-bold text-rose-400 text-sm">${bearishSetup.stopLoss.toFixed(2)}</span>
                <span className="text-[10px] text-rose-500/80 block">+{bearishSetup.riskPercentage}% risk</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-emerald-400 block">Cover TP 1</span>
                <span className="font-bold text-emerald-400 text-sm">${bearishSetup.target1.toFixed(2)}</span>
                <span className="text-[10px] text-emerald-400 block">{bearishSetup.riskRewardRatioT1}x R:R</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-cyan-400 block">Cover TP 2</span>
                <span className="font-bold text-cyan-400 text-sm">${bearishSetup.target2.toFixed(2)}</span>
                <span className="text-[10px] text-cyan-400 block">{bearishSetup.riskRewardRatioT2}x R:R</span>
              </div>
            </div>

            {/* Invalidation Trigger */}
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[11px] text-slate-300 flex items-start gap-2 font-sans">
              <Compass className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Short Invalidation: </span>
                <span>{bearishSetup.invalidationTrigger}</span>
              </div>
            </div>

            {/* Downside Catalysts */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Downside Risk Triggers:</span>
              <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-0.5 font-sans">
                {bearishSetup.catalysts.map((cat, i) => (
                  <li key={i}>{cat}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
