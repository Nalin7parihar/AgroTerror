'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Dna, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  FileText,
  Zap,
  Shield,
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { OnboardingHeader } from '@/components/home/OnboardingHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  getAnalysisHistory, 
  getAuthToken, 
  removeAuthToken,
  type AnalysisHistoryItem,
  type ApiError 
} from '@/lib/api';

// Format trait name from snake_case to Title Case
function formatTraitName(trait: string): string {
  return trait
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Format date to relative time or absolute date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Get trait icon based on trait type
function getTraitIcon(trait: string) {
  const traitLower = trait.toLowerCase();
  if (traitLower.includes('drought') || traitLower.includes('tolerance')) {
    return <Shield className="w-5 h-5" />;
  }
  if (traitLower.includes('yield') || traitLower.includes('height')) {
    return <TrendingUp className="w-5 h-5" />;
  }
  if (traitLower.includes('disease') || traitLower.includes('resistance')) {
    return <Shield className="w-5 h-5" />;
  }
  return <Zap className="w-5 h-5" />;
}

// Get trait color based on trait type
function getTraitColor(trait: string): string {
  const traitLower = trait.toLowerCase();
  if (traitLower.includes('drought') || traitLower.includes('tolerance')) {
    return 'bg-accent/20 text-accent border-accent/30';
  }
  if (traitLower.includes('yield') || traitLower.includes('height')) {
    return 'bg-primary/20 text-primary border-primary/30';
  }
  if (traitLower.includes('disease') || traitLower.includes('resistance')) {
    return 'bg-accent/20 text-accent border-accent/30';
  }
  return 'bg-secondary/30 text-text border-secondary/40';
}

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Check authentication
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
    
    // Fetch analysis history
    loadAnalyses();
  }, [router]);

  const loadAnalyses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getAnalysisHistory(20, 0);
      setAnalyses(response.analyses);
      setTotal(response.total);
    } catch (err) {
      const apiError = err as ApiError;
      
      if (apiError.status === 401) {
        // Remove invalid/expired token
        removeAuthToken();
        router.push('/login');
        return;
      }
      
      setError(
        apiError.detail || 
        'Failed to load analysis history. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (analysisId: string) => {
    router.push(`/analysis?analysisId=${analysisId}`);
  };

  const handleStartNewProject = () => {
    router.push('/analysis');
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <>
      <OnboardingHeader />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8 sm:mb-12">
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-text mb-2">
                  Dashboard
                </h1>
                <p className="text-text/70">
                  Manage your gene editing analyses and projects
                </p>
              </div>
              
              {/* Stats Summary */}
              {!isLoading && !error && total > 0 && (
                <div className="flex items-center gap-2 text-sm text-text/60">
                  <FileText className="w-4 h-4" />
                  <span>{total} {total === 1 ? 'analysis' : 'analyses'} total</span>
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-text/70">Loading your analyses...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <Card className="p-6 mb-6 border-red-200 bg-red-50/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 mb-1">Error Loading Analyses</h3>
                    <p className="text-sm text-red-700 mb-4">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadAnalyses}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && analyses.length === 0 && (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-text mb-3">
                    No Analyses Yet
                  </h2>
                  <p className="text-text/70 mb-6 leading-relaxed">
                    Get started by creating your first gene editing analysis. 
                    Our AI-powered platform will help you design optimal CRISPR edits 
                    for your desired traits.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleStartNewProject}
                      className="group"
                    >
                      <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                      Start Your First Project
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => router.push('/home')}
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Analyses Grid */}
            {!isLoading && !error && analyses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyses.map((analysis) => (
                  <Card
                    key={analysis.analysis_id}
                    hover
                    className="cursor-pointer group"
                    onClick={() => handleViewDetails(analysis.analysis_id)}
                  >
                    {/* Header with Trait Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getTraitColor(analysis.target_trait)}`}>
                        {getTraitIcon(analysis.target_trait)}
                        <span>{formatTraitName(analysis.target_trait)}</span>
                      </div>
                      {analysis.dataset_name && (
                        <span className="text-xs text-text/50 px-2 py-1 bg-secondary/20 rounded">
                          {analysis.dataset_name}
                        </span>
                      )}
                    </div>

                    {/* DNA Sequence Preview */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Dna className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-text/70 uppercase tracking-wide">
                          DNA Sequence
                        </span>
                      </div>
                      <p className="text-xs font-mono text-text/60 bg-secondary/10 p-2 rounded border border-secondary/20 break-all line-clamp-2">
                        {analysis.dna_sequence.length > 80 
                          ? `${analysis.dna_sequence.substring(0, 80)}...` 
                          : analysis.dna_sequence}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-secondary/10 rounded-lg p-3">
                        <div className="text-xs text-text/60 mb-1">SNPs Affected</div>
                        <div className="text-lg font-bold text-text">
                          {analysis.summary.total_snps_affected}
                        </div>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-3">
                        <div className="text-xs text-text/60 mb-1">High Impact</div>
                        <div className="text-lg font-bold text-accent">
                          {analysis.summary.high_impact_snps}
                        </div>
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-text/70">Confidence</span>
                        <span className="text-xs font-bold text-primary">
                          {Math.round(analysis.summary.overall_confidence)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-secondary/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                          style={{ width: `${analysis.summary.overall_confidence}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer with Date and View Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-secondary/20">
                      <div className="flex items-center gap-2 text-xs text-text/60">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(analysis.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
