import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Upload,
  Cpu,
  Database,
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  Eye,
  Info,
  Clock,
  Calendar,
  Layers,
  Award,
  Zap,
  BookOpen,
  Filter,
  Check,
  Plus,
  Trash2,
  Flame,
  ExternalLink,
  ChevronRight,
  Search,
  Activity,
  BarChart3,
  Server
} from 'lucide-react';
import {
  TickerMarketData,
  AISettingsConfig,
  NewsArticle,
  UploadedNewspaperDocument,
  AgentSkill,
  TruthAndBiasAnalysisResult,
  InfrastructureRecommendation
} from '../types';

interface NewsAndFundamentalAnalysisViewProps {
  currentTickerData: TickerMarketData;
  aiSettings: AISettingsConfig;
  onOpenAiSettings: () => void;
  onSelectTicker: (ticker: string) => void;
  onNavigateToTrading?: () => void;
}

export const NewsAndFundamentalAnalysisView: React.FC<NewsAndFundamentalAnalysisViewProps> = ({
  currentTickerData,
  aiSettings,
  onOpenAiSettings,
  onSelectTicker,
  onNavigateToTrading
}) => {
  // Navigation sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'analysis' | 'news_feed' | 'newspaper_vault' | 'agent_skills' | 'infrastructure'>('analysis');

  // Core Data States
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newspaperDocs, setNewspaperDocs] = useState<UploadedNewspaperDocument[]>([]);
  const [agentSkills, setAgentSkills] = useState<AgentSkill[]>([]);
  const [infrastructureRecs, setInfrastructureRecs] = useState<InfrastructureRecommendation[]>([]);
  const [analysisResult, setAnalysisResult] = useState<TruthAndBiasAnalysisResult | null>(null);

  // Loading & Processing States
  const [isLoadingNews, setIsLoadingNews] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);
  const [isUploadingSkill, setIsUploadingSkill] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; isError?: boolean } | null>(null);

  // Selected filters & states
  const [newsFilterSource, setNewsFilterSource] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDocPreview, setSelectedDocPreview] = useState<UploadedNewspaperDocument | null>(null);

  // Upload Document Modal State
  const [showUploadDocModal, setShowUploadDocModal] = useState<boolean>(false);
  const [docUploadPublication, setDocUploadPublication] = useState<string>('Financial Times');
  const [docUploadDate, setDocUploadDate] = useState<string>('2026-09-01');
  const [docUploadFileName, setDocUploadFileName] = useState<string>('');
  const [docUploadContent, setDocUploadContent] = useState<string>('');

  // Upload Skill Modal State
  const [showUploadSkillModal, setShowUploadSkillModal] = useState<boolean>(false);
  const [skillName, setSkillName] = useState<string>('');
  const [skillCategory, setSkillCategory] = useState<'FUNDAMENTAL_VALUATION' | 'FORENSIC_ACCOUNTING' | 'MACRO_REGIME' | 'BIAS_DETECTOR' | 'OPTIONS_ORDER_FLOW' | 'TECHNICAL_EXECUTION' | 'CUSTOM'>('FUNDAMENTAL_VALUATION');
  const [skillDescription, setSkillDescription] = useState<string>('');
  const [skillPrompt, setSkillPrompt] = useState<string>('');
  const [skillTags, setSkillTags] = useState<string>('Fundamental, Forensic, Anti-Bias');

  // Real-time temporal clock
  const [currentDateTime, setCurrentDateTime] = useState<string>(new Date().toLocaleString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Flash message
  const showToast = (message: string, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch initial news, documents, skills, and infrastructure
  const fetchAllData = async () => {
    try {
      setIsLoadingNews(true);
      const [newsRes, docsRes, skillsRes, infraRes] = await Promise.all([
        fetch(`/api/news/${currentTickerData.ticker}`).then(r => r.json()),
        fetch('/api/documents/newspapers').then(r => r.json()),
        fetch('/api/skills').then(r => r.json()),
        fetch('/api/infrastructure/recommendations').then(r => r.json())
      ]);

      if (newsRes.success && newsRes.articles) {
        setNewsArticles(newsRes.articles);
      }
      if (docsRes.success && docsRes.documents) {
        setNewspaperDocs(docsRes.documents);
      }
      if (skillsRes.success && skillsRes.skills) {
        setAgentSkills(skillsRes.skills);
      }
      if (infraRes.success && infraRes.recommendations) {
        setInfrastructureRecs(infraRes.recommendations);
      }
    } catch (e: any) {
      console.error('Error loading news & skills data:', e);
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentTickerData.ticker]);

  // Run AI Fundamental Truth & Bias Analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const activeSkillIds = agentSkills.filter(s => s.isEnabled).map(s => s.id);
      const res = await fetch('/api/news/analyze-fundamental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: currentTickerData.ticker,
          fundamentalMetrics: currentTickerData.fundamentalMetrics,
          newsArticles,
          activeSkillIds,
          currentPrice: currentTickerData.currentPrice,
          priceChangePct: currentTickerData.priceChangePct,
          settings: aiSettings
        })
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
        showToast(`Fundamental Truth & Bias Analysis compiled via ${data.source}.`);
      } else {
        showToast(data.error || 'Failed to complete analysis.', true);
      }
    } catch (e: any) {
      showToast('Analysis error: ' + e.message, true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-run analysis on first load if not analyzed
  useEffect(() => {
    if (!analysisResult && !isAnalyzing) {
      handleRunAnalysis();
    }
  }, [currentTickerData.ticker]);

  // Toggle Skill Enabled/Disabled
  const handleToggleSkill = async (id: string) => {
    try {
      const res = await fetch(`/api/skills/${id}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.skills) {
        setAgentSkills(data.skills);
        showToast(data.message);
      }
    } catch (e: any) {
      showToast('Failed to toggle skill: ' + e.message, true);
    }
  };

  // Delete Custom Skill
  const handleDeleteSkill = async (id: string) => {
    try {
      const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && data.skills) {
        setAgentSkills(data.skills);
        showToast(data.message);
      } else {
        showToast(data.error || 'Cannot delete skill.', true);
      }
    } catch (e: any) {
      showToast('Error deleting skill: ' + e.message, true);
    }
  };

  // Upload Custom Skill
  const handleUploadSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim() || !skillPrompt.trim()) {
      showToast('Please provide a skill name and prompt instructions.', true);
      return;
    }

    setIsUploadingSkill(true);
    try {
      const res = await fetch('/api/skills/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: skillName,
          category: skillCategory,
          description: skillDescription,
          systemPromptGuidelines: skillPrompt,
          tags: skillTags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      const data = await res.json();
      if (data.success && data.skills) {
        setAgentSkills(data.skills);
        setShowUploadSkillModal(false);
        setSkillName('');
        setSkillPrompt('');
        setSkillDescription('');
        showToast(`Skill "${data.skill.name}" successfully integrated into agent reasoning loop.`);
      } else {
        showToast(data.error || 'Skill upload failed.', true);
      }
    } catch (e: any) {
      showToast('Upload error: ' + e.message, true);
    } finally {
      setIsUploadingSkill(false);
    }
  };

  // Upload Newspaper Document
  const handleUploadDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUploadFileName.trim() || !docUploadContent.trim()) {
      showToast('Please provide a document title/file name and content.', true);
      return;
    }

    setIsUploadingDoc(true);
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: docUploadFileName,
          publicationName: docUploadPublication,
          issueDate: docUploadDate,
          fileContent: docUploadContent,
          fileType: 'PDF / Text Transcript'
        })
      });

      const data = await res.json();
      if (data.success && data.documents) {
        setNewspaperDocs(data.documents);
        setShowUploadDocModal(false);
        setDocUploadFileName('');
        setDocUploadContent('');
        showToast(`Document "${data.document.fileName}" ingested & cross-validated in Lakehouse Vault.`);
      } else {
        showToast(data.error || 'Document upload failed.', true);
      }
    } catch (e: any) {
      showToast('Upload error: ' + e.message, true);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Toggle Infrastructure Resource Link
  const handleToggleInfraLink = async (category: string) => {
    try {
      const res = await fetch(`/api/infrastructure/toggle-link/${category}`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.recommendations) {
        setInfrastructureRecs(data.recommendations);
        showToast(data.message);
      }
    } catch (e: any) {
      showToast('Error toggling resource: ' + e.message, true);
    }
  };

  // Filtered news items
  const filteredNews = newsArticles.filter(n => {
    const matchesSource = newsFilterSource === 'ALL' || n.sourceType === newsFilterSource;
    const matchesSearch = !searchQuery.trim() || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Flash Notification Toast */}
      {notification && (
        <div className={`px-4 py-3 rounded-xl border flex items-center justify-between text-sm shadow-xl font-mono ${
          notification.isError
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {notification.isError ? <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs opacity-75 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Main Header & Temporal Context Hub */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Header Identity */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/30">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white font-mono">FINANCIAL NEWS & AI FUNDAMENTAL TRUTH ENGINE</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  ANTI-BIAS SIEVE ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Target Asset: <span className="text-cyan-300 font-bold">{currentTickerData.ticker}</span> (${currentTickerData.currentPrice}) • Critical Multi-Source Forensic Triangulation
              </p>
            </div>
          </div>

          {/* Temporal Clock & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* System Temporal Awareness Badge */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span>{currentDateTime}</span>
            </div>

            {/* Run Analysis Button */}
            <button
              id="btn-run-fundamental-truth-audit"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Auditing Truth & Biases...' : 'Run Forensic Truth Audit'}</span>
            </button>

            {/* AI Model Config */}
            <button
              onClick={onOpenAiSettings}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>AI Provider ({aiSettings.provider})</span>
            </button>
          </div>
        </div>

        {/* Active Applied Frameworks Sub-Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong className="text-purple-300">Active Skill Injection ({agentSkills.filter(s => s.isEnabled).length} Enabled):</strong>{' '}
              {agentSkills.filter(s => s.isEnabled).map(s => s.name.split(' ')[0]).join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">
              Vault Documents: <strong className="text-slate-200">{newspaperDocs.length} Subscriptions Loaded</strong>
            </span>
            <button
              onClick={() => setShowUploadDocModal(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3 h-3" />
              <span>Upload Newspaper</span>
            </button>
            <button
              onClick={() => setShowUploadSkillModal(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-purple-300 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Upload Custom Skill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          
          <button
            onClick={() => setActiveSubTab('analysis')}
            className={`px-4 py-2.5 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'analysis'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>AI Fundamental Truth & Bias Audit</span>
          </button>

          <button
            onClick={() => setActiveSubTab('news_feed')}
            className={`px-4 py-2.5 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'news_feed'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Curated Financial News Stream ({newsArticles.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('newspaper_vault')}
            className={`px-4 py-2.5 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'newspaper_vault'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Premium Newspaper Vault ({newspaperDocs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('agent_skills')}
            className={`px-4 py-2.5 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'agent_skills'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Agent Skills Marketplace ({agentSkills.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('infrastructure')}
            className={`px-4 py-2.5 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'infrastructure'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Data Warehouse & Infra Advisor</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: AI Fundamental Truth & Bias Analysis */}
      {activeSubTab === 'analysis' && analysisResult && (
        <div className="space-y-6">

          {/* Top Scorecard & Divergence Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Overall Truth & Fact Score */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Forensic Truth & Veracity Score</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold font-mono text-cyan-400">{analysisResult.overallTruthScore}</span>
                <span className="text-sm font-mono text-slate-400">/ 100</span>
              </div>
              <div className="mt-2 text-xs font-mono text-slate-300">
                Noise-to-Signal Ratio: <strong className="text-purple-300">{analysisResult.noiseVsSignalRatio}</strong>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-mono">
                Calculated by cross-checking media claims against SEC 10-Q/10-K filings, Free Cash Flow, and Piotroski F strength.
              </p>
            </div>

            {/* Media Sentiment vs Hard Fundamentals Divergence */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Media Sentiment vs Balance Sheet Reality</span>
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                  analysisResult.mediaSentimentVsHardFundamentalsDivergence.divergenceType === 'FUNDAMENTALLY_ALIGNED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {analysisResult.mediaSentimentVsHardFundamentalsDivergence.divergenceType.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-2.5">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Media Headline Tone:</span>
                  <span className={`font-bold ${analysisResult.mediaSentimentVsHardFundamentalsDivergence.headlineSentiment === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {analysisResult.mediaSentimentVsHardFundamentalsDivergence.headlineSentiment}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Audited Balance Sheet Reality:</span>
                  <span className="font-bold text-cyan-300">
                    {analysisResult.mediaSentimentVsHardFundamentalsDivergence.hardFundamentalsVerdict}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                {analysisResult.mediaSentimentVsHardFundamentalsDivergence.divergenceExplanation}
              </p>
            </div>
          </div>

          {/* Hard Data Corroboration Ledger */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>HARD FUNDAMENTAL DATA CORROBORATION (SEC FILING AUDIT)</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Media / Qualitative Claim</th>
                    <th className="py-3 px-4">Verified Against Official Lakehouse Source</th>
                    <th className="py-3 px-4">Audit Status</th>
                    <th className="py-3 px-4">Forensic Verification Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {analysisResult.hardDataCorroboration.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-100">{row.factClaim}</td>
                      <td className="py-3 px-4 text-cyan-400">{row.verifiedAgainst}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          row.status === 'VERIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : row.status === 'DISPROVEN'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px]">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Biases & Track Record & Devil's Advocate Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Identified Critical Biases */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>IDENTIFIED SOURCE BIASES & VESTED INTEREST RISKS</span>
              </h3>
              <div className="space-y-3">
                {analysisResult.criticalBiasesIdentified.map((bias, i) => (
                  <div key={i} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="font-bold text-slate-200">{bias.source}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {bias.biasType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono leading-relaxed mt-1">
                      {bias.vestedInterestRisk}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Devil's Advocate Counter-Thesis */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />

              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 mb-2 text-rose-300">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>DEVIL'S ADVOCATE COUNTER-THESIS & FAILURE MODES</span>
              </h3>
              
              <div className="bg-slate-950/80 border border-rose-500/20 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed space-y-2.5">
                <p>{analysisResult.devilsAdvocateCounterThesis}</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <strong className="text-slate-300">Institutional Consensus Check:</strong> {analysisResult.expertConsensusCheck}
                </div>
              </div>
            </div>
          </div>

          {/* Synthesized Action Recommendation & Robinhood Bridge */}
          <div className="bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold block">
                  SYNTHESIZED ACTION VERDICT (DATE & TIME AWARE)
                </span>
                <h3 className="text-lg font-bold text-white font-mono mt-0.5 flex items-center gap-2">
                  <span>{analysisResult.finalSynthesizedRecommendation.actionVerdict.replace(/_/g, ' ')}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    {analysisResult.finalSynthesizedRecommendation.confidenceLevelPct}% Confidence
                  </span>
                </h3>
              </div>

              {onNavigateToTrading && (
                <button
                  onClick={onNavigateToTrading}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  <span>Execute on Robinhood Console</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 text-xs font-mono">
                <span className="text-slate-500 text-[10px] block">Calculated Invalidation Level:</span>
                <span className="text-rose-400 font-bold text-sm">${analysisResult.finalSynthesizedRecommendation.invalidationPrice}</span>
              </div>
              <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 text-xs font-mono">
                <span className="text-slate-500 text-[10px] block">Intrinsic Value Target:</span>
                <span className="text-emerald-400 font-bold text-sm">${analysisResult.finalSynthesizedRecommendation.targetPrice}</span>
              </div>
              <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 text-xs font-mono">
                <span className="text-slate-500 text-[10px] block">Recommended Time Horizon:</span>
                <span className="text-cyan-300 font-bold text-sm">{analysisResult.finalSynthesizedRecommendation.recommendedTimeHorizon}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
              {analysisResult.finalSynthesizedRecommendation.reasoning}
            </p>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Curated Financial News Stream */}
      {activeSubTab === 'news_feed' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400">Filter Source:</span>
              {['ALL', 'FINANCIAL_TIMES', 'WSJ', 'BLOOMBERG', 'REUTERS', 'BARRONS', 'MAINSTREAM_MEDIA'].map((src) => (
                <button
                  key={src}
                  onClick={() => setNewsFilterSource(src)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    newsFilterSource === src
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {src.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search headlines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* News Feed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNews.map((article) => (
              <div
                key={article.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-lg flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                    <span className="font-bold text-cyan-400">{article.source}</span>
                    <span>{article.timeAgo}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white font-mono mb-2 leading-snug">{article.title}</h4>
                  <p className="text-xs text-slate-400 font-mono mb-3 line-clamp-3">{article.summary}</p>

                  {/* Fact-Check & Bias Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      Reliability: {article.sourceReliabilityScore}/10
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      article.factCheckVerdict === 'CORROBORATED_BY_SEC_FILINGS'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}>
                      {article.factCheckVerdict.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
                      {article.biasAssessment.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Key Takeaways */}
                  <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80 mb-3 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 block">KEY TAKEAWAYS:</span>
                    {article.keyTakeaways.map((takeaway, i) => (
                      <div key={i} className="text-[11px] font-mono text-slate-300 flex items-start gap-1.5">
                        <span className="text-cyan-400">•</span>
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className={`font-bold ${article.sentimentScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Sentiment: {article.sentimentScore > 0 ? '+' : ''}{article.sentimentScore.toFixed(2)}
                  </span>
                  <button
                    onClick={() => {
                      setActiveSubTab('analysis');
                      handleRunAnalysis();
                    }}
                    className="text-cyan-400 hover:text-cyan-200 flex items-center gap-1"
                  >
                    <span>Audit with AI</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Premium Newspaper Vault */}
      {activeSubTab === 'newspaper_vault' && (
        <div className="space-y-4">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>PREMIUM SUBSCRIBED FINANCIAL NEWSPAPER ARCHIVE</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Upload PDFs, TXTs, or Transcripts from your paid subscriptions (FT, WSJ, Barron's, Bloomberg). The AI extracts text, evaluates publisher bias, and cross-references data with the Lakehouse.
              </p>
            </div>

            <button
              onClick={() => setShowUploadDocModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-purple-950/40 transition-all shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Newspaper / PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newspaperDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                    <span className="font-bold text-purple-400">{doc.publicationName}</span>
                    <span>{doc.issueDate}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white font-mono mb-2">{doc.fileName}</h4>
                  <p className="text-xs text-slate-300 font-mono mb-3 line-clamp-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    "{doc.textSnippet}"
                  </p>

                  <div className="space-y-1.5 mb-3 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Credibility Rating:</span>
                      <strong className="text-cyan-400">{doc.sourceCredibilityRating} / 10</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Lakehouse Status:</span>
                      <span className="px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        {doc.analyzedStatus}
                      </span>
                    </div>
                  </div>

                  {/* Extracted Catalysts */}
                  <div className="space-y-1 bg-slate-950/60 rounded-lg p-2.5 border border-slate-800 text-[11px] font-mono mb-3">
                    <span className="text-slate-500 block text-[10px]">EXTRACTED CATALYSTS:</span>
                    {doc.extractedCatalysts.map((cat, i) => (
                      <div key={i} className="text-slate-300 flex items-start gap-1">
                        <span className="text-purple-400">▸</span>
                        <span>{cat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedDocPreview(doc)}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View Transcript</span>
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
                        const data = await res.json();
                        if (data.success && data.documents) {
                          setNewspaperDocs(data.documents);
                          showToast('Document removed from vault.');
                        }
                      } catch (e: any) {
                        showToast('Error removing doc: ' + e.message, true);
                      }
                    }}
                    className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Agent Skills Marketplace */}
      {activeSubTab === 'agent_skills' && (
        <div className="space-y-4">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>AI AGENT SKILLS & ANALYTICAL REASONING INJECTION</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Enable or upload modular analytical skills (Buffett Moat Analysis, Forensic Accounting, Media Bias Sieve, Macro Regimes). Active skills are directly injected into the AI decision prompts with full datetime and market context awareness.
              </p>
            </div>

            <button
              onClick={() => setShowUploadSkillModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Custom Skill</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentSkills.map((skill) => (
              <div
                key={skill.id}
                className={`bg-slate-900/90 border rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                  skill.isEnabled ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-slate-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                        {skill.category.replace(/_/g, ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-white font-mono mt-1.5">{skill.name}</h4>
                    </div>

                    <button
                      onClick={() => handleToggleSkill(skill.id)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all ${
                        skill.isEnabled
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {skill.isEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 font-mono mb-3">{skill.description}</p>

                  {/* System Prompt Guidelines Snippet */}
                  <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 text-[11px] font-mono text-slate-300 mb-3 space-y-1">
                    <span className="text-[10px] text-slate-500 block font-bold">INJECTED PROMPT GUIDELINES:</span>
                    <p className="line-clamp-4 whitespace-pre-line text-slate-400">{skill.systemPromptGuidelines}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {skill.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800/80 text-purple-300 text-[10px] font-mono border border-purple-800/30">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Author: {skill.author}</span>
                  {!skill.isDefault && (
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Data Warehouse & Infrastructure Advisor */}
      {activeSubTab === 'infrastructure' && (
        <div className="space-y-4">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Server className="w-5 h-5 text-amber-400" />
              <span>DATA WAREHOUSE & INFRASTRUCTURE ADVISORY FOR MAXIMUM EFFICIENCY</span>
            </h3>
            <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed">
              To operate at institutional scale with sub-millisecond execution and cost-effective multi-decade historical backtesting, here is the recommended external resource architecture:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infrastructureRecs.map((infra, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                      {infra.category.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => handleToggleInfraLink(infra.category)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all ${
                        infra.isLinked
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {infra.isLinked ? 'LINKED & SYNCED' : 'UNLINKED (LOCAL DUCKDB)'}
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-white font-mono mb-1.5">{infra.title}</h4>
                  <p className="text-xs text-slate-300 font-mono mb-3">{infra.recommendation}</p>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-emerald-400 font-bold block text-[11px]">Cost Efficiency:</span>
                      <span className="text-slate-300">{infra.costEfficiency}</span>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-cyan-400 font-bold block text-[11px]">Performance Benefit:</span>
                      <span className="text-slate-300">{infra.performanceBenefit}</span>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-purple-400 font-bold block text-[11px]">Implementation Guide:</span>
                      <span className="text-slate-400 text-[11px]">{infra.implementationGuide}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Newspaper Document Modal */}
      {showUploadDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span>Upload Premium Newspaper / PDF Transcript</span>
              </h3>
              <button onClick={() => setShowUploadDocModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUploadDocumentSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Publication Name</label>
                  <select
                    value={docUploadPublication}
                    onChange={(e) => setDocUploadPublication(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                  >
                    <option value="Financial Times">Financial Times</option>
                    <option value="The Wall Street Journal">The Wall Street Journal</option>
                    <option value="Barron's">Barron's</option>
                    <option value="Bloomberg Businessweek">Bloomberg Businessweek</option>
                    <option value="The Economist">The Economist</option>
                    <option value="Institutional Research Transcript">Institutional Research Transcript</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={docUploadDate}
                    onChange={(e) => setDocUploadDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Document File Name / Headline</label>
                <input
                  type="text"
                  placeholder="e.g. FT_Semiconductor_Supply_Chain_Special_Sep2026.pdf"
                  value={docUploadFileName}
                  onChange={(e) => setDocUploadFileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Document Content / Article Text (Pasted or Extracted)</label>
                <textarea
                  rows={6}
                  placeholder="Paste the full text or key article excerpt from your subscribed financial newspaper..."
                  value={docUploadContent}
                  onChange={(e) => setDocUploadContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadDocModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingDoc}
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingDoc ? 'Ingesting into Vault...' : 'Ingest Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Custom Skill Modal */}
      {showUploadSkillModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <span>Upload Custom Agent Analytical Skill</span>
              </h3>
              <button onClick={() => setShowUploadSkillModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUploadSkillSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Skill Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Asymmetric Biotech Catalyst & FDA Trial Auditing"
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={skillCategory}
                    onChange={(e: any) => setSkillCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                  >
                    <option value="FUNDAMENTAL_VALUATION">Fundamental Valuation</option>
                    <option value="FORENSIC_ACCOUNTING">Forensic Accounting</option>
                    <option value="MACRO_REGIME">Macro Regime</option>
                    <option value="BIAS_DETECTOR">Bias Detector</option>
                    <option value="OPTIONS_ORDER_FLOW">Options Order Flow</option>
                    <option value="TECHNICAL_EXECUTION">Technical Execution</option>
                    <option value="CUSTOM">Custom Skill</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. Scrutinizes Phase 3 trial sample size, placebo controls, and cash runway."
                  value={skillDescription}
                  onChange={(e) => setSkillDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">System Prompt Guidelines (Instructions for AI reasoning)</label>
                <textarea
                  rows={5}
                  placeholder="[SKILL: CUSTOM_FRAMEWORK]
1. Scrutinize X...
2. Verify Y against SEC filings...
3. Demand margin of safety Z..."
                  value={skillPrompt}
                  onChange={(e) => setSkillPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Biotech, FDA, Cash Runway, Catalyst"
                  value={skillTags}
                  onChange={(e) => setSkillTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadSkillModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingSkill}
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUploadingSkill ? 'Activating...' : 'Activate Skill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Full Transcript Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-3xl shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">{selectedDocPreview.publicationName} ({selectedDocPreview.issueDate})</span>
                <h3 className="text-base font-bold text-white font-mono">{selectedDocPreview.fileName}</h3>
              </div>
              <button onClick={() => setSelectedDocPreview(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 font-mono text-xs text-slate-300 pr-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed">
                {selectedDocPreview.fullContent || selectedDocPreview.textSnippet}
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-cyan-400 font-bold block text-[11px]">CROSS-VALIDATION WITH LAKEHOUSE:</span>
                <p className="text-slate-400">{selectedDocPreview.crossValidationSummary || 'Cross-validated against SEC EDGAR database with high confidence.'}</p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800 mt-4">
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-mono text-xs"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
