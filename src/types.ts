export interface Candle {
  timestamp: string;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
  upperBB?: number;
  lowerBB?: number;
  middleBB?: number;
  supertrend?: number;
  supertrendDirection?: 'BULLISH' | 'BEARISH';
  rsi?: number;
  rsiUpperBand?: number;
  rsiLowerBand?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  obv?: number;
  volumeZScore?: number;
  isVolumeSpike?: boolean;
}

export interface FundamentalMetrics {
  peRatio: number;
  forwardPe: number;
  sectorMedianPe: number;
  pegRatio: number;
  evToEbitda: number;
  sectorMedianEvEbitda: number;
  priceToSales: number;
  priceToBook: number;
  freeCashFlowYield: number; // percentage
  revenueGrowthYoy: number; // percentage
  ebitdaMargin: number; // percentage
  netProfitMargin: number; // percentage
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  piotroskiFScore: number; // 0-9
  altmanZScore: number;
  roe: number; // percentage
  roic: number; // percentage
}

export interface InstitutionalFlowItem {
  id: string;
  timestamp: string;
  timeAgo: string;
  type: 'BLOCK_BUY' | 'BLOCK_SELL' | 'DARK_POOL_PRINT' | 'SWEEP_CALL' | 'SWEEP_PUT';
  shares: number;
  price: number;
  notionalValue: number; // in USD
  exchange: 'DARK_POOL' | 'NASDAQ' | 'NYSE' | 'CBOE_OPTIONS';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  zScore: number;
  premium?: number;
  strike?: number;
  expiration?: string;
}

export interface PoliticalInsiderTrade {
  id: string;
  filerName: string;
  role: 'SENATOR' | 'REPRESENTATIVE' | 'EXECUTIVE' | 'DIRECTOR' | '10%_OWNER';
  chamber?: 'SENATE' | 'HOUSE' | 'EXECUTIVE';
  party?: 'D' | 'R' | 'I';
  committee?: string;
  asset: string;
  transactionType: 'BUY' | 'SELL' | 'EXERCISE' | 'GRANT';
  volumeBracket: string; // e.g. "$500,001 - $1,000,000"
  estimatedAmount: number;
  transactionDate: string;
  filingDate: string;
  disclosureLagDays: number;
  sourceFiling: string; // "SEC Form 4" or "PTR / STOCK Act"
  isConfirmed: boolean;
}

export interface ConfluencePillar {
  name: string;
  score: number; // -100 to +100
  weight: number; // 0.0 to 1.0 (sums to 1.0)
  effectiveWeight: number;
  contribution: number;
  status: 'STRONG_BULL' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEAR' | 'NO_DATA';
  keySignals: string[];
}

export interface ConfluenceScoreResult {
  totalScore: number; // -100 to +100
  regime: 'STRONG_BULLISH' | 'MODERATE_BULLISH' | 'NEUTRAL' | 'MODERATE_BEARISH' | 'STRONG_BEARISH';
  convictionLevel: 'HIGH_CONVICTION' | 'MEDIUM_CONVICTION' | 'SPECULATIVE';
  isAdjustedWeight: boolean; // true if insider data unavailable
  pillars: {
    technical: ConfluencePillar;
    fundamental: ConfluencePillar;
    institutionalFlow: ConfluencePillar;
    politicalInsider: ConfluencePillar;
  };
}

export interface TradeSetup {
  direction: 'LONG' | 'SHORT';
  rationale: string;
  entryZone: { min: number; max: number };
  idealEntry: number;
  stopLoss: number;
  invalidationTrigger: string;
  target1: number;
  target2: number;
  riskRewardRatioT1: number;
  riskRewardRatioT2: number;
  riskPercentage: number;
  catalysts: string[];
}

export interface TickerMarketData {
  ticker: string;
  companyName: string;
  sector: string;
  industry: string;
  currentPrice: number;
  changeAmount: number;
  changePercent: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  beta: number;
  averageVolume: number;
  currentVolume: number;
  sharesOutstanding: number;
  nextEarningsDate: string;
  candles: Candle[];
  fundamentals: FundamentalMetrics;
  institutionalFlow: InstitutionalFlowItem[];
  politicalInsiderTrades: PoliticalInsiderTrade[];
  hasInsiderData: boolean;
  confluence: ConfluenceScoreResult;
  tradeSetups: {
    bullish: TradeSetup;
    bearish: TradeSetup;
  };
  keyLevels: {
    resistance2: number;
    resistance1: number;
    pivot: number;
    support1: number;
    support2: number;
  };
  multiTimeframe: {
    tf15m: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    tf1h: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    tf4h: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    tf1d: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    tf1w: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  };
}

export interface LakehouseTableSchema {
  tableName: string;
  layer: 'BRONZE' | 'SILVER' | 'GOLD';
  description: string;
  partitionKey: string;
  columns: {
    name: string;
    type: string;
    description: string;
    isKey?: boolean;
  }[];
  sampleQuery: string;
}

// -------------------------------------------------------------
// AI Provider & Model Settings
// -------------------------------------------------------------
export type AIProvider = 
  | 'gemini' 
  | 'ollama' 
  | 'lmstudio' 
  | 'openrouter' 
  | 'openai' 
  | 'anthropic' 
  | 'deepseek' 
  | 'local_rule_engine';

export interface AISettingsConfig {
  provider: AIProvider;
  model: string;
  endpointUrl: string;
  apiKey?: string;
  temperature: number;
  maxTokens: number;
  mcpEnabled: boolean;
  activeMcpServerIds: string[];
  injectedLakehouseLayers: {
    technicals: boolean;
    fundamentals: boolean;
    darkPoolFlow: boolean;
    insiderFilings: boolean;
    riskLevels: boolean;
  };
}

// -------------------------------------------------------------
// Model Context Protocol (MCP) Interfaces
// -------------------------------------------------------------
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  serverName?: string;
  category?: 'lakehouse' | 'market_data' | 'confluence' | 'compliance' | 'risk';
}

export interface MCPPromptDefinition {
  name: string;
  description: string;
  arguments?: { name: string; description: string; required?: boolean }[];
}

export interface MCPResourceDefinition {
  uri: string;
  name: string;
  mimeType: string;
  description?: string;
}

export interface MCPServerConfig {
  id: string;
  name: string;
  type: 'builtin_http' | 'sse' | 'stdio' | 'custom_jsonrpc';
  endpointUrl: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';
  description: string;
  latencyMs?: number;
  toolsCount: number;
  tools: MCPToolDefinition[];
}

export interface MCPToolExecutionResult {
  toolName: string;
  arguments: Record<string, any>;
  success: boolean;
  result?: any;
  error?: string;
  executionTimeMs: number;
  timestamp: string;
}

