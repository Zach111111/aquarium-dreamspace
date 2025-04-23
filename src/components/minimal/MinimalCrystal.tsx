
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MinimalCrystalProps {
  position: [number, number, number];
}

export const MinimalCrystal = ({ position }: MinimalCrystalProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    const t = clock.getElapsedTime();
    
    // Gentle pulsing effect
    const pulse = 1 + Math.sin(t * 1.5) * 0.05;
    meshRef.current.scale.set(pulse, pulse, pulse);
    
    // Subtle color shift effect
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      const hue = (Math.sin(t * 0.2) * 0.1) + 0.6; // Range between 0.5-0.7
      meshRef.current.material.emissive.setHSL(hue, 0.8, 0.5);
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} rotation={[Math.PI / 6, 0, Math.PI / 4]}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial 
        color="cyan" 
        emissive="cyan" 
        emissiveIntensity={0.4}
        roughness={0.3}
        metalness={0.7}
      />
    </mesh>
  );
};
