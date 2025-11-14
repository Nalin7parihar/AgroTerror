'use client';

// CRITICAL: Import shim FIRST, before any Three.js imports
import '@/lib/react-compat';
import React from 'react';

// Apply shim immediately at module level (before Three.js imports)
if (typeof window !== 'undefined') {
  try {
    const internals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    if (internals) {
      if (!internals.ReactCurrentOwner) {
        internals.ReactCurrentOwner = { current: null };
      }
      if (!internals.ReactCurrentDispatcher) {
        internals.ReactCurrentDispatcher = { current: { transition: null } };
      } else if (!internals.ReactCurrentDispatcher.current) {
        internals.ReactCurrentDispatcher.current = { transition: null };
      } else if (!internals.ReactCurrentDispatcher.current.transition) {
        internals.ReactCurrentDispatcher.current.transition = null;
      }
      if (!internals.ReactCurrentBatchConfig) {
        internals.ReactCurrentBatchConfig = { transition: null };
      }
      if (!internals.ReactCurrentActQueue) {
        internals.ReactCurrentActQueue = { current: null };
      }
    } else {
      (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
        ReactCurrentOwner: { current: null },
        ReactCurrentDispatcher: { current: { transition: null } },
        ReactCurrentBatchConfig: { transition: null },
        ReactCurrentActQueue: { current: null },
      };
    }
    if (!(window as any).React) {
      (window as any).React = React;
    }
  } catch (e) {
    // Silently continue
  }
}

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

const DNAModel = dynamic(
  () => import('./DNAModel3D').then(mod => ({ default: mod.DNAModel })),
  { ssr: false }
);

function Scene() {
  return (
    <Suspense fallback={null}>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.8} />
      <directionalLight position={[0, 10, 5]} intensity={1.2} />
      <DNAModel scale={[1.5, 1.5, 1.5]} position={[0, 0, 0]} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Suspense>
  );
}

export function DNAModel3DWrapper({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure React compatibility shim is applied before mounting Canvas
    if (typeof window !== 'undefined') {
      try {
        const React = require('react');
        const internals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        if (internals) {
          if (!internals.ReactCurrentOwner) {
            internals.ReactCurrentOwner = { current: null };
          }
          if (!internals.ReactCurrentDispatcher) {
            internals.ReactCurrentDispatcher = { current: { transition: null } };
          } else if (!internals.ReactCurrentDispatcher.current) {
            internals.ReactCurrentDispatcher.current = { transition: null };
          } else if (!internals.ReactCurrentDispatcher.current.transition) {
            internals.ReactCurrentDispatcher.current.transition = null;
          }
          if (!internals.ReactCurrentBatchConfig) {
            internals.ReactCurrentBatchConfig = { transition: null };
          }
        } else {
          (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
            ReactCurrentOwner: { current: null },
            ReactCurrentDispatcher: { current: { transition: null } },
            ReactCurrentBatchConfig: { transition: null },
            ReactCurrentActQueue: { current: null },
          };
        }
      } catch (e) {
        console.warn('Failed to apply React compatibility shim:', e);
      }
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-full h-full ${className} flex items-center justify-center bg-secondary/10 rounded-lg`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-text/50">Loading 3D model...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full h-full ${className}`} 
      style={{ 
        minHeight: '400px', 
        minWidth: '100%',
        position: 'relative',
        backgroundColor: 'transparent'
      }}
    >
      <Canvas
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true
        }}
        dpr={[1, 2]}
        onCreated={({ gl, scene, camera }) => {
          gl.setClearColor('#00000000', 0);
          console.log('Canvas created', { gl, scene, camera });
        }}
        onError={(error) => {
          console.error('Canvas error:', error);
        }}
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <Scene />
      </Canvas>
    </div>
  );
}

