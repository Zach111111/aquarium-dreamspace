
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MinimalPlantProps {
  position: [number, number, number];
}

export const MinimalPlant = ({ position }: MinimalPlantProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    const t = clock.getElapsedTime();
    
    // Gentle swaying motion
    meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.05;
    meshRef.current.rotation.z = Math.cos(t * 0.7) * 0.05;
  });
  
  // Create a slightly varied green color for each plant
  const hue = 100 + Math.random() * 40;
  const color = `hsl(${hue}, 70%, 30%)`;
  
  return (
    <group position={position}>
      {/* Plant stem */}
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 1.0, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Plant leaves */}
      <mesh position={[0, 0.7, 0]} rotation={[0, 0, Math.PI / 4]}>
        <sphereGeometry args={[0.15, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[0, 0.85, 0]} rotation={[0, Math.PI / 2, Math.PI / 4]}>
        <sphereGeometry args={[0.12, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
