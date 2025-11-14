'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, TestTube, Cloud, BarChart3, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OnboardingHeader } from '@/components/home/OnboardingHeader';

export default function ValidationPage() {
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
                  <TestTube className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-text">In-Silico Validation</h1>
                  <p className="text-text/70 mt-1">Digital twin simulation for edit validation</p>
                </div>
              </div>
              <div className="w-24 h-1 bg-primary rounded-full" />
            </div>

            {/* Overview */}
            <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
              <h2 className="text-2xl font-bold text-text mb-4">Overview</h2>
              <p className="text-text/80 leading-relaxed mb-4">
                In-Silico Validation uses digital twin technology to simulate crop growth and development 
                with your proposed gene edits under various environmental conditions. This stage allows you 
                to validate edits computationally before investing in expensive laboratory work.
              </p>
              <p className="text-text/80 leading-relaxed">
                By running hundreds of simulations across different climate scenarios, you can predict how 
                your edits will perform in real-world conditions, identify potential issues early, and 
                optimize your approach.
              </p>
            </Card>

            {/* Digital Twin Technology */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6 flex items-center gap-3">
                <Cloud className="w-8 h-8 text-primary" />
                Digital Twin Technology
              </h2>
              <Card className="p-6 mb-6">
                <p className="text-text/80 leading-relaxed mb-4">
                  Our digital twin is a comprehensive computational model that replicates:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-text mb-1">Crop Physiology</h4>
                      <p className="text-sm text-text/70">Growth patterns, development stages, and metabolic processes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-text mb-1">Gene Expression</h4>
                      <p className="text-sm text-text/70">How edited genes affect protein production and function</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-text mb-1">Environmental Factors</h4>
                      <p className="text-sm text-text/70">Temperature, precipitation, soil conditions, and climate patterns</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-text mb-1">Trait Expression</h4>
                      <p className="text-sm text-text/70">How genetic changes manifest as observable traits</p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Simulation Process */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6 flex items-center gap-3">
                <Zap className="w-8 h-8 text-primary" />
                Simulation Process
              </h2>
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">1. Scenario Configuration</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Define simulation parameters including:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Climate scenarios (drought, heat stress, normal conditions)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Growing seasons and geographic locations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Soil conditions and nutrient availability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Time periods for growth simulation</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">2. Batch Simulation</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Run hundreds of parallel simulations to test your edits across multiple scenarios:
                  </p>
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary mb-1">100+</div>
                        <div className="text-xs text-text/70">Simulations</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary mb-1">10+</div>
                        <div className="text-xs text-text/70">Climate Scenarios</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary mb-1">5+</div>
                        <div className="text-xs text-text/70">Growing Seasons</div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">3. Result Analysis</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Analyze simulation results to understand:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-primary mb-2" />
                      <p className="font-semibold text-text mb-1">Yield Predictions</p>
                      <p className="text-sm text-text/70">Expected crop yield under different conditions</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
                      <p className="font-semibold text-text mb-1">Trait Expression</p>
                      <p className="text-sm text-text/70">How well the desired trait is expressed</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <Zap className="w-5 h-5 text-primary mb-2" />
                      <p className="font-semibold text-text mb-1">Stress Resistance</p>
                      <p className="text-sm text-text/70">Performance under adverse conditions</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <TestTube className="w-5 h-5 text-primary mb-2" />
                      <p className="font-semibold text-text mb-1">Validation Score</p>
                      <p className="text-sm text-text/70">Overall confidence in edit success</p>
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
                  <h3 className="text-lg font-bold text-text mb-2">Cost Savings</h3>
                  <p className="text-text/70 text-sm">
                    Identify problematic edits before expensive laboratory work, saving time and resources.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2">Risk Reduction</h3>
                  <p className="text-text/70 text-sm">
                    Predict potential issues and optimize edits before real-world testing.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2">Comprehensive Testing</h3>
                  <p className="text-text/70 text-sm">
                    Test edits across multiple scenarios that would be impractical in laboratory settings.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2">Faster Iteration</h3>
                  <p className="text-text/70 text-sm">
                    Rapidly iterate on edit designs based on simulation feedback.
                  </p>
                </Card>
              </div>
            </section>

            {/* Next Steps */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
              <h3 className="text-xl font-bold text-text mb-4">Next Stage</h3>
              <p className="text-text/80 mb-4">
                After validation, proceed to Multi-Objective Optimization to balance multiple goals 
                simultaneously.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/home/how-it-works/edit-design')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="primary"
                  onClick={() => router.push('/home/how-it-works/optimization')}
                >
                  Learn About Optimization
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

