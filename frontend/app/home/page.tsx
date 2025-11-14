'use client';

import { useRouter } from 'next/navigation';
import { OnboardingHeader } from '@/components/home/OnboardingHeader';
import { QuickStartGuide } from '@/components/home/QuickStartGuide';
import { FAQPreview } from '@/components/home/FAQPreview';
import { GettingStartedChecklist } from '@/components/home/GettingStartedChecklist';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const router = useRouter();
  return (
    <>
      <OnboardingHeader />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Section */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="text-center">
                <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                  Welcome Back
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-4 leading-tight">
                  Welcome to{' '}
                  <span className="text-primary relative">
                    AgrIQ
                    <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full" />
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-text/80 mb-6 leading-relaxed max-w-2xl mx-auto">
                  Your gateway to AI-powered gene editing for agriculture. 
                  Learn how to use our platform and start creating climate-resilient crops.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      router.push('/dashboard');
                    }}
                  >
                    Start Your Project
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      const element = document.getElementById('quick-start');
                      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    Begin Onboarding
                  </Button>
                </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="max-w-5xl mx-auto space-y-16">
            <div id="quick-start">
              <QuickStartGuide />
            </div>
            <FAQPreview />
            <GettingStartedChecklist />
          </div>
        </div>
      </main>
    </>
  );
}
