'use client';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Wand2, TestTube, Target, Dna, ArrowRight, Info } from 'lucide-react';

const stages = [
  {
    id: 1,
    icon: <Search className="w-8 h-8" />,
    title: 'Trait Mining',
    shortDescription: 'Multi-omics data integration',
    fullDescription: 'Our AI analyzes genomics, transcriptomics, metabolomics, and phenomics data to identify candidate genes responsible for desired traits like drought resistance, nitrogen efficiency, and pest resistance.',
    details: [
      'Multi-omics data collection and integration',
      'AI-powered gene identification',
      'Trait correlation analysis',
      'Candidate gene ranking',
    ],
    color: 'primary',
    link: '#',
  },
  {
    id: 2,
    icon: <Wand2 className="w-8 h-8" />,
    title: 'Edit Design',
    shortDescription: 'AI suggests optimal edits',
    fullDescription: 'Advanced algorithms suggest precise edits including single nucleotide changes and small insertions that achieve your desired trait without off-target effects.',
    details: [
      'Prime editing suggestions',
      'Base editing recommendations',
      'Off-target effect prediction',
      'Edit optimization',
    ],
    color: 'accent',
    link: '#',
  },
  {
    id: 3,
    icon: <TestTube className="w-8 h-8" />,
    title: 'In-Silico Validation',
    shortDescription: 'Digital twin simulation',
    fullDescription: 'Run hundreds of growth simulations with proposed edits under different climate scenarios. Validate your edits before any lab work using our digital twin technology.',
    details: [
      'Digital twin crop modeling',
      'Climate scenario testing',
      'Growth simulation',
      'Yield prediction',
    ],
    color: 'primary',
    link: '#',
  },
  {
    id: 4,
    icon: <Target className="w-8 h-8" />,
    title: 'Multi-Objective Optimization',
    shortDescription: 'Balance multiple goals',
    fullDescription: 'Our genetic algorithm optimizes for multiple objectives simultaneously, balancing yield, climate resilience, nutrient efficiency, and pest resistance.',
    details: [
      'Multi-objective optimization',
      'Genetic algorithm processing',
      'Trade-off analysis',
      'Optimal solution selection',
    ],
    color: 'accent',
    link: '#',
  },
  {
    id: 5,
    icon: <Dna className="w-8 h-8" />,
    title: 'CRISPR Guide Design',
    shortDescription: 'Automated sgRNA design',
    fullDescription: 'Get automated sgRNA (single guide RNA) designs with predicted on-target and off-target scoring. Ensure precise and safe gene editing.',
    details: [
      'sgRNA sequence generation',
      'On-target efficiency scoring',
      'Off-target risk assessment',
      'Guide RNA optimization',
    ],
    color: 'primary',
    link: '#',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text mb-4">
          How It Works
        </h2>
        <p className="text-lg sm:text-xl text-text/70 max-w-3xl mx-auto leading-relaxed">
          Our 5-stage pipeline takes you from trait discovery to ready-to-use CRISPR guides. 
          Each stage builds upon the previous one, creating a comprehensive workflow for gene editing.
        </p>
        <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
      </div>
      
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6">
          {stages.map((stage, index) => {
            const isPrimary = stage.color === 'primary';
            const isLast = index === stages.length - 1;
            
            return (
              <div key={stage.id} className="relative">
                {/* Connecting Arrow */}
                {!isLast && (
                  <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary opacity-30 hidden sm:block z-0" />
                )}
                
                <Card
                  hover
                  className="relative overflow-hidden cursor-pointer group"
                  onClick={() => {
                    console.log(`Learn more about ${stage.title}`);
                    // Navigate to detailed page
                  }}
                >
                  {/* Step Number */}
                  <div className="absolute top-6 left-6 z-10">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-lg ${
                      isPrimary 
                        ? 'bg-primary text-background' 
                        : 'bg-accent text-background'
                    }`}>
                      {stage.id}
                    </div>
                  </div>
                  
                  <div className="pl-24 pr-6 py-6">
                    <div className="flex items-start justify-between gap-6 mb-4">
                      <div className="flex-1">
                        <div className={`inline-flex items-center gap-3 mb-3 ${
                          isPrimary ? 'text-primary' : 'text-accent'
                        }`}>
                          {stage.icon}
                          <div>
                            <h3 className="text-2xl font-bold text-text">{stage.title}</h3>
                            <p className="text-sm text-text/60 font-medium">{stage.shortDescription}</p>
                          </div>
                        </div>
                        <p className="text-base text-text/80 leading-relaxed mb-4">
                          {stage.fullDescription}
                        </p>
                      </div>
                    </div>
                    
                    {/* Details Grid */}
                    <div className="bg-secondary/20 rounded-lg p-4 mb-4 border-l-4 border-primary">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-primary" />
                        <p className="text-xs font-semibold text-text/70 uppercase tracking-wide">
                          Key Features:
                        </p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {stage.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                              isPrimary ? 'bg-primary' : 'bg-accent'
                            }`} />
                            <span className="text-sm text-text/80 leading-relaxed">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-text/60">
                        Stage {stage.id} of {stages.length}
                      </div>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Learn more about ${stage.title}`);
                        }}
                        className={`group-hover:scale-105 transition-transform ${
                          isPrimary 
                            ? 'border-primary text-primary hover:bg-primary hover:text-background' 
                            : 'border-accent text-accent hover:bg-accent hover:text-background'
                        }`}
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${
                    isPrimary ? 'bg-primary' : 'bg-accent'
                  }`} />
                </Card>
              </div>
            );
          })}
        </div>
        
        {/* Summary Card */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20">
          <div className="text-center p-6">
            <h3 className="text-xl font-bold text-text mb-2">Complete Pipeline</h3>
            <p className="text-text/70 mb-4">
              Follow all 5 stages to go from trait discovery to ready-to-use CRISPR guides
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                console.log('Start using the pipeline');
              }}
            >
              Start Using Pipeline
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
