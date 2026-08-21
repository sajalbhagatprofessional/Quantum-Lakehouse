# 🏛️ Institutional Quantitative Market Intelligence & Data Lakehouse Platform
> **Core Theme**: High-Precision Financial Data Engineering, Vectorized Quantitative Analytics, and Medallion Lakehouse Architecture.

An enterprise-grade, full-stack quantitative trading intelligence platform built on a scalable **Medallion Data Lakehouse** pattern (Bronze ➔ Silver ➔ Gold). It features real-time asynchronous ETL ingestion, vectorized technical & fundamental indicator pipelines, dynamic missing-data governance, and automated executive equity research dossier generation.

---

## 📐 End-to-End System Architecture

```
                          ┌─────────────────────────────────────────────────────────┐
                          │            REAL-TIME & ASYNC DATA SOURCES               │
                          │  • Exchange Real-Time Quotes & 6-Mo Daily OHLCV Bars    │
                          │  • SEC EDGAR Form 4 (C-Suite Insider Open-Market Trades)│
                          │  • US Congressional STOCK Act Periodic Disclosures     │
                          │  • FINRA ADF Dark Pool Prints & OPRA Options Sweeps     │
                          └────────────────────────────┬────────────────────────────┘
                                                       │
                                  [Token Bucket Rate Limiter & Async ETL]
                                                       │
                                                       ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   MEDALLION LAKEHOUSE STORAGE (DUCKDB / DELTA)                           │
 │                                                                                                          │
 │  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  ┌───────────────────────────┐  │
 │  │          BRONZE LAYER           │  │          SILVER LAYER           │  │        GOLD LAYER         │  │
 │  │  • raw_market_ticks             │─▶│  • financial_fundamentals       │─▶│  • confluence_signals     │  │
 │  │  • High-frequency tick bars     │  │  • institutional_flow (>2.0σ)   │  │  • Unified heuristic score│  │
 │  │  • Unmutated JSON payloads      │  │  • political_insider_trades     │  │  • Dynamic weight engine  │  │
 │  │  • Partitioned by trade_date    │  │  • Standardized typed schema    │  │  • Risk/reward trade plans│  │
 │  └─────────────────────────────────┘  └─────────────────────────────────┘  └───────────────────────────┘  │
 └─────────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                       │
                                [Vectorized Math & Confluence Signal Engine]
                                                       │
                                                       ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   EXECUTIVE DOSSIER & INTELLIGENCE SUITE                                 │
 │  • Real-Time Candlestick Suite (EMA 20/50/200, Supertrend, VWAP, Bollinger Bands, RSI, MACD)             │
 │  • 4-Pillar Confluence Engine (-100 to +100) with Dynamic Missing-Data Redistribution                    │
 │  • Interactive DuckDB SQL Explorer with Microsecond Execution Latency Telemetry                          │
 │  • Production Python Async ETL & Vectorized Quant Pipeline Exporter                                      │
 │  • AI-Powered Research Synthesis (Gemini 3.7 Flash with Built-In Deterministic Local Fallback)           │
 └──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 Data Sources, Government Disclosures & API Integrations

The platform extracts and harmonizes data across official government public transparency portals, regulatory repositories, consolidated exchange tapes, and optional third-party market data APIs.

### 1. Official Government & Regulatory Disclosure Portals

| Regulatory Source | Data Extracted | Disclosure Format & Latency | Official Public Portal URL |
| :--- | :--- | :--- | :--- |
| **U.S. SEC EDGAR** *(Securities and Exchange Commission)* | **Form 4**: C-Suite & Director insider open-market purchases and sales.<br>**Form 10-K / 10-Q**: Audited financial statements, balance sheets, and cash flow statements. | XML / XBRL submissions;<br>Mandatory filing within 2 business days of transaction. | [sec.gov/edgar](https://www.sec.gov/edgar/searchedgar/companysearch)<br>[data.sec.gov API](https://data.sec.gov/submissions/) |
| **U.S. House of Representatives** *(Office of the Clerk)* | **STOCK Act PTRs**: Periodic Transaction Reports filed by Members of Congress and senior legislative staff. | PDF & XML disclosures;<br>Mandatory filing within 45 days of trade (STOCK Act). | [disclosures-clerk.house.gov](https://disclosures-clerk.house.gov/) |
| **U.S. Senate Financial Disclosures** *(Select Committee on Ethics)* | **Senate PTRs**: Public transaction disclosures of equity, bond, and options trades executed by U.S. Senators. | Electronic Financial Disclosures (EFD);<br>Mandatory filing within 45 days. | [efdsearch.senate.gov](https://efdsearch.senate.gov/search/) |
| **FINRA Alternative Display Facility (ADF)** | **Dark Pool (ATS) & OTC Volume**: Off-exchange institutional block prints and non-ATS internalized liquidity. | Trade Reporting Facility (TRF) daily aggregations and weekly ATS summaries. | [finra.org/finra-data](https://www.finra.org/finra-data/browse-catalog/otc-transparency-data) |

---

### 2. Consolidated Exchange Tapes & Market Data Feeds

| Feed Domain | Network Source | Extracted Fields | Usage in Lakehouse |
| :--- | :--- | :--- | :--- |
| **Consolidated Tape (CTA / UTP SIP)** | NYSE, NASDAQ, Cboe, IEX | Real-time NBBO quote prices, day high/low, 52-week channels, continuous tick stream, and daily OHLCV bars. | Loaded into **Bronze** (`raw_market_ticks`) and transformed into **Silver** technical indicators. |
| **OPRA Options Feed** | Options Price Reporting Authority | Contract strike, expiration, premium paid, call/put volume, and institutional aggressive sweep flags. | Loaded into **Silver** (`institutional_flow`) for volume anomaly Z-scoring ($z > 2.0\sigma$). |

---

### 3. API Keys & Optional Provider Integrations

The platform is designed to be **100% functional out of the box** without requiring any paid subscriptions or mandatory API keys. For users who wish to supplement institutional feeds or AI synthesis, the following API keys can be configured in `.env`:

| Environment Variable | Service Provider | Description & Functional Purpose | Required / Optional | Key Acquisition Link |
| :--- | :--- | :--- | :---: | :--- |
| **`GEMINI_API_KEY`** | Google AI Studio | Powers live generative equity research and executive dossier summaries via **Gemini 3.7 Flash**. *(Deterministic fallback runs if omitted).* | **Optional** | [Get Free Key](https://aistudio.google.com/) |
| **`FINNHUB_API_KEY`** | Finnhub Financial API | Real-time company profile verification, shares outstanding reconciliation, and economic calendars. | **Optional** | [Get Free Key](https://finnhub.io/) |
| **`POLYGON_API_KEY`** | Polygon.io | Direct institutional SIP market quotes, historical aggregates, and trade-by-trade tick streams. | **Optional** | [Get Key](https://polygon.io/) |
| **`FMP_API_KEY`** | Financial Modeling Prep | Standardized multi-year balance sheets, 10-K income statements, and enterprise valuation ratios. | **Optional** | [Get Key](https://site.financialmodelingprep.com/) |

---

## 🔬 Data Engineering Excellence: The 4 ETL Pipeline Layers

This platform demonstrates robust data engineering practices, prioritizing data integrity, idempotent operations, and low-latency feature serving.

```
 [EXTRACT] ──────────────▶ [TRANSFORM] ──────────────▶ [LOAD] ──────────────▶ [SERVE / REPORT]
 Ingest Raw Feeds          Cleanse, Enrich, Quant      Medallion Lakehouse     Executive Dossier
 (Quotes, SEC, Flow)       (Z-Scores, EMAs, Solvency)  (Bronze, Silver, Gold)  & Quant Signal Engine
