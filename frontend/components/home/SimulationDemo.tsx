'use client';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Play, Pause, RotateCcw, Dna, Activity, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GeneAnalysisResponse } from '@/lib/api';

const RealTimeDNAEditingWrapper = dynamic(
  () => import('../animations/RealTimeDNAEditingWrapper').then(mod => ({ default: mod.RealTimeDNAEditingWrapper })),
  { ssr: false, loading: () => <div className="w-full h-full bg-secondary/10 animate-pulse rounded-lg flex items-center justify-center"><p className="text-text/50">Loading simulation...</p></div> }
);

interface SimulationDemoProps {
  analysisData?: GeneAnalysisResponse | null;
  dnaSequence?: string;
  originalSequence?: string; // Original sequence from the request
}

export function SimulationDemo({ analysisData, dnaSequence = '', originalSequence }: SimulationDemoProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Generate sequence from analysis data or use provided sequence
  const sequence = useMemo(() => {
    // Priority: originalSequence > dnaSequence > reconstruct from analysis
    if (originalSequence) return originalSequence;
    if (dnaSequence) return dnaSequence;
    
    // If we have analysis data, try to reconstruct sequence from edit positions
    if (analysisData?.edit_suggestions?.[0]) {
      // Find the max position to determine sequence length
      const maxPosition = Math.max(...analysisData.edit_suggestions.map(e => e.target_position || 0));
      // Generate a sequence that's at least maxPosition + 10 long
      const minLength = Math.max(maxPosition + 10, 50);
      // Generate a varied sequence with all nucleotides represented
      let baseSequence = '';
      const bases = ['A', 'T', 'G', 'C'];
      for (let i = 0; i < minLength; i++) {
        baseSequence += bases[i % 4];
      }
      // Apply original bases from edit suggestions where available
      analysisData.edit_suggestions.forEach(edit => {
        if (edit.target_position !== undefined && edit.original_base) {
          const pos = edit.target_position;
          if (pos >= 0 && pos < baseSequence.length) {
            baseSequence = baseSequence.substring(0, pos) + edit.original_base + baseSequence.substring(pos + 1);
          }
        }
      });
      return baseSequence;
    }
    // Default sequence with all nucleotides represented
    return 'ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG';
  }, [dnaSequence, originalSequence, analysisData]);

  // Get edit suggestions - limit to 5 for 5 edit tabs
  const editSuggestions = useMemo(() => {
    if (!analysisData?.edit_suggestions) return [];
    return analysisData.edit_suggestions.slice(0, 5);
  }, [analysisData]);

  // Create tabs data - 6 tabs total: Overview + 5 Edit tabs + Summary
  const tabs = useMemo(() => {
    const baseTabs = [
      { id: 0, label: 'Overview', icon: Dna, description: 'Complete analysis overview' },
    ];

    // Add edit tabs (up to 5)
    for (let i = 0; i < 5; i++) {
      const edit = editSuggestions[i];
      if (edit) {
        baseTabs.push({
          id: i + 1,
          label: `Edit ${i + 1}`,
          icon: Activity,
          description: `Position ${edit.target_position}: ${edit.original_base} → ${edit.target_base}`
        });
      } else {
        baseTabs.push({
          id: i + 1,
          label: `Edit ${i + 1}`,
          icon: Activity,
          description: 'No edit available'
        });
      }
    }

    // Add summary tab
    baseTabs.push({
      id: 6,
      label: 'Summary',
      icon: TrendingUp,
      description: 'Analysis summary'
    });

    return baseTabs;
  }, [editSuggestions]);

  // Get current edit suggestion for active tab
  const currentEdit = useMemo(() => {
    if (activeTab === 0 || activeTab === 6) return null;
    return editSuggestions[activeTab - 1] || null;
  }, [activeTab, editSuggestions]);

  // Get validation for current edit
  const currentValidation = useMemo(() => {
    if (!currentEdit || !analysisData?.dnabert_validations) return null;
    return analysisData.dnabert_validations[activeTab - 1] || null;
  }, [currentEdit, activeTab, analysisData]);

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // Generate modified sequence for current edit
  const getModifiedSequence = () => {
    if (!currentEdit) return sequence;
    const seq = sequence.split('');
    if (seq[currentEdit.target_position]) {
      seq[currentEdit.target_position] = currentEdit.target_base;
    }
    return seq.join('');
  };

  return (
    <section id="simulation-demo" className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-text mb-4">
            Digital Twin Simulation
          </h2>
          <p className="text-lg text-text/70 max-w-2xl mx-auto">
            Experience real-time DNA strand editing in our interactive simulation. Watch as CRISPR edits are applied to DNA strands.
          </p>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
        </div>
        
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="mb-6 border-b border-secondary/20">
            <div className="flex flex-wrap gap-2 sm:gap-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isDisabled = tab.id > 0 && tab.id < 6 && !editSuggestions[tab.id - 1];
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                    disabled={isDisabled}
                    className={`
                      flex items-center gap-2 px-4 py-3 border-b-2 transition-colors
                      ${isActive 
                        ? 'border-primary text-primary font-semibold' 
                        : 'border-transparent text-text/60 hover:text-text hover:border-secondary/40'
                      }
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm sm:text-base">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Card className="mb-8">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 sm:p-8 min-h-[500px] sm:min-h-[600px] relative overflow-hidden">
              <RealTimeDNAEditingWrapper 
                className="w-full h-full absolute inset-0"
                isPlaying={isPlaying}
                onProgressChange={setProgress}
                dnaSequence={activeTab === 0 || activeTab === 6 ? sequence : getModifiedSequence()}
                editPosition={currentEdit?.target_position}
                originalBase={currentEdit?.original_base}
                targetBase={currentEdit?.target_base}
              />
              
              {/* Overlay Instructions */}
              {!isPlaying && progress === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                  <div className="text-center p-6 bg-background/90 rounded-xl border-2 border-primary/20">
                    <p className="text-lg font-semibold text-text mb-2">Ready to Start?</p>
                    <p className="text-sm text-text/70 mb-4">
                      {activeTab === 0 
                        ? 'Click Play to view the DNA sequence'
                        : currentEdit 
                          ? `Click Play to simulate edit at position ${currentEdit.target_position}`
                          : 'Click Play to begin the DNA editing simulation'
                      }
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => setIsPlaying(true)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Simulation
                    </Button>
                  </div>
                </div>
              )}

              {/* Tab-specific info overlay */}
              {activeTab > 0 && currentEdit && (
                <div className="absolute top-4 left-4 right-4 z-10">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-text mb-2">{tabs[activeTab].label}</h3>
                        <div className="space-y-1 text-sm text-text/70">
                          <p>Position: <span className="font-mono font-semibold text-primary">{currentEdit.target_position}</span></p>
                          <p>Edit: <span className="font-mono">{currentEdit.original_base}</span> → <span className="font-mono text-primary font-bold">{currentEdit.target_base}</span></p>
                          <p>Efficiency: <span className="font-semibold text-primary">{currentEdit.efficiency_score.toFixed(1)}%</span></p>
                          {currentValidation && (
                            <p>Validation: {currentValidation.validation_passed ? (
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
            
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <Button
                variant="primary"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            
            {progress > 0 && (
              <div className="mt-4">
                <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <p className="text-xs text-text/50 mt-2 text-center">
                  Edit Progress: {Math.round(progress * 100)}%
                </p>
              </div>
            )}
          </Card>
          
          {/* Tab-specific content */}
          {activeTab === 0 && (
            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-text mb-2">Original Sequence</h3>
                <p className="text-sm text-text/70 mb-4">
                  Complete DNA sequence
                </p>
                <div className="bg-secondary/30 rounded-lg p-4 font-mono text-xs text-text/80 break-all">
                  {sequence}
                </div>
              </Card>
              
              <Card>
                <h3 className="text-lg font-semibold text-text mb-2">Analysis Info</h3>
                {analysisData ? (
                  <div className="space-y-2 text-sm">
                    <p><span className="text-text/70">Total Edits:</span> <span className="font-semibold text-primary">{analysisData.edit_suggestions.length}</span></p>
                    <p><span className="text-text/70">SNPs Affected:</span> <span className="font-semibold text-primary">{analysisData.summary.total_snps_affected}</span></p>
                    <p><span className="text-text/70">Risk:</span> <span className="font-semibold text-accent">{analysisData.summary.risk_assessment}</span></p>
                    <p><span className="text-text/70">Confidence:</span> <span className="font-semibold text-primary">{(analysisData.summary.overall_confidence * 100).toFixed(1)}%</span></p>
                  </div>
                ) : (
                  <p className="text-text/70 text-sm">No analysis data available</p>
                )}
              </Card>
            </div>
          )}

          {activeTab === 6 && analysisData && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold text-text">Summary</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text/70">Total SNPs:</span>
                    <span className="font-semibold text-primary">{analysisData.summary.total_snps_affected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text/70">High Impact:</span>
                    <span className="font-semibold text-accent">{analysisData.summary.high_impact_snps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text/70">Causal Candidates:</span>
                    <span className="font-semibold text-primary">{analysisData.summary.causal_candidate_snps.length}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold text-text">Trait Change</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-text/70">Prediction Change:</span>
                    <div className="mt-2 text-2xl font-bold text-primary">
                      {(analysisData.summary.trait_prediction_change * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-text/70">Confidence:</span>
                    <div className="mt-1 text-lg font-semibold text-primary">
                      {(analysisData.summary.overall_confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-accent" />
                  <h3 className="text-lg font-semibold text-text">Risk Assessment</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-text/70">{analysisData.summary.risk_assessment}</p>
                  {analysisData.summary.causal_candidate_snps.length > 0 && (
                    <div className="pt-3 border-t border-secondary/20">
                      <p className="text-xs text-text/60 mb-2">Causal Candidates:</p>
                      <div className="space-y-1">
                        {analysisData.summary.causal_candidate_snps.slice(0, 3).map((snp, idx) => (
                          <div key={idx} className="text-xs font-mono text-primary">
                            {snp.snp_id}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {(activeTab > 0 && activeTab < 6) && currentEdit && (
            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-text mb-2">Before Editing</h3>
                <p className="text-sm text-text/70 mb-4">
                  Original DNA sequence at position {currentEdit.target_position}
                </p>
                <div className="bg-secondary/30 rounded-lg p-4 font-mono text-xs text-text/80 break-all">
                  {sequence.split('').map((base, idx) => (
                    <span
                      key={idx}
                      className={idx === currentEdit.target_position ? 'bg-accent/30 px-1 rounded font-bold' : ''}
                    >
                      {base}
                    </span>
                  ))}
                </div>
              </Card>
              
              <Card>
                <h3 className="text-lg font-semibold text-text mb-2">After Editing</h3>
                <p className="text-sm text-text/70 mb-4">
                  Modified sequence with CRISPR edit applied
                </p>
                <div className="bg-primary/10 rounded-lg p-4 font-mono text-xs text-text/80 border-l-4 border-primary break-all">
                  {getModifiedSequence().split('').map((base, idx) => (
                    <span
                      key={idx}
                      className={idx === currentEdit.target_position ? 'bg-primary/30 px-1 rounded font-bold text-primary' : ''}
                    >
                      {base}
                    </span>
                  ))}
                </div>
                {currentValidation && (
                  <div className="mt-4 pt-4 border-t border-secondary/20">
                    <div className="flex items-center gap-2 mb-2">
                      {currentValidation.validation_passed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm font-semibold">
                        DNABERT Validation: {currentValidation.validation_passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div className="text-xs text-text/70 space-y-1">
                      <p>Score Change: {(currentValidation.difference * 100).toFixed(2)}%</p>
                      <p>Log Odds: {currentValidation.log_odds_ratio.toFixed(3)}</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
