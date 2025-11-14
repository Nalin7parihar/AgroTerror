import * as THREE from 'three';

export function createDNAHelixGeometry(
  radius: number = 1,
  height: number = 4,
  segments: number = 20
) {
  const points: THREE.Vector3[] = [];
  const points2: THREE.Vector3[] = [];
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const y = (i / segments) * height - height / 2;
    
    // First strand
    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    points.push(new THREE.Vector3(x1, y, z1));
    
    // Second strand (opposite side)
    const x2 = Math.cos(angle + Math.PI) * radius;
    const z2 = Math.sin(angle + Math.PI) * radius;
    points2.push(new THREE.Vector3(x2, y, z2));
  }
  
  return { points, points2 };
}

export function createDNABasePairs(
  radius: number = 1,
  height: number = 4,
  segments: number = 20
) {
  const basePairs: Array<{ start: THREE.Vector3; end: THREE.Vector3 }> = [];
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const y = (i / segments) * height - height / 2;
    
    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const x2 = Math.cos(angle + Math.PI) * radius;
    const z2 = Math.sin(angle + Math.PI) * radius;
    
    basePairs.push({
      start: new THREE.Vector3(x1, y, z1),
      end: new THREE.Vector3(x2, y, z2),
    });
  }
  
  return basePairs;
}

