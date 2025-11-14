import { OnboardingHeader } from '@/components/home/OnboardingHeader';
import { SimulationDemo } from '@/components/home/SimulationDemo';
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SimulationPage() {
  return (
    <>
      <OnboardingHeader />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Link href="/home">
              <Button
                variant="outline"
                size="sm"
                className="mb-8"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            {/* Simulation Section */}
            <SimulationDemo />
          </div>
        </div>
      </main>
      <ChatbotWidget />
    </>
  );
}

