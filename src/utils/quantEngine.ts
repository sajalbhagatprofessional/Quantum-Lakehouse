import {
  Candle,
  FundamentalMetrics,
  InstitutionalFlowItem,
  PoliticalInsiderTrade,
  ConfluenceScoreResult,
  ConfluencePillar,
  TradeSetup
} from '../types';

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  
  if (prices.length === 0) return ema;
  
  // Start with SMA for initial period
  let sum = 0;
  for (let i = 0; i < Math.min(period, prices.length); i++) {
    sum += prices[i];
    ema.push(sum / (i + 1));
  }
  
  for (let i = period; i < prices.length; i++) {
    const val = prices[i] * k + ema[i - 1] * (1 - k);
    ema.push(val);
  }
  
  return ema;
}

/**
 * Calculates Average True Range (ATR)
 */
export function calculateATR(candles: { high: number; low: number; close: number }[], period = 14): number[] {
  const tr: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      tr.push(candles[i].high - candles[i].low);
    } else {
      const hl = candles[i].high - candles[i].low;
      const hc = Math.abs(candles[i].high - candles[i - 1].close);
      const lc = Math.abs(candles[i].low - candles[i - 1].close);
      tr.push(Math.max(hl, hc, lc));
    }
  }
  
  // Wilder's smoothing for ATR
  const atr: number[] = [];
  let sum = 0;
  for (let i = 0; i < Math.min(period, tr.length); i++) {
    sum += tr[i];
    atr.push(sum / (i + 1));
  }
  for (let i = period; i < tr.length; i++) {
    const val = (atr[i - 1] * (period - 1) + tr[i]) / period;
    atr.push(val);
  }
  return atr;
}

/**
 * Calculates Supertrend Indicator
 */
export function calculateSupertrend(
  candles: { high: number; low: number; close: number }[],
  period = 10,
  multiplier = 3
): { supertrend: number[]; direction: ('BULLISH' | 'BEARISH')[] } {
  const atr = calculateATR(candles, period);
  const supertrend: number[] = [];
  const direction: ('BULLISH' | 'BEARISH')[] = [];
  
  const basicUpper: number[] = [];
  const basicLower: number[] = [];
  const finalUpper: number[] = [];
  const finalLower: number[] = [];

  for (let i = 0; i < candles.length; i++) {
    const hl2 = (candles[i].high + candles[i].low) / 2;
    const currentAtr = atr[i] || (candles[i].high - candles[i].low);
    
    basicUpper.push(hl2 + multiplier * currentAtr);
    basicLower.push(hl2 - multiplier * currentAtr);

    if (i === 0) {
      finalUpper.push(basicUpper[i]);
      finalLower.push(basicLower[i]);
      direction.push('BULLISH');
      supertrend.push(finalLower[i]);
    } else {
      // Final Upper Band
      if (basicUpper[i] < finalUpper[i - 1] || candles[i - 1].close > finalUpper[i - 1]) {
        finalUpper.push(basicUpper[i]);
      } else {
        finalUpper.push(finalUpper[i - 1]);
      }

      // Final Lower Band
      if (basicLower[i] > finalLower[i - 1] || candles[i - 1].close < finalLower[i - 1]) {
        finalLower.push(basicLower[i]);
      } else {
        finalLower.push(finalLower[i - 1]);
      }

      // Direction logic
      let currentDir: 'BULLISH' | 'BEARISH' = direction[i - 1];
      if (direction[i - 1] === 'BULLISH' && candles[i].close < finalLower[i]) {
        currentDir = 'BEARISH';
      } else if (direction[i - 1] === 'BEARISH' && candles[i].close > finalUpper[i]) {
        currentDir = 'BULLISH';
      }
      direction.push(currentDir);
      supertrend.push(currentDir === 'BULLISH' ? finalLower[i] : finalUpper[i]);
    }
  }

  return { supertrend, direction };
}

/**
 * Calculates Relative Strength Index (RSI) and dynamic volatility bands
 */
