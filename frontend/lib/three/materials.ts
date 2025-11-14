import * as THREE from 'three';

export function createDNAMaterial(color: string, opacity: number = 1) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.3,
    roughness: 0.7,
    opacity,
    transparent: opacity < 1,
  });
}

export function createDNAStrandMaterial(color: string) {
  return new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    linewidth: 3,
  });
}

export function createDNABasePairMaterial(color: string) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.3,
    metalness: 0.5,
    roughness: 0.5,
  });
}

