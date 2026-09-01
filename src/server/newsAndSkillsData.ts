import { AgentSkill, UploadedNewspaperDocument, NewsArticle, InfrastructureRecommendation } from '../types';

export const INITIAL_AGENT_SKILLS: AgentSkill[] = [
  {
    id: 'skill-warren-buffett-moat',
    name: 'Warren Buffett & Graham Deep Value & Moat Analysis',
    category: 'FUNDAMENTAL_VALUATION',
    author: 'QuantLakehouse Alpha Research',
    description: 'Forensic Margin of Safety, ROIC vs WACC, Owner Earnings, and Durable Pricing Power validation.',
    version: '2.4.0',
    isEnabled: true,
    isDefault: true,
    systemPromptGuidelines: `[SKILL: BUFFETT_GRAHAM_DEEP_VALUE]
1. Assess economic moat: Is pricing power intact? Does the company generate durable ROIC exceeding WACC (> 15% ROIC)?
2. Calculate Owner Earnings (Free Cash Flow adjusted for maintenance capex). Never rely solely on adjusted non-GAAP EBITDA.
3. Establish strict Margin of Safety: Demand at least a 20-30% discount to intrinsic DCF valuation before recommending long accumulation.
4. Distinguish between cyclical peak earnings vs durable normalized earnings power.
5. Invalidate thesis if debt-to-equity escalates (> 1.8x) or if management engages in value-destroying dilutive acquisitions.`,
    requiredContexts: ['BALANCE_SHEET', 'DATETIME_AWARENESS'],
    tags: ['Value Investing', 'Margin of Safety', 'ROIC', 'Moat Analysis', 'Owner Earnings'],
    createdAt: '2026-08-15T10:00:00.000Z'
  },
  {
    id: 'skill-forensic-accounting',
    name: 'Forensic Accounting & Beneish M-Score Red Flag Auditing',
    category: 'FORENSIC_ACCOUNTING',
    author: 'Lakehouse Forensic Lab',
    description: 'Detects revenue inflation, aggressive capitalization of expenses, and earnings accrual anomalies.',
    version: '1.9.0',
    isEnabled: true,
    isDefault: true,
    systemPromptGuidelines: `[SKILL: FORENSIC_ACCOUNTING_AUDIT]
1. Scrutinize the quality of earnings: Compare Net Income to Cash Flow from Operations. If Net Income grows while Operating Cash Flow declines, flag severe accrual risk.
2. Calculate Beneish M-Score components: Days Sales in Receivables Index (DSRI), Gross Margin Index (GMI), Asset Quality Index (AQI), and Sales Growth Index (SGI).
3. Investigate off-balance-sheet liabilities, supplier financing arrangements, capitalized R&D/SaaS costs, and unbilled receivables.
4. When analyzing glowing press releases, check if underlying working capital deteriorated in the latest SEC 10-Q/10-K filings.`,
    requiredContexts: ['BALANCE_SHEET', 'SEC_FORM4', 'NEWS_DISCLOSURES'],
    tags: ['Forensic Audit', 'Beneish M-Score', 'Earnings Quality', 'Working Capital', 'Red Flags'],
    createdAt: '2026-08-20T14:30:00.000Z'
  },
  {
    id: 'skill-anti-noise-bias-sieve',
    name: 'Anti-Noise Media Sieve & Source Bias Deconstructor',
    category: 'BIAS_DETECTOR',
    author: 'DeepMind Antigravity Intelligence',
    description: 'Critical skepticism filter identifying PR spin, retail FOMO traps, and conflict-of-interest broker bias.',
    version: '3.1.0',
    isEnabled: true,
    isDefault: true,
    systemPromptGuidelines: `[SKILL: ANTI_NOISE_MEDIA_SIEVE]
1. Critical Skepticism Rule: Treat ALL financial media headlines as biased data points designed to generate clicks or facilitate institutional distribution/accumulation.
2. Identify publisher alignment: Corporate PR releases (hyper-bullish promotional bias), sell-side broker upgrades (conflict of interest with underwriting fees), and retail news portals (chasing momentum hype).
3. Cross-validate every qualitative headline against hard quantifiable lakehouse metrics (SEC Edgar 10-K, actual FCF yield, Piotroski F-Score).
4. Formulate the Devil's Advocate Counter-Thesis: What is the most severe, high-probability failure mode that the headline is glossing over?
5. Ensure transaction decision is grounded in current exact datetime context, market session liquidity, and risk-adjusted invalidation levels.`,
    requiredContexts: ['DATETIME_AWARENESS', 'NEWS_DISCLOSURES', 'BALANCE_SHEET'],
    tags: ['Media Bias', 'Fact-Checking', 'Devils Advocate', 'Noise Filter', 'Counter-Thesis'],
    createdAt: '2026-08-25T08:00:00.000Z'
  },
  {
    id: 'skill-macro-liquidity-regime',
    name: 'Macro Liquidity, Yield Curve & Central Bank Regime Detector',
    category: 'MACRO_REGIME',
    author: 'Global Macro Alpha Team',
    description: 'Maps Fed SOFR liquidity, Reverse Repo drain, 10Y-2Y yield curve slope, and US Dollar Index (DXY) momentum.',
    version: '2.1.0',
    isEnabled: true,
    isDefault: true,
    systemPromptGuidelines: `[SKILL: MACRO_LIQUIDITY_REGIME]
1. Map current economic regime: Fed Funds Rate, Reverse Repo (RRP) drain, Treasury General Account (TGA) dynamics, and Net Global Central Bank Liquidity.
2. Track 10Y-2Y Treasury Yield Curve slope: Inversion vs Bear/Bull Steepening impacts on equity multiples.
3. Gauge US Dollar Index (DXY) momentum: Strong dollar tightens offshore liquidity and compresses multinational corporate earnings.
4. Scale equity risk exposure dynamically based on high-yield credit spreads (CDX HY) and VIX term structure contango/backwardation.`,
    requiredContexts: ['DATETIME_AWARENESS', 'NEWS_DISCLOSURES'],
    tags: ['Macro Regime', 'Liquidity', 'Yield Curve', 'Central Banks', 'Credit Spreads'],
    createdAt: '2026-08-28T11:15:00.000Z'
  },
  {
    id: 'skill-institutional-darkpool-options',
    name: 'Institutional Dark Pool & Options Gamma Volatility Squeeze',
    category: 'OPTIONS_ORDER_FLOW',
    author: 'Derivatives & Microstructure Quant Group',
    description: 'Correlates off-exchange block sweeps (> 2.5σ) with Net Gamma Exposure (GEX) and zero-gamma flip points.',
    version: '2.5.0',
    isEnabled: false,
    isDefault: false,
    systemPromptGuidelines: `[SKILL: DARK_POOL_GAMMA_MICROSTRUCTURE]
1. Correlate off-exchange Dark Pool prints (> 2.5σ volume spikes) with Net Gamma Exposure (GEX).
2. Identify Gamma Pinning levels and Zero-Gamma flip points where market makers switch from stabilizing buyers to accelerating directional sellers.
3. Track institutional option sweeps: Look for deep OTM call volume exceeding open interest on unusual short-dated expiries.
4. Detect synthetic long/short delta positioning used by hedge funds to disguise accumulation ahead of earnings.`,
    requiredContexts: ['DARK_POOL', 'DATETIME_AWARENESS'],
    tags: ['Dark Pools', 'Gamma Exposure (GEX)', 'Options Flow', 'Market Microstructure'],
    createdAt: '2026-08-30T16:45:00.000Z'
  }
];

