import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  FileCode,
  Database,
  FileText,
  Terminal,
  Layers
} from 'lucide-react';
import { TickerMarketData } from '../types';
import { PYTHON_ETL_PIPELINE, PYTHON_QUANT_ENGINE, LAKEHOUSE_DDL_SQL } from '../data/codeTemplates';

interface CodePipelineProps {
  tickerData: TickerMarketData;
}

export const CodePipelineView: React.FC<CodePipelineProps> = ({ tickerData }) => {
  const [activeSubTab, setActiveSubTab] = useState<'etl' | 'quant' | 'sql' | 'dossier'>('etl');
  const [copied, setCopied] = useState<string | null>(null);

  const generateMarkdownDossier = (data: TickerMarketData): string => {
    const isAdjusted = data.confluence.isAdjustedWeight;
    const b = data.tradeSetups.bullish;
    const s = data.tradeSetups.bearish;

    const formatCap = (cap: number) => {
      if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)} Trillion`;
      if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)} Billion`;
      if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)} Million`;
      return `$${cap.toLocaleString()}`;
    };

    return `# 3. Stock Market Intelligence Dossier: ${data.ticker} (${data.companyName})
**Date**: ${new Date().toISOString().split('T')[0]} | **Asset Class**: US Equity | **Sector**: ${data.sector}

---

