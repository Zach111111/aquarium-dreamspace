
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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
  count = 200, 
  color = '#F6F7FF', 
  size = 0.05,
  tankSize,
  mousePosition,
  audioLevel = 0
}: ParticlesProps) {
  const [tankWidth, tankHeight, tankDepth] = tankSize;
  const points = useRef<THREE.Points>(null);
  
  // Generate initial random positions - reduced count for better performance
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * tankWidth * 0.8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * tankHeight * 0.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * tankDepth * 0.8;
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
  
  // Simplified animation for particles - update fewer particles per frame
  useFrame(({ clock }) => {
    if (!points.current) return;
    
    const positions = points.current.geometry.attributes.position.array as Float32Array;
    
    // Only update a small subset of particles each frame for better performance
    const step = 20; // Update fewer particles per frame
    const limit = Math.min(count, 60); // Only process up to 60 particles
    
    for (let i = 0; i < limit; i += step) {
      const i3 = i * 3;
      
      // Simple movement with minimal calculations
      positions[i3] += velocities[i].x;
      positions[i3 + 1] += velocities[i].y;
      positions[i3 + 2] += velocities[i].z;
      
      // Simplified boundary check - wrap around
      if (Math.abs(positions[i3]) > tankWidth/2) {
        positions[i3] *= -0.9; // Bounce off wall
      }
      
      if (positions[i3 + 1] > tankHeight/2) {
        positions[i3 + 1] = -tankHeight/2; // Reset to bottom if reached top
      }
      
      if (Math.abs(positions[i3 + 2]) > tankDepth/2) {
        positions[i3 + 2] *= -0.9; // Bounce off wall
      }
    }
    
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  // Simplified point material for better performance
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
        opacity={0.4}
        sizeAttenuation={true}
      />
    </points>
  );
}

Particles.displayName = 'Particles';
