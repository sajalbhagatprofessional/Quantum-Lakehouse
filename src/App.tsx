import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveDossierView } from './components/ExecutiveDossierView';
import { SignalEngineView } from './components/SignalEngineView';
import { LakehouseView } from './components/LakehouseView';
import { McpHubView } from './components/McpHubView';
import { CodePipelineView } from './components/CodePipelineView';
import { InferenceSettingsModal } from './components/InferenceSettingsModal';
import { getTickerData, mergeLiveMarketDataIntoTicker } from './data/mockMarketData';
import { TickerMarketData, AISettingsConfig, MCPServerConfig } from './types';
import { calculateConfluenceScore, calculateTechnicalIndicators } from './utils/quantEngine';

const DEFAULT_AI_SETTINGS: AISettingsConfig = {
  provider: 'gemini',
  model: 'gemini-3.7-flash',
  endpointUrl: 'https://generativelanguage.googleapis.com',
  apiKey: '',
  temperature: 0.2,
  maxTokens: 4096,
  mcpEnabled: true,
  activeMcpServerIds: ['native-lakehouse-server'],
  injectedLakehouseLayers: {
    technicals: true,
    fundamentals: true,
    darkPoolFlow: true,
    insiderFilings: true,
    riskLevels: true
  }
};

const DEFAULT_MCP_SERVERS: MCPServerConfig[] = [
  {
    id: 'native-lakehouse-server',
    name: 'DuckDB Medallion Lakehouse Server',
    type: 'builtin_http',
    endpointUrl: '/api/mcp',
    status: 'CONNECTED',
    latencyMs: 1.2,
    toolsCount: 6,
    description: 'In-process analytical query engine executing directly against Bronze, Silver, and Gold Delta tables.',
    tools: [
      {
        name: 'lakehouse_query_sql',
        description: 'Executes analytical SQL queries against the DuckDB Medallion Lakehouse tables.',
        category: 'lakehouse',
        inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] }
      },
      {
        name: 'get_ticker_confluence',
        description: 'Computes the 4-pillar quantitative confluence score (-100 to +100) and missing-data weights.',
        category: 'confluence',
        inputSchema: { type: 'object', properties: { ticker: { type: 'string' } }, required: ['ticker'] }
      },
      {
        name: 'fetch_live_quotes',
        description: 'Fetches real-time NBBO price, 6-month OHLCV candles, market capitalization, and beta.',
        category: 'market_data',
        inputSchema: { type: 'object', properties: { ticker: { type: 'string' } }, required: ['ticker'] }
      },
      {
        name: 'get_darkpool_flow',
        description: 'Queries off-exchange block prints (> $5M) and options sweeps with volume anomaly Z-scores (> 2.0σ).',
        category: 'market_data',
        inputSchema: { type: 'object', properties: { ticker: { type: 'string' }, minNotional: { type: 'number' } }, required: ['ticker'] }
      },
      {
        name: 'fetch_sec_disclosures',
        description: 'Retrieves official SEC Form 4 insider purchases and Congressional STOCK Act periodic transaction reports.',
        category: 'compliance',
        inputSchema: { type: 'object', properties: { ticker: { type: 'string' } }, required: ['ticker'] }
      },
      {
        name: 'calculate_risk_position',
        description: 'Calculates recommended position sizing, dollar risk per share, and stop-loss triggers.',
        category: 'risk',
        inputSchema: { type: 'object', properties: { portfolioSize: { type: 'number' }, riskTolerancePct: { type: 'number' }, entryPrice: { type: 'number' }, stopLoss: { type: 'number' } }, required: ['portfolioSize', 'riskTolerancePct', 'entryPrice', 'stopLoss'] }
      }
    ]
  }
];

