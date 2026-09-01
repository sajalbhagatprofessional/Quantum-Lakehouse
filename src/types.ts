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

// -------------------------------------------------------------
// Robinhood Integration & Automated Trading Engine
// -------------------------------------------------------------
export interface RobinhoodPosition {
  id: string;
  ticker: string;
  companyName: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  equityPct: number;
}

export interface RobinhoodOrder {
  id: string;
  ticker: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  shares: number;
  requestedPrice?: number;
  executionPrice?: number;
  totalAmount: number;
  strategyId?: string;
  strategyName?: string;
  triggeredBy: string;
  mode: 'DEMO' | 'LIVE';
  timestamp: string;
  executionTime?: string;
  slippage?: number;
}

export interface RobinhoodAccount {
  mode: 'DEMO' | 'LIVE';
  status: 'CONNECTED' | 'DISCONNECTED' | 'AUTHENTICATING';
  accountNumber: string;
  portfolioValue: number;
  cashBalance: number;
  buyingPower: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  realizedPnL: number;
  todaysReturn: number;
  todaysReturnPct: number;
  positions: RobinhoodPosition[];
  orders: RobinhoodOrder[];
  credentials?: {
    apiKey?: string;
    accessToken?: string;
    username?: string;
    mfaEnabled?: boolean;
    connectedAt?: string;
  };
}

export interface StrategyCondition {
  id: string;
  factor: 'CONFLUENCE_SCORE' | 'PRICE_LEVEL' | 'RSI_14' | 'SUPERTREND' | 'EMA_20_50_CROSS' | 'DARK_POOL_ZSCORE' | 'SEC_FORM4_BUY' | 'CONGRESS_STOCK_BUY';
  operator: '>' | '<' | '>=' | '<=' | '==' | 'CROSSES_ABOVE' | 'CROSSES_BELOW' | 'CONTAINS';
  threshold: number | string;
  label: string;
  isCurrentlySatisfied?: boolean;
  currentValue?: any;
}

export interface AutomatedTradingStrategy {
  id: string;
  name: string;
  description: string;
  ticker: string;
  isActive: boolean;
  triggerType: 'CONFLUENCE_SCORE' | 'TECHNICAL_INDICATOR' | 'DARK_POOL_FLOW' | 'GOVERNMENT_DISCLOSURE' | 'MULTI_FACTOR';
  conditions: StrategyCondition[];
  action: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  limitPriceOffsetPct?: number; // e.g. -0.5% below market
  sizingType: 'FIXED_DOLLARS' | 'PERCENT_PORTFOLIO' | 'MAX_ATR_RISK' | 'FIXED_SHARES';
  sizingValue: number; // e.g. $1000, 5%, 10 shares
  stopLossPct?: number; // e.g. 3.5%
  takeProfitPct?: number; // e.g. 7.0%
  trailingStopPct?: number;
  executeOnDemoOrLive: 'DEMO' | 'LIVE' | 'BOTH';
  maxExecutions: number;
  currentExecutions: number;
  cooldownMinutes: number;
  lastExecutedAt?: string;
  naturalLanguagePrompt?: string;
  createdAt: string;
}

export interface GovernmentDisclosureFeedStatus {
  lastSyncedAt: string;
  totalFilingsCount: number;
  isAutoSyncEnabled: boolean;
  syncIntervalSec: number;
  sources: {
    secEdgar: { status: 'OK' | 'SYNCING' | 'ERROR'; lastChecked: string; filingsFound: number };
    houseClerk: { status: 'OK' | 'SYNCING' | 'ERROR'; lastChecked: string; filingsFound: number };
    senateEthics: { status: 'OK' | 'SYNCING' | 'ERROR'; lastChecked: string; filingsFound: number };
  };
  recentDisclosures: PoliticalInsiderTrade[];
}