export const INITIAL_NEWSPAPER_DOCUMENTS: UploadedNewspaperDocument[] = [
  {
    id: 'doc-ft-2026-09-01',
    fileName: 'Financial_Times_Global_Capital_Markets_Sep2026.pdf',
    fileType: 'PDF Document',
    fileSizeKb: 3420,
    publicationName: 'Financial Times',
    issueDate: '2026-09-01',
    uploadedAt: '2026-09-01T08:15:00.000Z',
    textSnippet: 'Big Tech Capex Reality Check: Cloud hyperscalers projected to commit over $240B in aggregate FY26 AI datacenter infrastructure. However, enterprise monetization lag creates growing margin divergence between silicon suppliers (NVIDIA, TSMC) and software service integrators.',
    fullContent: `FINANCIAL TIMES — GLOBAL CAPITAL MARKETS REPORT
Date: September 1, 2026

HEADLINE: Hyperscaler Capital Expenditure Escalation Meets Enterprise ROI Scrutiny

Key Excerpt:
"While NVIDIA and specialized semiconductor design houses continue to report record high gross margins exceeding 73%, tier-1 enterprise software customers are experiencing longer sales cycles and slower payback periods on custom generative AI models. 
Institutional asset managers at BlackRock and Vanguard have begun rotating into infrastructure power suppliers, grid utilities, and high-efficiency optical interconnect players, while scrutinizing cash flow conversion rates among second-tier AI SaaS vendors.
Meanwhile, US regulatory bodies are intensifying export compliance audits on advanced chip shipments destined for Middle Eastern data sovereign clusters."`,
    analyzedStatus: 'ANALYZED',
    sourceCredibilityRating: 9.4,
    identifiedBiases: ['Slight European institutional skepticism on US valuation multiples', 'Focus on macro regulatory headwinds and Capex discipline'],
    extractedCatalysts: [
      'NVDA & Semi hardware suppliers maintain superior pricing power (73%+ gross margin)',
      'Enterprise SaaS monetization lag could trigger valuation multiple compression',
      'Power utilities & optical networking experiencing secondary institutional inflow surge'
    ],
    crossValidationSummary: 'Corroborated by NVDA Q2 10-Q filing showing 74.8% gross margins and $13.5B quarterly free cash flow, but justifies caution on software companies trading above 18x EV/Sales.'
  },
  {
    id: 'doc-wsj-2026-08-31',
    fileName: 'WSJ_Markets_Weekend_Deep_Dive_Aug2026.txt',
    fileType: 'Text Transcript',
    fileSizeKb: 1850,
    publicationName: 'The Wall Street Journal',
    issueDate: '2026-08-31',
    uploadedAt: '2026-08-31T19:30:00.000Z',
    textSnippet: 'Wall Street Journal Markets Desk: Sovereign AI Compute Funds from Saudi Arabia, UAE, and Singapore deploy $45B in dedicated sovereign compute infrastructure mandates. SEC Form 4 insider filings reveal selective executive profit-taking across tech leadership.',
    fullContent: `THE WALL STREET JOURNAL — MARKETS & INVESTING
Date: August 31, 2026

HEADLINE: Sovereign Wealth Mega-Orders Cushion Supply Chain While Corporate Insiders Diversify Holdings

Key Points:
- Sovereign AI initiatives across APAC and the Middle East have placed multi-year advance purchase orders for next-generation GPU clusters and liquid cooling infrastructure.
- SEC Form 4 analysis over the past 30 days reveals aggregate net insider selling among C-suite executives at tech bellwethers, though 85% of transactions were pre-arranged Rule 10b5-1 trading plans.
- High-yield corporate credit spreads remain tightly compressed at 310 bps, indicating absence of systemic credit stress despite elevated terminal interest rates.`,
    analyzedStatus: 'ANALYZED',
    sourceCredibilityRating: 9.1,
    identifiedBiases: ['Focus on sovereign liquidity and institutional insider flow mechanics', 'Tendency to normalize 10b5-1 selling'],
    extractedCatalysts: [
      'Sovereign AI infrastructure demand provides multi-year revenue floor for top semiconductor vendors',
      'Rule 10b5-1 executive selling is scheduled but caps immediate upside momentum near resistance',
      'Tight credit spreads confirm healthy corporate solvency across tier-1 balance sheets'
    ],
    crossValidationSummary: 'Verified against SEC Form 4 database and lakehouse credit spread indices. Confirms strong underlying demand with moderate tactical supply overhead.'
  },
  {
    id: 'doc-barrons-2026-08-28',
    fileName: 'Barrons_Institutional_Cover_Story_Aug2026.pdf',
    fileType: 'PDF Document',
    fileSizeKb: 2780,
    publicationName: "Barron's",
    issueDate: '2026-08-28',
    uploadedAt: '2026-08-29T11:00:00.000Z',
    textSnippet: "Barron's Cover: The Great Valuation Re-Rating — Why High Free-Cash-Flow Yield and Low Leverage Trump Speculative Multiple Expansion in the 2026-2027 Macro Regime.",
    fullContent: `BARRON'S COVER STORY
Date: August 28, 2026

HEADLINE: The Flight to Quality: Balance Sheet Fortresses in a 4.5% Risk-Free Rate World

Key Analysis:
"With 10-year Treasury yields anchored near 4.25%, the era of zero-cost capital multiple expansion is definitively over. Companies with sub-2% Free Cash Flow yields and heavy refinancing walls in 2027 are facing aggressive multiple compression.
Conversely, companies boasting Altman Z-scores > 4.5, Piotroski F-scores >= 7, and net cash balance sheets are commanding an unprecedented 'Fortress Balance Sheet Premium'. Investors should focus on companies with high return on invested capital (ROIC > 20%) that can self-fund aggressive R&D without relying on debt markets."`,
    analyzedStatus: 'ANALYZED',
    sourceCredibilityRating: 8.8,
    identifiedBiases: ['Pro-value bias, skeptical of unprofitable growth tech', 'Heavy emphasis on balance sheet ratios and credit solvency'],
    extractedCatalysts: [
      'Fortress balance sheets (Altman Z > 4.0, Piotroski F >= 7) will outperform high-beta leveraged peers',
      'Refinancing wall in 2027 creates severe downside tail risk for zombie firms with Debt/Equity > 2.0x'
    ],
    crossValidationSummary: 'Matches our Lakehouse fundamental scoring methodology perfectly. Emphasizes strict selection of companies with Piotroski F-Score >= 7 and Altman Z >= 4.0.'
  }
];

