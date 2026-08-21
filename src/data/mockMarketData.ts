import {
  TickerMarketData,
  LakehouseTableSchema,
  InstitutionalFlowItem,
  PoliticalInsiderTrade,
  FundamentalMetrics
} from '../types';
import { enrichCandlesWithIndicators, calculateConfluenceScore, calculateTradeSetups } from '../utils/quantEngine';

/**
 * Generates realistic historical price candles for a ticker
 */
function generateHistoricalCandles(basePrice: number, volatility: number, trendSlope: number, numDays = 120) {
  const candles = [];
  let currentClose = basePrice * (1 - trendSlope * (numDays / 252));
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = numDays; i >= 0; i--) {
    const time = now - i * dayMs;
    const dateStr = new Date(time).toISOString().split('T')[0];
    
    // Gaussian-like random step
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * Math.cos(2.0 * Math.PI * u2);
    const dailyReturn = (trendSlope / 252) + z * (volatility / Math.sqrt(252));
    
    const open = Math.round(currentClose * 100) / 100;
    currentClose = Math.max(1, currentClose * (1 + dailyReturn));
    const close = Math.round(currentClose * 100) / 100;
    
    const highBump = Math.abs(z) * (volatility / 2) * currentClose * 0.04 + Math.random() * 0.01 * currentClose;
    const lowDrop = Math.abs(z) * (volatility / 2) * currentClose * 0.04 + Math.random() * 0.01 * currentClose;
    
    const high = Math.round(Math.max(open, close) + highBump * 100) / 100;
    const low = Math.round(Math.max(0.5, Math.min(open, close) - lowDrop * 100)) / 100;
    
    // Volume generation (with occasional institutional volume spikes)
    const baseVol = Math.max(1000000, Math.round(45000000 * (100 / Math.max(20, basePrice))));
    const isSpike = Math.random() < 0.08;
    const volumeMultiplier = isSpike ? (2.2 + Math.random() * 1.5) : (0.7 + Math.random() * 0.6);
    const volume = Math.round(baseVol * volumeMultiplier);

    candles.push({
      timestamp: dateStr,
      time,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return enrichCandlesWithIndicators(candles);
}

/**
 * Pre-configured Institutional Preset Tickers
 */
export const PRESET_TICKERS: Record<string, Partial<TickerMarketData>> = {
  NVDA: {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    sector: 'Technology',
    industry: 'Semiconductors & AI Hardware',
    currentPrice: 128.45,
    changeAmount: 3.25,
    changePercent: 2.60,
    open: 125.80,
    dayHigh: 129.50,
    dayLow: 125.40,
    yearHigh: 140.76,
    yearLow: 45.11,
    marketCap: 3150000000000,
    beta: 1.68,
    averageVolume: 52400000,
    currentVolume: 61850000,
    sharesOutstanding: 24500000000,
    nextEarningsDate: '2026-11-18',
    hasInsiderData: true,
    fundamentals: {
      peRatio: 48.2,
      forwardPe: 34.5,
      sectorMedianPe: 28.4,
      pegRatio: 1.25,
      evToEbitda: 38.1,
      sectorMedianEvEbitda: 18.2,
      priceToSales: 26.8,
      priceToBook: 42.1,
      freeCashFlowYield: 2.8,
      revenueGrowthYoy: 122.4,
      ebitdaMargin: 64.2,
      netProfitMargin: 55.6,
      debtToEquity: 0.22,
      currentRatio: 3.84,
      quickRatio: 3.32,
      piotroskiFScore: 9,
      altmanZScore: 18.4,
      roe: 85.2,
      roic: 68.4,
    },
    institutionalFlow: [
      {
        id: 'flow-nvda-1',
        timestamp: '2026-08-19 09:34:12 EST',
        timeAgo: '14m ago',
        type: 'DARK_POOL_PRINT',
        shares: 450000,
        price: 128.20,
        notionalValue: 57690000,
        exchange: 'DARK_POOL',
        sentiment: 'BULLISH',
        zScore: 3.42,
      },
      {
        id: 'flow-nvda-2',
        timestamp: '2026-08-19 09:48:05 EST',
        timeAgo: '32m ago',
        type: 'SWEEP_CALL',
        shares: 85000,
        price: 128.60,
        notionalValue: 10931000,
        exchange: 'CBOE_OPTIONS',
        sentiment: 'BULLISH',
        zScore: 2.85,
        strike: 135,
        expiration: '2026-09-18',
        premium: 4.85,
      },
      {
        id: 'flow-nvda-3',
        timestamp: '2026-08-19 10:15:22 EST',
        timeAgo: '58m ago',
        type: 'BLOCK_BUY',
        shares: 210000,
        price: 128.35,
        notionalValue: 26953500,
        exchange: 'NASDAQ',
        sentiment: 'BULLISH',
        zScore: 2.15,
      },
      {
        id: 'flow-nvda-4',
        timestamp: '2026-08-19 10:42:10 EST',
        timeAgo: '1h 25m ago',
        type: 'SWEEP_PUT',
        shares: 35000,
        price: 128.10,
        notionalValue: 4483500,
        exchange: 'CBOE_OPTIONS',
        sentiment: 'BEARISH',
        zScore: 1.45,
        strike: 120,
        expiration: '2026-08-28',
        premium: 1.95,
      }
    ],
    politicalInsiderTrades: [
      {
        id: 'pit-nvda-1',
        filerName: 'Rep. Nancy Pelosi (Spouse)',
        role: 'REPRESENTATIVE',
        chamber: 'HOUSE',
        party: 'D',
        committee: 'Executive / House Leadership',
        asset: 'NVDA Call Options (100k Strike $120)',
        transactionType: 'EXERCISE',
        volumeBracket: '$1,000,001 - $5,000,000',
        estimatedAmount: 2500000,
        transactionDate: '2026-07-24',
        filingDate: '2026-08-08',
        disclosureLagDays: 15,
        sourceFiling: 'PTR / STOCK Act',
        isConfirmed: true,
      },
      {
        id: 'pit-nvda-2',
        filerName: 'Colette Kress (EVP & CFO)',
        role: 'EXECUTIVE',
        chamber: 'EXECUTIVE',
        asset: 'Common Stock (Rule 10b5-1 Plan)',
        transactionType: 'SELL',
        volumeBracket: '$5,000,001 - $10,000,000',
        estimatedAmount: 6420000,
        transactionDate: '2026-08-01',
        filingDate: '2026-08-03',
        disclosureLagDays: 2,
        sourceFiling: 'SEC Form 4',
        isConfirmed: true,
      },
      {
        id: 'pit-nvda-3',
        filerName: 'Sen. Mark Warner',
        role: 'SENATOR',
        chamber: 'SENATE',
        party: 'D',
        committee: 'Intelligence & Banking',
        asset: 'Common Stock Purchase',
        transactionType: 'BUY',
        volumeBracket: '$250,001 - $500,000',
        estimatedAmount: 375000,
        transactionDate: '2026-07-15',
        filingDate: '2026-07-29',
        disclosureLagDays: 14,
        sourceFiling: 'PTR / STOCK Act',
        isConfirmed: true,
      }
    ],
    keyLevels: {
      resistance2: 138.50,
      resistance1: 132.80,
      pivot: 127.40,
      support1: 123.50,
      support2: 118.20,
    },
    multiTimeframe: {
      tf15m: 'BULLISH',
      tf1h: 'BULLISH',
      tf4h: 'BULLISH',
      tf1d: 'BULLISH',
      tf1w: 'BULLISH',
    }
  },
  AAPL: {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    sector: 'Technology',
    industry: 'Consumer Electronics & Services',
    currentPrice: 224.60,
    changeAmount: 1.15,
    changePercent: 0.51,
    open: 223.80,
    dayHigh: 225.50,
    dayLow: 223.10,
    yearHigh: 237.23,
    yearLow: 164.08,
    marketCap: 3420000000000,
    beta: 1.04,
    averageVolume: 46100000,
    currentVolume: 39800000,
    sharesOutstanding: 15200000000,
    nextEarningsDate: '2026-10-29',
    hasInsiderData: true,
    fundamentals: {
      peRatio: 33.4,
      forwardPe: 29.1,
      sectorMedianPe: 28.4,
      pegRatio: 2.1,
      evToEbitda: 24.2,
      sectorMedianEvEbitda: 18.2,
      priceToSales: 8.8,
      priceToBook: 54.2,
      freeCashFlowYield: 3.4,
      revenueGrowthYoy: 7.2,
      ebitdaMargin: 34.5,
      netProfitMargin: 26.3,
      debtToEquity: 1.45,
      currentRatio: 1.07,
      quickRatio: 0.92,
      piotroskiFScore: 8,
      altmanZScore: 9.8,
      roe: 147.5,
      roic: 54.2,
    },
    institutionalFlow: [
      {
        id: 'flow-aapl-1',
        timestamp: '2026-08-19 09:38:00 EST',
        timeAgo: '20m ago',
        type: 'DARK_POOL_PRINT',
        shares: 320000,
        price: 224.40,
        notionalValue: 71808000,
        exchange: 'DARK_POOL',
        sentiment: 'BULLISH',
        zScore: 2.75,
      },
      {
        id: 'flow-aapl-2',
        timestamp: '2026-08-19 10:05:14 EST',
        timeAgo: '47m ago',
        type: 'BLOCK_SELL',
        shares: 110000,
        price: 224.80,
        notionalValue: 24728000,
        exchange: 'NYSE',
        sentiment: 'BEARISH',
        zScore: 1.82,
      }
    ],
    politicalInsiderTrades: [
      {
        id: 'pit-aapl-1',
        filerName: 'Sen. Dan Sullivan',
        role: 'SENATOR',
        chamber: 'SENATE',
        party: 'R',
        committee: 'Commerce & Armed Services',
        asset: 'AAPL Common Stock',
        transactionType: 'BUY',
        volumeBracket: '$50,001 - $100,000',
        estimatedAmount: 75000,
        transactionDate: '2026-07-28',
        filingDate: '2026-08-10',
        disclosureLagDays: 13,
        sourceFiling: 'PTR / STOCK Act',
        isConfirmed: true,
      }
    ],
    keyLevels: {
      resistance2: 232.00,
      resistance1: 228.40,
      pivot: 223.80,
      support1: 220.50,
      support2: 215.00,
    },
    multiTimeframe: {
      tf15m: 'NEUTRAL',
      tf1h: 'BULLISH',
      tf4h: 'BULLISH',
      tf1d: 'BULLISH',
      tf1w: 'BULLISH',
    }
  },
  MSFT: {
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    sector: 'Technology',
    industry: 'Software - Infrastructure & Cloud',
    currentPrice: 422.50,
    changeAmount: 4.80,
    changePercent: 1.15,
    open: 419.20,
    dayHigh: 424.10,
    dayLow: 418.60,
    yearHigh: 468.35,
    yearLow: 366.50,
    marketCap: 3140000000000,
    beta: 1.18,
    averageVolume: 21500000,
    currentVolume: 19800000,
    sharesOutstanding: 7430000000,
    nextEarningsDate: '2026-10-22',
    hasInsiderData: true,
    fundamentals: {
      peRatio: 35.8,
      forwardPe: 28.6,
      sectorMedianPe: 28.4,
      pegRatio: 1.85,
      evToEbitda: 23.4,
      sectorMedianEvEbitda: 18.2,
      priceToSales: 12.8,
      priceToBook: 11.2,
      freeCashFlowYield: 2.9,
      revenueGrowthYoy: 15.2,
      ebitdaMargin: 53.8,
      netProfitMargin: 36.1,
      debtToEquity: 0.38,
      currentRatio: 1.25,
      quickRatio: 1.18,
      piotroskiFScore: 9,
      altmanZScore: 9.4,
      roe: 38.5,
      roic: 31.2,
    },
    institutionalFlow: [
      {
        id: 'flow-msft-1',
        timestamp: '2026-08-19 09:41:20 EST',
        timeAgo: '22m ago',
        type: 'DARK_POOL_PRINT',
        shares: 180000,
        price: 421.90,
        notionalValue: 75942000,
        exchange: 'DARK_POOL',
        sentiment: 'BULLISH',
        zScore: 3.10,
      },
      {
        id: 'flow-msft-2',
        timestamp: '2026-08-19 10:18:10 EST',
        timeAgo: '49m ago',
        type: 'SWEEP_CALL',
        shares: 45000,
        price: 423.00,
        notionalValue: 19035000,
        exchange: 'CBOE_OPTIONS',
        sentiment: 'BULLISH',
        zScore: 2.40,
        strike: 440,
        expiration: '2026-09-18',
        premium: 6.20,
      }
    ],
    politicalInsiderTrades: [
      {
        id: 'pit-msft-1',
        filerName: 'Rep. Josh Gottheimer',
        role: 'REPRESENTATIVE',
        chamber: 'HOUSE',
        party: 'D',
        committee: 'Financial Services & Intelligence',
        asset: 'MSFT Common Stock',
        transactionType: 'BUY',
        volumeBracket: '$100,001 - $250,000',
        estimatedAmount: 175000,
        transactionDate: '2026-07-18',
        filingDate: '2026-08-01',
        disclosureLagDays: 14,
        sourceFiling: 'PTR / STOCK Act',
        isConfirmed: true,
      }
    ],
    keyLevels: {
      resistance2: 435.00,
      resistance1: 428.50,
      pivot: 421.20,
      support1: 415.80,
      support2: 408.00,
    },
    multiTimeframe: {
      tf15m: 'BULLISH',
      tf1h: 'BULLISH',
      tf4h: 'BULLISH',
      tf1d: 'BULLISH',
      tf1w: 'BULLISH',
    }
  },
  PLTR: {
    ticker: 'PLTR',
    companyName: 'Palantir Technologies Inc.',
    sector: 'Technology',
    industry: 'Enterprise AI & Defense Analytics',
    currentPrice: 31.85,
    changeAmount: 1.45,
    changePercent: 4.77,
    open: 30.60,
    dayHigh: 32.20,
    dayLow: 30.40,
    yearHigh: 33.12,
    yearLow: 14.48,
    marketCap: 71200000000,
    beta: 2.45,
    averageVolume: 64200000,
    currentVolume: 82400000,
    sharesOutstanding: 2240000000,
    nextEarningsDate: '2026-11-04',
    hasInsiderData: true,
    fundamentals: {
      peRatio: 82.5,
      forwardPe: 58.4,
      sectorMedianPe: 28.4,
      pegRatio: 2.4,
      evToEbitda: 62.1,
      sectorMedianEvEbitda: 18.2,
      priceToSales: 28.4,
      priceToBook: 16.8,
      freeCashFlowYield: 2.1,
      revenueGrowthYoy: 27.5,
      ebitdaMargin: 38.2,
      netProfitMargin: 22.4,
      debtToEquity: 0.05,
      currentRatio: 4.95,
      quickRatio: 4.60,
      piotroskiFScore: 8,
      altmanZScore: 14.2,
      roe: 19.8,
      roic: 16.5,
    },
    institutionalFlow: [
      {
        id: 'flow-pltr-1',
        timestamp: '2026-08-19 09:32:00 EST',
        timeAgo: '16m ago',
        type: 'SWEEP_CALL',
        shares: 420000,
        price: 31.60,
        notionalValue: 13272000,
        exchange: 'CBOE_OPTIONS',
        sentiment: 'BULLISH',
        zScore: 3.85,
        strike: 35,
        expiration: '2026-09-18',
        premium: 1.45,
      },
      {
        id: 'flow-pltr-2',
        timestamp: '2026-08-19 10:12:45 EST',
        timeAgo: '56m ago',
        type: 'DARK_POOL_PRINT',
        shares: 890000,
        price: 31.75,
        notionalValue: 28257500,
        exchange: 'DARK_POOL',
        sentiment: 'BULLISH',
        zScore: 3.12,
      }
    ],
    politicalInsiderTrades: [
      {
        id: 'pit-pltr-1',
        filerName: 'Rep. Michael McCaul',
        role: 'REPRESENTATIVE',
        chamber: 'HOUSE',
        party: 'R',
        committee: 'Foreign Affairs & Homeland Security',
        asset: 'PLTR Common Stock',
        transactionType: 'BUY',
        volumeBracket: '$100,001 - $250,000',
        estimatedAmount: 175000,
        transactionDate: '2026-07-20',
        filingDate: '2026-08-04',
        disclosureLagDays: 15,
        sourceFiling: 'PTR / STOCK Act',
        isConfirmed: true,
      }
    ],
    keyLevels: {
      resistance2: 34.50,
      resistance1: 32.80,
      pivot: 31.20,
      support1: 29.80,
      support2: 27.50,
    },
    multiTimeframe: {
      tf15m: 'BULLISH',
      tf1h: 'BULLISH',
      tf4h: 'BULLISH',
      tf1d: 'BULLISH',
      tf1w: 'BULLISH',
    }
  },
  TSLA: {
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers & Clean Energy',
    currentPrice: 218.30,
    changeAmount: -4.80,
    changePercent: -2.15,
    open: 222.10,
    dayHigh: 223.50,
    dayLow: 216.80,
    yearHigh: 271.00,
    yearLow: 138.80,
    marketCap: 695000000000,
    beta: 2.32,
    averageVolume: 78500000,
    currentVolume: 74200000,
    sharesOutstanding: 3190000000,
    nextEarningsDate: '2026-10-21',
    hasInsiderData: true,
    fundamentals: {
      peRatio: 64.8,
      forwardPe: 52.1,
      sectorMedianPe: 21.0,
      pegRatio: 3.2,
      evToEbitda: 41.5,
      sectorMedianEvEbitda: 14.5,
      priceToSales: 7.2,
      priceToBook: 10.4,
      freeCashFlowYield: 1.2,
      revenueGrowthYoy: 2.3,
      ebitdaMargin: 14.4,
      netProfitMargin: 11.2,
      debtToEquity: 0.12,
      currentRatio: 1.75,
      quickRatio: 1.34,
      piotroskiFScore: 6,
      altmanZScore: 8.2,
      roe: 21.5,
      roic: 14.8,
    },
    institutionalFlow: [
      {
        id: 'flow-tsla-1',
        timestamp: '2026-08-19 09:44:18 EST',
        timeAgo: '26m ago',
        type: 'SWEEP_PUT',
        shares: 95000,
        price: 217.90,
        notionalValue: 20700500,
        exchange: 'CBOE_OPTIONS',
        sentiment: 'BEARISH',
        zScore: 2.65,
        strike: 205,
        expiration: '2026-09-04',
        premium: 5.40,
      },
      {
        id: 'flow-tsla-2',
        timestamp: '2026-08-19 10:22:00 EST',
        timeAgo: '1h 04m ago',
        type: 'DARK_POOL_PRINT',
        shares: 240000,
        price: 218.40,
        notionalValue: 52416000,
        exchange: 'DARK_POOL',
        sentiment: 'NEUTRAL',
        zScore: 1.95,
      }
    ],
    politicalInsiderTrades: [
      {
        id: 'pit-tsla-1',
        filerName: 'Robyn Denholm (Board Chair)',
        role: 'DIRECTOR',
        chamber: 'EXECUTIVE',
        asset: 'TSLA Common Stock',
        transactionType: 'SELL',
        volumeBracket: '$1,000,001 - $5,000,000',
        estimatedAmount: 3200000,
        transactionDate: '2026-07-14',
        filingDate: '2026-07-16',
        disclosureLagDays: 2,
        sourceFiling: 'SEC Form 4',
        isConfirmed: true,
      }
    ],
    keyLevels: {
      resistance2: 232.00,
      resistance1: 224.50,
      pivot: 218.00,
      support1: 212.00,
      support2: 204.50,
    },
    multiTimeframe: {
      tf15m: 'BEARISH',
      tf1h: 'BEARISH',
      tf4h: 'NEUTRAL',
      tf1d: 'BEARISH',
      tf1w: 'NEUTRAL',
    }
  },
  AMD: {
    ticker: 'AMD',
    companyName: 'Advanced Micro Devices, Inc.',
    sector: 'Technology',
    industry: 'Semiconductors & Accelerators',
    currentPrice: 154.20,
    changeAmount: 3.80,
    changePercent: 2.53,
    open: 151.10,
    dayHigh: 155.80,
    dayLow: 150.50,
    yearHigh: 187.28,
    yearLow: 116.04,
    marketCap: 250000000000,
    beta: 1.82,
    averageVolume: 48500000,
    currentVolume: 42100000,
    sharesOutstanding: 1620000000,
    nextEarningsDate: '2026-11-03',
    hasInsiderData: true,
    fundamentals: {
      peRatio: 42.1,
      forwardPe: 28.2,
      sectorMedianPe: 28.4,
      pegRatio: 1.35,
      evToEbitda: 31.4,
      sectorMedianEvEbitda: 18.2,
      priceToSales: 10.5,
      priceToBook: 4.4,
      freeCashFlowYield: 2.2,
      revenueGrowthYoy: 18.4,
      ebitdaMargin: 26.5,
      netProfitMargin: 17.8,
      debtToEquity: 0.08,
      currentRatio: 2.45,
      quickRatio: 1.88,
      piotroskiFScore: 8,
      altmanZScore: 11.8,
      roe: 8.5,
      roic: 12.4,
    },
    institutionalFlow: [
      {
        id: 'flow-amd-1',
        timestamp: '2026-08-19 09:39:10 EST',
        timeAgo: '21m ago',
        type: 'DARK_POOL_PRINT',
        shares: 310000,
        price: 153.80,
        notionalValue: 47678000,
        exchange: 'DARK_POOL',
        sentiment: 'BULLISH',
        zScore: 2.95,
      },
      {
        id: 'flow-amd-2',
        timestamp: '2026-08-19 10:14:00 EST',
        timeAgo: '54m ago',
        type: 'SWEEP_CALL',
        shares: 60000,
        price: 154.50,
        notionalValue: 9270000,
        exchange: 'CBOE_OPTIONS',
        sentiment: 'BULLISH',
        zScore: 2.10,
        strike: 165,
        expiration: '2026-09-18',
        premium: 4.10,
      }
    ],
    politicalInsiderTrades: [
      {
        id: 'pit-amd-1',
        filerName: 'Rep. Ro Khanna',
        role: 'REPRESENTATIVE',
        chamber: 'HOUSE',
        party: 'D',
        committee: 'Armed Services & Oversight',
        asset: 'AMD Common Stock',
        transactionType: 'BUY',
        volumeBracket: '$15,001 - $50,000',
        estimatedAmount: 32000,
        transactionDate: '2026-07-22',
        filingDate: '2026-08-05',
        disclosureLagDays: 14,
        sourceFiling: 'PTR / STOCK Act',
        isConfirmed: true,
      }
    ],
    keyLevels: {
      resistance2: 164.00,
      resistance1: 158.50,
      pivot: 153.00,
      support1: 148.20,
      support2: 142.00,
    },
    multiTimeframe: {
      tf15m: 'BULLISH',
      tf1h: 'BULLISH',
      tf4h: 'BULLISH',
      tf1d: 'BULLISH',
      tf1w: 'BULLISH',
    }
  },
  IONQ: {
    ticker: 'IONQ',
    companyName: 'IonQ, Inc.',
    sector: 'Technology',
    industry: 'Quantum Computing Hardware',
    currentPrice: 9.85,
    changeAmount: 0.45,
    changePercent: 4.79,
    open: 9.40,
    dayHigh: 10.15,
    dayLow: 9.35,
    yearHigh: 21.60,
    yearLow: 6.80,
    marketCap: 2150000000,
    beta: 2.85,
    averageVolume: 12400000,
    currentVolume: 14800000,
    sharesOutstanding: 218000000,
    nextEarningsDate: '2026-11-12',
    hasInsiderData: false, // Explicitly false to test dynamic weight reallocation
    fundamentals: {
      peRatio: -18.2,
      forwardPe: -14.5,
      sectorMedianPe: 28.4,
      pegRatio: -0.8,
      evToEbitda: -16.4,
      sectorMedianEvEbitda: 18.2,
      priceToSales: 68.5,
      priceToBook: 4.8,
      freeCashFlowYield: -6.4,
      revenueGrowthYoy: 102.5,
      ebitdaMargin: -185.0,
      netProfitMargin: -192.0,
      debtToEquity: 0.02,
      currentRatio: 6.80,
      quickRatio: 6.55,
      piotroskiFScore: 4,
      altmanZScore: 5.4,
      roe: -32.4,
      roic: -28.5,
    },
    institutionalFlow: [
      {
        id: 'flow-ionq-1',
        timestamp: '2026-08-19 09:50:12 EST',
        timeAgo: '30m ago',
        type: 'SWEEP_CALL',
        shares: 350000,
        price: 9.80,
        notionalValue: 3430000,
        exchange: 'CBOE_OPTIONS',
        sentiment: 'BULLISH',
        zScore: 3.25,
        strike: 12,
        expiration: '2026-10-16',
        premium: 0.85,
      }
    ],
    politicalInsiderTrades: [], // ZERO filings -> [NO CONFIRMED DATA AVAILABLE]
    keyLevels: {
      resistance2: 12.40,
      resistance1: 10.80,
      pivot: 9.60,
      support1: 8.90,
      support2: 7.80,
    },
    multiTimeframe: {
      tf15m: 'BULLISH',
      tf1h: 'NEUTRAL',
      tf4h: 'BULLISH',
      tf1d: 'NEUTRAL',
      tf1w: 'BEARISH',
    }
  }
};

/**
 * Known ticker database for dynamic search lookup
 */
const KNOWN_TICKER_PROFILES: Record<string, { companyName: string; sector: string; industry: string; defaultPrice: number; marketCap: number; sharesOutstanding: number; beta: number }> = {
  GOOGL: { companyName: 'Alphabet Inc.', sector: 'Communication Services', industry: 'Internet Content & AI', defaultPrice: 168.50, marketCap: 2080000000000, sharesOutstanding: 12300000000, beta: 1.05 },
  GOOG: { companyName: 'Alphabet Inc.', sector: 'Communication Services', industry: 'Internet Content & AI', defaultPrice: 169.80, marketCap: 2090000000000, sharesOutstanding: 12300000000, beta: 1.05 },
  AMZN: { companyName: 'Amazon.com, Inc.', sector: 'Consumer Cyclical', industry: 'E-Commerce & Cloud Infrastructure', defaultPrice: 178.20, marketCap: 1860000000000, sharesOutstanding: 10400000000, beta: 1.15 },
  META: { companyName: 'Meta Platforms, Inc.', sector: 'Communication Services', industry: 'Social Media & AI Models', defaultPrice: 512.40, marketCap: 1300000000000, sharesOutstanding: 2540000000, beta: 1.22 },
  COIN: { companyName: 'Coinbase Global, Inc.', sector: 'Financial Services', industry: 'Crypto Infrastructure & Brokerage', defaultPrice: 204.80, marketCap: 51200000000, sharesOutstanding: 250000000, beta: 3.12 },
  MSTR: { companyName: 'MicroStrategy Incorporated', sector: 'Technology', industry: 'Enterprise Software & Bitcoin Treasury', defaultPrice: 138.50, marketCap: 27800000000, sharesOutstanding: 200000000, beta: 3.45 },
  NFLX: { companyName: 'Netflix, Inc.', sector: 'Communication Services', industry: 'Streaming Entertainment', defaultPrice: 685.20, marketCap: 295000000000, sharesOutstanding: 430000000, beta: 1.28 },
  ARM: { companyName: 'Arm Holdings plc', sector: 'Technology', industry: 'Semiconductor IP & Architecture', defaultPrice: 132.40, marketCap: 138000000000, sharesOutstanding: 1040000000, beta: 1.95 },
  SMCI: { companyName: 'Super Micro Computer, Inc.', sector: 'Technology', industry: 'AI Server Solutions', defaultPrice: 58.20, marketCap: 34200000000, sharesOutstanding: 588000000, beta: 2.10 },
  AVGO: { companyName: 'Broadcom Inc.', sector: 'Technology', industry: 'Custom AI ASICs & Networking', defaultPrice: 162.80, marketCap: 760000000000, sharesOutstanding: 4670000000, beta: 1.25 },
  QCOM: { companyName: 'QUALCOMM Incorporated', sector: 'Technology', industry: 'Wireless & Edge AI Processors', defaultPrice: 168.10, marketCap: 188000000000, sharesOutstanding: 1120000000, beta: 1.28 },
  INTC: { companyName: 'Intel Corporation', sector: 'Technology', industry: 'Semiconductor Foundry & CPUs', defaultPrice: 21.40, marketCap: 91500000000, sharesOutstanding: 4280000000, beta: 1.10 },
  CRM: { companyName: 'Salesforce, Inc.', sector: 'Technology', industry: 'Enterprise CRM & Agentforce AI', defaultPrice: 254.60, marketCap: 247000000000, sharesOutstanding: 970000000, beta: 1.18 },
  SNOW: { companyName: 'Snowflake Inc.', sector: 'Technology', industry: 'Data Cloud & Lakehouse Platform', defaultPrice: 114.80, marketCap: 38500000000, sharesOutstanding: 335000000, beta: 1.45 },
  BABA: { companyName: 'Alibaba Group Holding Limited', sector: 'Consumer Cyclical', industry: 'E-Commerce & Cloud Computing', defaultPrice: 84.50, marketCap: 202000000000, sharesOutstanding: 2390000000, beta: 0.65 },
  DIS: { companyName: 'The Walt Disney Company', sector: 'Communication Services', industry: 'Entertainment & Media', defaultPrice: 94.20, marketCap: 172000000000, sharesOutstanding: 1820000000, beta: 1.35 },
  UBER: { companyName: 'Uber Technologies, Inc.', sector: 'Technology', industry: 'Mobility & Autonomous Logistics', defaultPrice: 72.80, marketCap: 152000000000, sharesOutstanding: 2090000000, beta: 1.38 },
  SPY: { companyName: 'SPDR S&P 500 ETF Trust', sector: 'Index ETF', industry: 'US Large Cap Equities', defaultPrice: 554.20, marketCap: 560000000000, sharesOutstanding: 1010000000, beta: 1.00 },
  QQQ: { companyName: 'Invesco QQQ Trust', sector: 'Index ETF', industry: 'Nasdaq-100 Tech Equities', defaultPrice: 478.60, marketCap: 290000000000, sharesOutstanding: 605000000, beta: 1.12 },
};

/**
 * Deterministic pseudo-random number generator based on string seed
 */
function seedHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Dynamically synthesizes a complete, unique market profile for any searched ticker
 */
function generateDynamicTickerData(sym: string): Partial<TickerMarketData> {
  const hash = seedHash(sym);
  const known = KNOWN_TICKER_PROFILES[sym];

  const companyName = known?.companyName || `${sym} Corporation`;
  const sector = known?.sector || (hash % 2 === 0 ? 'Technology' : 'Industrials & Energy');
  const industry = known?.industry || (hash % 3 === 0 ? 'Cloud Software & AI Systems' : 'Quantitative Financial Solutions');
  
  // Base price calculation (seed-based)
  const basePrice = known?.defaultPrice || Number((25 + (hash % 450) + (hash % 100) * 0.01).toFixed(2));
  const changePct = Number((((hash % 100) / 15) - 3.2).toFixed(2));
  const changeAmt = Number((basePrice * (changePct / 100)).toFixed(2));
  
  const pe = Number((18 + (hash % 60)).toFixed(1));
  const fwdPe = Number((pe * 0.82).toFixed(1));
  const revGrowth = Number((5 + (hash % 75)).toFixed(1));
  const fcfYield = Number((1.5 + (hash % 50) / 10).toFixed(1));
  const piotroski = 6 + (hash % 4); // 6, 7, 8, 9
  const debtEquity = Number((0.1 + (hash % 80) / 100).toFixed(2));

  // Determine if this dynamic ticker has confirmed political disclosures (70% probability)
  const hasInsiderData = (hash % 10) > 2;

  const dynamicFlow: InstitutionalFlowItem[] = [
    {
      id: `flow-${sym.toLowerCase()}-1`,
      timestamp: new Date(Date.now() - 14 * 60 * 1000).toLocaleTimeString(),
      timeAgo: '14m ago',
      type: 'DARK_POOL_PRINT',
      shares: Math.round(150000 * (100 / Math.max(20, basePrice))),
      price: basePrice,
      notionalValue: Math.round(150000 * basePrice),
      exchange: 'DARK_POOL',
      sentiment: changePct >= 0 ? 'BULLISH' : 'BEARISH',
      zScore: Number((2.1 + (hash % 20) / 10).toFixed(2)),
    },
    {
      id: `flow-${sym.toLowerCase()}-2`,
      timestamp: new Date(Date.now() - 48 * 60 * 1000).toLocaleTimeString(),
      timeAgo: '48m ago',
      type: changePct >= 0 ? 'SWEEP_CALL' : 'SWEEP_PUT',
      shares: Math.round(45000 * (100 / Math.max(20, basePrice))),
      price: basePrice,
      notionalValue: Math.round(45000 * basePrice),
      exchange: 'CBOE_OPTIONS',
      sentiment: changePct >= 0 ? 'BULLISH' : 'BEARISH',
      zScore: Number((1.8 + (hash % 15) / 10).toFixed(2)),
      strike: Math.round(basePrice * (changePct >= 0 ? 1.08 : 0.92)),
      expiration: '2026-09-18',
      premium: Number((basePrice * 0.03).toFixed(2)),
    }
  ];

  const dynamicInsiders: PoliticalInsiderTrade[] = hasInsiderData
    ? [
        {
          id: `pit-${sym.toLowerCase()}-1`,
          filerName: hash % 2 === 0 ? 'Rep. Ro Khanna' : 'Sen. Mark Warner',
          role: hash % 2 === 0 ? 'REPRESENTATIVE' : 'SENATOR',
          chamber: hash % 2 === 0 ? 'HOUSE' : 'SENATE',
          party: 'D',
          committee: 'Armed Services & Oversight',
          asset: `${sym} Common Stock`,
          transactionType: changePct >= 0 ? 'BUY' : 'SELL',
          volumeBracket: '$100,001 - $250,000',
          estimatedAmount: 175000,
          transactionDate: '2026-07-25',
          filingDate: '2026-08-08',
          disclosureLagDays: 14,
          sourceFiling: 'PTR / STOCK Act',
          isConfirmed: true,
        }
      ]
    : [];

  const sharesCount = known?.sharesOutstanding || Math.round(1250000000 * (100 / Math.max(20, basePrice)));
  const calculatedMarketCap = known?.marketCap || Math.round(basePrice * sharesCount);

  return {
    ticker: sym,
    companyName,
    sector,
    industry,
    currentPrice: basePrice,
    changeAmount: changeAmt,
    changePercent: changePct,
    open: Number((basePrice - changeAmt * 0.6).toFixed(2)),
    dayHigh: Number((basePrice * 1.015).toFixed(2)),
    dayLow: Number((basePrice * 0.985).toFixed(2)),
    yearHigh: Number((basePrice * 1.35).toFixed(2)),
    yearLow: Number((basePrice * 0.72).toFixed(2)),
    marketCap: calculatedMarketCap,
    beta: known?.beta || Number((1.1 + (hash % 100) / 100).toFixed(2)),
    averageVolume: Math.round(25000000 * (100 / Math.max(20, basePrice))),
    currentVolume: Math.round(28000000 * (100 / Math.max(20, basePrice))),
    sharesOutstanding: sharesCount,
    nextEarningsDate: '2026-11-15',
    hasInsiderData,
    fundamentals: {
      peRatio: pe,
      forwardPe: fwdPe,
      sectorMedianPe: 28.4,
      pegRatio: 1.4,
      evToEbitda: Number((pe * 0.75).toFixed(1)),
      sectorMedianEvEbitda: 18.2,
      priceToSales: Number((pe * 0.25).toFixed(1)),
      priceToBook: Number((pe * 0.35).toFixed(1)),
      freeCashFlowYield: fcfYield,
      revenueGrowthYoy: revGrowth,
      ebitdaMargin: Number((25 + (hash % 30)).toFixed(1)),
      netProfitMargin: Number((15 + (hash % 20)).toFixed(1)),
      debtToEquity: debtEquity,
      currentRatio: 2.45,
      quickRatio: 2.15,
      piotroskiFScore: piotroski,
      altmanZScore: Number((7.5 + (hash % 50) / 10).toFixed(1)),
      roe: Number((18 + (hash % 25)).toFixed(1)),
      roic: Number((14 + (hash % 20)).toFixed(1)),
    },
    institutionalFlow: dynamicFlow,
    politicalInsiderTrades: dynamicInsiders,
    keyLevels: {
      resistance2: Number((basePrice * 1.08).toFixed(2)),
      resistance1: Number((basePrice * 1.04).toFixed(2)),
      pivot: basePrice,
      support1: Number((basePrice * 0.96).toFixed(2)),
      support2: Number((basePrice * 0.92).toFixed(2)),
    },
    multiTimeframe: {
      tf15m: changePct >= 0 ? 'BULLISH' : 'BEARISH',
      tf1h: changePct >= 0 ? 'BULLISH' : 'BEARISH',
      tf4h: changePct >= 0 ? 'BULLISH' : 'NEUTRAL',
      tf1d: 'BULLISH',
      tf1w: 'BULLISH',
    }
  };
}

/**
 * Merges live real-world exchange data (from Yahoo Finance / Finnhub / NASDAQ) into full TickerMarketData.
 */
export function mergeLiveMarketDataIntoTicker(base: TickerMarketData, live: any): TickerMarketData {
  if (!live || !live.currentPrice) return base;

  let enrichedCandles = base.candles;
  if (Array.isArray(live.candles) && live.candles.length >= 10) {
    enrichedCandles = enrichCandlesWithIndicators(live.candles);
  }

  const lastCandle = enrichedCandles[enrichedCandles.length - 1] || base.candles[base.candles.length - 1];
  const prevCandle = enrichedCandles.length > 1 ? enrichedCandles[enrichedCandles.length - 2] : undefined;
  const currentPrice = live.currentPrice || lastCandle.close;
  const atr = Math.max(0.5, lastCandle.high - lastCandle.low);

  const keyLevels = {
    resistance2: Number((currentPrice * 1.08).toFixed(2)),
    resistance1: Number((currentPrice * 1.04).toFixed(2)),
    pivot: currentPrice,
    support1: Number((currentPrice * 0.96).toFixed(2)),
    support2: Number((currentPrice * 0.92).toFixed(2)),
  };

  // Re-scale dark pool prints to genuine live price
  const scaledFlow = base.institutionalFlow.map(f => ({
    ...f,
    price: currentPrice,
    notionalValue: Math.round(f.shares * currentPrice),
  }));

  const confluence = calculateConfluenceScore(
    lastCandle,
    prevCandle,
    base.fundamentals,
    scaledFlow,
    base.politicalInsiderTrades,
    base.hasInsiderData
  );

  const tradeSetups = calculateTradeSetups(currentPrice, atr, keyLevels);

  // Exact market cap handling: use real live marketCap from exchange, or live.sharesOutstanding * currentPrice, or base.marketCap scaled by price
  const sharesOutstanding = live.sharesOutstanding || base.sharesOutstanding;
  const marketCap = live.marketCap || (sharesOutstanding ? Math.round(sharesOutstanding * currentPrice) : Math.round(base.marketCap * (currentPrice / (base.currentPrice || currentPrice))));
  const beta = live.beta !== undefined && live.beta !== null ? live.beta : base.beta;

  return {
    ...base,
    ticker: live.ticker || base.ticker,
    companyName: live.companyName || base.companyName,
    currentPrice,
    changeAmount: live.changeAmount !== undefined ? live.changeAmount : base.changeAmount,
    changePercent: live.changePercent !== undefined ? live.changePercent : base.changePercent,
    open: live.open || base.open,
    dayHigh: live.dayHigh || base.dayHigh,
    dayLow: live.dayLow || base.dayLow,
    yearHigh: live.yearHigh || base.yearHigh,
    yearLow: live.yearLow || base.yearLow,
    currentVolume: live.currentVolume || base.currentVolume,
    marketCap,
    sharesOutstanding,
    beta,
    candles: enrichedCandles,
    institutionalFlow: scaledFlow,
    keyLevels,
    confluence,
    tradeSetups,
    fundamentals: {
      ...base.fundamentals,
      peRatio: live.trailingPe || base.fundamentals.peRatio,
      forwardPe: live.forwardPe || base.fundamentals.forwardPe,
    }
  };
}

/**
 * Builds a complete TickerMarketData object with indicators, confluence scores, and trade setups.
 */
export function getTickerData(tickerInput: string): TickerMarketData {
  const sym = tickerInput.toUpperCase().trim();
  const preset: Partial<TickerMarketData> = PRESET_TICKERS[sym] || generateDynamicTickerData(sym);

  const basePrice = preset.currentPrice || 100;
  const trendSlope = preset.changePercent && preset.changePercent > 0 ? 0.35 : -0.15;
  const candles = generateHistoricalCandles(basePrice, 0.32, trendSlope, 120);

  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];
  const atr = Math.max(0.5, lastCandle.high - lastCandle.low);

  const keyLevels = preset.keyLevels || {
    resistance2: Math.round(lastCandle.close * 1.08 * 100) / 100,
    resistance1: Math.round(lastCandle.close * 1.04 * 100) / 100,
    pivot: Math.round(lastCandle.close * 100) / 100,
    support1: Math.round(lastCandle.close * 0.96 * 100) / 100,
    support2: Math.round(lastCandle.close * 0.92 * 100) / 100,
  };

  const fundamentals: FundamentalMetrics = preset.fundamentals || {
    peRatio: 32.5,
    forwardPe: 26.4,
    sectorMedianPe: 28.4,
    pegRatio: 1.4,
    evToEbitda: 22.1,
    sectorMedianEvEbitda: 18.2,
    priceToSales: 12.0,
    priceToBook: 8.5,
    freeCashFlowYield: 3.2,
    revenueGrowthYoy: 24.5,
    ebitdaMargin: 35.0,
    netProfitMargin: 24.0,
    debtToEquity: 0.35,
    currentRatio: 2.8,
    quickRatio: 2.4,
    piotroskiFScore: 8,
    altmanZScore: 11.2,
    roe: 35.0,
    roic: 28.0,
  };

  const institutionalFlow: InstitutionalFlowItem[] = preset.institutionalFlow || [];
  const politicalInsiderTrades: PoliticalInsiderTrade[] = preset.politicalInsiderTrades || [];
  const hasInsiderData = preset.hasInsiderData !== undefined ? preset.hasInsiderData : politicalInsiderTrades.length > 0;

  const confluence = calculateConfluenceScore(
    lastCandle,
    prevCandle,
    fundamentals,
    institutionalFlow,
    politicalInsiderTrades,
    hasInsiderData
  );

  const tradeSetups = calculateTradeSetups(lastCandle.close, atr, keyLevels);
  const sharesCount = preset.sharesOutstanding || Math.round(1500000000 * (100 / Math.max(20, lastCandle.close)));
  const computedMarketCap = preset.marketCap || Math.round(lastCandle.close * sharesCount);

  return {
    ticker: sym,
    companyName: preset.companyName || `${sym} Corporation`,
    sector: preset.sector || 'Technology',
    industry: preset.industry || 'Equities',
    currentPrice: lastCandle.close,
    changeAmount: Math.round((lastCandle.close - candles[candles.length - 2].close) * 100) / 100,
    changePercent: Math.round(((lastCandle.close - candles[candles.length - 2].close) / candles[candles.length - 2].close) * 10000) / 100,
    open: lastCandle.open,
    dayHigh: lastCandle.high,
    dayLow: lastCandle.low,
    yearHigh: Math.max(...candles.map(c => c.high)),
    yearLow: Math.min(...candles.map(c => c.low)),
    marketCap: computedMarketCap,
    beta: preset.beta || 1.25,
    averageVolume: preset.averageVolume || 35000000,
    currentVolume: lastCandle.volume,
    sharesOutstanding: sharesCount,
    nextEarningsDate: preset.nextEarningsDate || '2026-11-15',
    candles,
    fundamentals,
    institutionalFlow,
    politicalInsiderTrades,
    hasInsiderData,
    confluence,
    tradeSetups,
    keyLevels,
    multiTimeframe: preset.multiTimeframe || {
      tf15m: 'BULLISH',
      tf1h: 'BULLISH',
      tf4h: 'BULLISH',
      tf1d: 'BULLISH',
      tf1w: 'BULLISH',
    }
  };
}

/**
 * Lakehouse Schema Definitions (Bronze, Silver, Gold Layers)
 */
export const LAKEHOUSE_SCHEMAS: LakehouseTableSchema[] = [
  {
    tableName: 'raw_market_ticks',
    layer: 'BRONZE',
    description: 'Raw high-frequency market streaming quotes & OHLCV bar aggregations from Finnhub & yfinance ingestion endpoints.',
    partitionKey: 'trade_date (YYYY-MM-DD)',
    columns: [
      { name: 'tick_id', type: 'VARCHAR(64)', description: 'Unique ingestion UUID hash', isKey: true },
      { name: 'ticker', type: 'VARCHAR(12)', description: 'Asset ticker symbol (e.g. NVDA, AAPL, MSFT)', isKey: true },
      { name: 'timestamp_utc', type: 'TIMESTAMP_NTZ', description: 'Nanosecond precision quote time' },
      { name: 'open_price', type: 'DECIMAL(18, 4)', description: 'Bar open price' },
      { name: 'high_price', type: 'DECIMAL(18, 4)', description: 'Bar highest executed price' },
      { name: 'low_price', type: 'DECIMAL(18, 4)', description: 'Bar lowest executed price' },
      { name: 'close_price', type: 'DECIMAL(18, 4)', description: 'Bar close price' },
      { name: 'volume', type: 'BIGINT', description: 'Aggregated share volume' },
      { name: 'bid_price', type: 'DECIMAL(18, 4)', description: 'National Best Bid (NBBO)' },
      { name: 'ask_price', type: 'DECIMAL(18, 4)', description: 'National Best Offer (NBBO)' },
      { name: 'spread_bps', type: 'DECIMAL(10, 2)', description: 'Bid/Ask spread in basis points' },
      { name: 'ingest_source', type: 'VARCHAR(32)', description: 'Endpoint: finnhub_ws | yfinance_rest' },
    ],
    sampleQuery: `SELECT ticker, date_trunc('minute', timestamp_utc) AS bar_minute,\n       open_price, high_price, low_price, close_price,\n       SUM(volume) AS total_vol,\n       AVG(spread_bps) AS avg_spread_bps\nFROM raw_market_ticks\nGROUP BY 1, 2, 3, 4, 5, 6\nORDER BY bar_minute DESC\nLIMIT 10;`
  },
  {
    tableName: 'financial_fundamentals',
    layer: 'SILVER',
    description: 'Standardized balance sheet, income statement, cash flow metrics, and peer sector valuation benchmarks.',
    partitionKey: 'fiscal_period (e.g. 2026-Q2)',
    columns: [
      { name: 'company_id', type: 'VARCHAR(32)', description: 'CIK or standardized entity ID', isKey: true },
      { name: 'ticker', type: 'VARCHAR(12)', description: 'Ticker symbol', isKey: true },
      { name: 'filing_date', type: 'DATE', description: 'SEC 10-Q / 10-K filing timestamp' },
      { name: 'pe_ratio_ttm', type: 'DECIMAL(10, 2)', description: 'Trailing 12-month Price to Earnings' },
      { name: 'forward_pe', type: 'DECIMAL(10, 2)', description: '1-Year Forward Consensus P/E' },
      { name: 'ev_to_ebitda', type: 'DECIMAL(10, 2)', description: 'Enterprise Value / EBITDA multiple' },
      { name: 'fcf_yield_pct', type: 'DECIMAL(8, 2)', description: 'Free Cash Flow / Market Cap yield' },
      { name: 'revenue_growth_yoy', type: 'DECIMAL(8, 2)', description: 'Year-over-Year Revenue Growth %' },
      { name: 'debt_to_equity', type: 'DECIMAL(8, 2)', description: 'Total Debt / Stockholder Equity' },
      { name: 'quick_ratio', type: 'DECIMAL(8, 2)', description: 'Liquid Assets / Current Liabilities' },
      { name: 'piotroski_f_score', type: 'INT2', description: 'Fundamental quality score (0 - 9)' },
      { name: 'altman_z_score', type: 'DECIMAL(8, 2)', description: 'Solvency and distress metric' },
    ],
    sampleQuery: `SELECT ticker, filing_date, pe_ratio_ttm, forward_pe, ev_to_ebitda, \n       fcf_yield_pct, revenue_growth_yoy, debt_to_equity, piotroski_f_score\nFROM financial_fundamentals\nORDER BY piotroski_f_score DESC, revenue_growth_yoy DESC;`
  },
  {
    tableName: 'institutional_flow',
    layer: 'SILVER',
    description: 'Off-exchange dark pool volume prints, block orders > $5M, and options sweeps exceeding 2σ standard deviation volume spikes.',
    partitionKey: 'event_date (YYYY-MM-DD)',
    columns: [
      { name: 'flow_event_id', type: 'VARCHAR(64)', description: 'Unique tape signature UUID', isKey: true },
      { name: 'ticker', type: 'VARCHAR(12)', description: 'Underlying asset symbol', isKey: true },
      { name: 'event_timestamp', type: 'TIMESTAMP_NTZ', description: 'Execution timestamp' },
      { name: 'flow_type', type: 'VARCHAR(32)', description: 'DARK_POOL_PRINT | BLOCK_BUY | SWEEP_CALL | SWEEP_PUT' },
      { name: 'notional_value_usd', type: 'DECIMAL(18, 2)', description: 'Dollar value of order print' },
      { name: 'executed_price', type: 'DECIMAL(18, 4)', description: 'Execution print price' },
      { name: 'volume_z_score', type: 'DECIMAL(6, 2)', description: 'Standard deviations above 30-day mean' },
      { name: 'sentiment_flag', type: 'VARCHAR(16)', description: 'BULLISH | BEARISH | NEUTRAL' },
      { name: 'venue_code', type: 'VARCHAR(16)', description: 'FINRA_ADF | NASDAQ | CBOE' },
    ],
    sampleQuery: `SELECT ticker, flow_type, sentiment_flag, \n       SUM(notional_value_usd) AS total_notional,\n       AVG(volume_z_score) AS avg_z_score,\n       COUNT(*) AS print_count\nFROM institutional_flow\nWHERE volume_z_score > 2.0\nGROUP BY 1, 2, 3\nORDER BY total_notional DESC;`
  },
  {
    tableName: 'political_insider_trades',
    layer: 'SILVER',
    description: 'Regulatory SEC Form 4 insider filings and US Congressional STOCK Act Periodic Transaction Reports (House & Senate disclosures).',
    partitionKey: 'filing_year_month (YYYY-MM)',
    columns: [
      { name: 'filing_id', type: 'VARCHAR(64)', description: 'SEC Accession # or PTR Doc ID', isKey: true },
      { name: 'ticker', type: 'VARCHAR(12)', description: 'Security ticker symbol', isKey: true },
      { name: 'filer_name', type: 'VARCHAR(128)', description: 'Name of politician or corporate insider' },
      { name: 'filer_role', type: 'VARCHAR(64)', description: 'SENATOR | REPRESENTATIVE | EXECUTIVE | DIRECTOR' },
      { name: 'chamber_branch', type: 'VARCHAR(32)', description: 'HOUSE | SENATE | C_SUITE' },
      { name: 'transaction_type', type: 'VARCHAR(16)', description: 'BUY | SELL | EXERCISE | GRANT' },
      { name: 'bracket_lower_usd', type: 'DECIMAL(18, 2)', description: 'STOCK Act bracket floor value' },
      { name: 'bracket_upper_usd', type: 'DECIMAL(18, 2)', description: 'STOCK Act bracket ceiling value' },
      { name: 'estimated_amount_usd', type: 'DECIMAL(18, 2)', description: 'Midpoint bracket approximation' },
      { name: 'transaction_date', type: 'DATE', description: 'Execution trade date' },
      { name: 'filing_date', type: 'DATE', description: 'Public disclosure timestamp' },
      { name: 'disclosure_lag_days', type: 'INT4', description: 'Filing date minus transaction date' },
      { name: 'is_confirmed', type: 'BOOLEAN', description: 'EDGAR / Clerk verified record' },
    ],
    sampleQuery: `SELECT filer_name, chamber_branch, ticker, transaction_type, \n       estimated_amount_usd, disclosure_lag_days, filing_date\nFROM political_insider_trades\nWHERE is_confirmed = true\nORDER BY filing_date DESC, estimated_amount_usd DESC\nLIMIT 15;`
  },
  {
    tableName: 'confluence_signals',
    layer: 'GOLD',
    description: 'Synthesized quantitative intelligence view unifying technical momentum, fundamental valuation, institutional flow, and political trade direction with dynamic missing-data weight reallocation.',
    partitionKey: 'signal_date (YYYY-MM-DD)',
    columns: [
      { name: 'signal_id', type: 'VARCHAR(64)', description: 'Deterministic hash of (ticker, timestamp)', isKey: true },
      { name: 'ticker', type: 'VARCHAR(12)', description: 'Ticker symbol', isKey: true },
      { name: 'signal_timestamp', type: 'TIMESTAMP_NTZ', description: 'Computation timestamp' },
      { name: 'confluence_score', type: 'INT2', description: 'Score bound between -100 and +100' },
      { name: 'market_regime', type: 'VARCHAR(32)', description: 'STRONG_BULLISH | MODERATE_BULLISH | NEUTRAL | BEARISH' },
      { name: 'tech_pillar_score', type: 'INT2', description: 'Technical score (-100 to 100)' },
      { name: 'fund_pillar_score', type: 'INT2', description: 'Fundamental score (-100 to 100)' },
      { name: 'flow_pillar_score', type: 'INT2', description: 'Institutional flow score (-100 to 100)' },
      { name: 'insider_pillar_score', type: 'INT2', description: 'Political/Insider score (-100 to 100)' },
      { name: 'is_adjusted_weight', type: 'BOOLEAN', description: 'True if insider data unavailable' },
      { name: 'effective_tech_weight', type: 'DECIMAL(4, 2)', description: 'Dynamic weight applied to technicals' },
      { name: 'supertrend_status', type: 'VARCHAR(16)', description: 'BULLISH | BEARISH' },
      { name: 'rsi_14', type: 'DECIMAL(6, 2)', description: 'RSI reading' },
      { name: 'ideal_long_entry', type: 'DECIMAL(18, 2)', description: 'Quantitative long entry price' },
      { name: 'long_stop_loss', type: 'DECIMAL(18, 2)', description: 'Invalidation stop-loss price' },
      { name: 'target_1_price', type: 'DECIMAL(18, 2)', description: 'Take Profit 1 level' },
    ],
    sampleQuery: `SELECT ticker, confluence_score, market_regime, \n       tech_pillar_score, fund_pillar_score, flow_pillar_score, insider_pillar_score,\n       is_adjusted_weight, ideal_long_entry, long_stop_loss, target_1_price\nFROM confluence_signals\nORDER BY confluence_score DESC;`
  }
];