// -------------------------------------------------------------
// Financial News Ingestion & Anti-Bias Fundamental Analysis
// -------------------------------------------------------------
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  contentSnippet: string;
  source: string;
  sourceType: 'FINANCIAL_TIMES' | 'WSJ' | 'BLOOMBERG' | 'REUTERS' | 'BARRONS' | 'SEC_FILING' | 'MAINSTREAM_MEDIA' | 'USER_UPLOAD';
  sourceReliabilityScore: number; // 1-10
  biasAssessment: 'PRO_CORPORATE_PR' | 'RETAIL_FOMO_HYPE' | 'BEARISH_FEAR_MONGERING' | 'INSTITUTIONAL_NEUTRAL' | 'HIGHLY_OBJECTIVE';
  publishedAt: string;
  timeAgo: string;
  url?: string;
  relatedTickers: string[];
  sentimentScore: number; // -1.0 (extremely bearish) to +1.0 (extremely bullish)
  factCheckVerdict: 'CORROBORATED_BY_SEC_FILINGS' | 'SPECULATIVE' | 'CONTRADICTED_BY_CASH_FLOW' | 'UNVERIFIED_RUMOR';
  fundamentalImpactCategory: 'EARNINGS_GROWTH' | 'COMPETITIVE_MOAT' | 'GOVERNMENT_CONTRACT' | 'REGULATORY_RISK' | 'CAPITAL_ALLOCATION' | 'MACRO_HEADWIND';
  keyTakeaways: string[];
}

export interface UploadedNewspaperDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  publicationName: string; // e.g. "Financial Times", "The Wall Street Journal", "Barron's", "Bloomberg Businessweek"
  issueDate: string;
  uploadedAt: string;
  textSnippet: string;
  fullContent?: string;
  analyzedStatus: 'READY' | 'ANALYZED' | 'PROCESSING';
  sourceCredibilityRating: number; // 1-10
  identifiedBiases: string[];
  extractedCatalysts: string[];
  crossValidationSummary?: string;
}

export interface AgentSkill {
  id: string;
  name: string;
  category: 'FUNDAMENTAL_VALUATION' | 'FORENSIC_ACCOUNTING' | 'MACRO_REGIME' | 'BIAS_DETECTOR' | 'OPTIONS_ORDER_FLOW' | 'TECHNICAL_EXECUTION' | 'CUSTOM';
  author: string;
  description: string;
  version: string;
  isEnabled: boolean;
  isDefault: boolean;
  systemPromptGuidelines: string;
  requiredContexts: ('DATETIME_AWARENESS' | 'BALANCE_SHEET' | 'SEC_FORM4' | 'DARK_POOL' | 'NEWS_DISCLOSURES')[];
  tags: string[];
  createdAt: string;
}

export interface TruthAndBiasAnalysisResult {
  ticker: string;
  timestamp: string;
  marketSession: string; // e.g. "Regular Trading Hours (RTH)" or "Post-Market"
  overallTruthScore: number; // 0 - 100
  noiseVsSignalRatio: string; // e.g. "35% Signal / 65% Noise"
  mediaSentimentVsHardFundamentalsDivergence: {
    headlineSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    hardFundamentalsVerdict: 'STRONG_BUY' | 'OVERVALUED' | 'HIGH_DEBT_RISK' | 'VALUE_TRAP' | 'COMPOUNDER';
    divergenceType: 'HYPE_EXCEEDS_REALITY' | 'UNDERVALUED_FEAR_DIVERGENCE' | 'FUNDAMENTALLY_ALIGNED' | 'ACCOUNTING_RED_FLAG';
    divergenceExplanation: string;
  };
  criticalBiasesIdentified: {
    source: string;
    biasType: string;
    vestedInterestRisk: string;
  }[];
  hardDataCorroboration: {
    factClaim: string;
    verifiedAgainst: string; // e.g. "10-Q Cash Flow Statement line 42"
    status: 'VERIFIED' | 'DISPROVEN' | 'INCONCLUSIVE';
    detail: string;
  }[];
  devilsAdvocateCounterThesis: string;
  expertConsensusCheck: string;
  finalSynthesizedRecommendation: {
    actionVerdict: 'ACCUMULATE_ON_PULLBACK' | 'HOLD_AND_AUDIT' | 'FADE_THE_HYPE' | 'EXPEDITE_ENTRY' | 'AVOID_HIGH_VALUATION';
    invalidationPrice: number;
    targetPrice: number;
    recommendedTimeHorizon: string;
    confidenceLevelPct: number;
    reasoning: string;
  };
  activeSkillsUtilized: string[];
}

export interface InfrastructureRecommendation {
  category: 'DATA_WAREHOUSE' | 'VECTOR_SEARCH' | 'STREAMING_PIPELINE' | 'CACHE_LAYER' | 'EXCHANGE_CONNECTIVITY';
  title: string;
  recommendation: string;
  costEfficiency: string;
  performanceBenefit: string;
  implementationGuide: string;
  isLinked: boolean;
}

