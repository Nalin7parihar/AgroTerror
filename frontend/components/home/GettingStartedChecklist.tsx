'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check, Circle } from 'lucide-react';

const checklistItems = [
  { id: 'basics', label: 'Read basics of gene editing' },
  { id: 'pipeline', label: 'Understand the pipeline' },
  { id: 'tutor', label: 'Try the AI tutor' },
  { id: 'demo', label: 'Explore a demo project' },
  { id: 'edit', label: 'Start your first edit design' },
];

export function GettingStartedChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('onboarding-checklist');
    if (saved) {
      try {
        setCheckedItems(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to load checklist:', e);
      }
    }
  }, []);

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
    localStorage.setItem('onboarding-checklist', JSON.stringify(Array.from(newChecked)));
  };

  const progress = (checkedItems.size / checklistItems.length) * 100;
  const allComplete = checkedItems.size === checklistItems.length;

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-text mb-4">
              Getting Started Checklist
            </h2>
            <p className="text-lg text-text/70 max-w-2xl mx-auto">
              Track your onboarding progress
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
          </div>
          
          <Card>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text">Progress</span>
                <span className="text-sm font-medium text-primary">
                  {checkedItems.size} / {checklistItems.length}
                </span>
              </div>
              <div className="w-full h-3 bg-secondary/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            {/* Checklist Items */}
            <div className="space-y-4">
              {checklistItems.map((item) => {
                const isChecked = checkedItems.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-lg hover:bg-secondary/20 transition-colors group"
                  >
                    <div className={`flex-shrink-0 transition-all duration-200 ${
                      isChecked ? 'text-primary' : 'text-text/30 group-hover:text-text/50'
                    }`}>
                      {isChecked ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`flex-1 text-base transition-all duration-200 ${
                      isChecked
                        ? 'text-text/60 line-through'
                        : 'text-text font-medium'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {/* Completion Message */}
            {allComplete && (
              <div className="mt-8 p-6 bg-primary/10 rounded-xl border-2 border-primary/30">
                <p className="text-center text-lg font-semibold text-primary mb-4">
                  🎉 Congratulations! You're all set!
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    // Placeholder for navigation to dashboard
                    console.log('Navigate to dashboard');
                  }}
                >
                  Start Your First Project
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}

