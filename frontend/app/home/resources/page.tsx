'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, ExternalLink, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OnboardingHeader } from '@/components/home/OnboardingHeader';

export default function ResourcesPage() {
  const router = useRouter();

  const articles = [
    {
      id: 1,
      title: 'Introduction to CRISPR-Cas9 Technology',
      author: 'Dr. Sarah Chen',
      date: '2024-01-15',
      category: 'Technology',
      description: 'A comprehensive overview of CRISPR-Cas9 gene editing technology, its mechanisms, and applications in agriculture.',
      link: 'https://www.nature.com/articles/crispr-basics',
      tags: ['CRISPR', 'Gene Editing', 'Basics']
    },
    {
      id: 2,
      title: 'AI in Agricultural Biotechnology: Current Trends',
      author: 'Prof. Michael Rodriguez',
      date: '2024-02-20',
      category: 'AI & ML',
      description: 'Exploring how artificial intelligence is revolutionizing crop improvement and agricultural research.',
      link: 'https://www.science.org/ai-agriculture',
      tags: ['AI', 'Agriculture', 'Machine Learning']
    },
    {
      id: 3,
      title: 'Climate-Resilient Crops: A Guide to Trait Selection',
      author: 'Dr. Emily Watson',
      date: '2024-03-10',
      category: 'Research',
      description: 'Learn how to identify and select traits that enhance crop resilience to climate change.',
      link: 'https://www.researchgate.net/climate-resilience',
      tags: ['Climate', 'Traits', 'Resilience']
    },
    {
      id: 4,
      title: 'Multi-Omics Data Integration for Crop Improvement',
      author: 'Dr. James Park',
      date: '2024-03-25',
      category: 'Data Science',
      description: 'Understanding how genomics, transcriptomics, and metabolomics data can be integrated for better crop design.',
      link: 'https://www.biorxiv.org/multi-omics',
      tags: ['Omics', 'Data Integration', 'Genomics']
    },
    {
      id: 5,
      title: 'Digital Twin Simulations in Gene Editing',
      author: 'Dr. Lisa Anderson',
      date: '2024-04-05',
      category: 'Simulation',
      description: 'How digital twin technology enables validation of gene edits before laboratory work.',
      link: 'https://www.nature.com/digital-twins',
      tags: ['Simulation', 'Digital Twin', 'Validation']
    },
    {
      id: 6,
      title: 'Off-Target Effects: Detection and Mitigation',
      author: 'Dr. Robert Kim',
      date: '2024-04-18',
      category: 'Safety',
      description: 'Best practices for identifying and minimizing off-target effects in CRISPR editing.',
      link: 'https://www.cell.com/off-target-effects',
      tags: ['Safety', 'Off-Target', 'CRISPR']
    },
    {
      id: 7,
      title: 'CRISPR Guide RNA Design Principles',
      author: 'Dr. Maria Garcia',
      date: '2024-05-02',
      category: 'Design',
      description: 'Essential principles for designing effective guide RNAs with high on-target efficiency.',
      link: 'https://www.nature.com/guide-rna-design',
      tags: ['Guide RNA', 'Design', 'Efficiency']
    },
    {
      id: 8,
      title: 'Ethical Considerations in Agricultural Gene Editing',
      author: 'Dr. David Thompson',
      date: '2024-05-15',
      category: 'Ethics',
      description: 'Exploring the ethical implications and regulatory landscape of gene editing in agriculture.',
      link: 'https://www.science.org/ethics-gene-editing',
      tags: ['Ethics', 'Regulation', 'Agriculture']
    },
    {
      id: 9,
      title: 'Machine Learning for Trait Prediction',
      author: 'Dr. Jennifer Lee',
      date: '2024-05-28',
      category: 'AI & ML',
      description: 'How machine learning models can predict crop traits from genomic data.',
      link: 'https://www.biorxiv.org/ml-traits',
      tags: ['Machine Learning', 'Prediction', 'Traits']
    }
  ];

  const blogs = [
    {
      id: 1,
      title: 'Getting Started with AgrIQ: A Beginner\'s Journey',
      author: 'AgrIQ Team',
      date: '2024-06-01',
      category: 'Tutorial',
      description: 'Follow along as we guide you through your first gene editing project on AgrIQ.',
      link: '/home/documentation',
      tags: ['Tutorial', 'Getting Started']
    },
    {
      id: 2,
      title: 'Case Study: Improving Drought Resistance in Wheat',
      author: 'AgrIQ Research Team',
      date: '2024-06-10',
      category: 'Case Study',
      description: 'A detailed case study showing how AgrIQ was used to develop drought-resistant wheat varieties.',
      link: '/home/documentation',
      tags: ['Case Study', 'Wheat', 'Drought']
    },
    {
      id: 3,
      title: 'Understanding the AgrIQ Workflow',
      author: 'AgrIQ Team',
      date: '2024-06-20',
      category: 'Guide',
      description: 'A comprehensive guide to understanding and using the AgrIQ platform workflow.',
      link: '/home/documentation',
      tags: ['Workflow', 'Guide']
    }
  ];

  const categories = ['All', 'Technology', 'AI & ML', 'Research', 'Data Science', 'Simulation', 'Safety', 'Design', 'Ethics', 'Tutorial', 'Case Study', 'Guide'];

  return (
    <>
      <OnboardingHeader />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/home')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-text">Resources & Articles</h1>
                <p className="text-text/70 mt-1">Explore articles, blogs, and research on gene editing and agriculture</p>
              </div>
            </div>
            <div className="w-24 h-1 bg-primary rounded-full" />
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Research Articles Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-text mb-6">Research Articles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Card key={article.id} hover className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {article.category}
                      </span>
                      <ExternalLink className="w-4 h-4 text-text/40" />
                    </div>
                    <h3 className="text-lg font-bold text-text mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-text/70 mb-4 flex-grow line-clamp-3">{article.description}</p>
                    <div className="space-y-2 pt-4 border-t border-secondary/20">
                      <div className="flex items-center gap-2 text-xs text-text/60">
                        <User className="w-3 h-3" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text/60">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {article.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 rounded bg-secondary/20 text-xs text-text/70">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => window.open(article.link, '_blank')}
                      >
                        Read Article
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Blog Posts Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-text mb-6">Blog Posts & Guides</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {blogs.map((blog) => (
                  <Card key={blog.id} hover className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                        {blog.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-text mb-2">{blog.title}</h3>
                    <p className="text-sm text-text/70 mb-4">{blog.description}</p>
                    <div className="space-y-2 pt-4 border-t border-secondary/20">
                      <div className="flex items-center gap-2 text-xs text-text/60">
                        <User className="w-3 h-3" />
                        <span>{blog.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text/60">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {blog.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 rounded bg-secondary/20 text-xs text-text/70">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => router.push(blog.link)}
                      >
                        Read More
                        <ArrowLeft className="w-3 h-3 ml-2 rotate-180" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Quick Links */}
            <Card className="p-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
              <h3 className="text-2xl font-bold text-text mb-4">Explore More</h3>
              <p className="text-text/70 mb-6">
                Continue learning with our comprehensive documentation and interactive tools.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  onClick={() => router.push('/home/documentation')}
                >
                  View Documentation
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

