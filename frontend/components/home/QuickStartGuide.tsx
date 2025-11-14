'use client';

import { useRouter } from 'next/navigation';
import { BookOpen, Play, FileText, Rocket, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function QuickStartGuide() {
  const router = useRouter();

  const steps = [
    {
      number: 1,
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Understand the Basics',
      description: 'Learn about gene editing and CRISPR technology',
      detailedDescription: 'Get familiar with the fundamentals of gene editing, how CRISPR works, and the science behind our platform. This section covers everything you need to know before diving into the tools.',
      content: [
        'Introduction to Gene Editing',
        'CRISPR-Cas9 Technology Explained',
        'How Our Platform Works',
        'Key Concepts and Terminology',
      ],
      ctaText: 'Start Learning',
      onClick: () => {
        router.push('/home/how-it-works');
      },
      color: 'primary',
    },
    {
      number: 2,
      icon: <Play className="w-8 h-8" />,
      title: 'Try a Demo',
      description: 'Experience the platform hands-on',
      detailedDescription: 'Interact with our Digital Twin Simulation to see how DNA editing works in real-time. Watch as CRISPR edits are applied and validated through our simulation engine.',
      content: [
        'Interactive DNA Editing Demo',
        'Real-time Simulation',
        'Step-by-step Process',
        'Visual Learning Experience',
      ],
      ctaText: 'Launch Demo',
      onClick: () => {
        router.push('/home/simulation');
      },
      color: 'accent',
    },
    {
      number: 3,
      icon: <FileText className="w-8 h-8" />,
      title: 'Documentation',
      description: 'Learn concepts, workflows, and best practices',
      detailedDescription: 'Access comprehensive documentation covering all aspects of the platform. From beginner tutorials to advanced workflows, find everything you need to master gene editing.',
      content: [
        'Getting Started Guides',
        'API Documentation',
        'Workflow Tutorials',
        'Best Practices & Tips',
      ],
      ctaText: 'View Documentation',
      onClick: () => {
        console.log('Navigate to documentation');
      },
      color: 'primary',
    },
    {
      number: 4,
      icon: <Rocket className="w-8 h-8" />,
      title: 'Start Your Project',
      description: 'Begin designing your first gene edit',
      detailedDescription: 'Ready to create? Start your first project using our AI-powered tools. Design CRISPR edits, validate them, and optimize for your desired traits.',
      content: [
        'Create New Project',
        'Design Your First Edit',
        'Run Validations',
        'Export Results',
      ],
      ctaText: 'Create Project',
      onClick: () => {
        router.push('/dashboard');
      },
      color: 'accent',
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
          Quick Start Guide
        </h2>
        <p className="text-lg text-text/70 max-w-2xl mx-auto">
          Follow these steps to get started with AgrIQ. Complete each step to unlock the next one.
        </p>
        <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {steps.map((step, index) => {
          const isPrimary = step.color === 'primary';
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.number} className="relative">
              {/* Connecting Line */}
              {!isLast && (
                <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary opacity-30 hidden sm:block" />
              )}
              
              <Card
                hover
                className="relative overflow-hidden cursor-pointer group"
                onClick={step.onClick}
              >
                {/* Step Number Badge */}
                <div className="absolute top-6 left-6 z-10">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg ${
                    isPrimary 
                      ? 'bg-primary text-background' 
                      : 'bg-accent text-background'
                  }`}>
                    {step.number}
                  </div>
                </div>
                
                <div className="pl-24 pr-6 py-6">
                  <div className="flex items-start justify-between gap-6 mb-4">
                    <div className="flex-1">
                      <div className={`inline-flex items-center gap-3 mb-3 ${
                        isPrimary ? 'text-primary' : 'text-accent'
                      }`}>
                        {step.icon}
                        <h3 className="text-2xl font-bold text-text">{step.title}</h3>
                      </div>
                      <p className="text-base text-text/80 mb-3 leading-relaxed">
                        {step.description}
                      </p>
                      <p className="text-sm text-text/60 leading-relaxed mb-4">
                        {step.detailedDescription}
                      </p>
                    </div>
                  </div>
                  
                  {/* Content Preview */}
                  <div className="bg-secondary/20 rounded-lg p-4 mb-4 border-l-4 border-primary">
                    <p className="text-xs font-semibold text-text/70 mb-3 uppercase tracking-wide">
                      What You'll Learn:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {step.content.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-text/80">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-text/60">
                      <Circle className="w-4 h-4" />
                      <span>Step {step.number} of {steps.length}</span>
                    </div>
                    <Button
                      variant={isPrimary ? 'primary' : 'secondary'}
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation();
                        step.onClick();
                      }}
                      className="group-hover:scale-105 transition-transform"
                    >
                      {step.ctaText}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
                
                {/* Hover Effect Gradient */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${
                  isPrimary ? 'bg-primary' : 'bg-accent'
                }`} />
              </Card>
            </div>
          );
        })}
      </div>
    </section>
  );
}
