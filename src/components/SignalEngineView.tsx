import React from 'react';
import {
  Activity,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Zap,
  TrendingUp,
  TrendingDown,
  Layers,
  BarChart3,
  Cpu,
  Radio,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TickerMarketData } from '../types';

interface SignalEngineProps {
  data: TickerMarketData;
}

export const SignalEngineView: React.FC<SignalEngineProps> = ({ data }) => {
  const { confluence, candles, fundamentals, multiTimeframe } = data;
  const lastCandle = candles[candles.length - 1];

  const getPillarStatusBadge = (status: string) => {
    switch (status) {
      case 'STRONG_BULL':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'BULLISH':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'STRONG_BEAR':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'BEARISH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'NO_DATA':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-mono">
      
      {/* Top Banner: Confluence Engine Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-bold text-white tracking-tight">Quantitative Signal Engine & Confluence Heuristic</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Real-time cross-referencing of mathematical technicals, fundamental health, institutional block footprints, and regulatory filings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {confluence.isAdjustedWeight ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>DYNAMIC WEIGHT ADAPTATION ACTIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ALL 4 PILLARS CONFIRMED</span>
              </div>
            )}

            <div className="px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs">
              <span className="text-slate-400">Total Confluence: </span>
              <span className={`font-bold text-sm ${confluence.totalScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {confluence.totalScore > 0 ? `+${confluence.totalScore}` : confluence.totalScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Weight Redistribution Visualizer */}
        <div className="pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-sans">
            <span>Dynamic Lakehouse Weight Redistribution Model:</span>
            {confluence.isAdjustedWeight && (
              <span className="text-amber-400 font-mono text-[11px]">
                * 15% Insider weight dynamically reallocated across 3 active pillars without data hallucination
              </span>
            )}
          </div>

          <div className="h-6 w-full bg-slate-950 rounded-lg overflow-hidden flex border border-slate-800 text-[10px] font-bold">
            <div
              style={{ width: `${confluence.pillars.technical.effectiveWeight * 100}%` }}
              className="bg-blue-600/80 text-blue-100 flex items-center justify-center border-r border-slate-900"
              title={`Technicals: ${confluence.pillars.technical.effectiveWeight * 100}%`}
            >
              Tech ({confluence.pillars.technical.effectiveWeight * 100}%)
            </div>
            <div
              style={{ width: `${confluence.pillars.fundamental.effectiveWeight * 100}%` }}
              className="bg-emerald-600/80 text-emerald-100 flex items-center justify-center border-r border-slate-900"
              title={`Fundamentals: ${confluence.pillars.fundamental.effectiveWeight * 100}%`}
            >
              Fund ({confluence.pillars.fundamental.effectiveWeight * 100}%)
            </div>
            <div
              style={{ width: `${confluence.pillars.institutionalFlow.effectiveWeight * 100}%` }}
              className="bg-cyan-600/80 text-cyan-100 flex items-center justify-center border-r border-slate-900"
              title={`Inst Flow: ${confluence.pillars.institutionalFlow.effectiveWeight * 100}%`}
            >
              Flow ({confluence.pillars.institutionalFlow.effectiveWeight * 100}%)
            </div>
            {confluence.pillars.politicalInsider.effectiveWeight > 0 ? (
              <div
                style={{ width: `${confluence.pillars.politicalInsider.effectiveWeight * 100}%` }}
                className="bg-purple-600/80 text-purple-100 flex items-center justify-center"
                title={`Political/Insider: ${confluence.pillars.politicalInsider.effectiveWeight * 100}%`}
              >
                Insider ({confluence.pillars.politicalInsider.effectiveWeight * 100}%)
              </div>
            ) : (
              <div
                style={{ width: '0%' }}
                className="bg-slate-800 text-slate-500 flex items-center justify-center"
              />
            )}
          </div>
        </div>
      </div>

      {/* Pillar Breakdown Cards (4 Pillars) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Pillar 1: Technicals */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-sm text-slate-200">1. Technical & Trend Momentum</h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getPillarStatusBadge(confluence.pillars.technical.status)}`}>
              Score: {confluence.pillars.technical.score > 0 ? `+${confluence.pillars.technical.score}` : confluence.pillars.technical.score}/100
            </span>
          </div>

          <div className="text-xs text-slate-400 space-y-1.5 font-sans">
            <div className="flex justify-between font-mono py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Moving Average Stack:</span>
              <span className="text-white font-semibold">
                Price (${lastCandle.close.toFixed(2)}) {lastCandle.close > (lastCandle.ema20 || 0) ? '>' : '<'} EMA20 (${lastCandle.ema20}) { (lastCandle.ema20 || 0) > (lastCandle.ema50 || 0) ? '>' : '<' } EMA50 (${lastCandle.ema50})
              </span>
            </div>
            <div className="flex justify-between font-mono py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Supertrend (10, 3.0):</span>
              <span className={lastCandle.supertrendDirection === 'BULLISH' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {lastCandle.supertrendDirection} (Support @ ${lastCandle.supertrend})
              </span>
            </div>
            <div className="flex justify-between font-mono py-1 border-b border-slate-800/60">
              <span className="text-slate-400">RSI(14) Momentum:</span>
              <span className="text-cyan-300 font-semibold">{lastCandle.rsi} (Bands: {lastCandle.rsiLowerBand} - {lastCandle.rsiUpperBand})</span>
            </div>
            <div className="flex justify-between font-mono py-1">
              <span className="text-slate-400">Pillar Contribution:</span>
              <span className="text-blue-400 font-bold">+{confluence.pillars.technical.contribution} pts</span>
            </div>
          </div>

          <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-1 pt-1 font-sans">
            {confluence.pillars.technical.keySignals.map((sig, i) => (
              <li key={i}>{sig}</li>
            ))}
          </ul>
        </div>

        {/* Pillar 2: Fundamentals */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-200">2. Fundamental Valuation & Solvency</h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getPillarStatusBadge(confluence.pillars.fundamental.status)}`}>
              Score: {confluence.pillars.fundamental.score > 0 ? `+${confluence.pillars.fundamental.score}` : confluence.pillars.fundamental.score}/100
            </span>
          </div>

          <div className="text-xs text-slate-400 space-y-1.5 font-sans">
            <div className="flex justify-between font-mono py-1 border-b border-slate-800/60">
              <span className="text-slate-400">P/E vs Sector Median:</span>
              <span className="text-white font-semibold">{fundamentals.peRatio}x vs {fundamentals.sectorMedianPe}x</span>
            </div>
            <div className="flex justify-between font-mono py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Revenue Growth YoY:</span>
              <span className="text-emerald-400 font-bold">+{fundamentals.revenueGrowthYoy}%</span>
            </div>
            <div className="flex justify-between font-mono py-1 border-b border-slate-800/60">
              <span className="text-slate-400">FCF Yield & Piotroski:</span>
              <span className="text-white font-semibold">{fundamentals.freeCashFlowYield}% FCF | {fundamentals.piotroskiFScore}/9 F-Score</span>
            </div>
            <div className="flex justify-between font-mono py-1">
              <span className="text-slate-400">Pillar Contribution:</span>
              <span className="text-emerald-400 font-bold">+{confluence.pillars.fundamental.contribution} pts</span>
            </div>
          </div>

          <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-1 pt-1 font-sans">
            {confluence.pillars.fundamental.keySignals.map((sig, i) => (
              <li key={i}>{sig}</li>
            ))}
          </ul>
        </div>

        {/* Pillar 3: Institutional Flow */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-200">3. Institutional Order Flow & Dark Pool</h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getPillarStatusBadge(confluence.pillars.institutionalFlow.status)}`}>
              Score: {confluence.pillars.institutionalFlow.score > 0 ? `+${confluence.pillars.institutionalFlow.score}` : confluence.pillars.institutionalFlow.score}/100
            </span>
          </div>

          <div className="text-xs text-slate-400 space-y-1.5 font-sans">
            <div className="flex justify-between font-mono py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Monitored Order Prints:</span>
              <span className="text-white font-semibold">{data.institutionalFlow.length} Large Block / Sweep Orders</span>
            </div>
            <div className="flex justify-between font-mono py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Max Anomaly Z-Score:</span>
              <span className="text-amber-400 font-bold">
                +{Math.max(...data.institutionalFlow.map(f => f.zScore), 1.0).toFixed(2)}σ Volume
              </span>
            </div>
            <div className="flex justify-between font-mono py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Options Flow Sentiment:</span>
              <span className="text-emerald-400 font-semibold">Bullish Sweep Call Bias</span>
            </div>
            <div className="flex justify-between font-mono py-1">
              <span className="text-slate-400">Pillar Contribution:</span>
              <span className="text-cyan-400 font-bold">+{confluence.pillars.institutionalFlow.contribution} pts</span>
            </div>
          </div>

          <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-1 pt-1 font-sans">
            {confluence.pillars.institutionalFlow.keySignals.map((sig, i) => (
              <li key={i}>{sig}</li>
            ))}
          </ul>
        </div>

        {/* Pillar 4: Regulatory Insider */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-slate-200">4. SEC Form 4 & Capitol Hill Trades</h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getPillarStatusBadge(confluence.pillars.politicalInsider.status)}`}>
              {data.hasInsiderData ? `Score: ${confluence.pillars.politicalInsider.score}/100` : '[NO CONFIRMED DATA AVAILABLE]'}
            </span>
          </div>

          <div className="text-xs text-slate-400 space-y-1.5 font-sans">
            <div className="flex justify-between font-mono py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Disclosures Monitored:</span>
              <span className="text-white font-semibold">
                {data.hasInsiderData ? `${data.politicalInsiderTrades.length} Validated Filings` : '0 Filings'}
              </span>
            </div>
            <div className="flex justify-between font-mono py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Effective Weight:</span>
              <span className={confluence.pillars.politicalInsider.effectiveWeight === 0 ? 'text-amber-400 font-bold' : 'text-purple-400 font-bold'}>
                {confluence.pillars.politicalInsider.effectiveWeight * 100}%
              </span>
            </div>
            <div className="flex justify-between font-mono py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Data Governance:</span>
              <span className="text-slate-300 font-semibold">
                {data.hasInsiderData ? 'EDGAR / STOCK Act Verified' : 'Zero Hallucination Mode Active'}
              </span>
            </div>
            <div className="flex justify-between font-mono py-1">
              <span className="text-slate-400">Pillar Contribution:</span>
              <span className="text-purple-400 font-bold">+{confluence.pillars.politicalInsider.contribution} pts</span>
            </div>
          </div>

          <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-1 pt-1 font-sans">
            {confluence.pillars.politicalInsider.keySignals.map((sig, i) => (
              <li key={i}>{sig}</li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
};