export const INITIAL_NEWS_ARTICLES: Record<string, NewsArticle[]> = {
  NVDA: [
    {
      id: 'news-nvda-1',
      title: 'NVIDIA Expands Next-Gen GPU Architecture Deployments with Major Cloud Providers',
      summary: 'Tier-1 hyperscalers announce expanded multi-gigawatt datacenter expansions featuring NVIDIA high-density Blackwell and Rubin AI compute clusters.',
      contentSnippet: 'SANTA CLARA, CA — NVIDIA Corporation announced multi-year datacenter infrastructure partnerships with Microsoft, Google Cloud, and AWS. The expansions focus on liquid-cooled high-throughput clusters with integrated optical networking.',
      source: 'Financial Times & Reuters',
      sourceType: 'FINANCIAL_TIMES',
      sourceReliabilityScore: 9.2,
      biasAssessment: 'INSTITUTIONAL_NEUTRAL',
      publishedAt: '2026-09-01T08:30:00.000Z',
      timeAgo: '1 hour ago',
      relatedTickers: ['NVDA', 'MSFT', 'GOOGL', 'AMZN'],
      sentimentScore: 0.82,
      factCheckVerdict: 'CORROBORATED_BY_SEC_FILINGS',
      fundamentalImpactCategory: 'EARNINGS_GROWTH',
      keyTakeaways: [
        'Multi-year revenue backlog reinforced by enterprise hyperscaler agreements',
        'Gross margins protected by proprietary NVLink interconnect and CUDA software ecosystem',
        'Watch for potential supply constraints on advanced packaging and liquid cooling components'
      ]
    },
    {
      id: 'news-nvda-2',
      title: 'Semiconductor Export Control Audits Intensify Across Transshipment Hubs',
      summary: 'Department of Commerce Bureau of Industry and Security issues expanded compliance guidelines for AI accelerators shipped to Middle Eastern and Southeast Asian hubs.',
      contentSnippet: 'WASHINGTON — Federal regulators published updated guidelines to prevent unauthorized diversion of high-performance compute accelerators through third-party intermediaries.',
      source: 'The Wall Street Journal',
      sourceType: 'WSJ',
      sourceReliabilityScore: 9.0,
      biasAssessment: 'HIGHLY_OBJECTIVE',
      publishedAt: '2026-08-31T20:15:00.000Z',
      timeAgo: '13 hours ago',
      relatedTickers: ['NVDA', 'AMD', 'INTC', 'TSM'],
      sentimentScore: -0.35,
      factCheckVerdict: 'CORROBORATED_BY_SEC_FILINGS',
      fundamentalImpactCategory: 'REGULATORY_RISK',
      keyTakeaways: [
        'Short-term regulatory headline risk may create volatility on regional revenue segments',
        'NVIDIA custom compliant SKUs mitigate total revenue impact to under 4% of total top-line',
        'Opportunity to accumulate on temporary regulatory-driven panic dips'
      ]
    },
    {
      id: 'news-nvda-3',
      title: 'Wall Street Analyst Upgrades Price Target to $165 Citing Data Center Dominance',
      summary: 'Prominent investment bank raises price target, projecting 55% YoY datacenter segment expansion through FY2027.',
      contentSnippet: 'NEW YORK — Equity research desk issues bullish note arguing enterprise inference compute will surpass initial training cluster demand by a factor of 3x.',
      source: 'MarketWatch & Sell-Side Wire',
      sourceType: 'MAINSTREAM_MEDIA',
      sourceReliabilityScore: 6.8,
      biasAssessment: 'PRO_CORPORATE_PR',
      publishedAt: '2026-08-31T14:00:00.000Z',
      timeAgo: '19 hours ago',
      relatedTickers: ['NVDA'],
      sentimentScore: 0.90,
      factCheckVerdict: 'SPECULATIVE',
      fundamentalImpactCategory: 'EARNINGS_GROWTH',
      keyTakeaways: [
        'Sell-side upgrades often lag price action and can signal short-term sentiment euphoria',
        'Our anti-bias sieve confirms strong fundamentals (ROIC 48%, FCF Yield 4.1%) but warns against buying extended gap-ups',
        'Maintain discipline: Wait for pullbacks to Key Support ($122-$126) rather than chasing at resistance'
      ]
    }
  ],
  AAPL: [
    {
      id: 'news-aapl-1',
      title: 'Apple Services Revenue Crosses Record High as Apple Intelligence Drives Hardware Upgrade Cycle',
      summary: 'Services segment gross margin expands to 74.2% while on-device neural engine capabilities accelerate iPhone replacement rate in enterprise channels.',
      contentSnippet: 'CUPERTINO, CA — Apple announced robust quarterly performance led by App Store, Cloud, and subscription services, with active installed base surpassing 2.3 billion devices.',
      source: 'Bloomberg News',
      sourceType: 'BLOOMBERG',
      sourceReliabilityScore: 9.3,
      biasAssessment: 'INSTITUTIONAL_NEUTRAL',
      publishedAt: '2026-09-01T07:45:00.000Z',
      timeAgo: '2 hours ago',
      relatedTickers: ['AAPL'],
      sentimentScore: 0.75,
      factCheckVerdict: 'CORROBORATED_BY_SEC_FILINGS',
      fundamentalImpactCategory: 'COMPETITIVE_MOAT',
      keyTakeaways: [
        'Ecosystem lock-in and high-margin recurring services provide superior earnings resilience',
        'Massive $110B annualized share buyback program creates structural downside floor'
      ]
    }
  ],
  MSFT: [
    {
      id: 'news-msft-1',
      title: 'Microsoft Cloud Azure Growth Accelerates to 31% YoY with Copilot Enterprise Monetization',
      summary: 'Azure cloud infrastructure gains enterprise market share as commercial Copilot seat adoption surges among Fortune 500 organizations.',
      contentSnippet: 'REDMOND, WA — Microsoft reported accelerated cloud momentum with commercial remaining performance obligations (RPO) reaching $280 billion.',
      source: 'Financial Times',
      sourceType: 'FINANCIAL_TIMES',
      sourceReliabilityScore: 9.2,
      biasAssessment: 'HIGHLY_OBJECTIVE',
      publishedAt: '2026-08-31T22:10:00.000Z',
      timeAgo: '11 hours ago',
      relatedTickers: ['MSFT'],
      sentimentScore: 0.84,
      factCheckVerdict: 'CORROBORATED_BY_SEC_FILINGS',
      fundamentalImpactCategory: 'EARNINGS_GROWTH',
      keyTakeaways: [
        'RPO backlog provides exceptional multi-year revenue visibility',
        'Free cash flow generation exceeds $75B annually, easily absorbing heavy Capex cycles'
      ]
    }
  ]
};

