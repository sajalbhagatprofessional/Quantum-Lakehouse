import React, { useState } from 'react';
import {
  Database,
  Terminal,
  Play,
  Layers,
  Table,
  CheckCircle2,
  Cpu,
  Clock,
  Zap,
  Activity,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { LakehouseTableSchema } from '../types';
import { LAKEHOUSE_SCHEMAS } from '../data/mockMarketData';

export const LakehouseView: React.FC = () => {
  const [selectedSchema, setSelectedSchema] = useState<LakehouseTableSchema>(LAKEHOUSE_SCHEMAS[0]);
  const [customSql, setCustomSql] = useState<string>(LAKEHOUSE_SCHEMAS[0].sampleQuery);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [copiedQuery, setCopiedQuery] = useState(false);

  const handleSelectTable = (schema: LakehouseTableSchema) => {
    setSelectedSchema(schema);
    setCustomSql(schema.sampleQuery);
  };

  const handleExecuteQuery = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: customSql, table: selectedSchema.tableName }),
      });
      const data = await res.json();
      setQueryResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(customSql);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  return (
    <div className="space-y-6 text-slate-100 font-mono">
      
      {/* 1. Lakehouse Architecture Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Medallion Lakehouse Storage Architecture</h1>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
            DuckDB / Delta Lake Engine
          </span>
        </div>

        {/* 3-Tier Layer Pipeline Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
          
          {/* Bronze Layer */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 font-mono text-sm uppercase">1. Bronze Layer (Raw)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">INGESTION</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              High-frequency tick data, WebSocket order book quotes, and NBBO bid/ask spreads streamed via rate-limited asynchronous token-bucket handlers.
            </p>
            <div className="pt-2 font-mono text-[11px] text-slate-300 border-t border-slate-800/80">
              Table: <span className="text-amber-300 font-bold">raw_market_ticks</span>
            </div>
          </div>

          {/* Silver Layer */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400 font-mono text-sm uppercase">2. Silver Layer (Clean)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">STANDARDIZED</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Deduplicated balance sheets, institutional Dark Pool prints, volume anomaly detection (&gt;2.0σ), and validated SEC Form 4 / Congressional filings.
            </p>
            <div className="pt-2 font-mono text-[11px] text-slate-300 border-t border-slate-800/80">
              Tables: <span className="text-blue-300 font-bold">fundamentals, flow, insider_trades</span>
            </div>
          </div>

          {/* Gold Layer */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 font-mono text-sm uppercase">3. Gold Layer (Signals)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">ANALYTICS READY</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Materialized confluence signal matrices (-100 to +100), automated weight reallocation views, and asymmetric quantitative risk/reward setups.
            </p>
            <div className="pt-2 font-mono text-[11px] text-slate-300 border-t border-slate-800/80">
              View: <span className="text-emerald-300 font-bold">confluence_signals</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Interactive Schema Explorer & SQL Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Schema Selector */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Table className="w-4 h-4 text-blue-400" />
            <span>Lakehouse Tables & DDL Schemas</span>
          </div>

          <div className="space-y-2">
            {LAKEHOUSE_SCHEMAS.map((sch) => (
              <button
                key={sch.tableName}
                onClick={() => handleSelectTable(sch)}
                className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                  selectedSchema.tableName === sch.tableName
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-200">{sch.tableName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    sch.layer === 'BRONZE' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    sch.layer === 'SILVER' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {sch.layer}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans line-clamp-2">{sch.description}</p>
                <span className="text-[10px] text-slate-500 block mt-1">Partition: {sch.partitionKey}</span>
              </button>
            ))}
          </div>

          {/* Column Definitions of Selected Table */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-300 uppercase block mb-2">Column Data Contract:</span>
            <div className="max-h-48 overflow-y-auto space-y-1 text-[11px] pr-1">
              {selectedSchema.columns.map((col) => (
                <div key={col.name} className="flex items-center justify-between bg-slate-950/70 p-1.5 rounded border border-slate-800/60">
                  <span className="text-white font-semibold flex items-center gap-1">
                    {col.name}
                    {col.isKey && <span className="text-[9px] text-amber-400">PK</span>}
                  </span>
                  <span className="text-cyan-400 text-[10px]">{col.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: SQL Query Runner & Results Grid */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-200">Interactive DuckDB SQL Console</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-all"
              >
                {copiedQuery ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedQuery ? 'Copied' : 'Copy SQL'}</span>
              </button>

              <button
                onClick={handleExecuteQuery}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/40 transition-all disabled:opacity-50"
              >
                {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>Run Lakehouse Query</span>
              </button>
            </div>
          </div>

          {/* SQL Editor Area */}
          <div className="relative">
            <textarea
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              rows={6}
              className="w-full bg-slate-950 text-slate-200 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 text-xs font-mono resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Query Results / Output Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider">Query Output</span>
              {queryResult && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {queryResult.rowCount} rows returned in {queryResult.executionTimeMs}ms
                </span>
              )}
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-h-40 max-h-64 overflow-auto">
              {!queryResult ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-xs space-y-1">
                  <Play className="w-5 h-5 text-slate-600 mb-1" />
                  <span>Click "Run Lakehouse Query" to execute the SQL statement against the in-memory engine.</span>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      {queryResult.columns.map((col: string) => (
                        <th key={col} className="p-2 font-bold whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {queryResult.rows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                        {queryResult.columns.map((col: string) => (
                          <td key={col} className="p-2 text-slate-200 whitespace-nowrap">
                            {typeof row[col] === 'boolean' ? (row[col] ? 'TRUE' : 'FALSE') : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