```

---

### Layer 1: Data Extraction (Ingestion & External Connectors)

The ingestion layer extracts raw market signals across four distinct data modalities:

| Source Domain | Target Entities & Endpoints | Extracted Fields & Data Schema | Ingestion Protocol |
| :--- | :--- | :--- | :--- |
| **Market Exchanges** | NYSE / NASDAQ / Cboe consolidated SIP feeds via REST & WebSocket | `timestamp_utc`, `open`, `high`, `low`, `close`, `volume`, `vwap`, `bid`, `ask`, `shares_outstanding`, `beta` | Async HTTP with Connection Pooling |
| **Corporate SEC Filings** | SEC EDGAR 10-K, 10-Q, and 8-K Financial Statements | `pe_ratio`, `forward_pe`, `ev_to_ebitda`, `price_to_sales`, `debt_to_equity`, `current_ratio`, `fcf_yield`, `revenue_growth_yoy` | Batch ETL with ETag Caching |
| **Institutional Dark Pools** | FINRA Alternative Display Facility (ADF) & OPRA Sweeps | `trade_id`, `exchange`, `shares`, `price`, `notional_value`, `order_type`, `sentiment`, `strike`, `expiration` | Real-time Stream Ingestion |
| **Regulatory & Political** | SEC Form 4 Disclosures & US Congressional STOCK Act Reports | `filer_name`, `office_role`, `political_party`, `asset_ticker`, `tx_type` (BUY/SELL), `volume_bracket`, `filing_lag_days` | Periodic Async Web Polling |

#### Resilient Extraction Safeguards
- **Token Bucket Rate Limiting**: Enforces strict requests-per-second thresholds to prevent rate-limit exhaustion against upstream APIs.
- **Exponential Backoff with Randomized Jitter**: Mitigates thundering herd problems by applying:
  $$\text{Wait Time} = \min(\text{Max Backoff}, \text{Base} \times 2^{\text{attempt}} + \text{rand}(0, 1))$$
- **Non-Blocking Fallback Routing**: Gracefully falls back across secondary mirror endpoints if an upstream feed is degraded.

---

### Layer 2: Data Transformation (Sanitization, Normalization & Feature Engineering)

Raw payloads undergo multi-stage transformations to convert unstructured and heterogeneous data into structured, queryable analytical features:

```
               ┌─────────────────────────────────────────────────────────┐
               │                 RAW INGESTED PAYLOADS                   │
               └────────────────────────────┬────────────────────────────┘
                                            │
               ┌────────────────────────────▼────────────────────────────┐
               │ 1. DATA HYGIENE & NORMALIZATION                         │
               │ • UTC Timestamp alignment & ISO 8601 standardization    │
               │ • Deduplication via MD5 hash primary keys               │
               │ • Outlier scrubbing (filtering zero/negative prices)    │
               └────────────────────────────┬────────────────────────────┘
                                            │
               ┌────────────────────────────▼────────────────────────────┐
               │ 2. VECTORIZED QUANTITATIVE FEATURE STORE                │
               │ • Exponential Moving Averages (EMA 20, 50, 200)         │
               │ • Dynamic-Band RSI (14-period with overbought/sold)     │
               │ • MACD Line (12, 26) & Signal (9) Histogram             │
               │ • Supertrend with 10-period Average True Range (ATR)    │
               │ • Bollinger Bands (20-period, 2.0 Standard Deviations)  │
               └────────────────────────────┬────────────────────────────┘
                                            │
               ┌────────────────────────────▼────────────────────────────┐
               │ 3. ADVANCED INSTITUTIONAL SCORING                       │
               │ • Altman Z-Score & 9-Point Piotroski F-Score Calculation│
               │ • Volume Anomaly Z-Scoring: z = (V - μ) / σ (> 2.0σ)    │
               │ • Dynamic Missing-Data Weight Reallocation Matrix       │
               └─────────────────────────────────────────────────────────┘
