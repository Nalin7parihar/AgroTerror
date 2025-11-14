'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Dna, Target, Shield, Zap, CheckCircle2, Code } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OnboardingHeader } from '@/components/home/OnboardingHeader';

export default function GuideDesignPage() {
  const router = useRouter();

  return (
    <>
      <OnboardingHeader />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/home/how-it-works')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to How It Works
              </Button>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Dna className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-text">CRISPR Guide Design</h1>
                  <p className="text-text/70 mt-1">Automated sgRNA design with scoring</p>
                </div>
              </div>
              <div className="w-24 h-1 bg-primary rounded-full" />
            </div>

            {/* Overview */}
            <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
              <h2 className="text-2xl font-bold text-text mb-4">Overview</h2>
              <p className="text-text/80 leading-relaxed mb-4">
                The final stage of our pipeline generates optimized single guide RNA (sgRNA) sequences 
                for your selected edits. Our AI-powered system designs guide RNAs with high on-target 
                efficiency and minimal off-target risk, ensuring precise and safe gene editing.
              </p>
              <p className="text-text/80 leading-relaxed">
                Each guide RNA is carefully designed, scored, and validated to maximize editing success 
                while maintaining safety standards.
              </p>
            </Card>

            {/* Guide RNA Basics */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6 flex items-center gap-3">
                <Code className="w-8 h-8 text-primary" />
                Guide RNA Basics
              </h2>
              <Card className="p-6 mb-6">
                <p className="text-text/80 leading-relaxed mb-4">
                  Guide RNAs (gRNAs) are RNA molecules that direct the CRISPR-Cas system to specific 
                  DNA sequences. They consist of:
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <h4 className="font-semibold text-text mb-2">Targeting Sequence (20 nucleotides)</h4>
                    <p className="text-sm text-text/70 mb-2">
                      The 20-base sequence that binds to the target DNA. This is the most critical 
                      component for specificity.
                    </p>
                    <div className="p-2 bg-background rounded font-mono text-xs text-primary">
                      Example: ATGCGATCGATCGATCGATC
                    </div>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <h4 className="font-semibold text-text mb-2">Scaffold Sequence</h4>
                    <p className="text-sm text-text/70">
                      The structural component that binds to the Cas protein, forming the CRISPR complex 
                      that performs the edit.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Design Process */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6 flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                Design Process
              </h2>
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">1. Sequence Generation</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Generate multiple candidate guide RNA sequences for each target site:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Analyze target sequence context and PAM (Protospacer Adjacent Motif) requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Generate all possible guide RNA candidates within the target region</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Filter candidates based on sequence quality and constraints</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">2. On-Target Efficiency Scoring</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Predict how efficiently each guide RNA will edit the target site:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <Zap className="w-5 h-5 text-primary mb-2" />
                      <p className="font-semibold text-text mb-1">Sequence Features</p>
                      <p className="text-sm text-text/70">GC content, nucleotide composition, secondary structure</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <Target className="w-5 h-5 text-primary mb-2" />
                      <p className="font-semibold text-text mb-1">Position Effects</p>
                      <p className="text-sm text-text/70">Distance from PAM, target site accessibility</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <Code className="w-5 h-5 text-primary mb-2" />
                      <p className="font-semibold text-text mb-1">Machine Learning Models</p>
                      <p className="text-sm text-text/70">Trained on experimental data for accuracy</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
                      <p className="font-semibold text-text mb-1">Efficiency Score</p>
                      <p className="text-sm text-text/70">0-100 scale predicting edit success rate</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">3. Off-Target Risk Assessment</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Comprehensive analysis to identify and score potential off-target sites:
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <Shield className="w-5 h-5 text-primary mb-2" />
                      <p className="font-semibold text-text mb-1">Genome-Wide Search</p>
                      <p className="text-sm text-text/70">
                        Scan entire genome for sequences similar to the guide RNA target sequence
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <Target className="w-5 h-5 text-primary mb-2" />
                      <p className="font-semibold text-text mb-1">Mismatch Tolerance</p>
                      <p className="text-sm text-text/70">
                        Calculate risk based on number and position of mismatches
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
                      <p className="font-semibold text-text mb-1">Functional Impact</p>
                      <p className="text-sm text-text/70">
                        Assess potential consequences of off-target edits on gene function
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">4. Guide RNA Optimization</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Select and optimize the best guide RNA candidates:
                  </p>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-text/70 mb-2">
                      <strong className="text-text">Selection Criteria:</strong>
                    </p>
                    <ul className="space-y-1 text-sm text-text/70">
                      <li>• High on-target efficiency score (&gt;70)</li>
                      <li>• Low off-target risk score (&lt;5 potential off-targets)</li>
                      <li>• Optimal positioning for desired edit outcome</li>
                      <li>• No predicted secondary structure issues</li>
                    </ul>
                  </div>
                </Card>
              </div>
            </section>

            {/* Output */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6">Output & Results</h2>
              <Card className="p-6">
                <p className="text-text/80 leading-relaxed mb-4">
                  For each optimized guide RNA, you receive:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <h4 className="font-semibold text-text mb-2">Guide RNA Sequence</h4>
                    <p className="text-sm text-text/70">Complete sgRNA sequence ready for synthesis</p>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <h4 className="font-semibold text-text mb-2">Efficiency Scores</h4>
                    <p className="text-sm text-text/70">On-target and off-target predictions with confidence intervals</p>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <h4 className="font-semibold text-text mb-2">Target Information</h4>
                    <p className="text-sm text-text/70">Genomic coordinates, PAM sequence, and edit location</p>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <h4 className="font-semibold text-text mb-2">Safety Report</h4>
                    <p className="text-sm text-text/70">List of potential off-target sites with risk assessments</p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Best Practices */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6">Best Practices</h2>
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2">Multiple Guides</h3>
                  <p className="text-text/70 text-sm">
                    Design 3-5 guide RNAs per target to increase chances of successful editing. 
                    Test multiple guides in parallel.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2">Validation</h3>
                  <p className="text-text/70 text-sm">
                    Always validate guide RNA efficiency experimentally before large-scale applications. 
                    Our predictions are highly accurate but experimental confirmation is recommended.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2">Safety First</h3>
                  <p className="text-text/70 text-sm">
                    Prioritize guides with low off-target risk, even if they have slightly lower 
                    on-target efficiency. Safety is paramount.
                  </p>
                </Card>
              </div>
            </section>

            {/* Completion */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
              <h3 className="text-xl font-bold text-text mb-4">Pipeline Complete!</h3>
              <p className="text-text/80 mb-4">
                You now have optimized guide RNAs ready for laboratory implementation. Your complete 
                workflow—from trait discovery to guide design—is finished and ready for experimental validation.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/home/how-it-works/optimization')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="primary"
                  onClick={() => router.push('/dashboard')}
                >
                  Start Your Project
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