export function calculateRSI(closes: number[], period = 14): { rsi: number[]; upperBand: number[]; lowerBand: number[] } {
  const rsi: number[] = [];
  const upperBand: number[] = [];
  const lowerBand: number[] = [];

  if (closes.length < 2) {
    return { rsi: [50], upperBand: [70], lowerBand: [30] };
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= Math.min(period, closes.length - 1); i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Initial fill
  for (let i = 0; i < Math.min(period, closes.length); i++) {
    rsi.push(50);
    upperBand.push(70);
    lowerBand.push(30);
  }

  for (let i = period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsiVal = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
    rsi.push(Math.round(rsiVal * 10) / 10);

    // Dynamic bands based on recent RSI standard deviation
    const slice = rsi.slice(Math.max(0, rsi.length - 20));
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / slice.length;
    const std = Math.sqrt(variance);

    upperBand.push(Math.min(85, Math.max(65, Math.round((mean + 1.618 * std) * 10) / 10)));
    lowerBand.push(Math.max(15, Math.min(35, Math.round((mean - 1.618 * std) * 10) / 10)));
  }

  return { rsi, upperBand, lowerBand };
}

/**
 * Calculates MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): { macd: number[]; signal: number[]; hist: number[] } {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);
  
  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    macdLine.push(fastEMA[i] - slowEMA[i]);
  }
  
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    histogram.push(macdLine[i] - signalLine[i]);
  }
  
  return { macd: macdLine, signal: signalLine, hist: histogram };
}

/**
 * Calculates Bollinger Bands (SMA20 +/- 2 * StdDev)
 */
export function calculateBollingerBands(
  closes: number[],
  period = 20,
  stdDevMult = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const upper: number[] = [];
  const middle: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      const slice = closes.slice(0, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      middle.push(avg);
      upper.push(avg * 1.02);
      lower.push(avg * 0.98);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / period;
      const std = Math.sqrt(variance);
      middle.push(avg);
      upper.push(avg + stdDevMult * std);
      lower.push(avg - stdDevMult * std);
    }
  }

  return { upper, middle, lower };
}

/**
 * Calculates Volume Weighted Average Price (VWAP)
 */
export function calculateVWAP(candles: { high: number; low: number; close: number; volume: number }[]): number[] {
  const vwap: number[] = [];
  let cumulativeTypicalVolume = 0;
  let cumulativeVolume = 0;

  for (let i = 0; i < candles.length; i++) {
    const typicalPrice = (candles[i].high + candles[i].low + candles[i].close) / 3;
    cumulativeTypicalVolume += typicalPrice * candles[i].volume;
    cumulativeVolume += candles[i].volume;

    vwap.push(cumulativeVolume === 0 ? candles[i].close : cumulativeTypicalVolume / cumulativeVolume);
  }

  return vwap;
}

/**
 * Calculates On-Balance Volume (OBV)
 */
export function calculateOBV(candles: { close: number; volume: number }[]): number[] {
  const obv: number[] = [];
  let currentOBV = 0;

  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      currentOBV = candles[i].volume;
    } else {
      if (candles[i].close > candles[i - 1].close) {
        currentOBV += candles[i].volume;
      } else if (candles[i].close < candles[i - 1].close) {
        currentOBV -= candles[i].volume;
      }
    }
    obv.push(currentOBV);
  }

  return obv;
}

/**
 * Computes Volume Z-score to detect institutional volume anomalies (> 2 sigma)
 */
export function calculateVolumeZScores(volumes: number[], period = 30): { zScores: number[]; spikes: boolean[] } {
  const zScores: number[] = [];
  const spikes: boolean[] = [];

  for (let i = 0; i < volumes.length; i++) {
    if (i < 5) {
      zScores.push(0);
      spikes.push(false);
      continue;
    }
    const startIdx = Math.max(0, i - period);
    const window = volumes.slice(startIdx, i);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / window.length;
    const std = Math.sqrt(variance) || 1;

    const z = (volumes[i] - mean) / std;
    zScores.push(Math.round(z * 100) / 100);
    spikes.push(z > 2.0);
  }

  return { zScores, spikes };
}

/**
 * Enrich candles with full suite of indicators
 */
