
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, MathUtils } from 'three';
import { useAquariumStore } from '../store/aquariumStore';

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
  tankSize,
  index,
  audioLevel = 0
}: FishProps) {
  const fishRef = useRef<Mesh>(null);
  const speedFactor = useAquariumStore(state => state.speedFactor);
  
  // Calculate tank boundaries
  const [tankWidth, tankHeight, tankDepth] = tankSize;
  const bounds = {
    minX: -(tankWidth/2) * 0.8,
    maxX: (tankWidth/2) * 0.8,
    minY: -(tankHeight/2) * 0.8,
    maxY: (tankHeight/2) * 0.8,
    minZ: -(tankDepth/2) * 0.8,
    maxZ: (tankDepth/2) * 0.8
  };
  
  // Memoize initial position and movement parameters for each fish
  const initialPosition = useMemo(() => new Vector3(
    MathUtils.lerp(bounds.minX, bounds.maxX, Math.random()),
    MathUtils.lerp(bounds.minY, bounds.maxY, Math.random()),
    MathUtils.lerp(bounds.minZ, bounds.maxZ, Math.random())
  ), [bounds]);
  
  // Unique movement parameters for each fish
  const movementParams = useMemo(() => ({
    amplitude: 0.005 + Math.random() * 0.005,
    frequency: 0.8 + Math.random() * 1.2,
    phaseOffset: Math.random() * Math.PI * 2,
    verticalFactor: 0.5 + Math.random() * 0.5
  }), []);
  
  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    
    const fish = fishRef.current;
    const time = clock.getElapsedTime();
    const fishIndex = index + 1;
    
    // Apply unique movement pattern with wider range
    const amplitude = movementParams.amplitude * speedFactor;
    const phase = time * movementParams.frequency * speedFactor + movementParams.phaseOffset;
    
    // Calculate new positions with wider swimming range
    const newX = initialPosition.x + Math.sin(phase) * amplitude * 3;
    const newY = initialPosition.y + Math.cos(phase * movementParams.verticalFactor) * amplitude * 2;
    const newZ = initialPosition.z + Math.sin(phase * 0.7) * amplitude * 2;
    
    // Apply position with boundary checks
    fish.position.x = MathUtils.clamp(newX, bounds.minX, bounds.maxX);
    fish.position.y = MathUtils.clamp(newY, bounds.minY, bounds.maxY);
    fish.position.z = MathUtils.clamp(newZ, bounds.minZ, bounds.maxZ);
    
    // Fish rotation facing movement direction
    fish.rotation.z = Math.sin(time * 3 * speedFactor + fishIndex) * 0.2;
    fish.rotation.y = Math.atan2(
      Math.sin(phase),
      Math.cos(phase * movementParams.verticalFactor)
    );
    
    // Breathing animation
    const breathScale = 1 + Math.sin(time * 5 * speedFactor + fishIndex) * 0.05;
    if (typeof scale === 'number') {
      fish.scale.set(scale, scale * breathScale, scale);
    }
  });

  return (
    <group>
      {/* Fish body */}
      <mesh ref={fishRef} position={initialPosition.toArray()} scale={[scale, scale * 0.6, scale * 0.5]}>
        <tetrahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.2}
          roughness={0.4}
          depthWrite={true}
        />
      </mesh>
      
      {/* Fish tail */}
      <mesh position={[initialPosition.x + scale * 0.4, initialPosition.y, initialPosition.z]} 
            rotation={[0, 0, Math.PI]} 
            scale={[scale * 0.4, scale * 0.3, scale * 0.2]}>
        <tetrahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.2}
          roughness={0.4}
          depthWrite={true}
        />
      </mesh>
    </group>
  );
}
