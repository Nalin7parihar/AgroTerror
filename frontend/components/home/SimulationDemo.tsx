'use client';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const RealTimeDNAEditingWrapper = dynamic(
  () => import('../animations/RealTimeDNAEditingWrapper').then(mod => ({ default: mod.RealTimeDNAEditingWrapper })),
  { ssr: false, loading: () => <div className="w-full h-full bg-secondary/10 animate-pulse rounded-lg flex items-center justify-center"><p className="text-text/50">Loading simulation...</p></div> }
);

export function SimulationDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <section id="simulation-demo" className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-text mb-4">
            Digital Twin Simulation
          </h2>
          <p className="text-lg text-text/70 max-w-2xl mx-auto">
            Experience real-time DNA strand editing in our interactive simulation. Watch as CRISPR edits are applied to DNA strands.
          </p>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
        </div>
        
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8 min-h-[600px] relative overflow-hidden">
              <RealTimeDNAEditingWrapper 
                className="w-full h-full absolute inset-0"
                isPlaying={isPlaying}
                onProgressChange={setProgress}
              />
              
              {/* Overlay Instructions */}
              {!isPlaying && progress === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                  <div className="text-center p-6 bg-background/90 rounded-xl border-2 border-primary/20">
                    <p className="text-lg font-semibold text-text mb-2">Ready to Start?</p>
                    <p className="text-sm text-text/70 mb-4">Click Play to begin the DNA editing simulation</p>
                    <Button
                      variant="primary"
                      onClick={() => setIsPlaying(true)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Simulation
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <Button
                variant="primary"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            
            {progress > 0 && (
              <div className="mt-4">
                <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <p className="text-xs text-text/50 mt-2 text-center">
                  Edit Progress: {Math.round(progress * 100)}%
                </p>
              </div>
            )}
          </Card>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-text mb-2">Before Editing</h3>
              <p className="text-sm text-text/70 mb-4">
                Original DNA sequence with target gene highlighted
              </p>
              <div className="bg-secondary/30 rounded-lg p-4 font-mono text-xs text-text/80">
                ATGCGATCGATCGATCGATCG...
              </div>
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold text-text mb-2">After Editing</h3>
              <p className="text-sm text-text/70 mb-4">
                Modified sequence with CRISPR edit applied
              </p>
              <div className="bg-primary/10 rounded-lg p-4 font-mono text-xs text-text/80 border-l-4 border-primary">
                ATGCGATCG<span className="text-primary font-bold">[EDIT]</span>ATCGATCG...
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