export function enrichCandlesWithIndicators(rawCandles: { timestamp: string; time: number; open: number; high: number; low: number; close: number; volume: number }[]): Candle[] {
  const closes = rawCandles.map(c => c.close);
  const volumes = rawCandles.map(c => c.volume);

  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);
  const { supertrend, direction } = calculateSupertrend(rawCandles, 10, 3);
  const { rsi, upperBand, lowerBand } = calculateRSI(closes, 14);
  const { macd, signal, hist } = calculateMACD(closes, 12, 26, 9);
  const bb = calculateBollingerBands(closes, 20, 2);
  const vwap = calculateVWAP(rawCandles);
  const obv = calculateOBV(rawCandles);
  const { zScores, spikes } = calculateVolumeZScores(volumes, 30);

  return rawCandles.map((c, i) => ({
    ...c,
    ema20: Math.round(ema20[i] * 100) / 100,
    ema50: Math.round(ema50[i] * 100) / 100,
    ema200: Math.round(ema200[i] * 100) / 100,
    supertrend: Math.round(supertrend[i] * 100) / 100,
    supertrendDirection: direction[i],
    rsi: rsi[i],
    rsiUpperBand: upperBand[i],
    rsiLowerBand: lowerBand[i],
    macd: Math.round(macd[i] * 100) / 100,
    macdSignal: Math.round(signal[i] * 100) / 100,
    macdHist: Math.round(hist[i] * 100) / 100,
    upperBB: Math.round(bb.upper[i] * 100) / 100,
    middleBB: Math.round(bb.middle[i] * 100) / 100,
    lowerBB: Math.round(bb.lower[i] * 100) / 100,
    vwap: Math.round(vwap[i] * 100) / 100,
    obv: obv[i],
    volumeZScore: zScores[i],
    isVolumeSpike: spikes[i],
  }));
}

export const calculateTechnicalIndicators = enrichCandlesWithIndicators;

/**
 * Calculates Confluence Score (-100 to +100) with dynamic weight redistribution
 * for missing/outdated insider data per prompt instructions.
 */
