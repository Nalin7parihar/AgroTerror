'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Brain, Dna, Zap, Shield, TrendingUp, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { getAuthToken } from '@/lib/api';
import { DNAModel3DWrapper } from '@/components/animations/DNAModel3DWrapper';

export default function LandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Only check authentication on client side to avoid hydration mismatch
    setIsAuthenticated(!!getAuthToken());
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Powered Design',
      description: 'Advanced algorithms identify optimal gene edits for desired traits',
    },
    {
      icon: <Dna className="w-6 h-6" />,
      title: 'CRISPR Technology',
      description: 'Precise gene editing with validated guide RNA design',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Digital Twin',
      description: 'Simulate and validate edits before lab implementation',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Climate Resilient',
      description: 'Create crops resistant to drought, pests, and extreme weather',
    },
  ];

  const benefits = [
    'Multi-omics data integration',
    'Automated trait discovery',
    'Off-target effect prediction',
    'Multi-objective optimization',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="AgrIQ"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/home')}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push('/register')}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-12">
              {/* Hero Content - Now on the left */}
              <div className="order-1 lg:order-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>Automated Trait Discovery & Gene Editing Pipeline</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text mb-4 leading-tight">
                  AI-Powered Gene Editing
                  <br />
                  <span className="text-primary relative">
                    for Agriculture
                    <span className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary rounded-full opacity-50" />
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg text-text/70 mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Design optimal CRISPR edits with AI. From trait discovery to validated gene modifications, 
                  our platform accelerates agricultural biotechnology research and helps you create 
                  crops with enhanced yield, resilience, and nutritional value.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => router.push(isAuthenticated ? '/home' : '/register')}
                    className="group"
                  >
                    Start Creating
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push('/home')}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
              
              {/* 3D DNA Model - Seamless Integration - Now on the right */}
              <div className="order-2 lg:order-2 h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] xl:h-[600px] w-full relative group">
                {/* Professional glow effect behind the model */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-3xl blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                {/* Main container - professional frame */}
                <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                  <DNAModel3DWrapper className="w-full h-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-text mb-3">
                Powerful Features
              </h2>
              <p className="text-base text-text/70 max-w-2xl mx-auto">
                Everything you need to design and validate gene edits for agriculture
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  hover
                  className="p-6 text-center group"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-text mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-text/70 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="py-20 sm:py-24 bg-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-text mb-3">
                How It Works
              </h2>
              <p className="text-base text-text/70 max-w-2xl mx-auto">
                From trait discovery to validated edits in five simple steps
              </p>
            </div>

            <div className="space-y-8">
              {[
                { step: '1', title: 'Trait Mining', desc: 'AI analyzes multi-omics data to identify candidate genes' },
                { step: '2', title: 'Edit Design', desc: 'Optimal CRISPR edits suggested with off-target predictions' },
                { step: '3', title: 'Validation', desc: 'Digital twin simulations test edits across scenarios' },
                { step: '4', title: 'Optimization', desc: 'Multi-objective balancing of yield, resilience, and efficiency' },
                { step: '5', title: 'Guide Design', desc: 'Automated sgRNA generation with on-target scoring' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-6 p-6 rounded-xl bg-background border border-secondary/20 hover:border-primary/30 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-background flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text/70">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6">
                  <TrendingUp className="w-4 h-4" />
                  <span>Why Choose AgrIQ</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
                  Accelerate Your Research
                </h2>
                <p className="text-base text-text/70 mb-6 leading-relaxed">
                  Reduce months of trial and error with AI-powered insights. 
                  Our platform combines cutting-edge machine learning with 
                  validated biological models to deliver actionable results.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-text/80">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Card className="p-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                      <Brain className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-text">AI-Driven</div>
                      <div className="text-xs text-text/60">Intelligent design recommendations</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                      <Shield className="w-7 h-7 text-accent" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-text">Validated</div>
                      <div className="text-xs text-text/60">Simulation-backed results</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-secondary/30 flex items-center justify-center">
                      <Zap className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-text">Fast</div>
                      <div className="text-xs text-text/60">From idea to validated edit</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Ready to Accelerate Your Research?
            </h2>
            <p className="text-lg text-text/70 mb-8 leading-relaxed">
              Join researchers and scientists using AI to design optimal gene edits 
              and validate them through digital twin simulations before lab work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push(isAuthenticated ? '/home' : '/register')}
                className="group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/home')}
              >
                Explore Platform
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-secondary/20 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-text/60 text-sm">
              © 2024 AgrIQ. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/home" className="text-text/60 hover:text-primary transition-colors">
                Platform
              </Link>
              <Link href="/dashboard/chatbot" className="text-text/60 hover:text-primary transition-colors">
                AI Tutor
              </Link>
              <Link href="#" className="text-text/60 hover:text-primary transition-colors">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
