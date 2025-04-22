
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { noise3D } from '../utils/noise';

interface ParticlesProps {
  count?: number;
  color?: string;
  size?: number;
  tankSize: [number, number, number];
  mousePosition?: THREE.Vector3;
  audioLevel?: number;
}

export function Particles({ 
  count = 200, 
  color = '#F6F7FF', 
  size = 0.05,
  tankSize,
  mousePosition,
  audioLevel = 0
}: ParticlesProps) {
  const [tankWidth, tankHeight, tankDepth] = tankSize;
  const points = useRef<THREE.Points>(null);
  
  // Generate initial random positions
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * tankWidth;
      positions[i * 3 + 1] = (Math.random() - 0.5) * tankHeight;
      positions[i * 3 + 2] = (Math.random() - 0.5) * tankDepth;
    }
    return positions;
  }, [count, tankWidth, tankHeight, tankDepth]);
  
  // Create velocities array
  const velocities = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 0.01,
      y: (Math.random() - 0.5) * 0.01 + 0.002, // Slight upward bias for bubbles
      z: (Math.random() - 0.5) * 0.01
    }));
  }, [count]);
  
  // Simplified animation for particles
  useFrame(({ clock }) => {
    if (!points.current) return;
    
    const time = clock.getElapsedTime();
    const positions = points.current.geometry.attributes.position.array as Float32Array;
    
    // Only update every 10th particle each frame for better performance
    const step = 10;
    const limit = Math.min(count, 100); // Cap the number of particles we process
    
    for (let i = 0; i < limit; i += step) {
      const i3 = i * 3;
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];
      
      // Simplified movement
      positions[i3] += velocities[i].x;
      positions[i3 + 1] += velocities[i].y;
      positions[i3 + 2] += velocities[i].z;
      
      // Simple boundary check - wrap around if out of bounds
      if (Math.abs(positions[i3]) > tankWidth/2) {
        velocities[i].x *= -1; // Reverse direction
      }
      
      if (Math.abs(positions[i3 + 1]) > tankHeight/2) {
        velocities[i].y *= -1;
      }
      
      if (Math.abs(positions[i3 + 2]) > tankDepth/2) {
        velocities[i].z *= -1;
      }
    }
    
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
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
        transparent
        opacity={0.6}
        alphaTest={0.3}
      />
    </points>
  );
}

Particles.displayName = 'Particles';
