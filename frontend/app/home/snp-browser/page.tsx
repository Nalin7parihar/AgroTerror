'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Info, ArrowLeft, RefreshCw, Dna } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OnboardingHeader } from '@/components/home/OnboardingHeader';
import { DNAComparisonViewer } from '@/components/home/DNAComparisonViewer';
import { apiRequest } from '@/lib/api';

export default function SNPBrowserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [analysisId, setAnalysisId] = useState<string>(searchParams.get('analysisId') || '');
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<{ analyses: any[]; total: number }>(
        '/gene-analysis/history?limit=50&skip=0'
      );
      setAnalyses(response.analyses || []);
      if (!analysisId && response.analyses.length > 0) {
        setAnalysisId(response.analyses[0].analysis_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisSelect = (id: string) => {
    setAnalysisId(id);
    router.push(`/home/snp-browser?analysisId=${id}`);
  };

  return (
    <>
      <OnboardingHeader />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/home')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Dna className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-text">DNA Comparison Browser</h1>
                <p className="text-text/70 mt-1">
                  Compare original and modified DNA sequences for each edit suggestion. View positions of changes in D3 visualization format.
                </p>
              </div>
            </div>
            <div className="w-24 h-1 bg-primary rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto">
            {/* Analysis Selection */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text">Select Analysis</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAnalysisHistory}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>

              {loading && !analysisId ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-text/70">Loading analyses...</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              ) : analyses.length === 0 ? (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-600 dark:text-yellow-400">
                    No analyses found. Create a gene edit analysis first.
                  </p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => router.push('/analysis')}
                  >
                    Go to Analysis
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyses.map((analysis) => (
                    <div
                      key={analysis.analysis_id}
                      onClick={() => handleAnalysisSelect(analysis.analysis_id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        analysisId === analysis.analysis_id
                          ? 'border-primary bg-primary/10'
                          : 'border-secondary/30 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-text">
                            {analysis.target_trait.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-sm text-text/70 mt-1">
                            Dataset: {analysis.dataset_name || 'maize'} |{' '}
                            {analysis.dna_sequence.length} bp
                          </p>
                          <p className="text-xs text-text/60 mt-1">
                            {new Date(analysis.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-text">
                            {analysis.summary.total_snps_affected} SNPs
                          </p>
                          {analysis.summary.causal_candidate_snps?.length > 0 && (
                            <p className="text-xs text-red-500 mt-1">
                              {analysis.summary.causal_candidate_snps.length} Causal
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>


            {/* DNA Comparison Visualization */}
            {analysisId && (
              <Card className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-text mb-2">DNA Sequence Comparison</h2>
                  <p className="text-sm text-text/70">
                    Compare original DNA sequence with modified DNA for each edit suggestion.
                    Changes are highlighted with color-coded nucleotides and position markers.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <DNAComparisonViewer
                    key={analysisId}
                    analysisId={analysisId}
                    width={1200}
                    height={600}
                  />
                </div>
              </Card>
            )}

            {/* Information Card */}
            <Card className="p-6 mt-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
              <h3 className="text-xl font-bold text-text mb-4">About the DNA Comparison Browser</h3>
              <div className="space-y-3 text-text/80">
                <p>
                  The DNA Comparison Browser compares original DNA sequences with modified DNA
                  sequences for each edit suggestion. This tool helps you:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>5 Edit Suggestions:</strong> View up to 5 different edit suggestions in
                    separate tabs, each showing its own DNA modification
                  </li>
                  <li>
                    <strong>Position-by-Position Comparison:</strong> See exactly where nucleotides
                    changed between original and modified DNA sequences
                  </li>
                  <li>
                    <strong>Color-Coded Nucleotides:</strong> Each nucleotide (A, T, G, C) is
                    color-coded for easy visualization
                  </li>
                  <li>
                    <strong>Change Markers:</strong> Changed positions are highlighted with arrows
                    and change indicators showing original→modified nucleotides
                  </li>
                  <li>
                    <strong>Edit Details:</strong> View efficiency scores, confidence levels, and
                    target positions for each edit suggestion
                  </li>
                  <li>
                    <strong>Interactive Navigation:</strong> Navigate through long sequences using
                    previous/next buttons to view different regions
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-background/50 rounded-lg">
                  <p className="text-sm font-semibold text-text mb-2">How It Works:</p>
                  <p className="text-sm text-text/70">
                    For each edit suggestion, the system applies the mutation at the target
                    position and compares the resulting modified DNA sequence with the original
                    sequence. All nucleotide changes are identified and displayed in the D3
                    visualization format.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