```

#### Dynamic Missing-Data Governance
When a ticker lacks regulatory insider filings (e.g. newly listed equities or specialized ETFs), the pipeline **strictly avoids synthetic hallucination**. Instead, it tags the pillar `[NO CONFIRMED DATA AVAILABLE]` and dynamically reallocates weights to preserve mathematical balance:

```
Standard Regime Weights:
├── Technicals:         35%
├── Fundamentals:       25%
├── Institutional Flow: 25%
└── Regulatory Insider: 15% (Total: 100%)

Adjusted Regime Weights (Zero-Insider Detection):
├── Technicals:         40% (+5% reallocated)
├── Fundamentals:       30% (+5% reallocated)
├── Institutional Flow: 30% (+5% reallocated)
└── Regulatory Insider:  0% (Total: 100%)
```

---

### Layer 3: Data Loading (Medallion Lakehouse Storage)

The transformed datasets are loaded into an in-memory **DuckDB / Parquet-compatible Medallion Architecture**:

```
 ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                MEDALLION LAKEHOUSE STORAGE                                   │
 ├──────────────────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                              │
 │  ┌─────────────────────────────────┐                                                        │
 │  │ 🥉 BRONZE: RAW STORAGE LAYER    │ • Table: raw_market_ticks                               │
 │  │                                 │ • Schema: (ticker, timestamp_utc, raw_payload, source)  │
 │  │                                 │ • Storage: Append-only immutable daily partitions       │
 │  └────────────────┬────────────────┘                                                        │
 │                   │ Cleanse, Validate & Deduplicate                                          │
 │                   ▼                                                                          │
 │  ┌─────────────────────────────────┐                                                        │
 │  │ 🥈 SILVER: CURATED FEATURE STORE│ • Table: financial_fundamentals (Solvency & Multiples)  │
 │  │                                 │ • Table: institutional_flow (Dark Pool Prints > 2.0σ)   │
 │  │                                 │ • Table: political_insider_trades (SEC Form 4 & STOCK)  │
 │  └────────────────┬────────────────┘                                                        │
 │                   │ Compute Vectorized Confluence & Risk Plans                               │
 │                   ▼                                                                          │
 │  ┌─────────────────────────────────┐                                                        │
 │  │ 🥇 GOLD: ALPHA SIGNALS LAYER    │ • View: confluence_signals                              │
 │  │                                 │ • Materialized aggregate metrics for low-latency UI     │
 │  │                                 │ • Pre-calculated Confluence Score, Regime & Setups      │
 │  └─────────────────────────────────┘                                                        │
 └──────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Bronze Layer (`lakehouse.bronze.raw_market_ticks`)**:
  - Ingests raw streaming ticks, order book snapshots, and external JSON payloads.
  - Partitioned chronologically by `(ticker, date_trunc('day', timestamp_utc))` for zero-scan partition pruning.
