'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Bot, User, Sparkles, Languages, BookOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OnboardingHeader } from '@/components/home/OnboardingHeader';
import { queryLLM, type LLMQueryRequest, type ApiError, removeAuthToken } from '@/lib/api';
import { markdownToPlainText } from '@/lib/markdown-to-text';

type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';
type Language = 'en' | 'hi' | 'kn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const preloadedPrompts = [
  {
    id: '1',
    title: 'What is Gene Editing?',
    prompt: 'What is gene editing and how does it work?',
    category: 'Basics',
    difficulty: 'basic' as DifficultyLevel,
  },
  {
    id: '2',
    title: 'Understanding CRISPR',
    prompt: 'Explain CRISPR-Cas9 technology and its mechanism in detail.',
    category: 'CRISPR',
    difficulty: 'intermediate' as DifficultyLevel,
  },
  {
    id: '3',
    title: 'CRISPR in Agriculture',
    prompt: 'How can CRISPR technology be used to improve crop resilience and yield?',
    category: 'Applications',
    difficulty: 'intermediate' as DifficultyLevel,
  },
  {
    id: '4',
    title: 'Off-Target Effects',
    prompt: 'What are off-target effects in CRISPR editing and how can they be minimized?',
    category: 'Safety',
    difficulty: 'advanced' as DifficultyLevel,
  },
  {
    id: '5',
    title: 'Prime Editing vs Base Editing',
    prompt: 'Compare prime editing and base editing techniques. What are their advantages and limitations?',
    category: 'Techniques',
    difficulty: 'advanced' as DifficultyLevel,
  },
  {
    id: '6',
    title: 'Trait Mining Process',
    prompt: 'Explain how multi-omics data integration helps identify candidate genes for desired traits.',
    category: 'Platform',
    difficulty: 'intermediate' as DifficultyLevel,
  },
  {
    id: '7',
    title: 'Digital Twin Validation',
    prompt: 'How does digital twin simulation validate CRISPR edits before actual implementation?',
    category: 'Platform',
    difficulty: 'intermediate' as DifficultyLevel,
  },
  {
    id: '8',
    title: 'sgRNA Design',
    prompt: 'What factors should be considered when designing guide RNAs for CRISPR editing?',
    category: 'Design',
    difficulty: 'advanced' as DifficultyLevel,
  },
  {
    id: '9',
    title: 'Climate-Resilient Crops',
    prompt: 'How can gene editing help create crops that are resistant to drought and extreme temperatures?',
    category: 'Applications',
    difficulty: 'basic' as DifficultyLevel,
  },
  {
    id: '10',
    title: 'Ethical Considerations',
    prompt: 'What are the ethical considerations and regulations surrounding gene editing in agriculture?',
    category: 'Ethics',
    difficulty: 'intermediate' as DifficultyLevel,
  },
];

const difficultyLabels = {
  basic: 'Basic',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const languageLabels = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  kn: 'ಕನ್ನಡ (Kannada)',
};

export default function ChatbotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const request: LLMQueryRequest = {
        question: text,
        difficulty,
        language,
        allow_code_mixing: false,
      };

      const response = await queryLLM(request);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: markdownToPlainText(response.answer),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const apiError = err as ApiError;
      
      if (apiError.status === 401) {
        // Remove invalid/expired token
        removeAuthToken();
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }
      
      let errorMessage = 'Failed to get response from AI Tutor. ';
      if (apiError.status === 400) {
        errorMessage += apiError.detail || 'Invalid request.';
      } else if (apiError.status === 500) {
        errorMessage += 'Server error. Please try again later.';
      } else {
        errorMessage += apiError.detail || 'An unexpected error occurred.';
      }

      setError(errorMessage);
      
      const errorMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: typeof preloadedPrompts[0]) => {
    setDifficulty(prompt.difficulty);
    handleSendMessage(prompt.prompt);
  };

  const filteredPrompts = preloadedPrompts.filter(
    (p) => p.difficulty === difficulty
  );

  return (
    <>
      <OnboardingHeader />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="max-w-7xl mx-auto mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text">AI Tutor</h1>
                <p className="text-text/70">Your gene editing and CRISPR learning assistant</p>
              </div>
            </div>

            {/* Settings */}
            <Card className="p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-text mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Difficulty Level
                  </label>
                  <div className="flex gap-2">
                    {(['basic', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          difficulty === level
                            ? 'bg-primary text-background'
                            : 'bg-secondary/20 text-text hover:bg-secondary/30'
                        }`}
                      >
                        {difficultyLabels[level]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-text mb-2 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Response Language
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {(['en', 'hi', 'kn'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          language === lang
                            ? 'bg-accent text-background'
                            : 'bg-secondary/20 text-text hover:bg-secondary/30'
                        }`}
                      >
                        {languageLabels[lang]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preloaded Prompts Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 h-[calc(100vh-250px)] overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-text">Quick Prompts</h2>
                </div>
                <p className="text-sm text-text/60 mb-4">
                  Click any prompt to start a conversation. Filtered by your selected difficulty level.
                </p>
                <div className="space-y-2">
                  {filteredPrompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handlePromptClick(prompt)}
                      className="w-full text-left p-3 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold text-text group-hover:text-primary transition-colors">
                          {prompt.title}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary text-nowrap">
                          {prompt.category}
                        </span>
                      </div>
                      <p className="text-xs text-text/60 line-clamp-2">{prompt.prompt}</p>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="lg:col-span-2 mb-4">
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </Card>
              </div>
            )}

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="p-0 h-[calc(100vh-250px)] flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Bot className="w-12 h-12 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-text mb-2">Start a Conversation</h3>
                      <p className="text-text/60 max-w-md">
                        Ask me anything about gene editing, CRISPR technology, or our platform. 
                        You can also click on any quick prompt from the sidebar to get started.
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-primary text-background'
                              : 'bg-secondary/20 text-text'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs mt-2 opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-accent" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div className="bg-secondary/20 rounded-lg p-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-secondary/20 p-4">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ask a question about gene editing, CRISPR, or our platform..."
                      className="flex-1 px-4 py-3 border border-secondary/30 rounded-lg bg-background text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={isLoading}
                    />
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleSendMessage()}
                      disabled={!input.trim() || isLoading}
                      className="px-6"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-text/50 mt-2 text-center">
                    Responses will be in <strong>{languageLabels[language]}</strong> at{' '}
                    <strong>{difficultyLabels[difficulty]}</strong> level
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

