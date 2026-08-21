import React, { useState } from 'react';
import {
  X,
  Cpu,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Download,
  Copy,
  Check,
  Globe,
  Sliders,
  Sparkles,
  Layers,
  Key,
  Database,
  Code,
  Shield,
  Activity,
  Play
} from 'lucide-react';
import { AIProvider, AISettingsConfig, MCPServerConfig, MCPToolDefinition } from '../types';

interface InferenceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettingsConfig;
  onSaveSettings: (newSettings: AISettingsConfig) => void;
  mcpServers: MCPServerConfig[];
  onUpdateMcpServers: (servers: MCPServerConfig[]) => void;
  onExecuteMcpTool: (toolName: string, args: Record<string, any>) => Promise<any>;
}

const PROVIDER_OPTIONS: { id: AIProvider; name: string; tag: string; defaultModel: string; defaultEndpoint: string; isLocal: boolean; description: string }[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    tag: 'Cloud High-Speed',
    defaultModel: 'gemini-3.7-flash',
    defaultEndpoint: 'https://generativelanguage.googleapis.com',
    isLocal: false,
    description: 'Ultra-low latency multimodel synthesis with Gemini 3.7 Flash & 2.5 Pro.'
  },
  {
    id: 'ollama',
    name: 'Ollama (Local AI)',
    tag: 'Local Private',
    defaultModel: 'llama3.3:70b',
    defaultEndpoint: 'http://localhost:11434',
    isLocal: true,
    description: 'Run 100% private local LLMs on your machine with 0 token costs (DeepSeek-R1, Qwen2.5, Llama 3.3).'
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (Local AI)',
    tag: 'Local Private',
    defaultModel: 'meta-llama-3.1-8b-instruct',
    defaultEndpoint: 'http://localhost:1234',
    isLocal: true,
    description: 'Connect to LM Studio local inference server via standard OpenAI-compatible API.'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter API',
    tag: 'Cloud Universal Router',
    defaultModel: 'deepseek/deepseek-r1',
    defaultEndpoint: 'https://openrouter.ai/api/v1',
    isLocal: false,
    description: 'Access 200+ frontier models (DeepSeek-R1, Claude 3.5 Sonnet, Llama 3.3) through a single unified API.'
  },
  {
    id: 'openai',
    name: 'OpenAI Direct',
    tag: 'Cloud Direct',
    defaultModel: 'gpt-4o',
    defaultEndpoint: 'https://api.openai.com/v1',
    isLocal: false,
    description: 'Direct GPT-4o, GPT-4o-mini, and o3-mini reasoning models.'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Direct',
    tag: 'Cloud Direct',
    defaultModel: 'deepseek-chat',
    defaultEndpoint: 'https://api.deepseek.com',
    isLocal: false,
    description: 'Direct access to DeepSeek-V3 and DeepSeek-R1 reasoning models.'
  },
  {
    id: 'local_rule_engine',
    name: 'Quantitative Rule Engine',
    tag: '0-Latency Deterministic',
    defaultModel: 'deterministic-v2.4',
    defaultEndpoint: 'in-memory',
    isLocal: true,
    description: 'Mathematical rule-based heuristic synthesis. Always instant, zero API keys required.'
  }
];

