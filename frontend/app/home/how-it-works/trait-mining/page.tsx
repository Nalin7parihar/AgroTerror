'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Dna, Database, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OnboardingHeader } from '@/components/home/OnboardingHeader';

export default function TraitMiningPage() {
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
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-text">Trait Mining</h1>
                  <p className="text-text/70 mt-1">Multi-omics data integration for candidate gene identification</p>
                </div>
              </div>
              <div className="w-24 h-1 bg-primary rounded-full" />
            </div>

            {/* Overview */}
            <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
              <h2 className="text-2xl font-bold text-text mb-4">Overview</h2>
              <p className="text-text/80 leading-relaxed mb-4">
                Trait Mining is the foundational stage of our gene editing pipeline. It leverages advanced AI algorithms 
                to analyze multi-omics data and identify candidate genes responsible for desired agricultural traits. 
                This stage integrates genomics, transcriptomics, metabolomics, and phenomics data to provide a comprehensive 
                view of the genetic basis of traits.
              </p>
              <p className="text-text/80 leading-relaxed">
                By combining multiple data types, we can identify genes with higher confidence and understand the complex 
                interactions that contribute to traits like drought resistance, nitrogen efficiency, and pest resistance.
              </p>
            </Card>

            {/* How It Works */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6 flex items-center gap-3">
                <Database className="w-8 h-8 text-primary" />
                How It Works
              </h2>
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">1. Data Collection & Integration</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Our platform collects and integrates data from multiple omics layers:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Dna className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-text mb-1">Genomics</h4>
                        <p className="text-sm text-text/70">DNA sequence data, genetic variants, and structural variations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-text mb-1">Transcriptomics</h4>
                        <p className="text-sm text-text/70">Gene expression patterns and RNA sequencing data</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Database className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-text mb-1">Metabolomics</h4>
                        <p className="text-sm text-text/70">Metabolite profiles and biochemical pathway data</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-text mb-1">Phenomics</h4>
                        <p className="text-sm text-text/70">Observable traits and phenotypic measurements</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">2. AI-Powered Analysis</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Advanced machine learning algorithms analyze the integrated data to:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Identify correlations between genetic variants and phenotypic traits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Detect gene expression patterns associated with desired traits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Analyze metabolic pathways involved in trait expression</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Rank candidate genes based on evidence strength and trait relevance</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">3. Candidate Gene Ranking</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Genes are ranked using a comprehensive scoring system that considers:
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <p className="font-semibold text-text mb-1">Evidence Strength</p>
                      <p className="text-sm text-text/70">Consistency across multiple data sources and studies</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <p className="font-semibold text-text mb-1">Trait Relevance</p>
                      <p className="text-sm text-text/70">Direct association with the target trait phenotype</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <p className="font-semibold text-text mb-1">Editability</p>
                      <p className="text-sm text-text/70">Feasibility of making precise edits to the gene</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <p className="font-semibold text-text mb-1">Safety Profile</p>
                      <p className="text-sm text-text/70">Low risk of unintended side effects</p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Benefits */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6">Key Benefits</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2">Comprehensive Analysis</h3>
                  <p className="text-text/70 text-sm">
                    Multi-omics integration provides a holistic view of trait genetics, reducing false positives 
                    and increasing confidence in candidate genes.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2">Time Efficiency</h3>
                  <p className="text-text/70 text-sm">
                    AI-powered analysis accelerates the discovery process from months to days, enabling faster 
                    research cycles.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2">Higher Accuracy</h3>
                  <p className="text-text/70 text-sm">
                    Cross-validation across multiple data types ensures more reliable gene identification 
                    compared to single-omics approaches.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2">Prioritized Results</h3>
                  <p className="text-text/70 text-sm">
                    Ranked candidate lists help researchers focus on the most promising targets, optimizing 
                    resource allocation.
                  </p>
                </Card>
              </div>
            </section>

            {/* Next Steps */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
              <h3 className="text-xl font-bold text-text mb-4">Next Stage</h3>
              <p className="text-text/80 mb-4">
                Once candidate genes are identified, proceed to the Edit Design stage where AI suggests 
                optimal CRISPR edits for your target genes.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/home/how-it-works/edit-design')}
              >
                Learn About Edit Design
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

