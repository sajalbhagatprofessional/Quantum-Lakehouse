# 🏛️ Institutional Quantitative Market Intelligence & Medallion Data Lakehouse Platform

> **Core Theme**: High-Precision Financial Data Engineering, Vectorized Quantitative Analytics, DuckDB Medallion Lakehouse Architecture, Model Context Protocol (MCP) Hub, and Multi-Provider LLM Inference.

An enterprise-grade, full-stack quantitative trading intelligence platform built on a scalable **Medallion Data Lakehouse** pattern (Bronze ➔ Silver ➔ Gold). It features real-time asynchronous ETL ingestion, vectorized technical & fundamental indicator pipelines, dynamic missing-data governance, interactive Lakehouse SQL exploration, native Model Context Protocol (MCP) server endpoints, and automated executive equity research dossier generation across local and cloud LLM inference engines.

---

## 📑 Table of Contents

1. [📐 End-to-End System Architecture](#-end-to-end-system-architecture)
2. [🔬 The Data Engineering Marvel](#-the-data-engineering-marvel)
   - [Medallion Lakehouse Pattern (DuckDB / Delta)](#1-medallion-lakehouse-pattern-duckdb--delta)
   - [Resilient Async ETL Ingestion Pipeline](#2-resilient-async-etl-ingestion-pipeline)
   - [Dynamic Missing-Data Governance & Weight Reallocation](#3-dynamic-missing-data-governance--weight-reallocation)
   - [Vectorized Quantitative Feature Store](#4-vectorized-quantitative-feature-store)
3. [🔌 Model Context Protocol (MCP) Native Hub & Integration Guide](#-model-context-protocol-mcp-native-hub--integration-guide)
   - [What is MCP in this Platform?](#what-is-mcp-in-this-platform)
   - [Exposed MCP Tools & Schemas](#exposed-mcp-tools--schemas)
   - [Exposed MCP Prompts & Resources](#exposed-mcp-prompts--resources)
   - [Connecting Claude Desktop to Lakehouse MCP](#connecting-claude-desktop-to-lakehouse-mcp)
   - [Connecting Cursor IDE to Lakehouse MCP](#connecting-cursor-ide-to-lakehouse-mcp)
   - [Interactive In-App MCP Tool Runner](#interactive-in-app-mcp-tool-runner)
4. [🤖 Multi-Provider LLM Inference & Connection Guide](#-multi-provider-llm-inference--connection-guide)
   - [Supported AI Providers & Local Engines](#supported-ai-providers--local-engines)
   - [Connecting Local Ollama (100% Private, 0 Cost)](#connecting-local-ollama-100-private-0-cost)
   - [Connecting LM Studio Local Server](#connecting-lm-studio-local-server)
   - [Connecting Google Gemini, OpenRouter, OpenAI & DeepSeek](#connecting-cloud-providers-gemini-openrouter-openai-deepseek)
   - [Deterministic Local Quantitative Rule Engine (Zero-Key Fallback)](#deterministic-local-quantitative-rule-engine)
   - [Lakehouse Layer Telemetry Injection & Grounding](#lakehouse-layer-telemetry-injection--grounding)
5. [🌐 Data Sources & Government Disclosures](#-data-sources--government-disclosures)
   - [Official Regulatory Disclosures (SEC Form 4 & STOCK Act)](#1-official-government--regulatory-disclosure-portals)
   - [Consolidated Exchange Feeds & Dark Pools](#2-consolidated-exchange-tapes--market-data-feeds)
6. [🖥️ Application Views & Feature Walkthrough](#-application-views--feature-walkthrough)
   - [1. Executive Equity Dossier View](#1-executive-equity-dossier-view)
   - [2. 4-Pillar Quantitative Signal Engine](#2-4-pillar-quantitative-signal-engine)
   - [3. DuckDB Lakehouse Explorer](#3-duckdb-lakehouse-explorer)
   - [4. Model Context Protocol (MCP) Hub](#4-model-context-protocol-mcp-hub)
   - [5. Python & SQL Pipeline Exporter](#5-python--sql-pipeline-exporter)
7. [💻 Local Deployment & Quickstart Guide](#-local-deployment--quickstart-guide)
8. [📊 Environment Variables & Configuration](#-environment-variables--configuration)

---

## 📐 End-to-End System Architecture

```
                          ┌─────────────────────────────────────────────────────────┐
                          │            REAL-TIME & ASYNC DATA INGESTION             │
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
                                ┌──────────────────────┴──────────────────────┐
                                │                                             │
                                ▼                                             ▼
  ┌──────────────────────────────────────────┐  ┌───────────────────────────────────────────────────────────┐
  │   MODEL CONTEXT PROTOCOL (MCP) JSON-RPC  │  │        MULTI-PROVIDER LLM & SYNTHESIS ENGINE              │
  │  • Built-in HTTP / SSE MCP Server        │  │  • Google Gemini 3.7 Flash & 2.5 Pro (Streaming)         │
  │  • Native Tools (SQL, Quotes, Flow, Risk)│  │  • Ollama (Local DeepSeek-R1, Llama 3.3, Qwen 2.5)       │
  │  • Claude Desktop & Cursor Integration   │  │  • LM Studio (Local Inference Port 1234)                 │
  │  • In-App Interactive Tool Runner        │  │  • OpenRouter / OpenAI / DeepSeek Direct                 │
  │  • Zero-Hallucination Lakehouse Context  │  │  • Deterministic Quantitative Rule Engine (Offline)       │
  └──────────────────────────────────────────┘  └───────────────────────────────────────────────────────────┘
                                │                                             │
                                └──────────────────────┬──────────────────────┘
                                                       │
                                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                   EXECUTIVE DOSSIER & INTELLIGENCE SUITE                                │
  │  • Real-Time Candlestick Suite (EMA 20/50/200, Supertrend, VWAP, Bollinger Bands, RSI, MACD)            │
  │  • 4-Pillar Confluence Engine (-100 to +100) with Dynamic Missing-Data Redistribution                   │
  │  • Interactive DuckDB SQL Explorer with Microsecond Latency Telemetry                                   │
  │  • Production Python Async ETL & Vectorized Quant Pipeline Exporter                                     │
  │  • Position Sizing & ATR Risk Calculator with Invalidation Triggers                                     │
  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 The Data Engineering Marvel

This platform is engineered around the core principles of institutional financial data pipelines: **idempotency, schema evolution, strict data hygiene, sub-millisecond querying, and deterministic feature calculation**.

```
 [EXTRACT] ──────────────▶ [TRANSFORM] ──────────────▶ [LOAD] ──────────────▶ [SERVE / REPORT]
 Ingest Raw Feeds          Cleanse, Enrich, Quant      Medallion Lakehouse     Executive Dossier
 (Quotes, SEC, Flow)       (Z-Scores, EMAs, Solvency)  (Bronze, Silver, Gold)  & Quant Signal Engine
```

### 1. Medallion Lakehouse Pattern (DuckDB / Delta)

The system organizes analytical tables into a structured **Medallion Lakehouse Pattern**:

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
 │                   │ Cleanse, Validate, Standardize & Deduplicate                             │
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

#### 🥉 Bronze Layer: Raw Ingestion (`raw_market_ticks`)
- **Immutability**: Append-only log of raw WebSocket tick streams, exchange order books, and SEC XML feeds.
- **Partitioning**: Chronologically partitioned by `(ticker, date_trunc('day', timestamp_utc))` for zero-scan partition pruning.
- **Auditability**: Stores raw, unmutated JSON payloads alongside ingestion metadata (`source_feed`, `latency_ms`, `http_status`).

#### 🥈 Silver Layer: Validated & Enriched Features
- **`financial_fundamentals`**: Cleansed and standardized balance sheet items, P/E ratios, EV/EBITDA, Free Cash Flow yields, and Altman Z / Piotroski F-Scores.
- **`institutional_flow`**: Off-exchange Dark Pool block prints filtered by notional size (`> $5.0M`) with standard deviation volume anomaly Z-scores ($z > 2.0\sigma$).
- **`political_insider_trades`**: Curated SEC Form 4 insider open-market transactions and US Congressional STOCK Act Periodic Transaction Reports (PTR) with calculated filing latency.

#### 🥇 Gold Layer: Materialized Alpha Signals (`confluence_signals`)
- **Materialized High-Speed Serving**: Pre-aggregates the 4 pillars into a single holistic score (`-100` to `+100`), market regime tags (`STRONG_BULLISH`, `NEUTRAL`, `STRONG_BEARISH`), and risk-managed execution levels (Ideal Entry, Stop Loss, Target 1, Target 2).

---

### 2. Resilient Async ETL Ingestion Pipeline

The extraction tier incorporates institutional reliability patterns to guarantee pipeline uptime:

1. **Token Bucket Rate Limiting**:
   - Dynamically regulates request throughput to downstream APIs to strictly prevent HTTP 429 rate limit exceptions.
2. **Exponential Backoff with Randomized Jitter**:
   $$\text{Wait Time} = \min\left(\text{Max Backoff}, \text{Base} \times 2^{\text{attempt}} + \text{Uniform}(0, 1)\right)$$
   Prevents thundering herd retries during exchange API micro-outages.
3. **Multi-Source Connection Pooling & Fallback**:
   - Concurrently polls primary exchange feeds (Yahoo Finance SIP / Finnhub) with asynchronous `aiohttp` / `fetch` connection pools, automatically routing to local high-precision reference baselines if upstream feeds degrade.

---

### 3. Dynamic Missing-Data Governance & Weight Reallocation

A critical flaw in standard algorithmic and AI trading pipelines is **synthetic data hallucination**—fabricating metrics when filings do not exist.

In this platform:
- When an asset lacks confirmed insider disclosures (e.g. newly listed equities, foreign ADRs, or specialized technology ETFs like `IONQ`), the pipeline explicitly flags the pillar as **`[NO CONFIRMED DATA AVAILABLE]`**.
- It then executes a **Dynamic Weight Reallocation Matrix**, re-distributing the 15% insider weighting proportionally across the remaining pillars so the mathematical sum remains exactly **100%**:

```
Standard Regime Weights:
├── Technicals:         35%
├── Fundamentals:       25%
├── Institutional Flow: 25%
└── Regulatory Insider: 15% (Total: 100%)

Adjusted Regime Weights (Zero-Insider Detection):
├── Technicals:         40% (+5.0% reallocated)
├── Fundamentals:       30% (+5.0% reallocated)
├── Institutional Flow: 30% (+5.0% reallocated)
└── Regulatory Insider:  0% (Total: 100% - Zero Hallucination Enforced)
```

---

### 4. Vectorized Quantitative Feature Store

All quantitative technical indicators are computed using vectorized time-series routines across a rolling 6-month window (~126–130 daily trading bars):

| Quantitative Metric | Lookback Window | Formula / Mathematical Definition |
| :--- | :--- | :--- |
| **Exponential Moving Averages** | 20, 50, 200 Days | $\text{EMA}_t = \alpha \cdot P_t + (1 - \alpha) \cdot \text{EMA}_{t-1}, \quad \alpha = \frac{2}{N+1}$ |
| **Dynamic-Band RSI** | 14 Periods | $\text{RSI} = 100 - \left(\frac{100}{1 + \text{RS}}\right), \quad \text{RS} = \frac{\text{EMA}(\text{Gain}, 14)}{\text{EMA}(\text{Loss}, 14)}$ |
| **MACD & Signal Histogram** | 12, 26, 9 Periods | $\text{MACD} = \text{EMA}_{12}(P) - \text{EMA}_{26}(P), \quad \text{Signal} = \text{EMA}_9(\text{MACD})$ |
| **Supertrend with ATR** | 10 Periods, 3.0 Mult | $\text{Band} = \frac{\text{High} + \text{Low}}{2} \pm (3.0 \times \text{ATR}_{10})$ |
| **Bollinger Bands** | 20 Periods, 2.0 $\sigma$ | $\text{Upper/Lower} = \text{SMA}_{20}(P) \pm (2.0 \times \sigma_{20})$ |
| **Volume Anomaly Z-Score** | 30-Day Rolling | $z = \frac{V_t - \mu_V}{\sigma_V} \quad (\text{Flagged if } z > 2.0\sigma)$ |
| **Piotroski F-Score** | 9 Fundamental Criteria | Profitability (4 pts) + Leverage/Liquidity (3 pts) + Operating Efficiency (2 pts) |
| **Altman Z-Score** | Solvency Multiples | $Z = 1.2 X_1 + 1.4 X_2 + 3.3 X_3 + 0.6 X_4 + 0.999 X_5$ |

---

## 🔌 Model Context Protocol (MCP) Native Hub & Integration Guide

### What is MCP in this Platform?

The **Model Context Protocol (MCP)** is an open industry standard (created by Anthropic) that allows AI models, coding assistants, and local LLMs to securely interact with data sources and tools.

This platform embeds a **Native HTTP JSON-RPC 2.0 MCP Server** directly in the backend (`/api/mcp`), enabling Claude Desktop, Cursor IDE, OpenRouter, and local Ollama/LM Studio models to query the Lakehouse and execute quant calculations in real time.

```
  ┌─────────────────────────────────┐
  │   EXTERNAL AGENT / CLIENT       │
  │   (Claude Desktop / Cursor IDE) │
  └────────────────┬────────────────┘
                   │
                   │ JSON-RPC 2.0 over HTTP/SSE
                   ▼
  ┌────────────────────────────────────────────────────────┐
  │   QUANTUM LAKEHOUSE NATIVE MCP SERVER                  │
  │   Endpoint: http://localhost:3000/api/mcp              │
  ├────────────────────────────────────────────────────────┤
  │   • Tools:      /api/mcp/tools      (JSON Schema)      │
  │   • Execution:  /api/mcp/call       (POST)             │
  │   • Prompts:    /api/mcp/prompts    (Pre-built flows)  │
  │   • Resources:  /api/mcp/resources  (Lakehouse URIs)   │
  └────────────────────────────────────────────────────────┘
```

---

### Exposed MCP Tools & Schemas

The Lakehouse exposes 6 high-performance native MCP tools:

| MCP Tool Name | Category | Description | Sample Arguments |
| :--- | :--- | :--- | :--- |
| **`lakehouse_query_sql`** | `lakehouse` | Executes analytical SQL queries directly against DuckDB Bronze, Silver, and Gold Delta tables. | `{"query": "SELECT * FROM lakehouse.gold.confluence_signals WHERE ticker = 'NVDA'"}` |
| **`get_ticker_confluence`** | `confluence` | Returns the 4-pillar confluence score (-100 to +100), market regime, and missing-data weight metadata. | `{"ticker": "NVDA"}` |
| **`fetch_live_quotes`** | `market_data` | Retrieves real-time NBBO prices, 6-month daily OHLCV candlestick bars, beta, and market capitalization. | `{"ticker": "MSFT"}` |
| **`get_darkpool_flow`** | `market_data` | Queries off-exchange Dark Pool block prints (`> $5.0M`) and options sweeps with volume anomaly Z-scores ($> 2.0\sigma$). | `{"ticker": "NVDA", "minNotional": 5000000}` |
| **`fetch_sec_disclosures`** | `compliance` | Retrieves official SEC Form 4 C-Suite insider purchases and US Congressional STOCK Act PTR disclosures. | `{"ticker": "AAPL", "maxLagDays": 30}` |
| **`calculate_risk_position`**| `risk` | Computes recommended position sizing, maximum dollar risk, and multi-target profit levels based on ATR stop-losses. | `{"portfolioSize": 100000, "riskTolerancePct": 1.0, "entryPrice": 128.45, "stopLoss": 123.50}` |

---

### Exposed MCP Prompts & Resources

#### MCP Prompts (`/api/mcp/prompts`)
- **`executive_dossier_synthesis`**: Automated multi-pillar research workflow fusing technicals, fundamentals, flow, and insider governance.
- **`darkpool_anomaly_investigation`**: Deep investigation prompt for block orders and options sweep spikes exceeding $2.0\sigma$.
- **`confluence_regime_audit`**: Multi-timeframe trend validation prompt for risk-managed swing trade setups.

#### MCP Resources (`/api/mcp/resources`)
- `lakehouse://schemas/medallion`: Complete DuckDB Medallion Lakehouse schema specifications.
- `lakehouse://metrics/active_market`: Real-time market metrics and consolidated quotes.
- `lakehouse://filings/sec_edgar`: Curated SEC Form 4 and Congressional STOCK Act transaction logs.

---

### Connecting Claude Desktop to Lakehouse MCP

To use your local or cloud Lakehouse directly inside **Claude Desktop**:

1. Open your Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add the `quantum_lakehouse` MCP server definition:

```json
{
  "mcpServers": {
    "quantum_lakehouse": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch",
        "http://localhost:3000/api/mcp/tools"
      ],
      "env": {
        "LAKEHOUSE_ENDPOINT": "http://localhost:3000"
      }
    }
  }
}
```

3. Restart Claude Desktop. You will now see the Lakehouse tool hammer icon in Claude, allowing Claude to run SQL queries and calculate confluence scores on demand!

---

### Connecting Cursor IDE to Lakehouse MCP

To connect **Cursor IDE** to the live Lakehouse:

1. Open Cursor Settings ➔ **Features** ➔ **MCP Servers** (or edit `~/.cursor/mcp.json`).
2. Click **Add New MCP Server**:
   - **Name**: `Quantum Lakehouse Pipeline`
   - **Type**: `SSE` or `HTTP`
   - **Server URL**: `http://localhost:3000/api/mcp`
3. Cursor's Composer and Agent modes will now automatically query your Lakehouse features when answering code and financial analysis questions.

---

### Interactive In-App MCP Tool Runner

Inside the web application:
1. Navigate to the **MCP Hub** tab in the top navigation bar.
2. Select any tool from the sidebar (e.g. `lakehouse_query_sql`, `get_ticker_confluence`, `get_darkpool_flow`).
3. Modify the JSON arguments in the real-time code editor.
4. Click **Execute MCP Tool** (`Ctrl+Enter` or button) to run the tool against the live engine and view microsecond JSON-RPC 2.0 telemetry results.

---

## 🤖 Multi-Provider LLM Inference & Connection Guide

The platform features an advanced **Inference Settings Hub** allowing you to switch between 7 different AI providers or run 100% offline with zero API keys.

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      INFERENCE ENGINE SELECTOR                         │
 ├────────────────────────────────────────────────────────────────────────┤
 │  [•] Google Gemini        (Cloud High-Speed • Gemini 3.7 Flash)        │
 │  [ ] Ollama Local         (100% Private • DeepSeek-R1 / Llama 3.3)     │
 │  [ ] LM Studio Local      (Local GUI Inference • Port 1234)            │
 │  [ ] OpenRouter API       (Universal Cloud Router • 200+ Models)       │
 │  [ ] OpenAI Direct        (GPT-4o, o3-mini)                            │
 │  [ ] DeepSeek Direct      (DeepSeek-V3, DeepSeek-R1)                   │
 │  [ ] Quant Rule Engine    (0-Latency Deterministic • Offline Fallback) │
 └────────────────────────────────────────────────────────────────────────┘
```

### Supported AI Providers & Local Engines

| Provider ID | Provider Name | Default Model | Typical Latency | Cost | Primary Use Case |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **`gemini`** | Google Gemini | `gemini-3.7-flash` | ~250–500ms | Free Tier | Blazing-fast cloud synthesis, live streaming, and high reasoning depth. |
| **`ollama`** | Ollama (Local) | `llama3.3:70b` | Local GPU-bound | **$0.00** | Air-gapped, 100% private analysis with zero data sent outside your machine. |
| **`lmstudio`**| LM Studio (Local)| `meta-llama-3.1-8b`| Local GPU-bound | **$0.00** | Desktop GUI-managed local model inference with OpenAI-compatible API. |
| **`openrouter`**| OpenRouter | `deepseek/deepseek-r1`| ~800–1500ms | Pay-as-you-go | Access to Claude 3.5 Sonnet, DeepSeek-R1, and Qwen 2.5 without separate accounts. |
| **`openai`** | OpenAI Direct | `gpt-4o` | ~600–1200ms | Pay-as-you-go | Direct OpenAI flagship models. |
| **`deepseek`** | DeepSeek Direct | `deepseek-chat` | ~500–1000ms | Ultra-Low Cost| High-density quantitative reasoning with DeepSeek-V3/R1. |
| **`local_rule_engine`**| Quant Rule Engine| `deterministic-v2.4`| **< 1ms** | **$0.00** | Instant mathematical heuristics when completely offline. |

---

### Connecting Local Ollama (100% Private, 0 Cost)

Run cutting-edge reasoning models (like `deepseek-r1:14b` or `llama3.3:70b`) completely locally on your hardware:

#### Step 1: Install & Pull Models
```bash
# Install Ollama (https://ollama.com)
ollama pull llama3.3:70b
# OR for smaller hardware:
ollama pull llama3.1:8b
ollama pull deepseek-r1:14b
```

#### Step 2: Start Ollama with CORS Enabled
To allow the browser application to communicate with your local Ollama server, set `OLLAMA_ORIGINS="*"`:
```bash
# macOS / Linux
OLLAMA_ORIGINS="*" ollama serve

# Windows (Command Prompt)
set OLLAMA_ORIGINS=*
ollama serve

# Windows (PowerShell)
$env:OLLAMA_ORIGINS="*"
ollama serve
```

#### Step 3: Configure in App
1. In the app header, click **Inference Settings** (or the CPU icon).
2. Select **Ollama (Local AI)**.
3. Verify the Endpoint URL: `http://localhost:11434`.
4. Enter your model name: `llama3.3:70b` (or `llama3.1:8b`).
5. Click **Test Endpoint Connection**. You should see a green **Connected** badge with latency metrics!
6. Click **Save Configuration**.

---

### Connecting LM Studio Local Server

[LM Studio](https://lmstudio.ai/) provides a user-friendly desktop GUI for downloading and running GGUF models on Apple Silicon and NVIDIA GPUs:

1. Open LM Studio and download your desired model (e.g. `Meta-Llama-3.1-8B-Instruct-GGUF`).
2. Go to the **Local Server** tab (`<->` icon on the left).
3. Under **Server Options**, ensure **Cross-Origin-Resource-Sharing (CORS)** is enabled.
4. Click **Start Server** (default port is `1234`).
5. In this application's **Inference Settings**, select **LM Studio (Local AI)**.
6. Verify Endpoint: `http://localhost:1234`, click **Test Endpoint Connection**, and save!

---

### Connecting Cloud Providers (Gemini, OpenRouter, OpenAI, DeepSeek)

1. Open the **Inference Settings Modal**.
2. Choose your provider:
   - **Google Gemini**: Enter your free [Google AI Studio API Key](https://aistudio.google.com/).
   - **OpenRouter**: Enter your [OpenRouter API Key](https://openrouter.ai/keys) to route queries to DeepSeek-R1 or Claude 3.5 Sonnet.
   - **OpenAI**: Enter your `sk-...` API key.
   - **DeepSeek**: Enter your DeepSeek API key.
3. Adjust Temperature (recommended: `0.1`–`0.3` for rigorous financial analysis) and Max Output Tokens.
4. Click **Test Endpoint Connection** ➔ **Save Configuration**.

---

### Deterministic Local Quantitative Rule Engine

If no API keys are provided and no local inference servers are running, the application **never fails or crashes**.

It seamlessly triggers the built-in **Deterministic Quantitative Rule Engine**, which evaluates:
- Confluence score regime boundaries
- P/E vs sector valuation discounts/premiums
- Dark pool block net accumulation flags
- Strict SEC Form 4 insider alignment or `[NO CONFIRMED DATA AVAILABLE]` governance tags
- Exact ATR-based Entry / Invalidation / Take-Profit calculations

All generated within **< 1ms** directly in-memory.

---

### Lakehouse Layer Telemetry Injection & Grounding

In the **Inference Settings Modal**, you can toggle which Lakehouse telemetry layers are automatically injected into the LLM context prompt:

- ☑️ **Technicals & MTF Indicators**: EMA stack, Supertrend, RSI, MACD, VWAP, Bollinger Bands.
- ☑️ **Fundamental Solvency & Valuation**: P/E, PEG, EV/EBITDA, Piotroski F, Altman Z, FCF Yield.
- ☑️ **Dark Pool & Institutional Flow**: Block orders, off-exchange volume Z-scores ($>2.0\sigma$).
- ☑️ **Regulatory Filings & Insiders**: SEC Form 4 insider trades, Congressional STOCK Act PTRs.
- ☑️ **Risk Plan & Invalidation Levels**: ATR stop-loss, Target 1, Target 2, Risk/Reward ratio.

---

## 🌐 Data Sources & Government Disclosures

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

## 🖥️ Application Views & Feature Walkthrough

### 1. Executive Equity Dossier View
- **Live Candlestick & Indicator Suite**: Interactive charts with instant toggles for EMAs (20/50/200), Supertrend (10, 3.0), VWAP, Bollinger Bands (20, 2.0$\sigma$), Dynamic RSI, and MACD Histogram.
- **Accurate Market Capitalization Scaling**: Formats scale automatically into Trillions ($T), Billions ($B), or Millions ($M) based on genuine shares outstanding and live exchange quotes.
- **Dynamic Trade Plan & Risk Calculator**: Interactive position sizing slider that computes maximum dollar risk, risk per share, recommended share quantity, and execution triggers.
- **Generative AI Research Dossier**: Click **Generate Executive Dossier** to produce a structured institutional equity research note grounded in live Lakehouse data.

### 2. 4-Pillar Quantitative Signal Engine
- **Holistic Confluence Breakdown**: View individual pillar scores (-100 to +100), baseline vs. effective weight allocations, and key triggering heuristics.
- **Multi-Timeframe Regime Matrix**: Evaluates trend alignment across 5 distinct timeframes: 15-Minute, 1-Hour, 4-Hour, Daily (1D), and Weekly (1W).
- **Institutional Flow & Insider Log**: Live table of dark pool prints and SEC Form 4 filings with calculated filing latency.

### 3. DuckDB Lakehouse Explorer
- **Interactive SQL Runner**: Write and run arbitrary SQL queries against Bronze, Silver, and Gold Delta tables with execution latency returned in milliseconds.
- **Complete Schema Data Dictionary**: Comprehensive documentation of all column types, descriptions, and primary partition keys.

### 4. Model Context Protocol (MCP) Hub
- **Tool Catalog & Inspector**: View all 6 registered MCP tools with their JSON Schema parameters.
- **Real-Time Tool Tester**: Execute any MCP tool directly within the app and view live JSON-RPC 2.0 responses.
- **One-Click Config Exporter**: Instantly copy JSON configurations for Claude Desktop or Cursor IDE.

### 5. Python & SQL Pipeline Exporter
- **Production Python Async Ingestion ETL**: Complete runnable `asyncio` + `aiohttp` script with token bucket rate limiting and DuckDB storage.
- **Vectorized Pandas/NumPy Feature Pipeline**: Script for calculating EMAs, RSI, Supertrend, and Z-scores on large historical datasets.
- **Medallion DDL & SQL Transformations**: DuckDB DDL schemas and Gold Layer aggregation queries ready for deployment.

### 6. Automated Trading & Robinhood Hub
- **Robinhood Demo Sandbox Simulator**: Fully functional simulated trading environment initialized with $100,000 buying power, realistic equity fill pricing, and real-time portfolio P&L tracking without financial risk.
- **Live Robinhood Routing Switcher**: Seamless toggle between zero-risk Demo Sandbox and Live account execution.
- **AI Natural Language Strategy Architect**: Describe arbitrary trading strategies in plain English (e.g. *"Buy $2,000 of NVDA when Confluence Score > 75 and Congress members purchase shares, set stop loss at 4% and profit target at 9%"*). The AI compiler translates natural language into structured, executable trigger pipelines.
- **Automated Quantitative Rules Engine**: Evaluates technical indicators, Confluence scores, dark pool volume surges, and government insider disclosures to execute automated orders.
- **Government Disclosures Sync Pipeline**: Background sync loop pulling official SEC Form 4 and Congressional STOCK Act filings every 45 seconds, enabling 1-click auto-copy trading strategies.
- **Full Execution Audit Trail**: Real-time ledger of all filled, pending, and executed orders with slippage, timestamps, and trigger source provenance.

---

## 📰 News-Driven Fundamental Analysis & Anti-Bias Sieve

The platform incorporates a **Critical Anti-Hallucination & Anti-Bias Fundamental Intelligence Engine**. The agent does **not** blindly follow financial media headlines or sell-side promotional upgrades. Instead, it treats all incoming text as narrative data points that must be forensically audited against hard lakehouse fundamentals.

### 1. Multi-Source Critical Skepticism & Triangulation
- **Source Reliability & Track Record Scoring (1-10)**: Every publisher (FT, WSJ, Bloomberg, Reuters, Barron's, Corporate PR, Mainstream Media) is scored based on institutional accuracy and historical conflict-of-interest indicators.
- **Publisher Bias Classification**: Categorizes articles into `PRO_CORPORATE_PR`, `RETAIL_FOMO_HYPE`, `BEARISH_FEAR_MONGERING`, `INSTITUTIONAL_NEUTRAL`, or `HIGHLY_OBJECTIVE`.
- **Media vs. Balance Sheet Divergence**: Compares headline sentiment directly against audited SEC 10-Q/10-K data (Cash Flow from Operations, Piotroski F-Score, Altman Z-Score, ROIC vs WACC). Detects `HYPE_EXCEEDS_REALITY`, `UNDERVALUED_FEAR_DIVERGENCE`, or `ACCOUNTING_RED_FLAGS`.
- **Hard Data Corroboration Ledger**: Cross-verifies qualitative news claims against official financial statement line items (VERIFIED vs DISPROVEN).
- **Devil's Advocate Counter-Thesis**: Formulates strict failure modes and identifies what happens if hyper-bullish growth assumptions decelerate or capital expenditure returns lag.

---

## 🧠 AI Agent Skills Marketplace & Custom Skill Upload

The AI reasoning engine is completely modular and accepts specialized analytical **Skills** injected directly into its prompt reasoning loop:

```
[Agent Reasoning Core]
        │
        ├── 🎯 Warren Buffett & Graham Deep Value & Moat Skill (Owner Earnings, ROIC > 15%, Margin of Safety)
        ├── 🔍 Forensic Accounting & Beneish M-Score Audit Skill (Accrual anomalies, capitalization red flags)
        ├── 🌐 Anti-Noise Media Sieve Skill (Identifies PR promotional spin & retail distribution traps)
        ├── 📈 Macro Liquidity & Yield Curve Regime Skill (SOFR, RRP, 10Y-2Y slope, DXY currency drag)
        ├── 🌊 Institutional Dark Pool & Options Gamma Squeeze Skill (Off-exchange prints & GEX pinning)
        └── ➕ User Uploaded Custom Skills (JSON, YAML, Markdown, or plain-English prompt guidelines)
```

### Dynamic Context & Temporal Awareness
All skill executions inject:
- **Precise System Date, Time, and Timezone** (e.g. `Tuesday, September 1, 2026 • 09:40:37 PDT`).
- **Market Session State**: Regular Trading Hours (RTH), Pre-Market, or After-Hours.
- **Active Economic & Interest Rate Regime**.

---

## 📚 Subscribed Premium Financial Newspaper Vault

Users can upload documents, PDFs, EPUBs, and text transcripts from their paid financial newspaper subscriptions (*Financial Times*, *The Wall Street Journal*, *Barron's*, *Bloomberg Businessweek*):
- **Automated Text Extraction & Parsing**: Ingests multi-page institutional reports and extracts key macro catalysts.
- **Lakehouse Cross-Validation**: Compares journalist claims against DuckDB Bronze/Silver historical data tables.
- **In-App Document Reader**: Instant transcript preview with credibility ratings and highlighted catalyst tags.

---

## 🏗️ External Data Warehouse & Infrastructure Advisory

To operate at maximum efficiency, scale to billions of market ticks, and maintain cost-effective AI inference, the platform provides explicit architecture blueprints for external cloud integration:

1. **Columnar Data Lakehouse (ClickHouse / Snowflake / BigQuery / MotherDuck)**:
   - *Why*: Sub-10ms queries over 10+ years of tick-by-tick order book data and SEC Edgar filings with vectorized SIMD execution.
   - *Cost Efficiency*: 10x lower compute costs compared to row-based relational databases for OLAP financial scans.
2. **Vector Knowledge Store (pgvector / Pinecone / Qdrant)**:
   - *Why*: RAG semantic retrieval over 10+ years of 10-K footnotes, earnings transcripts, and premium newspaper archives in < 30ms.
3. **Event Streaming Gateway (Apache Kafka / Redis Streams)**:
   - *Why*: Pub/sub messaging for OPRA options sweeps and real-time NASDAQ TotalView feeds without client polling latency.
4. **Distributed In-Memory L1 Cache (Redis / DragonFly)**:
   - *Why*: Instant sub-millisecond dashboard renders and 15-minute fundamental AI analysis caching to prevent redundant API token costs.

---

## 💻 Local Deployment & Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher
- **Git**: ([Download Git](https://git-scm.com/))
- *(Optional)* **Python 3.10+**: For running the standalone ETL scripts in `/src/data/codeTemplates.ts`.

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/quantum-lakehouse-pipeline.git
cd quantum-lakehouse-pipeline
npm install
```

### 3. Environment Configuration (Optional)
The platform is **100% operational out of the box** without required environment variables. To configure optional cloud keys:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Optional: Google AI Studio API Key for Gemini 3.7 Flash synthesis
GEMINI_API_KEY=

# Optional: Finnhub API Key for supplementary company profile verification
FINNHUB_API_KEY=

# Optional: Polygon.io API Key for direct institutional SIP feeds
POLYGON_API_KEY=

# Optional: Financial Modeling Prep API Key for balance sheet statements
FMP_API_KEY=
```

### 4. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 5. Production Build & Execution
```bash
npm run build
npm start
```

---

## 📊 Environment Variables & Configuration

| Environment Variable | Service Provider | Description & Functional Purpose | Required / Optional | Key Acquisition Link |
| :--- | :--- | :--- | :---: | :--- |
| **`GEMINI_API_KEY`** | Google AI Studio | Powers live generative equity research and executive dossier summaries via **Gemini 3.7 Flash**. *(Deterministic fallback runs if omitted).* | **Optional** | [Get Free Key](https://aistudio.google.com/) |
| **`FINNHUB_API_KEY`** | Finnhub Financial API | Real-time company profile verification, shares outstanding reconciliation, and economic calendars. | **Optional** | [Get Free Key](https://finnhub.io/) |
| **`POLYGON_API_KEY`** | Polygon.io | Direct institutional SIP market quotes, historical aggregates, and trade-by-trade tick streams. | **Optional** | [Get Key](https://polygon.io/) |
| **`FMP_API_KEY`** | Financial Modeling Prep | Standardized multi-year balance sheets, 10-K income statements, and enterprise valuation ratios. | **Optional** | [Get Key](https://site.financialmodelingprep.com/) |

---

## 📜 License
MIT License. Developed to demonstrate institutional financial data engineering, Medallion Lakehouse patterns, and Model Context Protocol (MCP) integrations.
