
import { useRef } from 'react';
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
  
  // Memoize boundaries
  const [tankWidth, tankHeight, tankDepth] = tankSize;
  const bounds = {
    minX: -(tankWidth/2) * 0.8,
    maxX: (tankWidth/2) * 0.8,
    minY: -(tankHeight/2) * 0.8,
    maxY: (tankHeight/2) * 0.8,
    minZ: -(tankDepth/2) * 0.8,
    maxZ: (tankDepth/2) * 0.8
  };
  
  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    
    const fish = fishRef.current;
    const time = clock.getElapsedTime();
    const fishIndex = index + 1;
    
    // Update position with speed factor and boundaries
    const newX = fish.position.x + Math.sin(time * 2 * speedFactor + fishIndex) * 0.003 * speedFactor;
    const newY = fish.position.y + Math.cos(time * 1.5 * speedFactor + fishIndex) * 0.002 * speedFactor;
    
    // Apply position changes with boundary checks
    fish.position.x = MathUtils.clamp(newX, bounds.minX, bounds.maxX);
    fish.position.y = MathUtils.clamp(newY, bounds.minY, bounds.maxY);
    fish.position.z = MathUtils.clamp(fish.position.z, bounds.minZ, bounds.maxZ);
    
    // Fish rotation and breathing animation
    fish.rotation.z = Math.sin(time * 3 * speedFactor + fishIndex) * 0.2;
    fish.rotation.y = Math.atan2(
      Math.sin(time * 2 * speedFactor + fishIndex),
      Math.cos(time * 1.5 * speedFactor + fishIndex)
    );
    
    const breathScale = 1 + Math.sin(time * 5 * speedFactor + fishIndex) * 0.05;
    if (typeof scale === 'number') {
      fish.scale.set(scale, scale * breathScale, scale);
    }
  });

  return (
    <group>
      {/* Fish body */}
      <mesh ref={fishRef} scale={[scale, scale * 0.6, scale * 0.5]}>
        <tetrahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.2}
          roughness={0.4}
        />
      </mesh>
      
      {/* Fish tail */}
      <mesh position={[scale * 0.4, 0, 0]} rotation={[0, 0, Math.PI]} scale={[scale * 0.4, scale * 0.3, scale * 0.2]}>
        <tetrahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.2}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}
