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
        <p className="text-text/70 text-sm">3D Animation Loading...</p>
      </div>
    </div>
  );
}

// Dynamically import with error handling
const DNAHelix3D = dynamic(
  () => import('./DNAHelix3D').then(mod => ({ default: mod.DNAHelix3D })).catch(() => ({ default: ErrorFallback })),
  { 
    ssr: false,
    loading: () => <ErrorFallback />
  }
);

export function DNAHelix3DWrapper({ 
  className = '',
  autoRotate = true,
  rotationSpeed = 0.5 
}: { 
  className?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
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
      <DNAHelix3D 
        className={className}
        autoRotate={autoRotate}
        rotationSpeed={rotationSpeed}
      />
    );
  } catch (error) {
    console.error('DNA Helix 3D Error:', error);
    setHasError(true);
    return <ErrorFallback />;
  }
}

