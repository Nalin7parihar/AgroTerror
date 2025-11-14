import { OnboardingHeader } from '@/components/home/OnboardingHeader';
import { Card } from '@/components/ui/Card';

export default function DashboardPage() {
  return (
    <>
      <OnboardingHeader />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <Card>
              <h1 className="text-3xl font-bold text-text mb-4">Dashboard</h1>
              <p className="text-text/70">
                Your dashboard is coming soon. This is where you'll manage your projects and gene editing workflows.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