export const INFRASTRUCTURE_RECOMMENDATIONS: InfrastructureRecommendation[] = [
  {
    category: 'DATA_WAREHOUSE',
    title: 'Cloud Data Lakehouse (Snowflake / BigQuery / ClickHouse)',
    recommendation: 'Link an external Columnar Data Warehouse (ClickHouse for sub-10ms time-series streaming analytics or Snowflake/BigQuery for historical SEC Edgar & Dark Pool feature engineering).',
    costEfficiency: 'ClickHouse / MotherDuck serverless achieves 10x lower query compute cost compared to legacy relational databases for billion-row market tick scans.',
    performanceBenefit: 'Reduces 5-year multi-factor Confluence backtests from 45 seconds to < 250 milliseconds with vectorized columnar SIMD execution.',
    implementationGuide: 'Configure S3/GCS parquet lakehouse ingestion with Apache Iceberg / Delta Lake metadata tables. Connect via ClickHouse HTTP Client or BigQuery Storage Read API.',
    isLinked: false
  },
  {
    category: 'VECTOR_SEARCH',
    title: 'Semantic Vector Knowledge Store (pgvector / Pinecone / Qdrant)',
    recommendation: 'Deploy an indexed Vector Embeddings store for semantic retrieval across 10+ years of SEC 10-K/10-Q filings, earnings call audio transcripts, and premium newspaper archives.',
    costEfficiency: 'Use pgvector inside Cloud SQL / PostgreSQL or serverless Pinecone free-tier to index 500,000 document chunks under $15/month.',
    performanceBenefit: 'Enables real-time RAG retrieval of forensic accounting footnotes and executive commentary in < 30ms during live news breaking events.',
    implementationGuide: 'Chunk newspaper PDFs and SEC filings with 512-token sliding windows, embed via text-embedding-004, and execute cosine similarity searches.',
    isLinked: false
  },
  {
    category: 'STREAMING_PIPELINE',
    title: 'Low-Latency Market Event Gateway (Apache Kafka / Redis Streams)',
    recommendation: 'Implement an event-driven pub/sub message broker to buffer high-frequency OPRA Options sweeps, NASDAQ TotalView order book changes, and EDGAR RSS feeds.',
    costEfficiency: 'Serverless Upstash Redis or Redpanda cloud consumes resources only on incoming message spikes.',
    performanceBenefit: 'Eliminates polling overhead and enables instant trigger dispatch to Robinhood automated execution engine in under 5ms.',
    implementationGuide: 'Publish exchange WebSockets to Kafka topic `market.ticks.v1` and consume via consumer groups for Signal Engine and Trading Engine.',
    isLinked: false
  },
  {
    category: 'CACHE_LAYER',
    title: 'Distributed In-Memory L1 Cache (Redis / DragonFly)',
    recommendation: 'Add an in-memory cache for live quotes, pre-calculated Technical Indicators (RSI, Supertrend, EMA), and AI sentiment caches.',
    costEfficiency: 'Prevents redundant AI model inference calls and third-party API rate-limit overage charges by caching unchanged fundamental analyses for 15 minutes.',
    performanceBenefit: 'Provides 1ms instant UI dashboard rendering across all client tabs.',
    implementationGuide: 'Key structure: `cache:quote:{ticker}`, `cache:ai_truth:{ticker}:{timestamp_bucket}` with TTL = 300s.',
    isLinked: false
  }
];
