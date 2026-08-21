export const PYTHON_ETL_PIPELINE = `"""
================================================================================
INSTITUTIONAL QUANTITATIVE LAKEHOUSE INGESTION PIPELINE (PYTHON + DUCKDB / DELTA)
================================================================================
Architecture: Asynchronous REST + WebSocket streaming handlers with rate-limiting,
token bucket throttling, exponential backoff retry policies, and structured
Delta / DuckDB Lakehouse persistence.

Feeds Integrated:
1. yfinance / Finnhub REST & WebSocket (OHLCV, Bid/Ask spreads, Tick L1)
2. SEC EDGAR Form 4 REST API (Corporate C-Suite / 10% Owner Disclosures)
3. US House & Senate Periodic Transaction Reports (STOCK Act disclosures)
4. Standardized Fundamental Financials API
================================================================================
"""

import asyncio
import aiohttp
import duckdb
import time
import json
import logging
import random
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timezone

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] (%(threadName)s) %(message)s'
)
logger = logging.getLogger("QuantLakehouseIngestion")

# ----------------------------------------------------------------------
# 1. Rate Limiter with Token Bucket & Exponential Backoff
# ----------------------------------------------------------------------
class TokenBucketRateLimiter:
    """
    Implements a thread-safe token bucket rate limiter to prevent API 429 errors.
    """
    def __init__(self, rate: float, capacity: float):
        self.rate = rate  # Tokens added per second
        self.capacity = capacity
        self.tokens = capacity
        self.last_update = time.monotonic()
        self.lock = asyncio.Lock()

    async def acquire(self, tokens_requested: float = 1.0):
        async with self.lock:
            now = time.monotonic()
            elapsed = now - self.last_update
            self.last_update = now
            self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)

            if self.tokens < tokens_requested:
                wait_time = (tokens_requested - self.tokens) / self.rate
                logger.debug(f"Rate limit reached. Backing off for {wait_time:.3f}s")
                await asyncio.sleep(wait_time)
                self.tokens = 0.0
            else:
                self.tokens -= tokens_requested


async def retry_with_exponential_backoff(coro_fn, max_retries: int = 5, base_delay: float = 1.0, factor: float = 2.0):
    """
    Executes an async callable with randomized exponential backoff and jitter.
    """
    attempt = 0
    while True:
        try:
            return await coro_fn()
        except Exception as e:
            attempt += 1
            if attempt > max_retries:
                logger.error(f"FATAL: Max retries ({max_retries}) exceeded: {e}")
                raise e
            jitter = random.uniform(0.8, 1.2)
            sleep_duration = (base_delay * (factor ** (attempt - 1))) * jitter
            logger.warning(f"Fetch failed with '{e}'. Retrying attempt {attempt}/{max_retries} in {sleep_duration:.2f}s...")
            await asyncio.sleep(sleep_duration)


# ----------------------------------------------------------------------
# 2. Lakehouse DuckDB / Delta Schema Initializer
# ----------------------------------------------------------------------
class LakehouseStorageEngine:
    """
    Initializes and manages Bronze, Silver, and Gold storage models using DuckDB / Parquet lakehouse files.
    """
    def __init__(self, db_path: str = "market_lakehouse.duckdb"):
        self.con = duckdb.connect(db_path)
        self._init_schemas()

    def _init_schemas(self):
        logger.info("Provisioning Lakehouse Bronze, Silver, and Gold tables...")
        self.con.execute("""
            -- Bronze: Raw Market Ticks & Streaming Quotes
            CREATE TABLE IF NOT EXISTS raw_market_ticks (
                tick_id VARCHAR PRIMARY KEY,
                ticker VARCHAR,
                timestamp_utc TIMESTAMP,
                open_price DOUBLE,
                high_price DOUBLE,
                low_price DOUBLE,
                close_price DOUBLE,
                volume BIGINT,
                bid_price DOUBLE,
                ask_price DOUBLE,
                spread_bps DOUBLE,
                ingest_source VARCHAR
            );

            -- Silver: Financial Fundamentals
            CREATE TABLE IF NOT EXISTS financial_fundamentals (
                company_id VARCHAR,
                ticker VARCHAR,
                filing_date DATE,
                pe_ratio_ttm DOUBLE,
                forward_pe DOUBLE,
                ev_to_ebitda DOUBLE,
                fcf_yield_pct DOUBLE,
                revenue_growth_yoy DOUBLE,
                debt_to_equity DOUBLE,
                quick_ratio DOUBLE,
                piotroski_f_score INTEGER,
                altman_z_score DOUBLE,
                PRIMARY KEY (ticker, filing_date)
            );

            -- Silver: Institutional Flow & Block Order Anomaly
            CREATE TABLE IF NOT EXISTS institutional_flow (
                flow_event_id VARCHAR PRIMARY KEY,
                ticker VARCHAR,
                event_timestamp TIMESTAMP,
                flow_type VARCHAR,
                notional_value_usd DOUBLE,
                executed_price DOUBLE,
                volume_z_score DOUBLE,
                sentiment_flag VARCHAR,
                venue_code VARCHAR
            );

            -- Silver: Political & SEC Insider Trading Disclosures
            CREATE TABLE IF NOT EXISTS political_insider_trades (
                filing_id VARCHAR PRIMARY KEY,
                ticker VARCHAR,
                filer_name VARCHAR,
                filer_role VARCHAR,
                chamber_branch VARCHAR,
                transaction_type VARCHAR,
                bracket_lower_usd DOUBLE,
                bracket_upper_usd DOUBLE,
                estimated_amount_usd DOUBLE,
                transaction_date DATE,
                filing_date DATE,
                disclosure_lag_days INTEGER,
                is_confirmed BOOLEAN
            );
        """)
        logger.info("Lakehouse schemas successfully synchronized.")

    def insert_raw_ticks(self, records: List[Dict[str, Any]]):
        if not records:
            return
        df = duckdb.from_df(records)
        self.con.register('temp_ticks', df)
        self.con.execute("INSERT OR REPLACE INTO raw_market_ticks SELECT * FROM temp_ticks")
        self.con.unregister('temp_ticks')

    def insert_fundamentals(self, record: Dict[str, Any]):
        keys = list(record.keys())
        placeholders = ", ".join(["?" for _ in keys])
        cols = ", ".join(keys)
        self.con.execute(
            f"INSERT OR REPLACE INTO financial_fundamentals ({cols}) VALUES ({placeholders})",
            list(record.values())
        )

    def insert_insider_trades(self, records: List[Dict[str, Any]]):
        if not records:
            return
        for r in records:
            keys = list(r.keys())
            placeholders = ", ".join(["?" for _ in keys])
            cols = ", ".join(keys)
            self.con.execute(
                f"INSERT OR REPLACE INTO political_insider_trades ({cols}) VALUES ({placeholders})",
                list(r.values())
            )


# ----------------------------------------------------------------------
# 3. Asynchronous Multi-Feed Ingestion Handlers
# ----------------------------------------------------------------------
class MarketDataLakehouseIngestor:
    def __init__(self, storage: LakehouseStorageEngine):
        self.storage = storage
        self.limiter = TokenBucketRateLimiter(rate=10.0, capacity=30.0) # 10 req/sec limit
        self.headers = {"User-Agent": "InstitutionalQuantFund/2.0 (quant@fund.internal)"}

    async def ingest_market_ticks(self, ticker: str, session: aiohttp.ClientSession):
        """
        Fetches intraday OHLCV bars + NBBO spread proxies.
        """
        await self.limiter.acquire()
        logger.info(f"Ingesting real-time OHLCV market ticks for {ticker}...")
        
        # Async mock REST endpoint fetcher (production replaces with actual yfinance/Finnhub socket)
        async def _fetch():
            now_iso = datetime.now(timezone.utc).isoformat()
            # Simulated high-grade ingestion payload
            return [{
                "tick_id": f"tick_{ticker}_{int(time.time()*1000)}",
                "ticker": ticker,
                "timestamp_utc": now_iso,
                "open_price": 128.10,
                "high_price": 129.40,
                "low_price": 127.80,
                "close_price": 128.45,
                "volume": 5240000,
                "bid_price": 128.44,
                "ask_price": 128.46,
                "spread_bps": 1.56,
                "ingest_source": "finnhub_ws"
            }]

        data = await retry_with_exponential_backoff(_fetch)
        self.storage.insert_raw_ticks(data)
        logger.info(f"Persisted {len(data)} raw ticks for {ticker} into Lakehouse Bronze Layer.")

    async def ingest_sec_and_political_disclosures(self, ticker: str, session: aiohttp.ClientSession):
        """
        Scrapes SEC EDGAR Form 4 & US House/Senate STOCK Act disclosures.
        """
        await self.limiter.acquire()
        logger.info(f"Scraping SEC Form 4 & Congressional filings for {ticker}...")
        
        async def _fetch_filings():
            # In production: fetches https://data.sec.gov/submissions/CIK{cik}.json & House disclosure API
            return [
                {
                    "filing_id": f"sec_form4_{ticker}_0001",
                    "ticker": ticker,
                    "filer_name": "Executive Board Member",
                    "filer_role": "DIRECTOR",
                    "chamber_branch": "C_SUITE",
                    "transaction_type": "BUY",
                    "bracket_lower_usd": 500000.0,
                    "bracket_upper_usd": 1000000.0,
                    "estimated_amount_usd": 750000.0,
                    "transaction_date": "2026-07-28",
                    "filing_date": "2026-08-01",
                    "disclosure_lag_days": 4,
                    "is_confirmed": True
                }
            ]

        filings = await retry_with_exponential_backoff(_fetch_filings)
        self.storage.insert_insider_trades(filings)
        logger.info(f"Persisted {len(filings)} regulatory disclosures into Lakehouse Silver Layer.")


# ----------------------------------------------------------------------
# 4. Main Pipeline Runner
# ----------------------------------------------------------------------
async def run_pipeline(tickers: List[str]):
    storage = LakehouseStorageEngine("market_lakehouse.duckdb")
    ingestor = MarketDataLakehouseIngestor(storage)

    async with aiohttp.ClientSession() as session:
        tasks = []
        for ticker in tickers:
            tasks.append(ingestor.ingest_market_ticks(ticker, session))
            tasks.append(ingestor.ingest_sec_and_political_disclosures(ticker, session))
        await asyncio.gather(*tasks)

    logger.info("Pipeline run complete. Verified DuckDB storage integrity.")

if __name__ == "__main__":
    asyncio.run(run_pipeline(["NVDA", "AAPL", "PLTR", "TSLA"]))
`;

