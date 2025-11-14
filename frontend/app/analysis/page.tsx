'use client';

import React, { useState, useEffect } from 'react';
import { Dna, Microscope, Activity, Zap, Shield, Database, Cpu, Play, Pause, RotateCcw, Loader2, CheckCircle2, XCircle, History, TrendingUp, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { analyzeGeneEdits, getAnalysisHistory, getAnalysisDetail, type GeneAnalysisRequest, type GeneAnalysisResponse, type EditSuggestion, type AnalysisHistoryItem } from '@/lib/api';
import { getAuthToken } from '@/lib/api';
import { useRouter } from 'next/navigation';

const RealTimeDNAEditingWrapper = dynamic(
  () => import('@/components/animations/RealTimeDNAEditingWrapper').then(mod => ({ default: mod.RealTimeDNAEditingWrapper })),
  { ssr: false, loading: () => <div className="w-full h-full bg-secondary/10 animate-pulse rounded-lg flex items-center justify-center"><p className="text-text/50">Loading simulation...</p></div> }
);

const DNALab3D = () => {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Analysis form state
  const [dnaSequence, setDnaSequence] = useState('');
  const [targetTrait, setTargetTrait] = useState<'plant_height' | 'leaf_color' | 'flowering_time' | 'yield' | 'disease_resistance' | 'drought_tolerance' | 'custom'>('plant_height');
  const [targetRegion, setTargetRegion] = useState('');
  const [datasetName, setDatasetName] = useState<string>('maize'); // Default to maize
  const [maxSuggestions, setMaxSuggestions] = useState(5);
  const [minEfficiency, setMinEfficiency] = useState(50);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GeneAnalysisResponse | null>(null);
  
  // Available datasets (matching .bim files)
  const availableDatasets = [
    { value: 'maize', label: 'Maize (Corn)' },
    { value: 'rice', label: 'Rice' },
    { value: 'millet', label: 'Millet' },
    { value: 'chikpea', label: 'Chickpea' },
    { value: 'cotton', label: 'Cotton' },
  ];
  
  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(!!getAuthToken());
    if (!getAuthToken()) {
      router.push('/login');
    }
  }, [router]);

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleAnalyze = async () => {
    if (!dnaSequence.trim()) {
      setAnalysisError('Please enter a DNA sequence');
      return;
    }

    if (dnaSequence.length < 20) {
      setAnalysisError('DNA sequence must be at least 20 characters long');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setIsPlaying(false);
    setProgress(0);

    try {
      const request: GeneAnalysisRequest = {
        dna_sequence: dnaSequence.trim(),
        target_trait: targetTrait,
        target_region: targetRegion.trim() || undefined,
        dataset_name: datasetName, // Pass the selected dataset
        max_suggestions: maxSuggestions,
        min_efficiency: minEfficiency,
      };

      const result = await analyzeGeneEdits(request);
      setAnalysisResult(result);
      setActiveTab(0); // Reset to overview tab
      setProgress(0); // Reset progress
      setIsPlaying(false);
      
      // Refresh history after analysis
      if (showHistory) {
        loadHistory();
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      setAnalysisError(error.detail || error.message || 'Failed to analyze DNA sequence. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await getAnalysisHistory(20, 0);
      setHistoryItems(history.analyses);
    } catch (error: any) {
      console.error('Error loading history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewHistory = () => {
    if (!showHistory) {
      loadHistory();
    }
    setShowHistory(!showHistory);
  };

  const handleViewAnalysis = async (analysisId: string) => {
    try {
      const detail = await getAnalysisDetail(analysisId);
      setAnalysisResult(detail);
      setSelectedAnalysisId(analysisId);
      setShowHistory(false);
      setProgress(1);
      setIsPlaying(true);
      // Scroll to results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error loading analysis detail:', error);
      setAnalysisError(error.detail || 'Failed to load analysis details');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      {/* Animated background stars */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              backgroundColor: 'var(--primary)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-[var(--primary)]/30 bg-[var(--background)]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--primary)]/20 rounded-lg">
                <Dna className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--primary)]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-wide">DNA LAB</h1>
                <p className="text-xs text-[var(--primary)]">Genetic Research Interface v3.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="px-3 sm:px-4 py-2 bg-[var(--primary)]/20 rounded-lg border border-[var(--primary)]/50">
                <p className="text-xs text-[var(--primary)]">STATUS: ONLINE</p>
              </div>
              <button
                onClick={handleViewHistory}
                className="px-4 sm:px-6 py-2 bg-[var(--secondary)]/20 rounded-lg font-semibold hover:bg-[var(--secondary)]/30 transition text-sm sm:text-base border border-[var(--primary)]/30 flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                History
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Analysis Form */}
        <div className="bg-[var(--secondary)]/20 backdrop-blur-sm border border-[var(--primary)]/30 rounded-xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <Microscope className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
            Gene Edit Analysis
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">DNA Sequence *</label>
              <textarea
                value={dnaSequence}
                onChange={(e) => setDnaSequence(e.target.value)}
                placeholder="Enter DNA sequence (minimum 20 characters, e.g., ATGCGATCGATCGATCGATC...)"
                className="w-full p-3 bg-[var(--background)]/50 border border-[var(--primary)]/30 rounded-lg focus:outline-none focus:border-[var(--primary)] text-sm font-mono"
                rows={4}
                disabled={isAnalyzing}
              />
              <p className="text-xs text-[var(--text)]/50 mt-1">Length: {dnaSequence.length} characters</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Target Trait *</label>
              <select
                value={targetTrait}
                onChange={(e) => setTargetTrait(e.target.value as any)}
                className="w-full p-3 bg-[var(--background)]/50 border border-[var(--primary)]/30 rounded-lg focus:outline-none focus:border-[var(--primary)] text-sm"
                disabled={isAnalyzing}
              >
                <option value="plant_height">Plant Height</option>
                <option value="leaf_color">Leaf Color</option>
                <option value="flowering_time">Flowering Time</option>
                <option value="yield">Yield</option>
                <option value="disease_resistance">Disease Resistance</option>
                <option value="drought_tolerance">Drought Tolerance</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Dataset (Crop) *</label>
              <select
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                className="w-full p-3 bg-[var(--background)]/50 border border-[var(--primary)]/30 rounded-lg focus:outline-none focus:border-[var(--primary)] text-sm"
                disabled={isAnalyzing}
              >
                {availableDatasets.map((dataset) => (
                  <option key={dataset.value} value={dataset.value}>
                    {dataset.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[var(--text)]/50 mt-1">Default: Maize</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Target Region (Optional)</label>
              <input
                type="text"
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                placeholder="e.g., 1:1000-2000"
                className="w-full p-3 bg-[var(--background)]/50 border border-[var(--primary)]/30 rounded-lg focus:outline-none focus:border-[var(--primary)] text-sm"
                disabled={isAnalyzing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Max Suggestions</label>
              <input
                type="number"
                value={maxSuggestions}
                onChange={(e) => setMaxSuggestions(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
                min={1}
                max={20}
                className="w-full p-3 bg-[var(--background)]/50 border border-[var(--primary)]/30 rounded-lg focus:outline-none focus:border-[var(--primary)] text-sm"
                disabled={isAnalyzing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Min Efficiency (%)</label>
              <input
                type="number"
                value={minEfficiency}
                onChange={(e) => setMinEfficiency(Math.max(0, Math.min(100, parseFloat(e.target.value) || 50)))}
                min={0}
                max={100}
                step={1}
                className="w-full p-3 bg-[var(--background)]/50 border border-[var(--primary)]/30 rounded-lg focus:outline-none focus:border-[var(--primary)] text-sm"
                disabled={isAnalyzing}
              />
            </div>
          </div>
          
          {analysisError && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{analysisError}</p>
            </div>
          )}
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !dnaSequence.trim()}
            className="mt-4 px-6 py-3 bg-[var(--primary)] rounded-lg font-semibold hover:opacity-90 transition text-sm sm:text-base text-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Start Analysis
              </>
            )}
          </button>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="bg-[var(--secondary)]/20 backdrop-blur-sm border border-[var(--primary)]/30 rounded-xl p-4 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
              Analysis History
            </h2>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
              </div>
            ) : historyItems.length === 0 ? (
              <p className="text-[var(--text)]/50 text-center py-8">No analysis history found</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {historyItems.map((item) => (
                  <div
                    key={item.analysis_id}
                    onClick={() => handleViewAnalysis(item.analysis_id)}
                    className={`p-4 bg-[var(--background)]/50 border rounded-lg cursor-pointer hover:border-[var(--primary)]/60 transition ${
                      selectedAnalysisId === item.analysis_id ? 'border-[var(--primary)]' : 'border-[var(--primary)]/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm">{item.target_trait.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-xs text-[var(--text)]/50 mt-1">
                          {item.dataset_name && (
                            <span className="inline-block px-2 py-0.5 bg-[var(--primary)]/20 text-[var(--primary)] rounded mr-2">
                              {item.dataset_name.charAt(0).toUpperCase() + item.dataset_name.slice(1)}
                            </span>
                          )}
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--primary)]">Confidence: {item.summary.overall_confidence.toFixed(1)}%</p>
                        <p className="text-xs text-[var(--text)]/50">SNPs: {item.summary.total_snps_affected}</p>
                      </div>
                    </div>
                    <p className="text-xs font-mono text-[var(--text)]/70 truncate">{item.dna_sequence}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {analysisResult && (
          <div className="bg-[var(--secondary)]/20 backdrop-blur-sm border border-[var(--primary)]/30 rounded-xl p-4 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              Analysis Results
            </h2>
            
            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-[var(--background)]/50 border border-[var(--primary)]/30 rounded-lg">
                <p className="text-xs text-[var(--text)]/50 mb-1">Overall Confidence</p>
                <p className="text-2xl font-bold text-[var(--primary)]">{analysisResult.summary.overall_confidence.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-[var(--background)]/50 border border-[var(--primary)]/30 rounded-lg">
                <p className="text-xs text-[var(--text)]/50 mb-1">SNPs Affected</p>
                <p className="text-2xl font-bold text-[var(--accent)]">{analysisResult.summary.total_snps_affected}</p>
              </div>
              <div className="p-4 bg-[var(--background)]/50 border border-[var(--primary)]/30 rounded-lg">
                <p className="text-xs text-[var(--text)]/50 mb-1">Trait Change</p>
                <p className="text-2xl font-bold text-[var(--secondary)]">{analysisResult.summary.trait_prediction_change > 0 ? '+' : ''}{analysisResult.summary.trait_prediction_change.toFixed(2)}%</p>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="mb-6 p-4 bg-[var(--background)]/50 border border-[var(--primary)]/30 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Risk Assessment</p>
                  <p className="text-sm text-[var(--text)]/70">{analysisResult.summary.risk_assessment}</p>
                </div>
              </div>
            </div>

            {/* Edit Suggestions */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Edit Suggestions ({analysisResult.edit_suggestions.length})</h3>
              <div className="space-y-3">
                {analysisResult.edit_suggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-4 bg-[var(--background)]/50 border border-[var(--primary)]/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm">Suggestion #{idx + 1}</p>
                        <p className="text-xs text-[var(--text)]/50 mt-1">Position: {suggestion.target_position} | Type: {suggestion.edit_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[var(--primary)]">Efficiency: {suggestion.efficiency_score.toFixed(1)}%</p>
                        <p className="text-xs text-[var(--text)]/50">Confidence: {suggestion.confidence.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-[var(--secondary)]/20 rounded font-mono text-xs break-all">
                      <p className="text-[var(--text)]/50 mb-1">Guide RNA:</p>
                      <p>{suggestion.guide_rna}</p>
                    </div>
                    {suggestion.original_base && suggestion.target_base && (
                      <p className="text-xs text-[var(--text)]/50 mt-2">
                        Base change: {suggestion.original_base} → {suggestion.target_base}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SNP Changes */}
            {analysisResult.snp_changes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">SNP Changes ({analysisResult.snp_changes.length})</h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {analysisResult.snp_changes.slice(0, 10).map((snp, idx) => (
                    <div key={idx} className="p-3 bg-[var(--background)]/50 border border-[var(--primary)]/30 rounded-lg text-xs">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{snp.snp_id}</p>
                          <p className="text-[var(--text)]/50">Chr{snp.chromosome}:{snp.position}</p>
                        </div>
                        <div className="text-right">
                          <p>{snp.original_allele} → {snp.new_allele}</p>
                          {snp.is_causal_candidate && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Causal</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* System Status */}
            <div className="bg-[var(--secondary)]/20 backdrop-blur-sm border border-[var(--primary)]/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-[var(--primary)]" />
                <h2 className="text-base sm:text-lg font-bold">System Status</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-[var(--text)]/70">Processing Power</span>
                    <span className="text-[var(--primary)]">{isAnalyzing ? '95%' : '15%'}</span>
                  </div>
                  <div className="h-2 bg-[var(--secondary)]/30 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--primary)] w-[15%] animate-pulse" style={{ width: isAnalyzing ? '95%' : '15%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-[var(--text)]/70">Memory Usage</span>
                    <span className="text-[var(--primary)]">62%</span>
                  </div>
                  <div className="h-2 bg-[var(--secondary)]/30 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--secondary)] w-[62%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-[var(--text)]/70">Network Activity</span>
                    <span className="text-[var(--accent)]">{isAnalyzing ? '85%' : '5%'}</span>
                  </div>
                  <div className="h-2 bg-[var(--secondary)]/30 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)]" style={{ width: isAnalyzing ? '85%' : '5%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* DNA Helix Data */}
            <div className="bg-[var(--secondary)]/20 backdrop-blur-sm border border-[var(--primary)]/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-[var(--primary)]" />
                <h2 className="text-base sm:text-lg font-bold">DNA Helix Data</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[var(--secondary)]/30 rounded-lg">
                  <span className="text-[var(--text)]/70 text-xs sm:text-sm">Sequence Length</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--primary)]">{dnaSequence.length || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[var(--secondary)]/30 rounded-lg">
                  <span className="text-[var(--text)]/70 text-xs sm:text-sm">Simulation</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--accent)]">{isPlaying ? 'Active' : 'Paused'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[var(--secondary)]/30 rounded-lg">
                  <span className="text-[var(--text)]/70 text-xs sm:text-sm">Progress</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--primary)]">{Math.round(progress * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Lab Tools */}
            <div className="bg-[var(--secondary)]/20 backdrop-blur-sm border border-[var(--primary)]/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Microscope className="w-5 h-5 text-[var(--primary)]" />
                <h2 className="text-base sm:text-lg font-bold">Lab Tools</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[
                  { icon: Cpu, label: 'Sequence', color: 'primary' },
                  { icon: Zap, label: 'Analyze', color: 'primary' },
                  { icon: Shield, label: 'Validate', color: 'secondary' },
                  { icon: Database, label: 'Store', color: 'accent' }
                ].map((tool, idx) => (
                  <button
                    key={idx}
                    className="p-3 sm:p-4 bg-[var(--secondary)]/30 hover:bg-[var(--secondary)]/50 border border-[var(--primary)]/30 rounded-lg transition group"
                  >
                    <tool.icon 
                      className="w-5 h-5 sm:w-6 sm:h-6 mb-2 mx-auto group-hover:scale-110 transition"
                      style={{ color: `var(--${tool.color})` }}
                    />
                    <p className="text-xs sm:text-sm">{tool.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Main Area - DNA Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--secondary)]/20 backdrop-blur-sm border border-[var(--primary)]/30 rounded-xl p-4 sm:p-6 h-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Dna className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
                  <h2 className="text-lg sm:text-xl font-bold">3D DNA Editing Simulation</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 sm:p-3 bg-[var(--primary)]/20 hover:bg-[var(--primary)]/30 rounded-lg transition"
                    aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
                    disabled={!analysisResult}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 sm:p-3 bg-[var(--secondary)]/20 hover:bg-[var(--secondary)]/30 rounded-lg transition"
                    aria-label="Reset simulation"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
                  </button>
                </div>
              </div>

              {/* Tabs for Edit Suggestions */}
              {analysisResult && analysisResult.edit_suggestions.length > 0 && (
                <div className="mb-4 border-b border-[var(--primary)]/30">
                  <div className="flex flex-wrap gap-2 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab(0)}
                      className={`
                        flex items-center gap-2 px-3 py-2 border-b-2 transition-colors text-sm
                        ${activeTab === 0 
                          ? 'border-[var(--primary)] text-[var(--primary)] font-semibold' 
                          : 'border-transparent text-[var(--text)]/60 hover:text-[var(--text)] hover:border-[var(--primary)]/40'
                        }
                      `}
                    >
                      <Dna className="w-4 h-4" />
                      <span>Overview</span>
                    </button>
                    {analysisResult.edit_suggestions.slice(0, 5).map((edit, idx) => {
                      const tabId = idx + 1;
                      const isActive = activeTab === tabId;
                      return (
                        <button
                          key={tabId}
                          onClick={() => setActiveTab(tabId)}
                          className={`
                            flex items-center gap-2 px-3 py-2 border-b-2 transition-colors text-sm
                            ${isActive 
                              ? 'border-[var(--primary)] text-[var(--primary)] font-semibold' 
                              : 'border-transparent text-[var(--text)]/60 hover:text-[var(--text)] hover:border-[var(--primary)]/40'
                            }
                          `}
                        >
                          <Activity className="w-4 h-4" />
                          <span>Edit {tabId}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3D DNA Editing Simulation Container */}
              <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg overflow-hidden border border-[var(--primary)]/20" style={{ height: '500px', minHeight: '500px' }}>
                <RealTimeDNAEditingWrapper 
                  className="w-full h-full absolute inset-0"
                  isPlaying={isPlaying && analysisResult !== null}
                  onProgressChange={setProgress}
                  dnaSequence={(() => {
                    if (!analysisResult || !dnaSequence) return '';
                    if (activeTab === 0) return dnaSequence;
                    const edit = analysisResult.edit_suggestions[activeTab - 1];
                    if (!edit) return dnaSequence;
                    const seq = dnaSequence.split('');
                    if (seq[edit.target_position]) {
                      seq[edit.target_position] = edit.target_base;
                    }
                    return seq.join('');
                  })()}
                  editPosition={analysisResult && activeTab > 0 ? analysisResult.edit_suggestions[activeTab - 1]?.target_position : undefined}
                  originalBase={analysisResult && activeTab > 0 ? analysisResult.edit_suggestions[activeTab - 1]?.original_base : undefined}
                  targetBase={analysisResult && activeTab > 0 ? analysisResult.edit_suggestions[activeTab - 1]?.target_base : undefined}
                />
                
                {/* Overlay Instructions */}
                {!analysisResult && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/50 backdrop-blur-sm z-10">
                    <div className="text-center p-6 bg-[var(--background)]/90 rounded-xl border-2 border-[var(--primary)]/20">
                      <p className="text-lg font-semibold text-[var(--text)] mb-2">Ready to Start?</p>
                      <p className="text-sm text-[var(--text)]/70 mb-4">Fill out the form above and click "Start Analysis" to begin</p>
                    </div>
                  </div>
                )}

                {/* Tab-specific info overlay */}
                {analysisResult && activeTab > 0 && analysisResult.edit_suggestions[activeTab - 1] && (
                  <div className="absolute top-4 left-4 right-4 z-10">
                    <div className="bg-[var(--background)]/90 backdrop-blur-sm rounded-lg p-4 border border-[var(--primary)]/20">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[var(--text)] mb-2">Edit {activeTab}</h3>
                          <div className="space-y-1 text-sm text-[var(--text)]/70">
                            <p>Position: <span className="font-mono font-semibold text-[var(--primary)]">{analysisResult.edit_suggestions[activeTab - 1].target_position}</span></p>
                            <p>Edit: <span className="font-mono">{analysisResult.edit_suggestions[activeTab - 1].original_base}</span> → <span className="font-mono text-[var(--primary)] font-bold">{analysisResult.edit_suggestions[activeTab - 1].target_base}</span></p>
                            <p>Efficiency: <span className="font-semibold text-[var(--primary)]">{analysisResult.edit_suggestions[activeTab - 1].efficiency_score.toFixed(1)}%</span></p>
                            {analysisResult.dnabert_validations?.[activeTab - 1] && (
                              <p>Validation: {analysisResult.dnabert_validations[activeTab - 1].validation_passed ? (
                                <span className="text-green-500 font-semibold">✓ Passed</span>
                              ) : (
                                <span className="text-red-500 font-semibold">✗ Failed</span>
                              )}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              {progress > 0 && (
                <div className="mt-4">
                  <div className="w-full h-2 bg-[var(--secondary)]/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300 rounded-full"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--text)]/50 mt-2 text-center">
                    Edit Progress: {Math.round(progress * 100)}%
                  </p>
                </div>
              )}

              {/* Base Pairs Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
                {[
                  { label: 'Adenine', color: '#00ff88' },
                  { label: 'Thymine', color: '#ff0088' },
                  { label: 'Cytosine', color: '#00d4ff' },
                  { label: 'Guanine', color: '#ffaa00' }
                ].map((base, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 sm:p-3 bg-[var(--secondary)]/30 rounded-lg">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0" style={{ backgroundColor: base.color, boxShadow: `0 0 10px ${base.color}` }}></div>
                    <span className="text-xs sm:text-sm">{base.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {[
            { icon: Activity, title: 'Real-time Analysis', desc: 'Monitor DNA structure changes live', color: 'primary' },
            { icon: Shield, title: 'Secure Storage', desc: 'Encrypted genetic data protection', color: 'secondary' },
            { icon: Zap, title: 'Fast Processing', desc: 'High-speed computational analysis', color: 'accent' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-[var(--secondary)]/20 backdrop-blur-sm border border-[var(--primary)]/30 rounded-xl p-4 sm:p-6 hover:border-[var(--primary)]/60 transition">
              <feature.icon 
                className="w-6 h-6 sm:w-8 sm:h-8 mb-3"
                style={{ color: `var(--${feature.color})` }}
              />
              <h3 className="text-base sm:text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-[var(--text)]/70 text-xs sm:text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--primary)]/30 bg-[var(--background)]/80 backdrop-blur-md mt-8 sm:mt-12 py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6 text-center text-[var(--text)]/70 text-xs sm:text-sm">
          <p>© 2024 DNA LAB - Advanced Genetic Research Platform | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default DNALab3D;
