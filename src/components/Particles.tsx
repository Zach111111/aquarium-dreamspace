
import { useMemo, useRef, forwardRef } from 'react';
import * as THREE from 'three';

interface ParticlesProps {
  count?: number;
  color?: string;
  size?: number;
  tankSize: [number, number, number];
  mousePosition?: THREE.Vector3 | null;
  audioLevel?: number;
}

export const Particles = forwardRef<THREE.Points, ParticlesProps>(function Particles({ 
  count = 50, 
  color = '#F6F7FF', 
  size = 0.05,
  tankSize,
  mousePosition,
  audioLevel = 0
}, ref) {
  const pointsRef = useRef<THREE.Points>(null);
  const [tankWidth, tankHeight, tankDepth] = tankSize;
  
  // Generate positions and velocities
  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Array(count).fill(0).map(() => new THREE.Vector3(
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01
    ));
    
    // Initialize positions
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * tankWidth * 0.8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * tankHeight * 0.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * tankDepth * 0.8;
    }
    
    return { positions, velocities };
  }, [count, tankWidth, tankHeight, tankDepth]);
  
  // We'll handle the animation in a separate component that's inside Canvas
  
  return (
    <points ref={ref || pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleData.positions.length / 3}
          array={particleData.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        color={color} 
        size={size} 
        transparent={true}
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
});

Particles.displayName = 'Particles';