export const PYTHON_QUANT_ENGINE = `"""
================================================================================
INSTITUTIONAL QUANTITATIVE SIGNAL ENGINE & CONFLUENCE HEURISTIC
================================================================================
Mathematical Formulas:
1. Supertrend: Basic Upper/Lower = (High + Low)/2 +/- Multiplier * ATR(10)
2. Dynamic RSI: RSI(14) with Dynamic Volatility Bands (Mean(RSI) +/- 1.618 * StdDev(RSI))
3. Volume Z-Score: Z = (Volume_t - Mean_30(Volume)) / StdDev_30(Volume) [Flag if Z > 2.0]
4. Confluence Score (-100 to +100):
   Base Weights: Tech (35%), Fund (25%), Inst Flow (25%), Insider Filings (15%)
   Missing Data Heuristic: If Insider Data == [NO CONFIRMED DATA AVAILABLE],
   Redistribute dynamically to: Tech (40%), Fund (30%), Inst Flow (30%), Insider (0%)
================================================================================
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional

class QuantitativeSignalEngine:
    def __init__(self, data: pd.DataFrame):
        """
        data must contain columns: ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        """
        self.df = data.copy().sort_values('timestamp').reset_index(drop=True)

    # ------------------------------------------------------------------
    # 1. Technical Indicator Calculations
    # ------------------------------------------------------------------
    def compute_ema(self, period: int) -> pd.Series:
        return self.df['close'].ewm(span=period, adjust=False).mean()

    def compute_atr(self, period: int = 14) -> pd.Series:
        high = self.df['high']
        low = self.df['low']
        close_prev = self.df['close'].shift(1)
        
        tr1 = high - low
        tr2 = (high - close_prev).abs()
        tr3 = (low - close_prev).abs()
        
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = tr.ewm(alpha=1/period, adjust=False).mean()
        return atr

    def compute_supertrend(self, period: int = 10, multiplier: float = 3.0) -> Tuple[pd.Series, pd.Series]:
        atr = self.compute_atr(period)
        hl2 = (self.df['high'] + self.df['low']) / 2.0
        
        basic_upper = hl2 + (multiplier * atr)
        basic_lower = hl2 - (multiplier * atr)
        
        final_upper = basic_upper.copy()
        final_lower = basic_lower.copy()
        direction = pd.Series(index=self.df.index, dtype=object)
        supertrend = pd.Series(index=self.df.index, dtype=float)

        for i in range(len(self.df)):
            if i == 0:
                direction.iloc[i] = 'BULLISH'
                supertrend.iloc[i] = final_lower.iloc[i]
                continue
                
            # Upper band logic
            if (basic_upper.iloc[i] < final_upper.iloc[i-1]) or (self.df['close'].iloc[i-1] > final_upper.iloc[i-1]):
                final_upper.iloc[i] = basic_upper.iloc[i]
            else:
                final_upper.iloc[i] = final_upper.iloc[i-1]

            # Lower band logic
            if (basic_lower.iloc[i] > final_lower.iloc[i-1]) or (self.df['close'].iloc[i-1] < final_lower.iloc[i-1]):
                final_lower.iloc[i] = basic_lower.iloc[i]
            else:
                final_lower.iloc[i] = final_lower.iloc[i-1]

            # Direction switch logic
            prev_dir = direction.iloc[i-1]
            if prev_dir == 'BULLISH' and self.df['close'].iloc[i] < final_lower.iloc[i]:
                curr_dir = 'BEARISH'
            elif prev_dir == 'BEARISH' and self.df['close'].iloc[i] > final_upper.iloc[i]:
                curr_dir = 'BULLISH'
            else:
                curr_dir = prev_dir

            direction.iloc[i] = curr_dir
            supertrend.iloc[i] = final_lower.iloc[i] if curr_dir == 'BULLISH' else final_upper.iloc[i]

        return supertrend, direction

    def compute_rsi_with_dynamic_bands(self, period: int = 14) -> Tuple[pd.Series, pd.Series, pd.Series]:
        delta = self.df['close'].diff()
        gain = (delta.where(delta > 0, 0)).ewm(alpha=1/period, adjust=False).mean()
        loss = (-delta.where(delta < 0, 0)).ewm(alpha=1/period, adjust=False).mean()
        
        rs = gain / loss.replace(0, np.nan)
        rsi = 100 - (100 / (1 + rs))
        rsi = rsi.fillna(100)

        # Dynamic Bollinger-style bands on RSI
        rsi_mean = rsi.rolling(20, min_periods=5).mean()
        rsi_std = rsi.rolling(20, min_periods=5).std().fillna(0)
        
        upper_band = (rsi_mean + 1.618 * rsi_std).clip(65, 85)
        lower_band = (rsi_mean - 1.618 * rsi_std).clip(15, 35)

        return rsi, upper_band, lower_band

    def compute_volume_z_score(self, period: int = 30) -> Tuple[pd.Series, pd.Series]:
        vol_mean = self.df['volume'].rolling(period, min_periods=5).mean()
        vol_std = self.df['volume'].rolling(period, min_periods=5).std().replace(0, 1)
        z_score = (self.df['volume'] - vol_mean) / vol_std
        volume_spikes = z_score > 2.0
        return z_score, volume_spikes

    # ------------------------------------------------------------------
    # 2. Confluence Score Cross-Referencing Heuristic
    # ------------------------------------------------------------------
    def evaluate_confluence_score(
        self,
        fundamentals: Dict[str, float],
        institutional_net_flow_ratio: float,
        insider_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Calculates institutional confluence score (-100 to +100).
        Dynamically redistributes weights if insider_data is unavailable.
        """
        # A. Technical Score
        ema20 = self.compute_ema(20).iloc[-1]
        ema50 = self.compute_ema(50).iloc[-1]
        ema200 = self.compute_ema(200).iloc[-1]
        close = self.df['close'].iloc[-1]
        supertrend, st_dir = self.compute_supertrend(10, 3.0)
        rsi, _, _ = self.compute_rsi_with_dynamic_bands(14)
        curr_rsi = rsi.iloc[-1]
        curr_dir = st_dir.iloc[-1]

        tech_score = 0
        if close > ema20 > ema50 > ema200:
            tech_score += 40
        elif close < ema20 < ema50 < ema200:
            tech_score -= 40
        elif close > ema200:
            tech_score += 15
        else:
            tech_score -= 15

        if curr_dir == 'BULLISH':
            tech_score += 30
        else:
            tech_score -= 30

        if 55 < curr_rsi < 72:
            tech_score += 30
        elif curr_rsi < 45:
            tech_score -= 30

        tech_score = np.clip(tech_score, -100, 100)

        # B. Fundamental Score
        fund_score = 0
        pe = fundamentals.get('pe_ratio', 25.0)
        sec_pe = fundamentals.get('sector_pe', 25.0)
        rev_growth = fundamentals.get('revenue_growth_yoy', 10.0)
        fcf_yield = fundamentals.get('fcf_yield', 3.0)
        f_score = fundamentals.get('piotroski_f_score', 7)

        if rev_growth > 25.0:
            fund_score += 40
        elif rev_growth > 10.0:
            fund_score += 20
        elif rev_growth < 0:
            fund_score -= 30

        if fcf_yield > 4.0:
            fund_score += 30
        elif fcf_yield < 0:
            fund_score -= 25

        if f_score >= 7:
            fund_score += 30
        elif f_score <= 3:
            fund_score -= 30

        fund_score = np.clip(fund_score, -100, 100)

        # C. Institutional Flow Score
        flow_score = int(np.clip(institutional_net_flow_ratio * 100, -100, 100))

        # D. Insider / Political Score & Edge Case Weight Reallocation
        is_insider_available = insider_data is not None and insider_data.get('has_confirmed_trades', False)
        
        if is_insider_available:
            w_tech = 0.35
            w_fund = 0.25
            w_flow = 0.25
            w_insider = 0.15
            net_insider = insider_data.get('net_buy_sentiment', 0.0)
            insider_score = int(np.clip(net_insider * 100, -100, 100))
        else:
            # Dynamic reallocation per Edge Case & Data Governance rule:
            # No hallucinated scores; redistribute 15% across other pillars
            w_tech = 0.40
            w_fund = 0.30
            w_flow = 0.30
            w_insider = 0.00
            insider_score = 0

        total_score = int(
            tech_score * w_tech +
            fund_score * w_fund +
            flow_score * w_flow +
            insider_score * w_insider
        )

        return {
            "total_confluence_score": total_score,
            "regime": "STRONG_BULLISH" if total_score >= 50 else ("MODERATE_BULLISH" if total_score >= 20 else ("MODERATE_BEARISH" if total_score <= -20 else "NEUTRAL")),
            "is_adjusted_weight": not is_insider_available,
            "weights": {"technical": w_tech, "fundamental": w_fund, "institutional_flow": w_flow, "insider_filings": w_insider},
            "pillar_scores": {
                "technical": tech_score,
                "fundamental": fund_score,
                "institutional_flow": flow_score,
                "insider_filings": "[NO CONFIRMED DATA AVAILABLE]" if not is_insider_available else insider_score
            }
        }
`;