export function calculateConfluenceScore(
  candleOrCandles: Candle | Candle[],
  prevCandleOrFundamentals: Candle | FundamentalMetrics | undefined,
  fundamentalsOrFlow?: FundamentalMetrics | InstitutionalFlowItem[],
  flowOrInsider?: InstitutionalFlowItem[] | PoliticalInsiderTrade[],
  politicalInsiderOrHasData?: PoliticalInsiderTrade[] | boolean,
  hasInsiderDataFlag?: boolean
): ConfluenceScoreResult {
  let lastCandle: Candle;
  let prevCandle: Candle | undefined;
  let fundamentals: FundamentalMetrics;
  let flow: InstitutionalFlowItem[];
  let politicalInsider: PoliticalInsiderTrade[];
  let hasInsiderData: boolean;

  if (Array.isArray(candleOrCandles)) {
    const candles = candleOrCandles;
    lastCandle = candles[candles.length - 1] || { close: 100, volume: 1000000, high: 100, low: 100, open: 100, timestamp: '', time: 0 };
    prevCandle = candles.length > 1 ? candles[candles.length - 2] : undefined;
    fundamentals = prevCandleOrFundamentals as FundamentalMetrics;
    flow = (fundamentalsOrFlow as InstitutionalFlowItem[]) || [];
    politicalInsider = (flowOrInsider as PoliticalInsiderTrade[]) || [];
    hasInsiderData = Boolean(politicalInsiderOrHasData);
  } else {
    lastCandle = candleOrCandles;
    prevCandle = prevCandleOrFundamentals as Candle | undefined;
    fundamentals = fundamentalsOrFlow as FundamentalMetrics;
    flow = (flowOrInsider as InstitutionalFlowItem[]) || [];
    politicalInsider = (politicalInsiderOrHasData as PoliticalInsiderTrade[]) || [];
    hasInsiderData = Boolean(hasInsiderDataFlag);
  }
  // 1. Technical Pillar Score (-100 to +100)
  let techScore = 0;
  const techSignals: string[] = [];

  // Moving average alignment (Golden stack)
  if (lastCandle.ema20 && lastCandle.ema50 && lastCandle.ema200) {
    if (lastCandle.close > lastCandle.ema20 && lastCandle.ema20 > lastCandle.ema50 && lastCandle.ema50 > lastCandle.ema200) {
      techScore += 35;
      techSignals.push("Bullish Moving Average Stack (Price > EMA20 > EMA50 > EMA200)");
    } else if (lastCandle.close < lastCandle.ema20 && lastCandle.ema20 < lastCandle.ema50 && lastCandle.ema50 < lastCandle.ema200) {
      techScore -= 35;
      techSignals.push("Bearish Moving Average Stack (Price < EMA20 < EMA50 < EMA200)");
    } else if (lastCandle.close > lastCandle.ema200) {
      techScore += 15;
      techSignals.push("Price Trading Above 200 EMA Macro Baseline");
    } else {
      techScore -= 15;
      techSignals.push("Price Trading Below 200 EMA Macro Baseline");
    }
  }

  // Supertrend
  if (lastCandle.supertrendDirection === 'BULLISH') {
    techScore += 25;
    techSignals.push(`Supertrend Bullish (Support at $${lastCandle.supertrend?.toFixed(2)})`);
  } else {
    techScore -= 25;
    techSignals.push(`Supertrend Bearish (Resistance at $${lastCandle.supertrend?.toFixed(2)})`);
  }

  // RSI Momentum
  if (lastCandle.rsi !== undefined) {
    if (lastCandle.rsi > 55 && lastCandle.rsi < 72) {
      techScore += 20;
      techSignals.push(`RSI in Bullish Expansion Zone (${lastCandle.rsi})`);
    } else if (lastCandle.rsi >= 72) {
      techScore += 5; // Bullish momentum but overextended
      techSignals.push(`RSI Overbought (${lastCandle.rsi}) - Momentum Strong, Mean Reversion Risk`);
    } else if (lastCandle.rsi < 45 && lastCandle.rsi > 28) {
      techScore -= 20;
      techSignals.push(`RSI in Bearish Contraction Zone (${lastCandle.rsi})`);
    } else if (lastCandle.rsi <= 28) {
      techScore -= 5;
      techSignals.push(`RSI Oversold (${lastCandle.rsi}) - Bearish Exhaustion Watch`);
    }
  }

  // MACD Histogram & Cross
  if (lastCandle.macdHist !== undefined && lastCandle.macd !== undefined && lastCandle.macdSignal !== undefined) {
    if (lastCandle.macd > lastCandle.macdSignal && lastCandle.macdHist > 0) {
      techScore += 20;
      techSignals.push("MACD Positive Momentum Expansion (Histogram > 0)");
    } else if (lastCandle.macd < lastCandle.macdSignal && lastCandle.macdHist < 0) {
      techScore -= 20;
      techSignals.push("MACD Negative Momentum Decay (Histogram < 0)");
    }
  }

  techScore = Math.max(-100, Math.min(100, techScore));

  // 2. Fundamental Valuation & Solvency Pillar Score (-100 to +100)
  let fundScore = 0;
  const fundSignals: string[] = [];

  // P/E vs Sector
  if (fundamentals.peRatio > 0 && fundamentals.sectorMedianPe > 0) {
    const peDiscount = ((fundamentals.sectorMedianPe - fundamentals.peRatio) / fundamentals.sectorMedianPe) * 100;
    if (peDiscount > 20) {
      fundScore += 25;
      fundSignals.push(`P/E of ${fundamentals.peRatio.toFixed(1)}x at ${Math.abs(peDiscount).toFixed(0)}% discount to Sector (${fundamentals.sectorMedianPe.toFixed(1)}x)`);
    } else if (peDiscount < -40) {
      fundScore -= 20;
      fundSignals.push(`P/E of ${fundamentals.peRatio.toFixed(1)}x represents ${Math.abs(peDiscount).toFixed(0)}% premium to Sector`);
    } else {
      fundScore += 10;
      fundSignals.push(`Valuation in-line with Sector Median (${fundamentals.peRatio.toFixed(1)}x vs ${fundamentals.sectorMedianPe.toFixed(1)}x)`);
    }
  }

  // Revenue Growth YoY
  if (fundamentals.revenueGrowthYoy > 25) {
    fundScore += 30;
    fundSignals.push(`Hyper-growth revenue expansion (+${fundamentals.revenueGrowthYoy.toFixed(1)}% YoY)`);
  } else if (fundamentals.revenueGrowthYoy > 10) {
    fundScore += 15;
    fundSignals.push(`Steady revenue expansion (+${fundamentals.revenueGrowthYoy.toFixed(1)}% YoY)`);
  } else if (fundamentals.revenueGrowthYoy < 0) {
    fundScore -= 25;
    fundSignals.push(`Top-line contraction (${fundamentals.revenueGrowthYoy.toFixed(1)}% YoY)`);
  }

  // Free Cash Flow Yield
  if (fundamentals.freeCashFlowYield > 5.0) {
    fundScore += 20;
    fundSignals.push(`Robust FCF yield of ${fundamentals.freeCashFlowYield.toFixed(1)}%`);
  } else if (fundamentals.freeCashFlowYield < 0) {
    fundScore -= 20;
    fundSignals.push(`Negative cash flow generation (FCF yield ${fundamentals.freeCashFlowYield.toFixed(1)}%)`);
  }

  // Solvency: Debt to Equity & Quick Ratio
  if (fundamentals.debtToEquity < 0.6 && fundamentals.quickRatio > 1.2) {
    fundScore += 15;
    fundSignals.push(`Pristine Balance Sheet (D/E: ${fundamentals.debtToEquity.toFixed(2)}, Quick Ratio: ${fundamentals.quickRatio.toFixed(2)})`);
  } else if (fundamentals.debtToEquity > 2.0) {
    fundScore -= 20;
    fundSignals.push(`Elevated leverage risk (D/E: ${fundamentals.debtToEquity.toFixed(2)})`);
  }

  // Piotroski F-Score
  if (fundamentals.piotroskiFScore >= 7) {
    fundScore += 10;
    fundSignals.push(`High Piotroski F-Score (${fundamentals.piotroskiFScore}/9) confirms operational quality`);
  } else if (fundamentals.piotroskiFScore <= 3) {
    fundScore -= 15;
    fundSignals.push(`Low Piotroski F-Score (${fundamentals.piotroskiFScore}/9) signals fundamental degradation`);
  }

  fundScore = Math.max(-100, Math.min(100, fundScore));

  // 3. Institutional Flow & Dark Pool Pillar (-100 to +100)
  let flowScore = 0;
  const flowSignals: string[] = [];

  const bullishFlow = flow.filter(f => f.sentiment === 'BULLISH');
  const bearishFlow = flow.filter(f => f.sentiment === 'BEARISH');
  const totalFlowVol = flow.reduce((acc, f) => acc + f.notionalValue, 0) || 1;
  const bullishVol = bullishFlow.reduce((acc, f) => acc + f.notionalValue, 0);
  const bearishVol = bearishFlow.reduce((acc, f) => acc + f.notionalValue, 0);

  const netFlowRatio = (bullishVol - bearishVol) / totalFlowVol;
  flowScore = Math.round(netFlowRatio * 80);

  const blockCount = flow.filter(f => f.notionalValue > 5000000).length;
  if (blockCount > 0) {
    flowSignals.push(`${blockCount} Block Prints > $5.0M detected in recent tape`);
  }
  if (netFlowRatio > 0.3) {
    flowScore += 20;
    flowSignals.push(`Strong Institutional Net Inflow ($${(bullishVol / 1e6).toFixed(1)}M Bullish vs $${(bearishVol / 1e6).toFixed(1)}M Bearish)`);
  } else if (netFlowRatio < -0.3) {
    flowScore -= 20;
    flowSignals.push(`Institutional Distribution Pressure ($${(bearishVol / 1e6).toFixed(1)}M Bearish vs $${(bullishVol / 1e6).toFixed(1)}M Bullish)`);
  } else {
    flowSignals.push(`Balanced institutional order routing`);
  }

  flowScore = Math.max(-100, Math.min(100, flowScore));

  // 4. Political & SEC Insider Trading Pillar (-100 to +100)
  let insiderScore = 0;
  const insiderSignals: string[] = [];

  if (!hasInsiderData || politicalInsider.length === 0) {
    insiderScore = 0;
    insiderSignals.push("[NO CONFIRMED DATA AVAILABLE] - Zero recent SEC Form 4 or Congressional disclosures within window");
  } else {
    let buyVol = 0;
    let sellVol = 0;
    let avgLag = 0;

    politicalInsider.forEach(trade => {
      avgLag += trade.disclosureLagDays;
      if (trade.transactionType === 'BUY') buyVol += trade.estimatedAmount;
      else if (trade.transactionType === 'SELL') sellVol += trade.estimatedAmount;
    });
    avgLag = avgLag / politicalInsider.length;

    if (buyVol > sellVol * 1.5) {
      insiderScore = 70;
      insiderSignals.push(`Net Insider/Political Accumulation ($${(buyVol / 1e3).toFixed(0)}k Buys vs $${(sellVol / 1e3).toFixed(0)}k Sells)`);
    } else if (sellVol > buyVol * 2.0) {
      insiderScore = -50;
      insiderSignals.push(`Executive / Congressional Net Selling ($${(sellVol / 1e3).toFixed(0)}k Sells)`);
    } else {
      insiderScore = 10;
      insiderSignals.push(`Mixed insider activity across Capitol Hill & C-Suite`);
    }

    if (avgLag > 30) {
      insiderSignals.push(`Average disclosure lag is elevated at ${Math.round(avgLag)} days`);
    } else {
      insiderSignals.push(`Timely disclosure filing cadence (~${Math.round(avgLag)} days lag)`);
    }
  }

  // 5. Weight Calculation (Handling edge cases & dynamic reweighting)
  let wTech = 0.35;
  let wFund = 0.25;
  let wFlow = 0.25;
  let wInsider = 0.15;
  const isAdjustedWeight = !hasInsiderData || politicalInsider.length === 0;

  if (isAdjustedWeight) {
    // Redistribute the 15% insider weight proportionally without hallucinating
    wTech = 0.40;
    wFund = 0.30;
    wFlow = 0.30;
    wInsider = 0.00;
  }

  const totalScore = Math.round(
    techScore * wTech +
    fundScore * wFund +
    flowScore * wFlow +
    insiderScore * wInsider
  );

  let regime: ConfluenceScoreResult['regime'] = 'NEUTRAL';
  let convictionLevel: ConfluenceScoreResult['convictionLevel'] = 'MEDIUM_CONVICTION';

  if (totalScore >= 50) {
    regime = 'STRONG_BULLISH';
    convictionLevel = 'HIGH_CONVICTION';
  } else if (totalScore >= 20) {
    regime = 'MODERATE_BULLISH';
    convictionLevel = 'MEDIUM_CONVICTION';
  } else if (totalScore <= -50) {
    regime = 'STRONG_BEARISH';
    convictionLevel = 'HIGH_CONVICTION';
  } else if (totalScore <= -20) {
    regime = 'MODERATE_BEARISH';
    convictionLevel = 'MEDIUM_CONVICTION';
  } else {
    regime = 'NEUTRAL';
    convictionLevel = 'SPECULATIVE';
  }

  const getStatus = (sc: number): ConfluencePillar['status'] => {
    if (sc >= 50) return 'STRONG_BULL';
    if (sc >= 15) return 'BULLISH';
    if (sc <= -50) return 'STRONG_BEAR';
    if (sc <= -15) return 'BEARISH';
    return 'NEUTRAL';
  };

  return {
    totalScore,
    regime,
    convictionLevel,
    isAdjustedWeight,
    pillars: {
      technical: {
        name: 'Technical & Multi-Timeframe Trend',
        score: techScore,
        weight: 0.35,
        effectiveWeight: wTech,
        contribution: Math.round(techScore * wTech),
        status: getStatus(techScore),
        keySignals: techSignals,
      },
      fundamental: {
        name: 'Fundamental Health & Valuation',
        score: fundScore,
        weight: 0.25,
        effectiveWeight: wFund,
        contribution: Math.round(fundScore * wFund),
        status: getStatus(fundScore),
        keySignals: fundSignals,
      },
      institutionalFlow: {
        name: 'Institutional Order Flow & Block Trades',
        score: flowScore,
        weight: 0.25,
        effectiveWeight: wFlow,
        contribution: Math.round(flowScore * wFlow),
        status: getStatus(flowScore),
        keySignals: flowSignals,
      },
      politicalInsider: {
        name: 'SEC Form 4 & Congressional Filings',
        score: isAdjustedWeight ? 0 : insiderScore,
        weight: 0.15,
        effectiveWeight: wInsider,
        contribution: Math.round((isAdjustedWeight ? 0 : insiderScore) * wInsider),
        status: isAdjustedWeight ? 'NO_DATA' : getStatus(insiderScore),
        keySignals: insiderSignals,
      },
    },
  };
}

