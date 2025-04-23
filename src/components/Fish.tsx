
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, MathUtils } from 'three';
import { useAquariumStore } from '../store/aquariumStore';

interface FishProps {
  color?: string;
  scale?: number;
  speed?: number;
  tankSize: [number, number, number];
  index: number;
  audioLevel?: number;
  groupOffset?: { x: number; y: number; z: number };
}

export function Fish({ 
  color = '#A5F3FF',
  scale = 1, 
  speed = 1,
  tankSize,
  index,
  audioLevel = 0,
  groupOffset = { x: 0, y: 0, z: 0 }
}: FishProps) {
  const fishRef = useRef<Group>(null);
  const speedFactor = useAquariumStore(state => state.speedFactor);
  const decrementScore = useAquariumStore(state => state.decrementScore);
  
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
  
  const initialPosition = useMemo(() => new Vector3(
    MathUtils.lerp(bounds.minX, bounds.maxX, Math.random()),
    MathUtils.lerp(bounds.minY, bounds.maxY, Math.random()),
    MathUtils.lerp(bounds.minZ, bounds.maxZ, Math.random())
  ), [bounds]);

  const movementParams = useMemo(() => ({
    amplitude: 0.01 + Math.random() * 0.01,
    frequency: 0.5 + Math.random() * 1.0,
    phaseOffset: Math.random() * Math.PI * 2 + index * (Math.PI / 4),
    verticalFactor: 0.3 + Math.random() * 0.7
  }), [index]);

  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    
    const time = clock.getElapsedTime();
    const actualSpeed = speed * speedFactor;
    
    // Calculate base position with group offset
    const phase = time * movementParams.frequency * actualSpeed + movementParams.phaseOffset;
    
    const targetPos = new Vector3(
      initialPosition.x + Math.sin(phase) * 6 + groupOffset.x,
      initialPosition.y + Math.sin(phase * movementParams.verticalFactor) * 4 + groupOffset.y,
      initialPosition.z + Math.cos(phase * 0.7) * 5 + groupOffset.z
    );
    
    // Apply boundary limits
    targetPos.x = MathUtils.clamp(targetPos.x, bounds.minX, bounds.maxX);
    targetPos.y = MathUtils.clamp(targetPos.y, bounds.minY, bounds.maxY);
    targetPos.z = MathUtils.clamp(targetPos.z, bounds.minZ, bounds.maxZ);
    
    // Smooth movement
    fishRef.current.position.lerp(targetPos, 0.02 * actualSpeed);
    
    // Fish rotation
    const direction = new Vector3().subVectors(targetPos, fishRef.current.position).normalize();
    if (direction.length() > 0.1) {
      fishRef.current.lookAt(fishRef.current.position.clone().add(direction));
      fishRef.current.rotation.z = Math.sin(time * 3 * speedFactor) * 0.2;
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    decrementScore();
  };

  return (
    <group 
      ref={fishRef} 
      position={initialPosition.toArray()}
      onClick={handleClick}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'default'}
    >
      <mesh scale={[scale, scale * 0.6, scale * 0.5]}>
        <tetrahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.2}
          roughness={0.4}
        />
      </mesh>
      
      <mesh 
        position={[-scale * 0.4, 0, 0]} 
        scale={[scale * 0.4, scale * 0.3, scale * 0.2]}
      >
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
