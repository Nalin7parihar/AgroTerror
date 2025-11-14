'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Wand2, Target, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OnboardingHeader } from '@/components/home/OnboardingHeader';

export default function EditDesignPage() {
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
                <div className="p-3 rounded-lg bg-accent/10 text-accent">
                  <Wand2 className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-text">Edit Design</h1>
                  <p className="text-text/70 mt-1">AI-powered suggestions for optimal CRISPR edits</p>
                </div>
              </div>
              <div className="w-24 h-1 bg-accent rounded-full" />
            </div>

            {/* Overview */}
            <Card className="p-6 mb-8 bg-gradient-to-br from-accent/10 via-secondary/10 to-primary/10">
              <h2 className="text-2xl font-bold text-text mb-4">Overview</h2>
              <p className="text-text/80 leading-relaxed mb-4">
                The Edit Design stage uses advanced AI algorithms to suggest precise gene edits that achieve 
                your desired trait modifications. Our system recommends optimal edit types—including prime editing, 
                base editing, and traditional CRISPR-Cas9—while predicting and minimizing off-target effects.
              </p>
              <p className="text-text/80 leading-relaxed">
                Each suggested edit is carefully designed to maximize on-target efficiency while ensuring safety 
                and maintaining the integrity of other important genetic functions.
              </p>
            </Card>

            {/* Edit Types */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6 flex items-center gap-3">
                <Target className="w-8 h-8 text-accent" />
                Edit Types
              </h2>
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-accent" />
                    <h3 className="text-xl font-bold text-text">Prime Editing</h3>
                  </div>
                  <p className="text-text/80 leading-relaxed mb-4">
                    A versatile editing technology that enables precise point mutations, small insertions, 
                    and deletions without requiring double-strand breaks. Ideal for making single nucleotide 
                    changes with high precision.
                  </p>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm text-text/70">
                      <strong className="text-text">Best for:</strong> Single nucleotide polymorphisms (SNPs), 
                      small insertions/deletions, precise point mutations
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Wand2 className="w-6 h-6 text-accent" />
                    <h3 className="text-xl font-bold text-text">Base Editing</h3>
                  </div>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Enables direct conversion of one DNA base to another without creating double-strand breaks. 
                    Highly efficient for specific base conversions (C→T, A→G, etc.).
                  </p>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm text-text/70">
                      <strong className="text-text">Best for:</strong> Base conversions, minimizing DNA damage, 
                      high-efficiency edits
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-6 h-6 text-accent" />
                    <h3 className="text-xl font-bold text-text">Traditional CRISPR-Cas9</h3>
                  </div>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Classic gene editing approach using Cas9 nuclease for creating double-strand breaks, 
                    followed by DNA repair mechanisms. Suitable for larger deletions and insertions.
                  </p>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm text-text/70">
                      <strong className="text-text">Best for:</strong> Gene knockouts, large insertions, 
                      complex modifications
                    </p>
                  </div>
                </Card>
              </div>
            </section>

            {/* Off-Target Prediction */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-accent" />
                Off-Target Effect Prediction
              </h2>
              <Card className="p-6">
                <p className="text-text/80 leading-relaxed mb-4">
                  Our AI models predict potential off-target effects by analyzing:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-text mb-1">Sequence Similarity</h4>
                      <p className="text-sm text-text/70">Similar sequences in the genome that might be accidentally edited</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-text mb-1">Chromatin Accessibility</h4>
                      <p className="text-sm text-text/70">Regions of the genome that are more accessible to editing machinery</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-text mb-1">Guide RNA Specificity</h4>
                      <p className="text-sm text-text/70">How specific the guide RNA sequence is to the target site</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-text mb-1">Functional Impact</h4>
                      <p className="text-sm text-text/70">Potential consequences of off-target edits on gene function</p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Optimization Process */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6">Optimization Process</h2>
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2">1. Edit Efficiency Scoring</h3>
                  <p className="text-text/70 text-sm">
                    Each suggested edit receives an efficiency score based on predicted success rate, 
                    considering factors like edit type, target sequence, and cellular context.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2">2. Safety Assessment</h3>
                  <p className="text-text/70 text-sm">
                    Comprehensive safety analysis evaluates off-target risks, potential unintended 
                    consequences, and overall edit safety profile.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2">3. Edit Ranking</h3>
                  <p className="text-text/70 text-sm">
                    Edits are ranked by a composite score balancing efficiency, safety, and trait 
                    achievement probability.
                  </p>
                </Card>
              </div>
            </section>

            {/* Next Steps */}
            <Card className="p-6 bg-gradient-to-br from-accent/10 via-secondary/10 to-primary/10">
              <h3 className="text-xl font-bold text-text mb-4">Next Stage</h3>
              <p className="text-text/80 mb-4">
                After designing your edits, validate them using our In-Silico Validation stage 
                with digital twin simulations.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/home/how-it-works')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => router.push('/home/how-it-works/validation')}
                >
                  Learn About Validation
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

