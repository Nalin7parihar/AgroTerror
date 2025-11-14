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
    // Only apply editing effect if there's an edit position and we're actually editing
    if (!isEditing || editProgress === 0 || editPosition === undefined) return points;
    
    // Find the index range around the edit position (smaller, more localized effect)
    const editIndex = Math.floor((editPosition / (points.length - 1)) * points.length);
    const effectRange = Math.max(3, Math.floor(points.length * 0.1)); // 10% of strand or at least 3 points
    const startIndex = Math.max(0, editIndex - effectRange);
    const endIndex = Math.min(points.length - 1, editIndex + effectRange);
    
    return points.map((point, index) => {
      if (index >= startIndex && index <= endIndex) {
        // Smooth falloff effect centered on edit position
        const distanceFromEdit = Math.abs(index - editIndex) / effectRange;
        const falloff = Math.max(0, 1 - distanceFromEdit);
        const editAmount = Math.sin(falloff * Math.PI) * editProgress * 0.15; // Reduced from 0.3 to 0.15
        return new THREE.Vector3(
          point.x + editAmount * 0.5, // Reduced movement
          point.y,
          point.z + editAmount * 0.3  // Reduced movement
        );
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
        // Only highlight as edited if there's an actual edit position
        const editIndex = editPosition !== undefined ? Math.floor((editPosition / (points.length - 1)) * points.length) : -1;
        const effectRange = Math.max(3, Math.floor(points.length * 0.1));
        const isEdited = isEditing && editPosition !== undefined && 
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
        const direction = new THREE.Vector3().subVectors(nextPoint, point);
        const length = direction.length();
        const midPoint = new THREE.Vector3().addVectors(point, nextPoint).multiplyScalar(0.5);
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

  const { points, points2, nucleotideColors1, nucleotideColors2, basePairColors } = useMemo(() => {
    const p1: THREE.Vector3[] = [];
    const p2: THREE.Vector3[] = [];
    const colors1: string[] = [];
    const colors2: string[] = [];
    const bpColors: string[] = [];
    
    // Determine number of segments based on sequence length or default
    const seqLength = dnaSequence.length || 20;
    const numSegments = Math.max(seqLength, 20);
    const radius = 0.7;
    const height = 2.5;
    
    // Generate colors from sequence
    for (let i = 0; i <= numSegments; i++) {
      const t = i / numSegments;
      const angle = t * Math.PI * 3;
      const y = (t - 0.5) * height;
      
      p1.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      p2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));
      
      // Get nucleotide color from sequence
      const seqIndex = Math.floor((i / numSegments) * seqLength);
      const nucleotide1 = dnaSequence[seqIndex]?.toUpperCase() || 'A';
      const nucleotide2 = getComplementaryBase(nucleotide1);
      
      // If this is the edit position and we're editing, use target base color
      let color1: string;
      if (editPosition !== undefined && seqIndex === editPosition && progress > 0) {
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
  }, [dnaSequence, editPosition, targetBase, progress]);

  const editProgress = isPlaying ? Math.min(progress, 1) : 0;
  const isEditing = editProgress > 0;

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
        const midPoint = new THREE.Vector3().addVectors(point1, point2).multiplyScalar(0.5);
        const distance = point1.distanceTo(point2);
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
      
      {isEditing && editPosition !== undefined && dnaSequence && (
        <CRISPRProtein 
          position={[
            points[Math.floor((editPosition / dnaSequence.length) * points.length)]?.x || 0,
            points[Math.floor((editPosition / dnaSequence.length) * points.length)]?.y || (editProgress - 0.5) * 2.5,
            points[Math.floor((editPosition / dnaSequence.length) * points.length)]?.z || 1.2
          ]} 
          isActive={isPlaying}
        />
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