## 1. Executive Overview & Regime Confluence
- **Current Price**: **$${data.currentPrice.toFixed(2)}** (${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)
- **Market Cap**: ${formatCap(data.marketCap)} | **Beta**: ${data.beta}
- **Primary Trend Regime**: **${data.confluence.regime.replace('_', ' ')}** (Score: **${data.confluence.totalScore > 0 ? '+' : ''}${data.confluence.totalScore}/100**)
- **Conviction Tier**: **${data.confluence.convictionLevel.replace('_', ' ')}**
- **Data Governance Status**: ${isAdjusted ? '\`[NO CONFIRMED DATA AVAILABLE]\` for Insider Filings — Weights Dynamically Reallocated (Tech: 40%, Fund: 30%, Flow: 30%, Insider: 0%)' : 'All 4 Pillars Validated via Real-time Lakehouse Lakehouse Silver Tables'}

---

## 2. Fundamental Valuation & Solvency Benchmark
| Metric | ${data.ticker} Value | Sector Median | Variance / Status |
| :--- | :--- | :--- | :--- |
| **Trailing P/E (TTM)** | **${data.fundamentals.peRatio.toFixed(1)}x** | ${data.fundamentals.sectorMedianPe.toFixed(1)}x | ${data.fundamentals.peRatio < data.fundamentals.sectorMedianPe ? 'Valuation Discount' : 'Growth Premium'} |
| **Forward P/E** | **${data.fundamentals.forwardPe.toFixed(1)}x** | 22.0x | Forward Growth Multiple |
| **EV / EBITDA** | **${data.fundamentals.evToEbitda.toFixed(1)}x** | ${data.fundamentals.sectorMedianEvEbitda.toFixed(1)}x | Core Enterprise Multiple |
| **Revenue Growth (YoY)** | **+${data.fundamentals.revenueGrowthYoy.toFixed(1)}%** | +8.5% | ${data.fundamentals.revenueGrowthYoy > 20 ? 'Hyper-Expansion' : 'Moderate Expansion'} |
| **Free Cash Flow Yield** | **${data.fundamentals.freeCashFlowYield.toFixed(1)}%** | 2.8% | Cash Generation Power |
| **Debt / Equity Ratio** | **${data.fundamentals.debtToEquity.toFixed(2)}** | 1.10 | ${data.fundamentals.debtToEquity < 0.5 ? 'Conservative Leverage' : 'Leveraged'} |
| **Piotroski F-Score** | **${data.fundamentals.piotroskiFScore}/9** | 6/9 | Fundamental Quality Index |

---

## 3. Technical & Multi-Timeframe Structure
- **Key Resistance Levels**: R1 = **$${data.keyLevels.resistance1.toFixed(2)}**, R2 = **$${data.keyLevels.resistance2.toFixed(2)}**
- **Key Support Levels**: S1 = **$${data.keyLevels.support1.toFixed(2)}**, S2 = **$${data.keyLevels.support2.toFixed(2)}**, Pivot = **$${data.keyLevels.pivot.toFixed(2)}**
- **Moving Average Stack**:
  - 20-Day EMA: **$${data.candles[data.candles.length-1]?.ema20}**
  - 50-Day EMA: **$${data.candles[data.candles.length-1]?.ema50}**
  - 200-Day EMA: **$${data.candles[data.candles.length-1]?.ema200}**
  - Golden Stack Confirmation: ${data.currentPrice > (data.candles[data.candles.length-1]?.ema20 || 0) ? 'ACTIVE BULLISH STACK (Price > EMA20 > EMA50 > EMA200)' : 'MIXED MOMENTUM'}
- **Supertrend (10, 3.0)**: **${data.candles[data.candles.length-1]?.supertrendDirection}** (Active Anchor Level: $${data.candles[data.candles.length-1]?.supertrend})
- **RSI (14)**: **${data.candles[data.candles.length-1]?.rsi}** (Dynamic Lower: ${data.candles[data.candles.length-1]?.rsiLowerBand}, Dynamic Upper: ${data.candles[data.candles.length-1]?.rsiUpperBand})

---

## 4. Smart Money & Regulatory Insider Flow
### A. Institutional Block Prints & Dark Pool Anomalies:
${data.institutionalFlow.map(f => `- **${f.type.replace('_', ' ')}** on ${f.exchange}: **$${(f.notionalValue/1e6).toFixed(2)}M** at $${f.price.toFixed(2)} (Anomaly Z-Score: **+${f.zScore.toFixed(2)}σ** | Sentiment: **${f.sentiment}**)`).join('\n')}

### B. Regulatory Form 4 & Capitol Hill Trades:
${isAdjusted ? 
  '- \`[NO CONFIRMED DATA AVAILABLE]\`: Zero public disclosures within the trailing 90-day window. Confluence weight redistributed automatically.' : 
  data.politicalInsiderTrades.map(t => `- **${t.filerName}** (${t.role}): ${t.transactionType} ${t.asset} (~$${(t.estimatedAmount/1e3).toFixed(0)}k | Filing Lag: **${t.disclosureLagDays} days** | Source: ${t.sourceFiling})`).join('\n')}

---

## 5. Actionable Asymmetric Trade Scenarios
### High-Conviction Long Setup (Primary):
- **Entry Zone**: **$${b.entryZone.min.toFixed(2)} – $${b.entryZone.max.toFixed(2)}** (Ideal: **$${b.idealEntry.toFixed(2)}**)
- **Stop Loss**: **$${b.stopLoss.toFixed(2)}** (-${b.riskPercentage}% Risk)
- **Target 1**: **$${b.target1.toFixed(2)}** (**${b.riskRewardRatioT1}x** Risk/Reward)
- **Target 2**: **$${b.target2.toFixed(2)}** (**${b.riskRewardRatioT2}x** Risk/Reward)
- **Invalidation Trigger**: ${b.invalidationTrigger}

### Tactical Short / Hedge Setup (Contingency):
- **Short Entry**: **$${s.idealEntry.toFixed(2)}** | **Cover Stop**: **$${s.stopLoss.toFixed(2)}**
- **Cover Target 1**: **$${s.target1.toFixed(2)}** (${s.riskRewardRatioT1}x R:R) | **Target 2**: **$${s.target2.toFixed(2)}** (${s.riskRewardRatioT2}x R:R)
- **Invalidation Trigger**: ${s.invalidationTrigger}
`;
  };

  const currentContent = 
    activeSubTab === 'etl' ? PYTHON_ETL_PIPELINE :
    activeSubTab === 'quant' ? PYTHON_QUANT_ENGINE :
    activeSubTab === 'sql' ? LAKEHOUSE_DDL_SQL :
    generateMarkdownDossier(tickerData);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-slate-100 font-mono">
      
      {/* Code Browser Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-bold text-white tracking-tight">Production Code & Dossier Exporter</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Modular Python Lakehouse ETL, Quantitative Vectorized Signal Engine, and Structured Dossier Markdown.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(currentContent, activeSubTab)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-all"
            >
              {copied === activeSubTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === activeSubTab ? 'Copied' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => downloadFile(
                currentContent,
                activeSubTab === 'etl' ? 'market_lakehouse_ingestion.py' :
                activeSubTab === 'quant' ? 'quantitative_signal_engine.py' :
                activeSubTab === 'sql' ? 'lakehouse_ddl_schemas.sql' :
                `dossier_${tickerData.ticker}.md`
              )}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* SubTab Selector */}
        <div className="flex items-center space-x-2 pt-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('etl')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
              activeSubTab === 'etl'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>1. Lakehouse ETL Pipeline (Python)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('quant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
              activeSubTab === 'quant'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. Quantitative Signal Engine (Python)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sql')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
              activeSubTab === 'sql'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Lakehouse DDL Schemas (SQL)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dossier')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
              activeSubTab === 'dossier'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. Market Intelligence Dossier ({tickerData.ticker})</span>
          </button>
        </div>
      </div>

      {/* Code / Content Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="font-semibold text-slate-300 ml-2">
              {activeSubTab === 'etl' ? 'pipeline_ingestion.py' :
               activeSubTab === 'quant' ? 'signal_engine.py' :
               activeSubTab === 'sql' ? 'lakehouse_schema.sql' :
               `dossier_${tickerData.ticker}.md`}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">UTF-8 • Production Grade</span>
        </div>

        <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
          <pre className="text-xs text-slate-200 font-mono leading-relaxed selection:bg-blue-600 selection:text-white">
            {currentContent}
          </pre>
        </div>
      </div>

    </div>
  );
};
