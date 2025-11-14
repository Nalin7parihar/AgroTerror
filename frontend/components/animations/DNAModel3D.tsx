'use client';

import '@/lib/react-compat';
import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

export function DNAModel(props: any) {
  const { nodes, materials } = useGLTF('/uploads_files_3251711_ДНК5.glb');

  useEffect(() => {
    console.log('DNA model loaded successfully', { 
      hasNodes: !!nodes, 
      hasMaterials: !!materials,
      nodeKeys: nodes ? Object.keys(nodes) : [],
      materialKeys: materials ? Object.keys(materials) : []
    });
  }, [nodes, materials]);

  if (!nodes || !materials) {
    console.warn('DNA model nodes or materials not available');
    return null;
  }

  return (
    <group {...props} dispose={null}>
      {nodes.Cylinder001 && materials['Material.003'] && (
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder001.geometry}
          material={materials['Material.003']}
          scale={[-1, -1, 1]}
        />
      )}
      {nodes.Cylinder002 && materials['Material.002'] && (
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder002.geometry}
          material={materials['Material.002']}
        />
      )}
    </group>
  );
}

// Preload the model
useGLTF.preload('/uploads_files_3251711_ДНК5.glb');

