'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MessageSquare, Workflow, BookOpen, GraduationCap, FileText, X, LogOut, Dna } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/Button';
import Link from 'next/link';
import { getAuthToken, removeAuthToken } from '@/lib/api';

const quickLinks = [
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: 'AI Tutor',
    href: '/dashboard/chatbot',
    color: 'primary',
  },
  {
    icon: <Dna className="w-5 h-5" />,
    title: 'SNP Browser',
    href: '/home/snp-browser',
    color: 'primary',
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Resources',
    href: '/home/resources',
    color: 'primary',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Docs',
    href: '/home/documentation',
    color: 'accent',
  },
];

export function OnboardingHeader() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-secondary/20 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/home" className="flex items-center hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="AgrIQ"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {quickLinks.map((link, index) => {
              return (
                <Button
                  key={index}
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (link.href.startsWith('/')) {
                      router.push(link.href);
                    } else {
                      console.log(`Navigate to ${link.title}`);
                    }
                  }}
                  className="flex items-center gap-2 bg-transparent text-text/80 hover:bg-primary hover:text-background"
                >
                  {link.icon}
                  <span>{link.title}</span>
                </Button>
              );
            })}
          </nav>
          
          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  className="hidden sm:flex"
                  onClick={() => router.push('/dashboard')}
                >
                  Start Project
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                  onClick={() => router.push('/login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => router.push('/register')}
                >
                  <span>Sign Up</span>
                </Button>
              </>
            )}
            
            {/* Mobile menu */}
            <div className="md:hidden flex items-center gap-2 ml-2">
              {quickLinks.slice(0, 2).map((link, index) => (
                <button
                  key={index}
                  className="p-2 text-text/60 hover:text-primary transition-colors"
                  onClick={() => {
                    if (link.href.startsWith('/')) {
                      router.push(link.href);
                    } else {
                      console.log(`Navigate to ${link.title}`);
                    }
                  }}
                >
                  {link.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
