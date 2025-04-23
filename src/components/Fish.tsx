
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
  speed = 1,
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
  
  // Generate unique initial position for each fish
  const initialPosition = useMemo(() => new Vector3(
    MathUtils.lerp(bounds.minX, bounds.maxX, Math.random()),
    MathUtils.lerp(bounds.minY, bounds.maxY, Math.random()),
    MathUtils.lerp(bounds.minZ, bounds.maxZ, Math.random())
  ), [bounds]);
  
  // Generate unique movement parameters for each fish
  const movementParams = useMemo(() => ({
    amplitude: 0.01 + Math.random() * 0.01,  // Increased amplitude
    frequency: 0.5 + Math.random() * 1.0,
    phaseOffset: Math.random() * Math.PI * 2,
    verticalFactor: 0.3 + Math.random() * 0.7
  }), []);
  
  // Store the target position for smooth movement
  const targetPosition = useRef(initialPosition.clone());
  const currentVelocity = useRef(new Vector3(0, 0, 0));
  
  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    
    const fish = fishRef.current;
    const time = clock.getElapsedTime();
    const actualSpeed = speed * speedFactor;
    
    // Calculate new target position with wider range of motion
    const phase = time * movementParams.frequency * actualSpeed + movementParams.phaseOffset;
    
    targetPosition.current.x = initialPosition.x + Math.sin(phase) * movementParams.amplitude * 6;
    targetPosition.current.y = initialPosition.y + Math.sin(phase * movementParams.verticalFactor) * movementParams.amplitude * 4;
    targetPosition.current.z = initialPosition.z + Math.cos(phase * 0.7) * movementParams.amplitude * 5;
    
    // Apply position with boundary checks
    targetPosition.current.x = MathUtils.clamp(targetPosition.current.x, bounds.minX, bounds.maxX);
    targetPosition.current.y = MathUtils.clamp(targetPosition.current.y, bounds.minY, bounds.maxY);
    targetPosition.current.z = MathUtils.clamp(targetPosition.current.z, bounds.minZ, bounds.maxZ);
    
    // Smooth movement towards target position
    fish.position.lerp(targetPosition.current, 0.02 * actualSpeed);
    
    // Fish rotation facing movement direction
    const direction = new Vector3().subVectors(targetPosition.current, fish.position).normalize();
    if (direction.length() > 0.1) {
      fish.lookAt(fish.position.clone().add(direction));
      // Add slight tilt based on vertical movement
      fish.rotation.z = Math.sin(time * 3 * speedFactor) * 0.2;
    }
    
    // Breathing animation
    const breathScale = 1 + Math.sin(time * 2 * actualSpeed) * 0.05;
    fish.scale.set(scale, scale * breathScale, scale);
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
        />
      </mesh>
      
      {/* Fish tail */}
      <mesh position={[initialPosition.x - scale * 0.4, initialPosition.y, initialPosition.z]} 
            scale={[scale * 0.4, scale * 0.3, scale * 0.2]}>
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
