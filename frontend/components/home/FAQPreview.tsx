'use client';

import { useState } from 'react';
import { Card } from '../ui/Card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';

const faqs = [
  {
    question: 'What is Gene Editing?',
    answer: 'Gene editing is a technology that allows scientists to make precise changes to DNA sequences in living cells. It enables the addition, removal, or alteration of genetic material at specific locations in the genome, offering unprecedented control over genetic traits.',
  },
  {
    question: 'What is CRISPR?',
    answer: 'CRISPR (Clustered Regularly Interspaced Short Palindromic Repeats) is a revolutionary gene-editing technology that acts like molecular scissors. It uses a protein called Cas9 to cut DNA at specific locations, allowing researchers to add, remove, or modify genetic material with high precision.',
  },
  {
    question: 'How does CRISPR help agriculture?',
    answer: 'CRISPR enables scientists to develop crops with improved traits such as drought resistance, pest resistance, higher nutritional value, and better yield. By precisely editing genes, we can create climate-resilient crops that can thrive in challenging environmental conditions, helping ensure food security for a growing global population.',
  },
  {
    question: 'How does our platform work?',
    answer: 'Our platform uses AI to analyze multi-omics data and identify optimal gene edits for desired traits. We then validate these edits through digital twin simulations before actual CRISPR editing. The platform guides you through trait mining, edit design, validation, optimization, and CRISPR guide design in a streamlined workflow.',
  },
  {
    question: 'What can I do with this platform?',
    answer: 'You can design CRISPR edits for crops, validate them through simulations, optimize for multiple objectives (yield, resilience, efficiency), and generate CRISPR guide RNAs. The platform provides end-to-end support from trait discovery to final edit design.',
  },
  {
    question: 'Do I need prior knowledge?',
    answer: 'While some background in biology or genetics is helpful, our platform is designed to be accessible. We provide educational resources, documentation, and an AI tutor to help you understand the concepts and use the tools effectively.',
  },
  {
    question: 'How accurate are the simulations?',
    answer: 'Our digital twin simulations use validated models based on extensive research data. While simulations provide valuable insights and reduce the need for physical experiments, actual lab validation is still recommended for final confirmation of edit outcomes.',
  },
];

export function FAQPreview() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-text mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-text/70 max-w-2xl mx-auto">
            Get answers to common questions about gene editing, CRISPR, and our platform
          </p>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
        </div>
        
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              hover
              className="overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left flex items-center justify-between p-2"
              >
                <h3 className="text-lg font-semibold text-text pr-4">{faq.question}</h3>
                <div className="text-primary flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="mt-4 pt-4 border-t border-secondary/20">
                  <p className="text-text/80 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Card className="inline-block">
            <p className="text-text/70 mb-4">Still have questions?</p>
            <Button
              variant="primary"
              onClick={() => {
                // Placeholder for chatbot
                console.log('Open chatbot');
              }}
            >
              Ask the AI Tutor
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}

