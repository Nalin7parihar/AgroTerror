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
      {/* Professional RGB lighting setup optimized for screen display */}
      
      {/* Blue key light - main illumination from top-right */}
      <directionalLight 
        position={[4, 6, 4]} 
        intensity={0.9} 
        color="#3b82f6"
        castShadow
      />
      
      {/* Red fill light - soft from left */}
      <directionalLight 
        position={[-4, 3, 2]} 
        intensity={0.6} 
        color="#ef4444"
      />
      
      {/* Green accent - balanced from right */}
      <pointLight 
        position={[3, 2, 3]} 
        intensity={0.7} 
        color="#10b981"
      />
      
      {/* Blue rim light - depth from behind */}
      <pointLight 
        position={[-2, 1, -4]} 
        intensity={0.8} 
        color="#3b82f6"
      />
      
      {/* Red bottom accent - subtle glow */}
      <pointLight 
        position={[0, -3, 1]} 
        intensity={0.5} 
        color="#ef4444"
      />
      
      {/* Green back light - additional depth */}
      <pointLight 
        position={[1, -1, -2]} 
        intensity={0.4} 
        color="#10b981"
      />
      
      {/* Balanced ambient light for color blending */}
      <ambientLight intensity={0.25} color="#ffffff" />
      
      <DNAModel scale={[0.8, 0.8, 0.8]} position={[0, -0.2, 0]} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, -0.2, 0]}
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
      <div className={`w-full h-full ${className} flex items-center justify-center bg-transparent`}>
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
        minHeight: '300px',
        height: '100%',
        width: '100%',
        position: 'relative',
        backgroundColor: 'transparent',
        borderRadius: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <Canvas
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          toneMappingExposure: 1.2,
          premultipliedAlpha: false,
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        onCreated={({ gl, scene, camera }) => {
          // Fully transparent background - seamless integration
          gl.setClearColor(0x000000, 0);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = 2; // PCFSoftShadowMap
          // Ensure alpha blending for seamless background
          gl.domElement.style.background = 'transparent';
          gl.domElement.style.width = '100%';
          gl.domElement.style.height = '100%';
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
          left: 0,
          background: 'transparent',
          backgroundColor: 'transparent',
          outline: 'none',
          border: 'none',
          margin: 0,
          padding: 0,
          touchAction: 'none'
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <Scene />
      </Canvas>
    </div>
  );
}