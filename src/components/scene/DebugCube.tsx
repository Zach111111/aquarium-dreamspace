
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface DebugCubeProps {
  visible?: boolean;
}

export function DebugCube({ visible = true }: DebugCubeProps) {
  // Use a ref to hold reference to the mesh for animations
  const meshRef = useRef<Mesh>(null);
  
  // Use useFrame to animate the cube on each frame
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime()) * 0.5;
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  if (!visible) return null;
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

DebugCube.displayName = 'DebugCube';
