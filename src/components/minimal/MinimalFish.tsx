
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MinimalFishProps {
  tankSize: [number, number, number];
  index: number;
}

export const MinimalFish = ({ tankSize, index }: MinimalFishProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const speed = 0.5 + Math.random() * 0.5;
  
  // Define as tuple with exactly 3 elements to satisfy TypeScript
  const startPosition: [number, number, number] = [
    (Math.random() - 0.5) * 5,
    (Math.random() - 0.5) * 3,
    (Math.random() - 0.5) * 5
  ];
  
  // Simple animation
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    const t = clock.getElapsedTime();
    
    // Fish swimming motion
    meshRef.current.position.x = startPosition[0] + Math.sin(t * speed + index) * 2;
    meshRef.current.position.y = startPosition[1] + Math.sin(t * speed * 0.5 + index * 2) * 0.5;
    meshRef.current.position.z = startPosition[2] + Math.cos(t * speed + index) * 2;
    
    // Fish rotation (face direction of movement)
    meshRef.current.rotation.y = Math.sin(t * speed + index) * 0.5;
    
    // Fish "breathing" effect
    const breathScale = 1 + Math.sin(t * 3 + index * 10) * 0.05;
    meshRef.current.scale.y = breathScale * 0.2;
    meshRef.current.scale.z = breathScale * 0.3;
  });

  const hue = index * 36 + 180;
  const color = `hsl(${hue}, 70%, ${50 + index * 5}%)`;

  return (
    <mesh ref={meshRef} position={startPosition}>
      <capsuleGeometry args={[0.2, 0.4, 4, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  );
};