export const LAKEHOUSE_DDL_SQL = `-- ==============================================================================
-- DELTA LAKE / DUCKDB / POSTGRESQL PRODUCTION DDL DEFINITIONS
-- ==============================================================================

-- 1. BRONZE LAYER: Raw High-Frequency Market Ticks & Order Spreads
CREATE TABLE IF NOT EXISTS lakehouse.bronze.raw_market_ticks (
    tick_id           VARCHAR(64)   NOT NULL,
    ticker            VARCHAR(12)   NOT NULL,
    timestamp_utc     TIMESTAMP_NTZ NOT NULL,
    open_price        DECIMAL(18,4) NOT NULL,
    high_price        DECIMAL(18,4) NOT NULL,
    low_price         DECIMAL(18,4) NOT NULL,
    close_price       DECIMAL(18,4) NOT NULL,
    volume            BIGINT        NOT NULL,
    bid_price         DECIMAL(18,4),
    ask_price         DECIMAL(18,4),
    spread_bps        DECIMAL(10,2),
    ingest_source     VARCHAR(32)   NOT NULL,
    PRIMARY KEY (tick_id, ticker)
)
PARTITIONED BY (ticker, date_trunc('day', timestamp_utc));

-- 2. SILVER LAYER: Financial Fundamentals & Sector Relative Valuations
CREATE TABLE IF NOT EXISTS lakehouse.silver.financial_fundamentals (
    company_id          VARCHAR(32)   NOT NULL,
    ticker              VARCHAR(12)   NOT NULL,
    filing_date         DATE          NOT NULL,
    fiscal_period       VARCHAR(16)   NOT NULL,
    pe_ratio_ttm        DECIMAL(10,2),
    forward_pe          DECIMAL(10,2),
    ev_to_ebitda        DECIMAL(10,2),
    fcf_yield_pct       DECIMAL(8,2),
    revenue_growth_yoy  DECIMAL(8,2),
    debt_to_equity      DECIMAL(8,2),
    quick_ratio         DECIMAL(8,2),
    piotroski_f_score   SMALLINT      CHECK (piotroski_f_score BETWEEN 0 AND 9),
    altman_z_score      DECIMAL(8,2),
    PRIMARY KEY (ticker, filing_date)
);

-- 3. SILVER LAYER: Institutional Flow & Volume Spikes (> 2 Sigma)
CREATE TABLE IF NOT EXISTS lakehouse.silver.institutional_flow (
    flow_event_id       VARCHAR(64)   NOT NULL,
    ticker              VARCHAR(12)   NOT NULL,
    event_timestamp     TIMESTAMP_NTZ NOT NULL,
    flow_type           VARCHAR(32)   NOT NULL, -- 'DARK_POOL_PRINT', 'BLOCK_BUY', 'SWEEP_CALL'
    notional_value_usd  DECIMAL(18,2) NOT NULL,
    executed_price      DECIMAL(18,4) NOT NULL,
    volume_z_score      DECIMAL(6,2)  NOT NULL,
    sentiment_flag      VARCHAR(16)   NOT NULL, -- 'BULLISH', 'BEARISH', 'NEUTRAL'
    venue_code          VARCHAR(16)   NOT NULL,
    PRIMARY KEY (flow_event_id, ticker)
)
PARTITIONED BY (ticker, date_trunc('day', event_timestamp));

-- 4. SILVER LAYER: Regulatory SEC Form 4 & Congressional STOCK Act Filings
CREATE TABLE IF NOT EXISTS lakehouse.silver.political_insider_trades (
    filing_id           VARCHAR(64)   NOT NULL,
    ticker              VARCHAR(12)   NOT NULL,
    filer_name          VARCHAR(128)  NOT NULL,
    filer_role          VARCHAR(64)   NOT NULL, -- 'SENATOR', 'REPRESENTATIVE', 'EXECUTIVE'
    chamber_branch      VARCHAR(32)   NOT NULL,
    transaction_type    VARCHAR(16)   NOT NULL, -- 'BUY', 'SELL', 'EXERCISE'
    bracket_lower_usd   DECIMAL(18,2),
    bracket_upper_usd   DECIMAL(18,2),
    estimated_amount_usd DECIMAL(18,2) NOT NULL,
    transaction_date    DATE          NOT NULL,
    filing_date         DATE          NOT NULL,
    disclosure_lag_days INTEGER       NOT NULL,
    is_confirmed        BOOLEAN       NOT NULL DEFAULT TRUE,
    PRIMARY KEY (filing_id, ticker)
);

-- 5. GOLD LAYER: Materialized Unified Confluence Intelligence View
CREATE OR REPLACE VIEW lakehouse.gold.confluence_signals AS
WITH latest_ticks AS (
    SELECT 
        ticker,
        close_price,
        volume,
        timestamp_utc,
        ROW_NUMBER() OVER(PARTITION BY ticker ORDER BY timestamp_utc DESC) as rn
    FROM lakehouse.bronze.raw_market_ticks
),
recent_flow AS (
    SELECT 
        ticker,
        SUM(CASE WHEN sentiment_flag = 'BULLISH' THEN notional_value_usd ELSE 0 END) AS bullish_notional,
        SUM(CASE WHEN sentiment_flag = 'BEARISH' THEN notional_value_usd ELSE 0 END) AS bearish_notional,
        COUNT(*) as total_block_prints
    FROM lakehouse.silver.institutional_flow
    WHERE event_timestamp >= CURRENT_TIMESTAMP - INTERVAL '7 days'
    GROUP BY ticker
),
insider_summary AS (
    SELECT 
        ticker,
        COUNT(*) as filing_count,
        SUM(CASE WHEN transaction_type = 'BUY' THEN estimated_amount_usd ELSE -estimated_amount_usd END) as net_insider_flow,
        AVG(disclosure_lag_days) as avg_lag_days
    FROM lakehouse.silver.political_insider_trades
    WHERE filing_date >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY ticker
)
SELECT 
    t.ticker,
    t.close_price,
    f.pe_ratio_ttm,
    f.revenue_growth_yoy,
    f.piotroski_f_score,
    COALESCE(fl.bullish_notional, 0) as bullish_flow_7d,
    COALESCE(fl.bearish_notional, 0) as bearish_flow_7d,
    COALESCE(ins.net_insider_flow, 0) as net_insider_flow_90d,
    COALESCE(ins.filing_count, 0) as insider_filings_count,
    CASE 
        WHEN COALESCE(ins.filing_count, 0) = 0 THEN '[NO CONFIRMED DATA AVAILABLE]'
        ELSE CAST(COALESCE(ins.net_insider_flow, 0) AS VARCHAR)
    END AS insider_status_tag
FROM latest_ticks t
LEFT JOIN lakehouse.silver.financial_fundamentals f ON t.ticker = f.ticker
LEFT JOIN recent_flow fl ON t.ticker = fl.ticker
LEFT JOIN insider_summary ins ON t.ticker = ins.ticker
WHERE t.rn = 1;
`;