/**
 * Calculates Asymmetric Trade Scenarios (Bullish and Bearish setups)
 */
export function calculateTradeSetups(currentPrice: number, atr: number, keyLevels: { support1: number; support2: number; resistance1: number; resistance2: number }): { bullish: TradeSetup; bearish: TradeSetup } {
  // Long Setup (Entry at pullbacks to support or momentum break)
  const longEntryMin = Math.round((currentPrice - 0.5 * atr) * 100) / 100;
  const longEntryMax = Math.round(currentPrice * 100) / 100;
  const longIdealEntry = Math.round(((longEntryMin + longEntryMax) / 2) * 100) / 100;
  const longSL = Math.round(Math.min(keyLevels.support1, longIdealEntry - 1.5 * atr) * 100) / 100;
  const longRisk = longIdealEntry - longSL;
  const longT1 = Math.round((longIdealEntry + 2.0 * longRisk) * 100) / 100;
  const longT2 = Math.round((longIdealEntry + 3.5 * longRisk) * 100) / 100;

  const bullishSetup: TradeSetup = {
    direction: 'LONG',
    rationale: 'Trend Continuation on EMA20/VWAP confluence with institutional accumulation backdrop.',
    entryZone: { min: longEntryMin, max: longEntryMax },
    idealEntry: longIdealEntry,
    stopLoss: longSL,
    invalidationTrigger: `4-Hour Close below $${longSL.toFixed(2)} invalidates bullish microstructure`,
    target1: Math.max(longT1, keyLevels.resistance1),
    target2: Math.max(longT2, keyLevels.resistance2),
    riskRewardRatioT1: Math.round(((Math.max(longT1, keyLevels.resistance1) - longIdealEntry) / (longRisk || 1)) * 10) / 10,
    riskRewardRatioT2: Math.round(((Math.max(longT2, keyLevels.resistance2) - longIdealEntry) / (longRisk || 1)) * 10) / 10,
    riskPercentage: Math.round(((longRisk / longIdealEntry) * 100) * 10) / 10,
    catalysts: [
      'Institutional block print volume absorption',
      'Supertrend trailing support hold',
      'Upcoming quarterly earnings momentum'
    ]
  };

  // Short Setup (Hedge / Tactical Short)
  const shortEntryMin = Math.round(currentPrice * 100) / 100;
  const shortEntryMax = Math.round((currentPrice + 0.6 * atr) * 100) / 100;
  const shortIdealEntry = Math.round(((shortEntryMin + shortEntryMax) / 2) * 100) / 100;
  const shortSL = Math.round(Math.max(keyLevels.resistance1, shortIdealEntry + 1.5 * atr) * 100) / 100;
  const shortRisk = shortSL - shortIdealEntry;
  const shortT1 = Math.round((shortIdealEntry - 2.0 * shortRisk) * 100) / 100;
  const shortT2 = Math.round((shortIdealEntry - 3.5 * shortRisk) * 100) / 100;

  const bearishSetup: TradeSetup = {
    direction: 'SHORT',
    rationale: 'Mean-reversion short on overbought exhaustion or breakdown of primary momentum trendline.',
    entryZone: { min: shortEntryMin, max: shortEntryMax },
    idealEntry: shortIdealEntry,
    stopLoss: shortSL,
    invalidationTrigger: `Daily candle close breaking above $${shortSL.toFixed(2)} forces short covering`,
    target1: Math.min(shortT1, keyLevels.support1),
    target2: Math.min(shortT2, keyLevels.support2),
    riskRewardRatioT1: Math.round(((shortIdealEntry - Math.min(shortT1, keyLevels.support1)) / (shortRisk || 1)) * 10) / 10,
    riskRewardRatioT2: Math.round(((shortIdealEntry - Math.min(shortT2, keyLevels.support2)) / (shortRisk || 1)) * 10) / 10,
    riskPercentage: Math.round(((shortRisk / shortIdealEntry) * 100) * 10) / 10,
    catalysts: [
      'RSI bearish divergence on higher timeframes',
      'Macro rate volatility or multiple compression',
      'Dark pool distribution volume prints'
    ]
  };

  return { bullish: bullishSetup, bearish: bearishSetup };
}