- **Silver Layer (`lakehouse.silver.*`)**:
  - `financial_fundamentals`: Normalized balance sheets, valuation multiples, and sector median comparative benchmarks.
  - `institutional_flow`: Standardized dark pool block prints (`> $5.0M`) and options sweeps with volume anomaly Z-scores.
  - `political_insider_trades`: Curated SEC Form 4 insider transactions and Congressional disclosures with reporting lag tracking.
- **Gold Layer (`lakehouse.gold.confluence_signals`)**:
  - Fully materialized analytical view aggregating the 4 pillars into a single holistic confluence score (`-100` to `+100`), market regime classification, and risk-managed execution levels (Entry, Stop Loss, Target 1, Target 2).

---

### Layer 4: Lakehouse-to-Report Layer (Executive Dossier & Research Synthesis)

The final layer extracts data directly from the Lakehouse **Gold** and **Silver** tables to generate institutional research outputs:

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 LAKEHOUSE GOLD & SILVER DATA TABLES                    │
  │   • confluence_signals   • financial_fundamentals   • institutional_flow│
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 EXECUTIVE DOSSIER REPORTING ENGINE                     │
  │                                                                        │
  │   1. Market Valuation & Scale Alignment                                │
  │      • Real-time Market Cap formatted to Trillions / Billions / Millions│
  │      • Exact Beta, 52-Week Range Channel, Shares Outstanding           │
  │                                                                        │
  │   2. Multi-Timeframe Regime & Confluence Synthesis                     │
  │      • Pillar Breakdown (Technicals, Fundamentals, Flow, Insiders)     │
  │      • Conviction Tier (HIGH CONVICTION, MODERATE, LOW CONVICTION)     │
  │                                                                        │
  │   3. Trade Setups & Risk-Managed Execution Plans                       │
  │      • Bullish & Bearish Scenarios with 1:2+ Risk-to-Reward Ratios     │
  │      • ATR-Derived Stop-Loss and Staggered Take-Profit Targets         │
  │                                                                        │
  │   4. Dual-Mode Executive Summary Generation                            │
  │      • Primary: Google Gemini 3.7 Flash LLM Research Synthesis         │
  │      • Fallback: Local Deterministic Quantitative Rule Engine          │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Summary of Historical Data Storage

