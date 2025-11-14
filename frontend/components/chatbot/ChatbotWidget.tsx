'use client';

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-background rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
        aria-label="Open AI Tutor"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <Card className="w-full max-w-md h-[600px] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary/20">
              <div>
                <h3 className="text-lg font-semibold text-text">AI Tutor</h3>
                <p className="text-xs text-text/60">Your gene editing assistant</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text/60 hover:text-text transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="text-sm text-text/80">
                  👋 Hello! I'm your AI Tutor. I can help you understand gene editing, 
                  CRISPR technology, and how to use our platform. What would you like to know?
                </p>
              </div>
              
              <div className="bg-primary/10 rounded-lg p-4 border-l-4 border-primary">
                <p className="text-sm text-text/70">
                  <strong>Note:</strong> The chatbot feature is coming soon! 
                  For now, you can explore our FAQ section or documentation.
                </p>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-secondary/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  disabled
                  className="flex-1 px-4 py-2 border border-secondary/30 rounded-lg bg-background text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <Button
                  variant="primary"
                  size="md"
                  disabled
                  className="px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-text/50 mt-2 text-center">
                Chatbot will be available soon
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

