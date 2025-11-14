import * as THREE from 'three';

export function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

export function getCSSVariableColor(variable: string): string {
  if (typeof window === 'undefined') return '#00bf63';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim() || '#00bf63';
}

export function createOrbitControls(camera: THREE.Camera, domElement: HTMLElement) {
  // This will be handled by @react-three/drei OrbitControls
  return null;
}

