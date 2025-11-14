'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Error boundary component
function ErrorFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-secondary/10 rounded-lg">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4 relative">
          <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-4 border-4 border-accent rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          <div className="absolute inset-8 bg-primary/20 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-full" />
          </div>
        </div>
        <p className="text-text/70 text-sm">3D Simulation Loading...</p>
      </div>
    </div>
  );
}

// Dynamically import with error handling
const RealTimeDNAEditing = dynamic(
  () => import('./RealTimeDNAEditing').then(mod => ({ default: mod.RealTimeDNAEditing })).catch(() => ({ default: ErrorFallback })),
  { 
    ssr: false,
    loading: () => <ErrorFallback />
  }
);

export function RealTimeDNAEditingWrapper({ 
  className = '',
  isPlaying = false,
  onProgressChange,
  dnaSequence = '',
  editPosition,
  originalBase,
  targetBase
}: { 
  className?: string;
  isPlaying?: boolean;
  onProgressChange?: (progress: number) => void;
  dnaSequence?: string;
  editPosition?: number;
  originalBase?: string;
  targetBase?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || hasError) {
    return <ErrorFallback />;
  }

  try {
    return (
      <RealTimeDNAEditing 
        className={className}
        isPlaying={isPlaying}
        onProgressChange={onProgressChange}
        dnaSequence={dnaSequence}
        editPosition={editPosition}
        originalBase={originalBase}
        targetBase={targetBase}
      />
    );
  } catch (error) {
    console.error('Real-time DNA Editing Error:', error);
    setHasError(true);
    return <ErrorFallback />;
  }
}

