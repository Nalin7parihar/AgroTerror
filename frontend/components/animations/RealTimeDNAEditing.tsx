'use client';

// React 19 compatibility
import '@/lib/react-compat';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Nucleotide color mapping
const NUCLEOTIDE_COLORS: Record<string, string> = {
  'A': '#ff00ff', // Magenta
  'T': '#ff0088', // Pink/Red
  'G': '#ffaa00', // Orange
  'C': '#00d4ff', // Cyan
};

// Simple DNA Strand using basic primitives
function DNAStrandModel({ 
  points, 
  color, 
  isEditing = false, 
  editProgress = 0,
  nucleotideColors = [],
  editPosition = undefined
}: { 
  points: THREE.Vector3[];
  color: string;
  isEditing?: boolean;
  editProgress?: number;
  nucleotideColors?: string[];
  editPosition?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  // Apply editing effect to points - only when there's an actual edit position
  const editedPoints = useMemo(() => {
    // Safety check: ensure we have valid points
    if (!points || points.length === 0) return [];
    
    // Only apply editing effect if there's an edit position and we're actually editing
    if (!isEditing || editProgress === 0 || editPosition === undefined || !isFinite(editPosition)) {
      return points.map(p => p ? p.clone() : new THREE.Vector3(0, 0, 0));
    }
    
    // Safety check: ensure points.length is valid for division
    if (points.length <= 1) {
      return points.map(p => p ? p.clone() : new THREE.Vector3(0, 0, 0));
    }
    
    // Find the index range around the edit position (smaller, more localized effect)
    const editIndex = Math.floor(Math.max(0, Math.min((editPosition / (points.length - 1)) * points.length, points.length - 1)));
    const effectRange = Math.max(3, Math.floor(points.length * 0.1)); // 10% of strand or at least 3 points
    const startIndex = Math.max(0, editIndex - effectRange);
    const endIndex = Math.min(points.length - 1, editIndex + effectRange);
    
    return points.map((point, index) => {
      // Safety check: ensure point is valid
      if (!point || !isFinite(point.x) || !isFinite(point.y) || !isFinite(point.z)) {
        return new THREE.Vector3(0, 0, 0);
      }
      
      if (index >= startIndex && index <= endIndex && effectRange > 0) {
        // Smooth falloff effect centered on edit position
        const distanceFromEdit = Math.abs(index - editIndex) / effectRange;
        const falloff = Math.max(0, Math.min(1, 1 - distanceFromEdit));
        const editAmount = Math.sin(falloff * Math.PI) * Math.max(0, Math.min(1, editProgress)) * 0.15;
        
        // Ensure all calculated values are finite
        const newX = point.x + editAmount * 0.5;
        const newY = point.y;
        const newZ = point.z + editAmount * 0.3;
        
        if (!isFinite(newX) || !isFinite(newY) || !isFinite(newZ)) {
          return point.clone();
        }
        
        return new THREE.Vector3(newX, newY, newZ);
      }
      return point.clone();
    });
  }, [points, isEditing, editProgress, editPosition]);

  const accentColor = typeof window !== 'undefined' 
    ? getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#d270ad'
    : '#d270ad';

  return (
    <group ref={groupRef}>
      {/* Render spheres for each point */}
      {editedPoints.map((point, index) => {
        // Safety check: ensure point is valid
        if (!point || !isFinite(point.x) || !isFinite(point.y) || !isFinite(point.z)) {
          return null;
        }
        
        // Only highlight as edited if there's an actual edit position
        let editIndex = -1;
        if (editPosition !== undefined && points.length > 1 && isFinite(editPosition)) {
          editIndex = Math.floor(Math.max(0, Math.min((editPosition / (points.length - 1)) * points.length, points.length - 1)));
        }
        const effectRange = points.length > 0 ? Math.max(3, Math.floor(points.length * 0.1)) : 3;
        const isEdited = isEditing && editPosition !== undefined && editIndex >= 0 &&
          index >= Math.max(0, editIndex - effectRange) && 
          index <= Math.min(points.length - 1, editIndex + effectRange);
        // Use nucleotide-specific color if available, otherwise use default
        const baseColor = nucleotideColors[index] || (isEdited ? accentColor : color);
        return (
          <mesh key={index} position={point}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial 
              color={baseColor}
              emissive={baseColor}
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
        
        // Safety checks: ensure points are valid
        if (!point || !nextPoint || 
            !isFinite(point.x) || !isFinite(point.y) || !isFinite(point.z) ||
            !isFinite(nextPoint.x) || !isFinite(nextPoint.y) || !isFinite(nextPoint.z)) {
          return null;
        }
        
        const direction = new THREE.Vector3().subVectors(nextPoint, point);
        const length = direction.length();
        
        // Safety check: ensure length is valid
        if (!isFinite(length) || length <= 0) {
          return null;
        }
        
        const midPoint = new THREE.Vector3().addVectors(point, nextPoint).multiplyScalar(0.5);
        
        // Final safety check: ensure midPoint is valid
        if (!isFinite(midPoint.x) || !isFinite(midPoint.y) || !isFinite(midPoint.z)) {
          return null;
        }
        
        // Use color from first point of the connection
        const connectionColor = nucleotideColors[index] || color;
        
        return (
          <mesh key={`conn-${index}`} position={midPoint}>
            <cylinderGeometry args={[0.05, 0.05, length, 12]} />
            <meshStandardMaterial 
              color={connectionColor}
              emissive={connectionColor}
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

function DNAEditingScene({ 
  isPlaying, 
  progress, 
  dnaSequence = '',
  editPosition,
  originalBase,
  targetBase
}: { 
  isPlaying: boolean; 
  progress: number;
  dnaSequence?: string;
  editPosition?: number;
  originalBase?: string;
  targetBase?: string;
}) {
  // Helper function to get complementary base
  const getComplementaryBase = (base: string): string => {
    const complement: Record<string, string> = {
      'A': 'T',
      'T': 'A',
      'G': 'C',
      'C': 'G'
    };
    return complement[base.toUpperCase()] || 'T';
  };

  // Validate progress value before using it
  const safeProgressValue = isFinite(progress) && !isNaN(progress) ? Math.max(0, Math.min(progress, 1)) : 0;
  
  const { points, points2, nucleotideColors1, nucleotideColors2, basePairColors } = useMemo(() => {
    const p1: THREE.Vector3[] = [];
    const p2: THREE.Vector3[] = [];
    const colors1: string[] = [];
    const colors2: string[] = [];
    const bpColors: string[] = [];
    
    // Determine number of segments based on sequence length or default
    const seqLength = dnaSequence?.length || 20;
    const numSegments = Math.max(seqLength, 20);
    const radius = 0.7;
    const height = 2.5;
    
    // Safety check: ensure we have valid segments
    if (numSegments <= 0 || !isFinite(numSegments)) {
      return { points: p1, points2: p2, nucleotideColors1: colors1, nucleotideColors2: colors2, basePairColors: bpColors };
    }
    
    // Generate colors from sequence
    for (let i = 0; i <= numSegments; i++) {
      const t = numSegments > 0 ? i / numSegments : 0;
      const angle = t * Math.PI * 3;
      const y = (t - 0.5) * height;
      
      // Ensure all values are valid numbers
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;
      
      // Validate values before creating Vector3
      if (!isFinite(x1) || !isFinite(y) || !isFinite(z1) || !isFinite(x2) || !isFinite(z2)) {
        continue;
      }
      
      p1.push(new THREE.Vector3(x1, y, z1));
      p2.push(new THREE.Vector3(x2, y, z2));
      
      // Get nucleotide color from sequence
      const seqIndex = seqLength > 0 ? Math.floor(Math.min((i / numSegments) * seqLength, seqLength - 1)) : 0;
      const nucleotide1 = dnaSequence?.[seqIndex]?.toUpperCase() || 'A';
      const nucleotide2 = getComplementaryBase(nucleotide1);
      
      // If this is the edit position and we're editing, use target base color
      let color1: string;
      if (editPosition !== undefined && isFinite(editPosition) && seqIndex === editPosition && safeProgressValue > 0 && safeProgressValue <= 1) {
        color1 = NUCLEOTIDE_COLORS[targetBase?.toUpperCase() || nucleotide1] || NUCLEOTIDE_COLORS[nucleotide1];
      } else {
        color1 = NUCLEOTIDE_COLORS[nucleotide1] || NUCLEOTIDE_COLORS['A'];
      }
      const color2 = NUCLEOTIDE_COLORS[nucleotide2] || NUCLEOTIDE_COLORS['T'];
      
      colors1.push(color1);
      colors2.push(color2);
      // Base pair color is the average or use the first strand color
      bpColors.push(color1);
    }
    
    return { points: p1, points2: p2, nucleotideColors1: colors1, nucleotideColors2: colors2, basePairColors: bpColors };
  }, [dnaSequence, editPosition, targetBase, safeProgressValue]);

  // Ensure progress is valid and finite (reuse the validated value from useMemo)
  const editProgress = isPlaying ? safeProgressValue : 0;
  const isEditing = editProgress > 0 && isFinite(editProgress);

  // Default fallback colors
  const getPrimaryColor = () => {
    return NUCLEOTIDE_COLORS['C'] || '#00d4ff'; // cyan for strand 1
  };

  const getSecondaryColor = () => {
    return NUCLEOTIDE_COLORS['G'] || '#ffaa00'; // orange for strand 2
  };

  return (
    <>
      <DNAStrandModel 
        points={points} 
        color={getPrimaryColor()} 
        isEditing={isEditing && editPosition !== undefined}
        editProgress={editProgress}
        nucleotideColors={nucleotideColors1}
        editPosition={editPosition}
      />
      <DNAStrandModel 
        points={points2} 
        color={getSecondaryColor()} 
        isEditing={isEditing && editPosition !== undefined}
        editProgress={editProgress}
        nucleotideColors={nucleotideColors2}
        editPosition={editPosition}
      />
      
      {/* Base pairs with sequence-based colors */}
      {points.map((point1, index) => {
        if (index >= points2.length) return null;
        const point2 = points2[index];
        
        // Safety checks: ensure points are valid
        if (!point1 || !point2 ||
            !isFinite(point1.x) || !isFinite(point1.y) || !isFinite(point1.z) ||
            !isFinite(point2.x) || !isFinite(point2.y) || !isFinite(point2.z)) {
          return null;
        }
        
        const midPoint = new THREE.Vector3().addVectors(point1, point2).multiplyScalar(0.5);
        const distance = point1.distanceTo(point2);
        
        // Safety check: ensure distance and midPoint are valid
        if (!isFinite(distance) || distance <= 0 ||
            !isFinite(midPoint.x) || !isFinite(midPoint.y) || !isFinite(midPoint.z)) {
          return null;
        }
        
        // Use the color from the first strand for the base pair
        const baseColor = basePairColors[index] || nucleotideColors1[index] || getPrimaryColor();
        
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
      
      {isEditing && editPosition !== undefined && dnaSequence && dnaSequence.length > 0 && points.length > 0 && (
        (() => {
          // Safety check: ensure valid edit position and sequence length
          if (!isFinite(editPosition) || editPosition < 0 || editPosition >= dnaSequence.length) {
            return null;
          }
          
          const pointIndex = Math.floor(Math.max(0, Math.min((editPosition / dnaSequence.length) * points.length, points.length - 1)));
          const editPoint = points[pointIndex];
          
          // Safety check: ensure point is valid
          if (!editPoint || !isFinite(editPoint.x) || !isFinite(editPoint.y) || !isFinite(editPoint.z)) {
            return null;
          }
          
          const yPos = isFinite(editPoint.y) ? editPoint.y : ((editProgress - 0.5) * 2.5);
          
          // Final validation of position array
          const position: [number, number, number] = [
            isFinite(editPoint.x) ? editPoint.x : 0,
            isFinite(yPos) ? yPos : 0,
            isFinite(editPoint.z) ? editPoint.z : 1.2
          ];
          
          if (!isFinite(position[0]) || !isFinite(position[1]) || !isFinite(position[2])) {
            return null;
          }
          
          return (
            <CRISPRProtein 
              position={position}
              isActive={isPlaying}
            />
          );
        })()
      )}
    </>
  );
}

export function RealTimeDNAEditing({ 
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
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setProgress((prev) => {
          // Safety check: ensure prev is valid
          const safePrev = isFinite(prev) && !isNaN(prev) ? prev : 0;
          const newProgress = safePrev + 0.01;
          
          // Safety check: ensure newProgress is valid
          if (!isFinite(newProgress) || isNaN(newProgress)) {
            return 0;
          }
          
          if (newProgress >= 1) {
            return 0; // Loop
          }
          return Math.max(0, Math.min(newProgress, 1)); // Clamp between 0 and 1
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
  }, [isPlaying]);

  // Call onProgressChange after progress state updates (outside of render phase)
  useEffect(() => {
    if (onProgressChange) {
      // Safety check: ensure progress is valid before calling callback
      const safeProgress = isFinite(progress) && !isNaN(progress) ? Math.max(0, Math.min(progress, 1)) : 0;
      onProgressChange(safeProgress);
    }
  }, [progress, onProgressChange]);

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
        <DNAEditingScene 
          isPlaying={isPlaying} 
          progress={progress}
          dnaSequence={dnaSequence}
          editPosition={editPosition}
          originalBase={originalBase}
          targetBase={targetBase}
        />
        
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
