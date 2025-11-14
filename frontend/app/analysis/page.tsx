'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Dna, Microscope, Activity, Zap, Shield, Database, Cpu, Play, Pause } from 'lucide-react';

const DNALab3D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
    };

    resize();
    window.addEventListener('resize', resize);

    let animationId: number | undefined;
    let rotation = 0;
    let time = 0;

    const colors = {
      adenine: '#00ff88',
      thymine: '#ff0088',
      cytosine: '#00d4ff',
      guanine: '#ffaa00',
      backbone: '#4a9eff'
    };

    const baseCount = 24;
    const helixRadius = 70;
    const helixHeight = 350;
    const turns = 3;

    const animate = () => {
      if (isRotating) {
        rotation += 0.01;
        time += 1;
      }

      const width = canvas.width / 2;
      const height = canvas.height / 2;

      ctx.clearRect(0, 0, width, height);

      // Grid background - use theme-aware color
      const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#00bf63';
      ctx.strokeStyle = gridColor + '15'; // Add transparency
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      const segments = [];

      for (let i = 0; i < baseCount; i++) {
        const t = i / baseCount;
        const y = (t - 0.5) * helixHeight;
        const angle1 = rotation + t * Math.PI * 2 * turns;
        const angle2 = angle1 + Math.PI;

        const wave = Math.sin(time * 0.002 + i * 0.3) * 5;

        const x1 = Math.cos(angle1) * (helixRadius + wave);
        const z1 = Math.sin(angle1) * (helixRadius + wave);
        const x2 = Math.cos(angle2) * (helixRadius + wave);
        const z2 = Math.sin(angle2) * (helixRadius + wave);

        segments.push({ z: (z1 + z2) / 2, i, x1, y, z1, x2, z2 });
      }

      segments.sort((a, b) => a.z - b.z);

      segments.forEach(seg => {
        const p1 = 600 / (600 + seg.z1);
        const sx1 = seg.x1 * p1 + width / 2;
        const sy1 = seg.y * p1 + height / 2;

        const p2 = 600 / (600 + seg.z2);
        const sx2 = seg.x2 * p2 + width / 2;
        const sy2 = seg.y * p2 + height / 2;

        const baseType = seg.i % 4;
        const color = baseType === 0 ? colors.adenine : baseType === 1 ? colors.thymine : baseType === 2 ? colors.cytosine : colors.guanine;

        // Draw base pair connection with gradient
        const gradient = ctx.createLinearGradient(sx1, sy1, sx2, sy2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, color);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 * Math.min(p1, p2);
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw backbone nodes - use theme primary color
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#00bf63';
        ctx.shadowBlur = 15;
        ctx.shadowColor = primaryColor;
        ctx.fillStyle = primaryColor + '80'; // Add transparency
        ctx.beginPath();
        ctx.arc(sx1, sy1, 4 * p1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx2, sy2, 4 * p2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw base nodes
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx1, sy1, 3 * p1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx2, sy2, 3 * p2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isRotating]);

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
                  <span className="text-xl sm:text-2xl font-bold text-[var(--primary)]">24</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[var(--secondary)]/30 rounded-lg">
                  <span className="text-[var(--text)]/70 text-xs sm:text-sm">Helix Turns</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--primary)]">3</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[var(--secondary)]/30 rounded-lg">
                  <span className="text-[var(--text)]/70 text-xs sm:text-sm">Rotation</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--accent)]">{isRotating ? 'Active' : 'Paused'}</span>
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
                  <h2 className="text-lg sm:text-xl font-bold">3D DNA Helix Visualization</h2>
                </div>
                <button
                  onClick={() => setIsRotating(!isRotating)}
                  className="p-2 sm:p-3 bg-[var(--primary)]/20 hover:bg-[var(--primary)]/30 rounded-lg transition"
                  aria-label={isRotating ? 'Pause animation' : 'Play animation'}
                >
                  {isRotating ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />}
                </button>
              </div>

              {/* Canvas Container - Responsive */}
              <div className="relative bg-[var(--background)]/50 rounded-lg overflow-hidden border border-[var(--primary)]/20" style={{ height: '300px', minHeight: '300px' }}>
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              </div>

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
