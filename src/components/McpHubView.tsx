import React, { useState } from 'react';
import {
  Server,
  Cpu,
  Terminal,
  Play,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  Sparkles,
  Zap,
  Code2,
  FileText,
  Shield,
  Activity,
  Sliders,
  ExternalLink,
  Download
} from 'lucide-react';
import { MCPServerConfig, MCPToolDefinition, AISettingsConfig } from '../types';

interface McpHubViewProps {
  mcpServers: MCPServerConfig[];
  aiSettings: AISettingsConfig;
  onOpenSettings: () => void;
  onExecuteMcpTool: (toolName: string, args: Record<string, any>) => Promise<any>;
  currentTicker: string;
}

export const McpHubView: React.FC<McpHubViewProps> = ({
  mcpServers,
  aiSettings,
  onOpenSettings,
  onExecuteMcpTool,
  currentTicker
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('lakehouse_query_sql');
  const [toolArgsJson, setToolArgsJson] = useState<string>(
    JSON.stringify({ query: `SELECT * FROM lakehouse.gold.confluence_signals WHERE ticker = '${currentTicker}'` }, null, 2)
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [copiedClaude, setCopiedClaude] = useState(false);
  const [copiedCursor, setCopiedCursor] = useState(false);

  const allTools: MCPToolDefinition[] = mcpServers.flatMap(s => s.tools);

  const handleToolSelect = (tool: MCPToolDefinition) => {
    setSelectedTool(tool.name);
    let sampleArgs: Record<string, any> = {};
    if (tool.name === 'lakehouse_query_sql') {
      sampleArgs = { query: `SELECT * FROM lakehouse.gold.confluence_signals WHERE ticker = '${currentTicker}'` };
    } else if (tool.name === 'get_ticker_confluence') {
      sampleArgs = { ticker: currentTicker };
    } else if (tool.name === 'fetch_live_quotes') {
      sampleArgs = { ticker: currentTicker };
    } else if (tool.name === 'get_darkpool_flow') {
      sampleArgs = { ticker: currentTicker, minNotional: 5000000 };
    } else if (tool.name === 'fetch_sec_disclosures') {
      sampleArgs = { ticker: currentTicker, maxLagDays: 30 };
    } else if (tool.name === 'calculate_risk_position') {
      sampleArgs = { portfolioSize: 100000, riskTolerancePct: 1.0, entryPrice: 128.45, stopLoss: 123.50 };
    }
    setToolArgsJson(JSON.stringify(sampleArgs, null, 2));
    setExecutionResult(null);
  };

  const handleRunTool = async () => {
    setIsExecuting(true);
    try {
      const parsed = JSON.parse(toolArgsJson);
      const res = await onExecuteMcpTool(selectedTool, parsed);
      setExecutionResult(res);
    } catch (err: any) {
      setExecutionResult({ error: err?.message || 'Invalid JSON input' });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyClaudeConfig = () => {
    const config = {
      mcpServers: {
        quantum_market_lakehouse: {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-fetch", `${window.location.origin}/api/mcp/tools`],
          env: {
            LAKEHOUSE_ENDPOINT: window.location.origin
          }
        }
      }
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedClaude(true);
    setTimeout(() => setCopiedClaude(false), 2000);
  };

  const copyCursorConfig = () => {
    const config = {
      mcpServers: {
        quantum_lakehouse: {
          url: `${window.location.origin}/api/mcp`,
          transport: "http"
        }
      }
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedCursor(true);
    setTimeout(() => setCopiedCursor(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-white tracking-tight">Model Context Protocol (MCP) Server Hub</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
                JSON-RPC 2.0 READY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Connect external AI clients (Claude Desktop, Cursor, Ollama, LM Studio, OpenRouter) directly into the DuckDB Medallion Lakehouse and Confluence Signal Engine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>AI & MCP Settings</span>
          </button>
        </div>
      </div>

      {/* Grid: Server Status & Quick Connect */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Active AI Provider Status */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">Active AI Model Provider</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono border border-blue-800">
              {aiSettings.provider.toUpperCase()}
            </span>
          </div>
          <div className="text-base font-bold text-white font-mono truncate">{aiSettings.model}</div>
          <p className="text-[11px] text-slate-400 font-mono truncate">Endpoint: {aiSettings.endpointUrl || 'Default'}</p>
        </div>

        {/* Total MCP Tools */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">Loaded MCP Tools</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
              READY
            </span>
          </div>
          <div className="text-base font-bold text-emerald-400 font-mono">{allTools.length} Standard Tools</div>
          <p className="text-[11px] text-slate-400">DuckDB Lakehouse, Confluence, SEC Filings, Flow</p>
        </div>

        {/* Server Latency */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">Internal MCP Transport</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800">
              HTTP / JSON-RPC
            </span>
          </div>
          <div className="text-base font-bold text-cyan-400 font-mono">0.8ms - 2.5ms</div>
          <p className="text-[11px] text-slate-400 font-mono">Endpoint: /api/mcp</p>
        </div>
      </div>

      {/* Main MCP Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Tools Explorer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Exposed MCP Tools ({allTools.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Click to test</span>
            </h3>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {allTools.map((tool) => {
                const isSelected = selectedTool === tool.name;
                return (
                  <button
                    key={tool.name}
                    type="button"
                    onClick={() => handleToolSelect(tool)}
                    className={`w-full p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white font-mono">{tool.name}()</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase">
                        {tool.category || 'lakehouse'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{tool.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export to External AI Clients */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              One-Click MCP Client Export
            </h3>
            <p className="text-xs text-slate-400">
              Copy ready-to-paste configurations to plug Claude Desktop or Cursor into this platform:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={copyClaudeConfig}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all"
              >
                {copiedClaude ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedClaude ? 'Copied Claude Config!' : 'Claude Desktop'}</span>
              </button>

              <button
                type="button"
                onClick={copyCursorConfig}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-all"
              >
                {copiedCursor ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCursor ? 'Copied Cursor Config!' : 'Cursor MCP'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Execution Bench */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-sm text-white font-mono">
                  MCP Tool Runner: <span className="text-blue-400">{selectedTool}()</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleRunTool}
                disabled={isExecuting}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all"
              >
                <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                <span>{isExecuting ? 'Invoking MCP Tool...' : 'Execute Tool Call'}</span>
              </button>
            </div>

            {/* Input Arguments */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-400 mb-1.5">
                JSON-RPC 2.0 Input Schema & Arguments:
              </label>
              <textarea
                rows={5}
                value={toolArgsJson}
                onChange={(e) => setToolArgsJson(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Output Display */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono font-medium text-slate-400">
                  Tool Response & Telemetry Output:
                </label>
                {executionResult?.executionTimeMs !== undefined && (
                  <span className="text-[10px] font-mono text-emerald-400">
                    Execution Time: {executionResult.executionTimeMs}ms
                  </span>
                )}
              </div>
              <div className="w-full min-h-[220px] max-h-[340px] overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200">
                {executionResult ? (
                  <pre className="text-emerald-300 leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(executionResult, null, 2)}
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12 space-y-2">
                    <Terminal className="w-8 h-8 opacity-40" />
                    <span className="text-xs">Click 'Execute Tool Call' to inspect real-time JSON-RPC 2.0 response.</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
