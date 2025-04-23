
import { useMemo } from 'react';
import * as THREE from 'three';

interface ParticlesProps {
  count?: number;
  color?: string;
  size?: number;
  tankSize: [number, number, number];
  mousePosition?: THREE.Vector3;
  audioLevel?: number;
}

export function Particles({ 
  count = 5, 
  color = '#F6F7FF', 
  size = 0.05,
  tankSize
}: ParticlesProps) {
  const [tankWidth, tankHeight, tankDepth] = tankSize;
  
  // Generate minimal positions
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * tankWidth * 0.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * tankHeight * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * tankDepth * 0.5;
    }
    return positions;
  }, [count, tankWidth, tankHeight, tankDepth]);

  // Ultra-simple point material for stability
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        color={color} 
        size={size} 
        transparent={false}
      />
    </points>
  );
}

Particles.displayName = 'Particles';