export const InferenceSettingsModal: React.FC<InferenceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  mcpServers,
  onUpdateMcpServers,
  onExecuteMcpTool
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'mcp' | 'context'>('ai');
  const [localSettings, setLocalSettings] = useState<AISettingsConfig>(settings);
  
  // Connection Test State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  // MCP Tool Test Bench
  const [selectedMcpTool, setSelectedMcpTool] = useState<string>('lakehouse_query_sql');
  const [mcpToolArgJson, setMcpToolArgJson] = useState<string>('{\n  "query": "SELECT ticker, confluence_score, market_regime FROM lakehouse.gold.confluence_signals WHERE ticker = \'NVDA\'"\n}');
  const [mcpExecResult, setMcpExecResult] = useState<any | null>(null);
  const [isExecutingMcp, setIsExecutingMcp] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  // Sync state when opened
  React.useEffect(() => {
    setLocalSettings(settings);
    setTestResult(null);
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleProviderSelect = (providerId: AIProvider) => {
    const selected = PROVIDER_OPTIONS.find(p => p.id === providerId);
    if (!selected) return;

    setLocalSettings(prev => ({
      ...prev,
      provider: providerId,
      model: selected.defaultModel,
      endpointUrl: selected.defaultEndpoint
    }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: localSettings.provider,
          endpointUrl: localSettings.endpointUrl,
          apiKey: localSettings.apiKey,
          model: localSettings.model
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Network error while attempting to connect.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleRunMcpTool = async () => {
    setIsExecutingMcp(true);
    try {
      const parsedArgs = JSON.parse(mcpToolArgJson);
      const res = await onExecuteMcpTool(selectedMcpTool, parsedArgs);
      setMcpExecResult(res);
    } catch (err: any) {
      setMcpExecResult({ error: err?.message || 'Invalid JSON arguments' });
    } finally {
      setIsExecutingMcp(false);
    }
  };

  const copyClaudeConfig = () => {
    const config = {
      mcpServers: {
        quantum_market_lakehouse: {
          url: `${window.location.origin}/api/mcp`,
          transport: "http"
        }
      }
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                AI & Model Context Protocol (MCP) Hub
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400">Configure local AI (Ollama, LM Studio), cloud APIs (OpenRouter, Gemini), and MCP tool telemetry.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/30 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'ai'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>AI Model & Local Inference</span>
          </button>
          
          <button
            onClick={() => setActiveTab('mcp')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'mcp'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Model Context Protocol (MCP) Tools</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 font-mono border border-blue-800">
              {mcpServers.reduce((acc, s) => acc + s.tools.length, 0)} Tools
            </span>
          </button>

          <button
            onClick={() => setActiveTab('context')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'context'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Lakehouse Grounding Layers</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: AI MODELS & PROVIDERS */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Select Active AI Engine Provider
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {PROVIDER_OPTIONS.map((prov) => {
                    const isSelected = localSettings.provider === prov.id;
                    return (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => handleProviderSelect(prov.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white text-xs">{prov.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                              prov.isLocal 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {prov.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{prov.description}</p>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">
                          Default: <span className="text-slate-300">{prov.defaultModel}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Endpoint & Key Configuration */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h3 className="font-semibold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  Provider Parameters & Credentials
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Endpoint URL (for Ollama, LM Studio, or Custom Proxy) */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Endpoint / Host URL
                    </label>
                    <input
                      type="text"
                      value={localSettings.endpointUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, endpointUrl: e.target.value })}
                      placeholder="e.g. http://localhost:11434"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      {localSettings.provider === 'ollama' && "Default: http://localhost:11434 (Make sure 'ollama serve' is running)"}
                      {localSettings.provider === 'lmstudio' && "Default: http://localhost:1234 (Enable Local Server in LM Studio)"}
                      {localSettings.provider === 'openrouter' && "Default: https://openrouter.ai/api/v1"}
                      {localSettings.provider === 'gemini' && "Google Cloud GenAI Infrastructure"}
                    </p>
                  </div>

                  {/* Model Name */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Model Identifier
                    </label>
                    <input
                      type="text"
                      value={localSettings.model}
                      onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                      placeholder="e.g. llama3.3:70b, deepseek-r1:32b, gemini-3.7-flash"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Specify any model name or checkpoint recognized by your provider.</p>
                  </div>
                </div>

                {/* API Key Input (if not local rule engine or default gemini) */}
                {localSettings.provider !== 'local_rule_engine' && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
                      <span>API Key / Secret Token (Saved securely in browser session)</span>
                      {localSettings.provider === 'gemini' && (
                        <span className="text-[10px] text-slate-500 font-normal">Optional if set on server</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={localSettings.apiKey || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                        placeholder={
                          localSettings.provider === 'openrouter' ? 'sk-or-v1-...' :
                          localSettings.provider === 'openai' ? 'sk-proj-...' :
                          localSettings.provider === 'deepseek' ? 'sk-...' :
                          localSettings.provider === 'ollama' || localSettings.provider === 'lmstudio' ? 'Not required for local inference' :
                          'AI Studio Gemini API Key'
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                      <Key className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Temperature & Token Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Temperature (Strictness vs Creativity)</span>
                      <span className="font-mono text-white font-bold">{localSettings.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={localSettings.temperature}
                      onChange={(e) => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>0.0 (Deterministic)</span>
                      <span>0.2 (Quant Focus)</span>
                      <span>1.0 (Creative)</span>
                    </div>
                  </div>

                  {/* Test Connection Button */}
                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 font-semibold transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Testing Provider...' : 'Test Connection & Model'}</span>
                    </button>
                  </div>
                </div>

                {/* Test Result Banner */}
                {testResult && (
                  <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                    testResult.success 
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                      : 'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-xs">{testResult.message}</p>
                      {testResult.latencyMs !== undefined && (
                        <p className="text-[10px] font-mono opacity-80 mt-0.5">Latency: {testResult.latencyMs}ms</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MODEL CONTEXT PROTOCOL (MCP) */}
          {activeTab === 'mcp' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Model Context Protocol (MCP) Server Registry</h3>
                  <p className="text-slate-400 text-xs">Expose DuckDB lakehouse queries, real-time confluence scoring, and SEC disclosures to AI models.</p>
                </div>
                <button
                  type="button"
                  onClick={copyClaudeConfig}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 transition-all font-mono text-[11px]"
                >
                  {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedConfig ? 'Copied Claude Config!' : 'Export Claude Desktop Config'}</span>
                </button>
              </div>

              {/* MCP Servers List */}
              <div className="space-y-3">
                {mcpServers.map((server) => (
                  <div key={server.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-bold text-white text-xs">{server.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                          {server.type.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {server.tools.length} Tools Loaded ({server.latencyMs || 2}ms)
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{server.description}</p>
                    
                    {/* Available Tools Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-900">
                      {server.tools.map((tool) => (
                        <button
                          key={tool.name}
                          type="button"
                          onClick={() => {
                            setSelectedMcpTool(tool.name);
                            if (tool.name === 'lakehouse_query_sql') {
                              setMcpToolArgJson('{\n  "query": "SELECT ticker, confluence_score, market_regime FROM lakehouse.gold.confluence_signals WHERE ticker = \'NVDA\'"\n}');
                            } else if (tool.name === 'get_ticker_confluence') {
                              setMcpToolArgJson('{\n  "ticker": "NVDA"\n}');
                            } else if (tool.name === 'fetch_live_quotes') {
                              setMcpToolArgJson('{\n  "ticker": "NVDA"\n}');
                            } else if (tool.name === 'get_darkpool_flow') {
                              setMcpToolArgJson('{\n  "ticker": "NVDA",\n  "minNotional": 5000000\n}');
                            } else if (tool.name === 'fetch_sec_disclosures') {
                              setMcpToolArgJson('{\n  "ticker": "NVDA"\n}');
                            } else if (tool.name === 'calculate_risk_position') {
                              setMcpToolArgJson('{\n  "portfolioSize": 100000,\n  "riskTolerancePct": 1.0,\n  "entryPrice": 128.45,\n  "stopLoss": 123.50\n}');
                            }
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                            selectedMcpTool === tool.name
                              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {tool.name}()
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* MCP Tool Test Bench */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    Interactive MCP Tool Test Bench: <span className="text-blue-400">{selectedMcpTool}()</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleRunMcpTool}
                    disabled={isExecutingMcp}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all text-[11px]"
                  >
                    <Play className={`w-3 h-3 ${isExecutingMcp ? 'animate-spin' : ''}`} />
                    <span>{isExecutingMcp ? 'Executing Tool...' : 'Run Tool'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">
                      JSON-RPC 2.0 Input Arguments:
                    </label>
                    <textarea
                      rows={5}
                      value={mcpToolArgJson}
                      onChange={(e) => setMcpToolArgJson(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">
                      Tool Execution Telemetry & Result:
                    </label>
                    <div className="w-full h-[120px] overflow-y-auto bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono text-slate-300">
                      {mcpExecResult ? (
                        <pre className="text-[10px] text-emerald-300">{JSON.stringify(mcpExecResult, null, 2)}</pre>
                      ) : (
                        <span className="text-slate-500 italic">Click 'Run Tool' to inspect live JSON-RPC telemetry...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LAKEHOUSE GROUNDING LAYERS */}
          {activeTab === 'context' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-sm">Lakehouse Context Ingestion Controls</h3>
                <p className="text-slate-400 text-xs">Select which Medallion Lakehouse layers are automatically serialized and injected into the AI reasoning prompt.</p>
              </div>

              <div className="space-y-2.5">
                {[
                  { key: 'technicals', label: 'Technical Indicator Stack', desc: 'EMA 20/50/200, Supertrend ATR, RSI(14), MACD, and Bollinger Bands', badge: 'Silver Layer' },
                  { key: 'fundamentals', label: 'Corporate Fundamentals & Solvency', desc: 'P/E vs Sector Median, Piotroski F-Score (0-9), Altman Z-Score, and FCF Yield', badge: 'Silver Layer' },
                  { key: 'darkPoolFlow', label: 'Institutional Dark Pool Prints & Options Sweeps', desc: 'Volume anomaly prints > 2.0σ and aggressive sweep order blocks', badge: 'Silver Layer' },
                  { key: 'insiderFilings', label: 'SEC Form 4 & Congressional Disclosures', desc: 'C-Suite open market trades and Capitol Hill STOCK Act disclosures', badge: 'Silver Layer' },
                  { key: 'riskLevels', label: 'Mathematical Trade Setups & ATR Stops', desc: 'Exact long/short entry triggers, stop-loss invalidations, and multi-target profit ratios', badge: 'Gold Layer' },
                ].map((item) => {
                  const isChecked = (localSettings.injectedLakehouseLayers as any)[item.key];
                  return (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            setLocalSettings({
                              ...localSettings,
                              injectedLakehouseLayers: {
                                ...localSettings.injectedLakehouseLayers,
                                [item.key]: e.target.checked
                              }
                            });
                          }}
                          className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <span className="font-semibold text-white text-xs">{item.label}</span>
                          <p className="text-slate-400 text-[11px]">{item.desc}</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                        {item.badge}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400 text-xs font-mono">
              Provider: <strong className="text-white">{localSettings.provider.toUpperCase()}</strong> ({localSettings.model})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-900/30 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Apply & Save Settings</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
