
import { useRef } from 'react';
import { Mesh } from 'three';

interface FishProps {
  color?: string;
  scale?: number;
  speed?: number;
  tankSize: [number, number, number];
  index: number;
  audioLevel?: number;
}

export function Fish({ 
  color = '#A5F3FF', 
  scale = 1, 
  tankSize
}: FishProps) {
  const fishRef = useRef<Mesh>(null);

  // Ultra-simple fish shape
  return (
    <mesh ref={fishRef} position={[2, 0, 0]}>
      <tetrahedronGeometry args={[0.5, 0]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

Fish.displayName = 'Fish';
