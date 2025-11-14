'use client';

import dynamic from 'next/dynamic';
import { Button } from '../ui/Button';

const DNAHelix3DWrapper = dynamic(
  () => import('../animations/DNAHelix3DWrapper').then(mod => ({ default: mod.DNAHelix3DWrapper })),
  { ssr: false, loading: () => <div className="w-full h-full bg-secondary/10 animate-pulse rounded-lg" /> }
);

export function HeroSection() {
  const scrollToOverview = () => {
    const element = document.getElementById('project-overview');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-secondary/5">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-text">Welcome to</span>{' '}
              <span className="text-primary">AgrIQ</span>
            </h1>
            <p className="text-xl sm:text-2xl text-text/80 font-medium">
              Learn how to use AI-powered gene editing for agriculture
            </p>
            <p className="text-base sm:text-lg text-text/60 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Discover how CRISPR technology and artificial intelligence work together 
              to create climate-resilient crops through precise gene editing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={scrollToOverview}
                className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 backdrop-blur-sm">
              <DNAHelix3DWrapper className="w-full h-full" autoRotate={true} rotationSpeed={0.5} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  );
}