| Lakehouse Layer | Scope & Storage Window | Data Schema & Retention Policy |
| :--- | :--- | :--- |
| **Bronze Layer (Raw Ingestion)** | **6 Months (~126–130 Trading Days)** | Daily OHLCV price action, volume, and in-memory tick session buffer. |
| **Silver Layer (Curated Feature Store)** | **Rolling 14-day to 252-day Windows** | Computed quant metrics: **20/50/200-day EMAs**, **14-period Dynamic RSI**, **MACD (12, 26, 9)**, **Bollinger Bands (20, 2.0σ)**, **Supertrend (10, 3.0 ATR)**, **VWAP**, and **52-Week (252-day) High/Low ranges**. |
| **Gold Layer (Alpha Signals)** | **30 to 90 Days** | Institutional dark pool order flow (30-day block anomaly prints) and regulatory SEC Form 4 / Congressional STOCK Act filings (30–90 day disclosure tracking). |

---

## 📈 Quantitative Trading Engine (-100 to +100 Confluence)

| Pillar | Baseline Weight | Adjusted Weight (No Insiders) | Key Quantitative Factors |
| :--- | :---: | :---: | :--- |
| **1. Technicals & MTF Alignment** | **35%** | **40%** | EMA Golden Stack (20, 50, 200), Supertrend (10, 3.0), Dynamic Band RSI(14), MACD Histogram, VWAP support, Multi-Timeframe Alignment (15m, 1h, 4h, 1d, 1w). |
| **2. Fundamental Health & Valuation** | **25%** | **30%** | P/E vs Sector Median, PEG Ratio, EV/EBITDA, YoY Revenue Growth, FCF Yield, Piotroski F-Score (0–9), Altman Z-Score. |
| **3. Institutional Flow & Dark Pools** | **25%** | **30%** | Off-exchange Dark Pool prints, Block buys > $5M, Options Sweep call/put ratios, Volume Z-Score anomalies (> +2.0σ). |
| **4. Regulatory Insider Disclosures** | **15%** | **0%** | SEC Form 4 executive open-market transactions, Congressional STOCK Act disclosures, filing lag days analysis. |

---

## 💻 Local Deployment Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher
- **Git**: ([Download Git](https://git-scm.com/))
- *(Optional)* **Python 3.10+**: To execute standalone ETL scripts.

### 2. Clone & Install
```bash
git clone https://github.com/your-username/quantum-market-lakehouse.git
cd quantum-market-lakehouse
npm install
```

### 3. Environment Configuration (Optional)
The platform is **100% operational out of the box** without required API keys. To enable optional supplementary feeds or AI synthesis:
```bash
cp .env.example .env
```
Supported variables:
- `GEMINI_API_KEY`: For generative research summaries via Gemini 3.7 Flash.
- `FINNHUB_API_KEY`: (Optional) For supplementary institutional profile verification.
- `POLYGON_API_KEY`: (Optional) For direct institutional SIP feeds.
- `FMP_API_KEY`: (Optional) For multi-year standardized balance sheet statements.

### 4. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 📜 License
MIT License. Built to demonstrate institutional quantitative research and financial data engineering excellence.
