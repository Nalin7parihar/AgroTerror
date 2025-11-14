'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Target, TrendingUp, BarChart3, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OnboardingHeader } from '@/components/home/OnboardingHeader';

export default function OptimizationPage() {
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
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-text">Multi-Objective Optimization</h1>
                  <p className="text-text/70 mt-1">Balancing multiple goals simultaneously</p>
                </div>
              </div>
              <div className="w-24 h-1 bg-accent rounded-full" />
            </div>

            {/* Overview */}
            <Card className="p-6 mb-8 bg-gradient-to-br from-accent/10 via-secondary/10 to-primary/10">
              <h2 className="text-2xl font-bold text-text mb-4">Overview</h2>
              <p className="text-text/80 leading-relaxed mb-4">
                Multi-Objective Optimization uses advanced genetic algorithms to find the optimal balance 
                between multiple competing objectives. In agricultural gene editing, you often need to 
                maximize yield while also improving climate resilience, nutrient efficiency, and pest 
                resistance—goals that may sometimes conflict.
              </p>
              <p className="text-text/80 leading-relaxed">
                Our optimization engine explores thousands of potential edit combinations to find solutions 
                that achieve the best overall performance across all your objectives.
              </p>
            </Card>

            {/* Objectives */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-accent" />
                Optimization Objectives
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="w-6 h-6 text-accent" />
                    <h3 className="text-xl font-bold text-text">Yield Maximization</h3>
                  </div>
                  <p className="text-text/80 leading-relaxed">
                    Optimize for maximum crop yield under normal growing conditions, ensuring 
                    productivity improvements.
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-accent" />
                    <h3 className="text-xl font-bold text-text">Climate Resilience</h3>
                  </div>
                  <p className="text-text/80 leading-relaxed">
                    Enhance ability to withstand drought, heat stress, flooding, and other 
                    climate-related challenges.
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-6 h-6 text-accent" />
                    <h3 className="text-xl font-bold text-text">Nutrient Efficiency</h3>
                  </div>
                  <p className="text-text/80 leading-relaxed">
                    Improve nutrient uptake and utilization, reducing fertilizer requirements 
                    while maintaining productivity.
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                    <h3 className="text-xl font-bold text-text">Pest Resistance</h3>
                  </div>
                  <p className="text-text/80 leading-relaxed">
                    Develop natural resistance to common pests and diseases, reducing need 
                    for chemical treatments.
                  </p>
                </Card>
              </div>
            </section>

            {/* Genetic Algorithm Process */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6">Genetic Algorithm Process</h2>
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">1. Population Initialization</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Create an initial population of edit combinations, each representing a potential 
                    solution with different trade-offs between objectives.
                  </p>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm text-text/70">
                      <strong className="text-text">Population Size:</strong> Typically 100-500 candidate solutions
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">2. Fitness Evaluation</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Evaluate each solution across all objectives using our simulation models:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Yield performance under various conditions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Resilience metrics across climate scenarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Nutrient utilization efficiency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-text/80">Pest and disease resistance scores</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">3. Selection & Evolution</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Apply genetic operators to evolve better solutions:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <p className="font-semibold text-text mb-1">Crossover</p>
                      <p className="text-sm text-text/70">Combine features from high-performing solutions</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <p className="font-semibold text-text mb-1">Mutation</p>
                      <p className="text-sm text-text/70">Introduce random variations to explore new possibilities</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <p className="font-semibold text-text mb-1">Selection</p>
                      <p className="text-sm text-text/70">Preserve best-performing solutions for next generation</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <p className="font-semibold text-text mb-1">Elitism</p>
                      <p className="text-sm text-text/70">Maintain top solutions across generations</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold text-text mb-3">4. Pareto Front Analysis</h3>
                  <p className="text-text/80 leading-relaxed mb-4">
                    Identify the Pareto-optimal front—solutions where improving one objective would 
                    worsen another. This gives you a range of optimal trade-offs to choose from.
                  </p>
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <p className="text-sm text-text/70">
                      <strong className="text-text">Example:</strong> A solution might offer 15% yield increase 
                      with 20% drought resistance, while another offers 10% yield increase with 30% drought 
                      resistance. Both are optimal—choose based on your priorities.
                    </p>
                  </div>
                </Card>
              </div>
            </section>

            {/* Trade-off Analysis */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-text mb-6">Understanding Trade-offs</h2>
              <Card className="p-6">
                <p className="text-text/80 leading-relaxed mb-4">
                  The optimization process reveals important trade-offs between objectives:
                </p>
                <div className="space-y-3">
                  <div className="p-4 bg-secondary/20 rounded-lg border-l-4 border-accent">
                    <p className="font-semibold text-text mb-1">Yield vs. Resilience</p>
                    <p className="text-sm text-text/70">
                      Maximum yield might require more resources, while resilience focuses on survival 
                      under stress. The algorithm finds the optimal balance.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-lg border-l-4 border-accent">
                    <p className="font-semibold text-text mb-1">Efficiency vs. Productivity</p>
                    <p className="text-sm text-text/70">
                      Nutrient efficiency improvements might slightly reduce maximum yield but significantly 
                      reduce input requirements.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-lg border-l-4 border-accent">
                    <p className="font-semibold text-text mb-1">Resistance vs. Growth</p>
                    <p className="text-sm text-text/70">
                      Some pest resistance mechanisms might have minor growth trade-offs, but provide 
                      significant protection benefits.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Next Steps */}
            <Card className="p-6 bg-gradient-to-br from-accent/10 via-secondary/10 to-primary/10">
              <h3 className="text-xl font-bold text-text mb-4">Next Stage</h3>
              <p className="text-text/80 mb-4">
                Once you've selected an optimal solution, proceed to CRISPR Guide Design to generate 
                the specific guide RNAs for implementation.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/home/how-it-works/validation')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="primary"
                  onClick={() => router.push('/home/how-it-works/guide-design')}
                >
                  Learn About Guide Design
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

