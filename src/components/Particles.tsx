
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
  
  // Animation for particles
  useFrame(({ clock }) => {
    if (!points.current) return;
    
    const time = clock.getElapsedTime();
    const positions = points.current.geometry.attributes.position.array as Float32Array;
    
    // Apply noise and mouse attraction to particle movement
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];
      
      // Apply perlin noise for natural movement
      const noiseScale = 0.5;
      const noiseStrength = 0.01 * (1 + audioLevel);
      const nx = noise3D(x * noiseScale, y * noiseScale, time * 0.3) * noiseStrength;
      const ny = noise3D(x * noiseScale, y * noiseScale + 100, time * 0.3) * noiseStrength;
      const nz = noise3D(x * noiseScale, y * noiseScale + 200, time * 0.3) * noiseStrength;
      
      // Mouse attraction if mouse position is available
      let mouseAttraction = { x: 0, y: 0, z: 0 };
      if (mousePosition) {
        const dx = mousePosition.x - x;
        const dy = mousePosition.y - y;
        const dz = mousePosition.z - z;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (distance < 2) { // Attraction radius
          const strength = (1 - distance/2) * 0.02; // Stronger when closer
          mouseAttraction = {
            x: dx * strength,
            y: dy * strength,
            z: dz * strength
          };
        }
      }
      
      // Update position with noise, velocity and mouse attraction
      positions[i3] += nx + velocities[i].x + mouseAttraction.x;
      positions[i3 + 1] += ny + velocities[i].y + mouseAttraction.y;
      positions[i3 + 2] += nz + velocities[i].z + mouseAttraction.z;
      
      // Boundary check - wrap around if out of bounds
      if (Math.abs(positions[i3]) > tankWidth/2) {
        positions[i3] = -positions[i3] * 0.9; // Bounce back from walls
        velocities[i].x *= -0.5; // Reverse direction with damping
      }
      
      if (Math.abs(positions[i3 + 1]) > tankHeight/2) {
        positions[i3 + 1] = -positions[i3 + 1] * 0.9;
        velocities[i].y *= -0.5;
      }
      
      if (Math.abs(positions[i3 + 2]) > tankDepth/2) {
        positions[i3 + 2] = -positions[i3 + 2] * 0.9;
        velocities[i].z *= -0.5;
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
        size={size * (1 + audioLevel * 0.5)} 
        transparent
        opacity={0.6}
        alphaTest={0.3}
      />
    </points>
  );
}
