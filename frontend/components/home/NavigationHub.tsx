'use client';

import { Card } from '../ui/Card';
import { MessageSquare, Workflow, BookOpen, GraduationCap, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

const links = [
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'AI Tutor',
    description: 'Chat with our AI assistant',
    href: '#',
    color: 'primary',
  },
  {
    icon: <Workflow className="w-6 h-6" />,
    title: 'Pipeline Dashboard',
    description: 'Access main workflow tools',
    href: '#',
    color: 'accent',
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Educational Resources',
    description: 'Learning materials and guides',
    href: '#',
    color: 'primary',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Documentation',
    description: 'Complete platform documentation',
    href: '#',
    color: 'accent',
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Examples & Tutorials',
    description: 'Guided examples and walkthroughs',
    href: '#',
    color: 'primary',
  },
];

export function NavigationHub() {
  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-secondary/5 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-text mb-4">
            Quick Navigation
          </h2>
          <p className="text-lg text-text/70 max-w-2xl mx-auto">
            Access key platform sections and resources
          </p>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {links.map((link, index) => {
            const isPrimary = link.color === 'primary';
            return (
              <Card
                key={index}
                hover
                className="group cursor-pointer"
                onClick={() => {
                  // Placeholder navigation
                  console.log(`Navigate to ${link.title}`);
                }}
              >
                <div className={`mb-4 group-hover:scale-110 transition-transform duration-300 ${
                  isPrimary ? 'text-primary' : 'text-accent'
                }`}>
                  {link.icon}
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">{link.title}</h3>
                <p className="text-sm text-text/70 mb-4">{link.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Explore
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

