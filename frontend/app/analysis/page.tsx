'use client';

import React, { useState } from 'react';
import { Dna, Microscope, Activity, Zap, Shield, Database, Cpu, Play, Pause, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';

const RealTimeDNAEditingWrapper = dynamic(
  () => import('@/components/animations/RealTimeDNAEditingWrapper').then(mod => ({ default: mod.RealTimeDNAEditingWrapper })),
  { ssr: false, loading: () => <div className="w-full h-full bg-secondary/10 animate-pulse rounded-lg flex items-center justify-center"><p className="text-text/50">Loading simulation...</p></div> }
);

const DNALab3D = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      {/* Animated background stars */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              backgroundColor: 'var(--primary)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-[var(--primary)]/30 bg-[var(--background)]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--primary)]/20 rounded-lg">
                <Dna className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--primary)]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-wide">DNA LAB</h1>
                <p className="text-xs text-[var(--primary)]">Genetic Research Interface v3.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="px-3 sm:px-4 py-2 bg-[var(--primary)]/20 rounded-lg border border-[var(--primary)]/50">
                <p className="text-xs text-[var(--primary)]">STATUS: ONLINE</p>
              </div>
              <button className="px-4 sm:px-6 py-2 bg-[var(--primary)] rounded-lg font-semibold hover:opacity-90 transition text-sm sm:text-base text-[var(--background)]">
                Start Analysis
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* System Status */}
            <div className="bg-[var(--secondary)]/20 backdrop-blur-sm border border-[var(--primary)]/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-[var(--primary)]" />
                <h2 className="text-base sm:text-lg font-bold">System Status</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-[var(--text)]/70">Processing Power</span>
                    <span className="text-[var(--primary)]">87%</span>
                  </div>
                  <div className="h-2 bg-[var(--secondary)]/30 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--primary)] w-[87%] animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-[var(--text)]/70">Memory Usage</span>
                    <span className="text-[var(--primary)]">62%</span>
                  </div>
                  <div className="h-2 bg-[var(--secondary)]/30 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--secondary)] w-[62%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-[var(--text)]/70">Network Activity</span>
                    <span className="text-[var(--accent)]">45%</span>
                  </div>
                  <div className="h-2 bg-[var(--secondary)]/30 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] w-[45%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* DNA Helix Data */}
            <div className="bg-[var(--secondary)]/20 backdrop-blur-sm border border-[var(--primary)]/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-[var(--primary)]" />
                <h2 className="text-base sm:text-lg font-bold">DNA Helix Data</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[var(--secondary)]/30 rounded-lg">
                  <span className="text-[var(--text)]/70 text-xs sm:text-sm">Base Pairs</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--primary)]">20</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[var(--secondary)]/30 rounded-lg">
                  <span className="text-[var(--text)]/70 text-xs sm:text-sm">Simulation</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--accent)]">{isPlaying ? 'Active' : 'Paused'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[var(--secondary)]/30 rounded-lg">
                  <span className="text-[var(--text)]/70 text-xs sm:text-sm">Progress</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--primary)]">{Math.round(progress * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Lab Tools */}
            <div className="bg-[var(--secondary)]/20 backdrop-blur-sm border border-[var(--primary)]/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Microscope className="w-5 h-5 text-[var(--primary)]" />
                <h2 className="text-base sm:text-lg font-bold">Lab Tools</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[
                  { icon: Cpu, label: 'Sequence', color: 'primary' },
                  { icon: Zap, label: 'Analyze', color: 'primary' },
                  { icon: Shield, label: 'Validate', color: 'secondary' },
                  { icon: Database, label: 'Store', color: 'accent' }
                ].map((tool, idx) => (
                  <button
                    key={idx}
                    className="p-3 sm:p-4 bg-[var(--secondary)]/30 hover:bg-[var(--secondary)]/50 border border-[var(--primary)]/30 rounded-lg transition group"
                  >
                    <tool.icon 
                      className="w-5 h-5 sm:w-6 sm:h-6 mb-2 mx-auto group-hover:scale-110 transition"
                      style={{ color: `var(--${tool.color})` }}
                    />
                    <p className="text-xs sm:text-sm">{tool.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Main Area - DNA Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--secondary)]/20 backdrop-blur-sm border border-[var(--primary)]/30 rounded-xl p-4 sm:p-6 h-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Dna className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
                  <h2 className="text-lg sm:text-xl font-bold">3D DNA Editing Simulation</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 sm:p-3 bg-[var(--primary)]/20 hover:bg-[var(--primary)]/30 rounded-lg transition"
                    aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 sm:p-3 bg-[var(--secondary)]/20 hover:bg-[var(--secondary)]/30 rounded-lg transition"
                    aria-label="Reset simulation"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
                  </button>
                </div>
              </div>

              {/* 3D DNA Editing Simulation Container */}
              <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg overflow-hidden border border-[var(--primary)]/20" style={{ height: '500px', minHeight: '500px' }}>
                <RealTimeDNAEditingWrapper 
                  className="w-full h-full absolute inset-0"
                  isPlaying={isPlaying}
                  onProgressChange={setProgress}
                />
                
                {/* Overlay Instructions */}
                {!isPlaying && progress === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/50 backdrop-blur-sm z-10">
                    <div className="text-center p-6 bg-[var(--background)]/90 rounded-xl border-2 border-[var(--primary)]/20">
                      <p className="text-lg font-semibold text-[var(--text)] mb-2">Ready to Start?</p>
                      <p className="text-sm text-[var(--text)]/70 mb-4">Click Play to begin the DNA editing simulation</p>
                      <button
                        onClick={() => setIsPlaying(true)}
                        className="px-4 py-2 bg-[var(--primary)] rounded-lg font-semibold hover:opacity-90 transition text-sm text-[var(--background)]"
                      >
                        <Play className="w-4 h-4 inline mr-2" />
                        Start Simulation
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              {progress > 0 && (
                <div className="mt-4">
                  <div className="w-full h-2 bg-[var(--secondary)]/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300 rounded-full"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--text)]/50 mt-2 text-center">
                    Edit Progress: {Math.round(progress * 100)}%
                  </p>
                </div>
              )}

              {/* Base Pairs Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
                {[
                  { label: 'Adenine', color: '#00ff88' },
                  { label: 'Thymine', color: '#ff0088' },
                  { label: 'Cytosine', color: '#00d4ff' },
                  { label: 'Guanine', color: '#ffaa00' }
                ].map((base, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 sm:p-3 bg-[var(--secondary)]/30 rounded-lg">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0" style={{ backgroundColor: base.color, boxShadow: `0 0 10px ${base.color}` }}></div>
                    <span className="text-xs sm:text-sm">{base.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {[
            { icon: Activity, title: 'Real-time Analysis', desc: 'Monitor DNA structure changes live', color: 'primary' },
            { icon: Shield, title: 'Secure Storage', desc: 'Encrypted genetic data protection', color: 'secondary' },
            { icon: Zap, title: 'Fast Processing', desc: 'High-speed computational analysis', color: 'accent' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-[var(--secondary)]/20 backdrop-blur-sm border border-[var(--primary)]/30 rounded-xl p-4 sm:p-6 hover:border-[var(--primary)]/60 transition">
              <feature.icon 
                className="w-6 h-6 sm:w-8 sm:h-8 mb-3"
                style={{ color: `var(--${feature.color})` }}
              />
              <h3 className="text-base sm:text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-[var(--text)]/70 text-xs sm:text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--primary)]/30 bg-[var(--background)]/80 backdrop-blur-md mt-8 sm:mt-12 py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6 text-center text-[var(--text)]/70 text-xs sm:text-sm">
          <p>© 2024 DNA LAB - Advanced Genetic Research Platform | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default DNALab3D;
