'use client';

import '@/lib/react-compat';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { createDNAHelixGeometry, createDNABasePairs } from '@/lib/three/models/dna-helix';

const NUCLEOTIDE_COLORS_3D: Record<string, string> = {
  A: '#ff4444', // Red
  T: '#4444ff', // Blue
  G: '#44ff44', // Green
  C: '#ffff44', // Yellow
};

interface DNAChange {
  position: number;
  original: string;
  modified: string;
}

interface DNA3DViewerProps {
  originalDna: string;
  modifiedDna: string;
  changes: DNAChange[];
  height?: number;
}

function DNAHelix3DModel({ 
  originalDna, 
  modifiedDna, 
  changes 
}: { 
  originalDna: string; 
  modifiedDna: string; 
  changes: DNAChange[] 
}) {
  const groupRef = useRef<THREE.Group>(null);
  const changePositions = useMemo(() => new Set(changes.map(c => c.position)), [changes]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  // Create geometry based on DNA length - scaled down for better fit
  const segments = Math.min(originalDna.length, 200); // Limit for performance
  const height = segments * 0.08; // Reduced height
  const radius = 0.8; // Reduced radius
  const { points, points2 } = useMemo(
    () => createDNAHelixGeometry(radius, height, segments),
    [segments, height, radius]
  );
  const basePairs = useMemo(
    () => createDNABasePairs(radius, height, segments),
    [segments, height, radius]
  );

  // Sample nucleotides for visualization (since we can't show all)
  const sampleRate = Math.max(1, Math.floor(originalDna.length / segments));
  const originalNucleotides = useMemo(() => {
    const sampled: string[] = [];
    for (let i = 0; i < segments; i++) {
      const idx = Math.min(i * sampleRate, originalDna.length - 1);
      sampled.push(originalDna[idx] || 'A');
    }
    return sampled;
  }, [originalDna, segments, sampleRate]);

  const modifiedNucleotides = useMemo(() => {
    const sampled: string[] = [];
    for (let i = 0; i < segments; i++) {
      const idx = Math.min(i * sampleRate, modifiedDna.length - 1);
      sampled.push(modifiedDna[idx] || 'A');
    }
    return sampled;
  }, [modifiedDna, segments, sampleRate]);

  return (
    <group ref={groupRef}>
      {/* Original strand (left) - nucleotides with connecting lines */}
      {points.map((point, index) => {
        if (!point) return null;
        const nucleotide = originalNucleotides[index];
        const globalPos = index * sampleRate;
        const isChanged = changePositions.has(globalPos);
        const nextPoint = index < points.length - 1 ? points[index + 1] : null;
        
        return (
          <group key={`original-group-${index}`}>
            {/* Nucleotide sphere */}
            <mesh position={point}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial 
                color={NUCLEOTIDE_COLORS_3D[nucleotide] || '#cccccc'}
                emissive={isChanged ? '#ff0000' : '#000000'}
                emissiveIntensity={isChanged ? 0.5 : 0}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>
            
            {/* Connecting grey line to next nucleotide */}
            {nextPoint && (() => {
              if (!nextPoint || !isFinite(nextPoint.x) || !isFinite(nextPoint.y) || !isFinite(nextPoint.z)) return null;
              if (!isFinite(point.x) || !isFinite(point.y) || !isFinite(point.z)) return null;
              
              const distance = point.distanceTo(nextPoint);
              if (!isFinite(distance) || distance <= 0) return null;
              
              const midpoint = new THREE.Vector3().addVectors(point, nextPoint).multiplyScalar(0.5);
              if (!isFinite(midpoint.x) || !isFinite(midpoint.y) || !isFinite(midpoint.z)) return null;
              
              const direction = new THREE.Vector3().subVectors(nextPoint, point).normalize();
              const rotationX = Math.atan2(direction.y, Math.sqrt(direction.x ** 2 + direction.z ** 2));
              const rotationY = Math.atan2(direction.x, direction.z);
              
              if (!isFinite(rotationX) || !isFinite(rotationY)) return null;
              
              return (
                <mesh 
                  key={`original-conn-${index}`}
                  position={midpoint}
                  rotation={[rotationX, rotationY, 0]}
                >
                  <cylinderGeometry args={[0.015, 0.015, distance, 8]} />
                  <meshStandardMaterial 
                    color="#888888"
                    opacity={0.6}
                    transparent
                    metalness={0.2}
                    roughness={0.8}
                  />
                </mesh>
              );
            })()}
          </group>
        );
      })}

      {/* Modified strand (right) - nucleotides with connecting lines */}
      {points2.map((point, index) => {
        if (!point) return null;
        const nucleotide = modifiedNucleotides[index];
        const globalPos = index * sampleRate;
        const isChanged = changePositions.has(globalPos);
        const nextPoint = index < points2.length - 1 ? points2[index + 1] : null;
        
        return (
          <group key={`modified-group-${index}`}>
            {/* Nucleotide sphere */}
            <mesh position={point}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial 
                color={NUCLEOTIDE_COLORS_3D[nucleotide] || '#cccccc'}
                emissive={isChanged ? '#00ff00' : '#000000'}
                emissiveIntensity={isChanged ? 0.5 : 0}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>
            
            {/* Connecting grey line to next nucleotide */}
            {nextPoint && (() => {
              if (!nextPoint || !isFinite(nextPoint.x) || !isFinite(nextPoint.y) || !isFinite(nextPoint.z)) return null;
              if (!isFinite(point.x) || !isFinite(point.y) || !isFinite(point.z)) return null;
              
              const distance = point.distanceTo(nextPoint);
              if (!isFinite(distance) || distance <= 0) return null;
              
              const midpoint = new THREE.Vector3().addVectors(point, nextPoint).multiplyScalar(0.5);
              if (!isFinite(midpoint.x) || !isFinite(midpoint.y) || !isFinite(midpoint.z)) return null;
              
              const direction = new THREE.Vector3().subVectors(nextPoint, point).normalize();
              const rotationX = Math.atan2(direction.y, Math.sqrt(direction.x ** 2 + direction.z ** 2));
              const rotationY = Math.atan2(direction.x, direction.z);
              
              if (!isFinite(rotationX) || !isFinite(rotationY)) return null;
              
              return (
                <mesh 
                  key={`modified-conn-${index}`}
                  position={midpoint}
                  rotation={[rotationX, rotationY, 0]}
                >
                  <cylinderGeometry args={[0.015, 0.015, distance, 8]} />
                  <meshStandardMaterial 
                    color="#888888"
                    opacity={0.6}
                    transparent
                    metalness={0.2}
                    roughness={0.8}
                  />
                </mesh>
              );
            })()}
          </group>
        );
      })}

      {/* Base pairs connecting strands */}
      {basePairs.map((pair, index) => {
        if (!pair.start || !pair.end) return null;
        const globalPos = index * sampleRate;
        const isChanged = changePositions.has(globalPos);
        const midpoint = new THREE.Vector3().addVectors(pair.start, pair.end).multiplyScalar(0.5);
        const distance = pair.start.distanceTo(pair.end);
        
        return (
          <group key={`basepair-${index}`}>
            {/* Connection cylinder */}
            <mesh position={midpoint} rotation={[
              Math.atan2(pair.end.y - pair.start.y, Math.sqrt((pair.end.x - pair.start.x) ** 2 + (pair.end.z - pair.start.z) ** 2)),
              Math.atan2(pair.end.x - pair.start.x, pair.end.z - pair.start.z),
              0
            ]}>
              <cylinderGeometry args={[0.02, 0.02, distance, 10]} />
              <meshStandardMaterial 
                color={isChanged ? '#ff6600' : '#888888'}
                emissive={isChanged ? '#ff6600' : '#000000'}
                emissiveIntensity={isChanged ? 0.6 : 0}
                opacity={isChanged ? 1 : 0.4}
                transparent
                metalness={0.3}
                roughness={0.5}
              />
            </mesh>
            
            {/* Highlight changed base pairs */}
            {isChanged && (
              <mesh position={midpoint}>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshStandardMaterial 
                  color="#ff6600"
                  emissive="#ff6600"
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function DNA3DViewer({ 
  originalDna, 
  modifiedDna, 
  changes,
  height = 500
}: DNA3DViewerProps) {
  return (
    <div className="w-full border border-secondary/30 rounded-lg bg-background overflow-hidden" style={{ height }}>
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 3.5]} fov={55} />
          <ambientLight intensity={0.5} />
          <pointLight position={[8, 8, 8]} intensity={0.8} />
          <pointLight position={[-8, -8, -8]} intensity={0.4} />
          <directionalLight position={[0, 5, 5]} intensity={0.7} />
          
          <DNAHelix3DModel 
            originalDna={originalDna}
            modifiedDna={modifiedDna}
            changes={changes}
          />
          
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={2.5}
            maxDistance={6}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
          />
        </Suspense>
      </Canvas>
      <div className="p-4 bg-secondary/10 border-t border-secondary/30">
        <p className="text-sm text-text/70 text-center">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
          Original strand changes
          <span className="inline-block w-3 h-3 rounded-full bg-green-500 mx-4 mr-2"></span>
          Modified strand changes
          <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mx-4 mr-2"></span>
          Changed base pairs
        </p>
      </div>
    </div>
  );
}

