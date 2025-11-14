'use client';

// React 19 compatibility
import '@/lib/react-compat';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Simple DNA Strand using basic primitives
function DNAStrandModel({ 
  points, 
  color, 
  isEditing = false, 
  editProgress = 0 
}: { 
  points: THREE.Vector3[];
  color: string;
  isEditing?: boolean;
  editProgress?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  // Apply editing effect to points
  const editedPoints = useMemo(() => {
    if (!isEditing || editProgress === 0) return points;
    
    return points.map((point, index) => {
      if (index >= points.length * 0.4 && index <= points.length * 0.6) {
        const editAmount = Math.sin((index / points.length) * Math.PI) * editProgress * 0.3;
        return new THREE.Vector3(
          point.x + editAmount,
          point.y,
          point.z + editAmount * 0.5
        );
      }
      return point.clone();
    });
  }, [points, isEditing, editProgress]);

  const accentColor = typeof window !== 'undefined' 
    ? getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#d270ad'
    : '#d270ad';

  return (
    <group ref={groupRef}>
      {/* Render spheres for each point */}
      {editedPoints.map((point, index) => {
        const isEdited = isEditing && index >= points.length * 0.4 && index <= points.length * 0.6;
        return (
          <mesh key={index} position={point}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial 
              color={isEdited ? accentColor : color}
              emissive={isEdited ? accentColor : color}
              emissiveIntensity={isEdited ? 0.9 : 0.5}
              metalness={0.6}
              roughness={0.2}
            />
          </mesh>
        );
      })}
      
      {/* Connect points with cylinders */}
      {editedPoints.slice(0, -1).map((point, index) => {
        const nextPoint = editedPoints[index + 1];
        const direction = new THREE.Vector3().subVectors(nextPoint, point);
        const length = direction.length();
        const midPoint = new THREE.Vector3().addVectors(point, nextPoint).multiplyScalar(0.5);
        
        return (
          <mesh key={`conn-${index}`} position={midPoint}>
            <cylinderGeometry args={[0.05, 0.05, length, 12]} />
            <meshStandardMaterial 
              color={color}
              emissive={color}
              emissiveIntensity={0.4}
              metalness={0.4}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function CRISPRProtein({ position, isActive }: { position: [number, number, number]; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial 
        color={isActive ? '#ff6b6b' : '#8f2d6a'}
        emissive={isActive ? '#ff6b6b' : '#8f2d6a'}
        emissiveIntensity={isActive ? 0.8 : 0.3}
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  );
}

function DNAEditingScene({ isPlaying, progress }: { isPlaying: boolean; progress: number }) {
  const { points, points2 } = useMemo(() => {
    const p1: THREE.Vector3[] = [];
    const p2: THREE.Vector3[] = [];
    
    const numSegments = 20;
    const radius = 0.7;
    const height = 2.5;
    
    for (let i = 0; i <= numSegments; i++) {
      const t = i / numSegments;
      const angle = t * Math.PI * 3;
      const y = (t - 0.5) * height;
      
      p1.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      p2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));
    }
    
    return { points: p1, points2: p2 };
  }, []);

  const editProgress = isPlaying ? Math.min(progress, 1) : 0;
  const isEditing = editProgress > 0;

  // Base pair colors from analysis page
  const basePairColors = ['#00ff88', '#ff0088', '#00d4ff', '#ffaa00']; // adenine, thymine, cytosine, guanine
  
  const getPrimaryColor = () => {
    return basePairColors[2]; // cytosine - cyan/blue for strand 1
  };

  const getSecondaryColor = () => {
    return basePairColors[3]; // guanine - orange/yellow for strand 2
  };
  
  const getBasePairColor = (index: number) => {
    return basePairColors[index % 4];
  };

  return (
    <>
      <DNAStrandModel 
        points={points} 
        color={getPrimaryColor()} 
        isEditing={isEditing}
        editProgress={editProgress}
      />
      <DNAStrandModel 
        points={points2} 
        color={getSecondaryColor()} 
        isEditing={isEditing}
        editProgress={editProgress}
      />
      
      {/* Base pairs with alternating colors */}
      {points.map((point1, index) => {
        if (index >= points2.length) return null;
        const point2 = points2[index];
        const midPoint = new THREE.Vector3().addVectors(point1, point2).multiplyScalar(0.5);
        const distance = point1.distanceTo(point2);
        const baseColor = getBasePairColor(index);
        
        return (
          <mesh key={`basepair-${index}`} position={midPoint}>
            <cylinderGeometry args={[0.025, 0.025, distance, 12]} />
            <meshStandardMaterial 
              color={baseColor}
              emissive={baseColor}
              emissiveIntensity={0.5}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
        );
      })}
      
      {isEditing && (
        <CRISPRProtein 
          position={[0, (editProgress - 0.5) * 3, 1.2]} 
          isActive={isPlaying}
        />
      )}
    </>
  );
}

export function RealTimeDNAEditing({ 
  className = '',
  isPlaying = false,
  onProgressChange
}: { 
  className?: string;
  isPlaying?: boolean;
  onProgressChange?: (progress: number) => void;
}) {
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setProgress((prev) => {
          const newProgress = prev + 0.01;
          if (newProgress >= 1) {
            return 0; // Loop
          }
          if (onProgressChange) {
            onProgressChange(newProgress);
          }
          return newProgress;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, onProgressChange]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-full h-full ${className} flex items-center justify-center bg-transparent`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-text/50">Loading simulation...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full h-full ${className}`} 
      style={{ 
        minHeight: '300px',
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: 'transparent',
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
          premultipliedAlpha: false
        }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = 2;
          gl.domElement.style.background = 'transparent';
          gl.domElement.style.width = '100%';
          gl.domElement.style.height = '100%';
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
        <PerspectiveCamera makeDefault position={[0, 1.5, 5.5]} fov={45} />
        
        {/* Enhanced RGB lighting setup */}
        {/* Blue key light */}
        <directionalLight position={[4, 5, 4]} intensity={0.9} color="#3b82f6" />
        {/* Red fill light */}
        <directionalLight position={[-4, 3, 3]} intensity={0.6} color="#ef4444" />
        {/* Green accent */}
        <pointLight position={[3, 2, 4]} intensity={0.7} color="#10b981" />
        {/* Blue rim */}
        <pointLight position={[-2, 1, -4]} intensity={0.8} color="#3b82f6" />
        {/* Red bottom */}
        <pointLight position={[0, -3, 2]} intensity={0.5} color="#ef4444" />
        {/* Ambient blend */}
        <ambientLight intensity={0.3} color="#ffffff" />
        
        {/* DNA Editing Scene */}
        <DNAEditingScene isPlaying={isPlaying} progress={progress} />
        
        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate={!isPlaying}
          autoRotateSpeed={0.5}
          minDistance={4}
          maxDistance={10}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