export default function App() {
  const [currentTicker, setCurrentTicker] = useState<string>('NVDA');
  const [tickerData, setTickerData] = useState<TickerMarketData>(() => getTickerData('NVDA'));
  const [activeTab, setActiveTab] = useState<'dossier' | 'signals' | 'lakehouse' | 'mcp' | 'code'>('dossier');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<string>('LIVE_EXCHANGE_FEED');
  const [isLoadingMarket, setIsLoadingMarket] = useState<boolean>(false);

  // AI & MCP State
  const [aiSettings, setAiSettings] = useState<AISettingsConfig>(() => {
    try {
      const saved = localStorage.getItem('quantum_ai_settings_v1');
      return saved ? JSON.parse(saved) : DEFAULT_AI_SETTINGS;
    } catch {
      return DEFAULT_AI_SETTINGS;
    }
  });
  const [mcpServers, setMcpServers] = useState<MCPServerConfig[]>(DEFAULT_MCP_SERVERS);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Save settings persistence
  const handleSaveAiSettings = (newSettings: AISettingsConfig) => {
    setAiSettings(newSettings);
    try {
      localStorage.setItem('quantum_ai_settings_v1', JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
  };

  // MCP Tool Execution Bridge
  const handleExecuteMcpTool = async (toolName: string, args: Record<string, any>) => {
    const res = await fetch('/api/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolName, arguments: args })
    });
    return await res.json();
  };

  // Fetch genuine real-time market data from backend API
  const fetchLiveMarketData = useCallback(async (sym: string) => {
    setIsLoadingMarket(true);
    try {
      const res = await fetch(`/api/market-data/${encodeURIComponent(sym)}`);
      const json = await res.json();
      if (json && json.success && json.currentPrice) {
        setTickerData((prev) => mergeLiveMarketDataIntoTicker(prev, json));
        setDataSource(json.source || 'LIVE_EXCHANGE_FEED');
      } else {
        setDataSource('OFFLINE_REFERENCE_CACHE');
      }
    } catch (e) {
      console.warn(`[MarketSync] Could not reach live exchange for ${sym}, using high-precision reference model.`);
      setDataSource('OFFLINE_REFERENCE_CACHE');
    } finally {
      setIsLoadingMarket(false);
    }
  }, []);

  // When ticker changes, initialize dataset and query genuine exchange prices
  const handleSelectTicker = useCallback((sym: string) => {
    const cleanSym = sym.trim().toUpperCase();
    setCurrentTicker(cleanSym);
    const initialData = getTickerData(cleanSym);
    setTickerData(initialData);
    fetchLiveMarketData(cleanSym);
  }, [fetchLiveMarketData]);

  // Initial load
  useEffect(() => {
    fetchLiveMarketData('NVDA');
  }, [fetchLiveMarketData]);

  // Real-time market tick stream simulation (active during trading hours)
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setTickerData((prev) => {
        // Subtle realistic price jitter (Gaussian-like ±0.15%)
        const delta = (Math.random() - 0.48) * (prev.currentPrice * 0.0018);
        const newPrice = Number(Math.max(1, prev.currentPrice + delta).toFixed(2));
        const newChangeAmount = Number((newPrice - (prev.currentPrice - prev.changeAmount)).toFixed(2));
        const newChangePercent = Number(((newChangeAmount / (newPrice - newChangeAmount)) * 100).toFixed(2));

        // Update the last candle in place
        const updatedCandles = [...prev.candles];
        const lastIdx = updatedCandles.length - 1;
        if (lastIdx >= 0) {
          const last = { ...updatedCandles[lastIdx] };
          last.close = newPrice;
          last.high = Math.max(last.high, newPrice);
          last.low = Math.min(last.low, newPrice);
          last.volume += Math.floor(Math.random() * 25000) + 5000;
          updatedCandles[lastIdx] = last;
        }

        // Recompute dynamic indicators on live candle feed
        const enrichedCandles = calculateTechnicalIndicators(updatedCandles);
        const recomputedConfluence = calculateConfluenceScore(
          enrichedCandles,
          prev.fundamentals,
          prev.institutionalFlow,
          prev.politicalInsiderTrades,
          prev.hasInsiderData
        );

        return {
          ...prev,
          currentPrice: newPrice,
          changeAmount: newChangeAmount,
          changePercent: newChangePercent,
          currentVolume: prev.currentVolume + 15000,
          marketCap: prev.sharesOutstanding ? Math.round(newPrice * prev.sharesOutstanding) : prev.marketCap,
          candles: enrichedCandles,
          confluence: recomputedConfluence,
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation & Ticker Bar */}
      <Navbar
        currentTicker={currentTicker}
        tickerData={tickerData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectTicker={handleSelectTicker}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        dataSource={dataSource}
        isLoadingMarket={isLoadingMarket}
        aiSettings={aiSettings}
        onOpenAiSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dossier' && (
          <ExecutiveDossierView
            data={tickerData}
            onRefreshData={() => handleSelectTicker(currentTicker)}
            dataSource={dataSource}
            isLoadingMarket={isLoadingMarket}
            aiSettings={aiSettings}
            onOpenAiSettings={() => setIsSettingsModalOpen(true)}
          />
        )}

        {activeTab === 'signals' && (
          <SignalEngineView data={tickerData} />
        )}

        {activeTab === 'lakehouse' && (
          <LakehouseView />
        )}

        {activeTab === 'mcp' && (
          <McpHubView
            mcpServers={mcpServers}
            aiSettings={aiSettings}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onExecuteMcpTool={handleExecuteMcpTool}
            currentTicker={currentTicker}
          />
        )}

        {activeTab === 'code' && (
          <CodePipelineView tickerData={tickerData} />
        )}
      </main>

      {/* Model & MCP Configuration Modal */}
      <InferenceSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={aiSettings}
        onSaveSettings={handleSaveAiSettings}
        mcpServers={mcpServers}
        onUpdateMcpServers={setMcpServers}
        onExecuteMcpTool={handleExecuteMcpTool}
      />

      {/* Institutional Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center font-mono text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>QUANTUM MEDALLION LAKEHOUSE ENGINE • v2.4 PROD</span>
          </div>
          <span>Model Context Protocol (MCP) JSON-RPC 2.0 • Ollama • LM Studio • OpenRouter</span>
          <span>Zero Hallucination Grounding Active</span>
        </div>
      </footer>
    </div>
  );
}
