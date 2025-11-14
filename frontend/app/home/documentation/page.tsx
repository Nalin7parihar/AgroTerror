'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Code, Workflow, Lightbulb, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OnboardingHeader } from '@/components/home/OnboardingHeader';

export default function DocumentationPage() {
  const router = useRouter();

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <BookOpen className="w-6 h-6" />,
      content: [
        {
          title: 'Introduction to AgrIQ',
          description: 'Learn about our AI-powered gene editing platform and its capabilities.',
          topics: [
            'Platform Overview',
            'Key Features',
            'Use Cases',
            'System Requirements'
          ]
        },
        {
          title: 'Quick Start Guide',
          description: 'Get up and running with AgrIQ in minutes.',
          topics: [
            'Account Setup',
            'First Project Creation',
            'Basic Workflow',
            'Next Steps'
          ]
        },
        {
          title: 'Installation & Setup',
          description: 'Detailed instructions for setting up your environment.',
          topics: [
            'Prerequisites',
            'Installation Steps',
            'Configuration',
            'Verification'
          ]
        }
      ]
    },
    {
      id: 'api-documentation',
      title: 'API Documentation',
      icon: <Code className="w-6 h-6" />,
      content: [
        {
          title: 'Authentication',
          description: 'Learn how to authenticate and manage API access.',
          topics: [
            'JWT Tokens',
            'API Keys',
            'Rate Limiting',
            'Error Handling'
          ]
        },
        {
          title: 'Endpoints Reference',
          description: 'Complete reference for all available API endpoints.',
          topics: [
            'Authentication Endpoints',
            'LLM Query Endpoints',
            'Project Management',
            'Data Export'
          ]
        },
        {
          title: 'Request & Response Formats',
          description: 'Understand the data structures used in API calls.',
          topics: [
            'Request Schemas',
            'Response Formats',
            'Error Codes',
            'Best Practices'
          ]
        }
      ]
    },
    {
      id: 'workflows',
      title: 'Workflow Tutorials',
      icon: <Workflow className="w-6 h-6" />,
      content: [
        {
          title: 'Trait Discovery Workflow',
          description: 'Step-by-step guide to discovering traits using multi-omics data.',
          topics: [
            'Data Input',
            'AI Analysis',
            'Trait Identification',
            'Result Interpretation'
          ]
        },
        {
          title: 'Edit Design Process',
          description: 'Learn how to design optimal CRISPR edits for your target traits.',
          topics: [
            'Target Selection',
            'Edit Design',
            'Off-target Analysis',
            'Optimization'
          ]
        },
        {
          title: 'Validation & Simulation',
          description: 'Validate your edits using digital twin simulations.',
          topics: [
            'Simulation Setup',
            'Running Validations',
            'Interpreting Results',
            'Iterative Refinement'
          ]
        }
      ]
    },
    {
      id: 'best-practices',
      title: 'Best Practices & Tips',
      icon: <Lightbulb className="w-6 h-6" />,
      content: [
        {
          title: 'Design Guidelines',
          description: 'Best practices for designing effective gene edits.',
          topics: [
            'Target Selection',
            'Edit Efficiency',
            'Safety Considerations',
            'Optimization Strategies'
          ]
        },
        {
          title: 'Performance Optimization',
          description: 'Tips for improving platform performance and efficiency.',
          topics: [
            'Query Optimization',
            'Resource Management',
            'Caching Strategies',
            'Batch Processing'
          ]
        },
        {
          title: 'Troubleshooting',
          description: 'Common issues and their solutions.',
          topics: [
            'Common Errors',
            'Debugging Tips',
            'Support Resources',
            'FAQ'
          ]
        }
      ]
    }
  ];

  return (
    <>
      <OnboardingHeader />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-text">Documentation</h1>
                <p className="text-text/70 mt-1">Complete guide to using AgrIQ platform</p>
              </div>
            </div>
            <div className="w-24 h-1 bg-primary rounded-full" />
          </div>

          {/* Documentation Sections */}
          <div className="max-w-6xl mx-auto space-y-12">
            {sections.map((section, sectionIndex) => (
              <section key={section.id} id={section.id} className="scroll-mt-20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {section.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-text">{section.title}</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.content.map((item, itemIndex) => (
                    <Card key={itemIndex} hover className="p-6 h-full flex flex-col">
                      <h3 className="text-xl font-bold text-text mb-2">{item.title}</h3>
                      <p className="text-sm text-text/70 mb-4 flex-grow">{item.description}</p>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-text/60 uppercase tracking-wide mb-2">
                          Topics Covered:
                        </p>
                        {item.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-text/80">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Quick Links */}
          <div className="max-w-6xl mx-auto mt-16">
            <Card className="p-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
              <h3 className="text-2xl font-bold text-text mb-4">Need More Help?</h3>
              <p className="text-text/70 mb-6">
                Explore our resources or get in touch with our support team.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  onClick={() => router.push('/home/resources')}
                >
                  View Resources
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/chatbot')}
                >
                  Ask AI Tutor
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/home')}
                >
                  Back to Home
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

