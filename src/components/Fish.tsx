
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { random } from '../utils/noise';
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
  const targetPosition = useRef(new Vector3());
  const velocityRef = useRef(new Vector3(
    (Math.random() - 0.5) * 0.02 * speed,
    (Math.random() - 0.5) * 0.01 * speed,
    (Math.random() - 0.5) * 0.02 * speed
  ));
  
  // Get global speed factor from store
  const speedFactor = useAquariumStore(state => state.speedFactor);
  
  // Set initial random position
  useEffect(() => {
    if (fishRef.current) {
      const [tankWidth, tankHeight, tankDepth] = tankSize;
      fishRef.current.position.set(
        (Math.random() - 0.5) * tankWidth * 0.5,
        (Math.random() - 0.5) * tankHeight * 0.5,
        (Math.random() - 0.5) * tankDepth * 0.5
      );
      
      // Initialize target position
      targetPosition.current.set(
        (Math.random() - 0.5) * tankWidth * 0.6,
        (Math.random() - 0.5) * tankHeight * 0.6,
        (Math.random() - 0.5) * tankDepth * 0.6
      );
    }
  }, [tankSize]);
  
  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    
    const fish = fishRef.current;
    const [tankWidth, tankHeight, tankDepth] = tankSize;
    const time = clock.getElapsedTime();
    const fishIndex = index + 1; // Avoid zero
    
    // Update target position occasionally
    if (Math.sin(time * 0.2 + fishIndex) > 0.97) {
      // Use stricter boundaries for target positions
      targetPosition.current.set(
        (Math.random() - 0.5) * tankWidth * 0.5,
        (Math.random() - 0.5) * tankHeight * 0.5,
        (Math.random() - 0.5) * tankDepth * 0.5
      );
    }
    
    // Move toward target with controlled speed
    const moveSpeed = 0.005 * speed * speedFactor;
    fish.position.x += (targetPosition.current.x - fish.position.x) * moveSpeed;
    fish.position.y += (targetPosition.current.y - fish.position.y) * moveSpeed;
    fish.position.z += (targetPosition.current.z - fish.position.z) * moveSpeed;
    
    // Add subtle swimming motion, adjusted by speed factor
    fish.position.x += Math.sin(time * 2 * speedFactor + fishIndex) * 0.003 * speedFactor;
    fish.position.y += Math.cos(time * 1.5 * speedFactor + fishIndex) * 0.002 * speedFactor;
    
    // Enforce strict tank boundaries
    const bounds = 0.8; // Stricter bounds
    fish.position.x = Math.max(-(tankWidth/2) * bounds, Math.min((tankWidth/2) * bounds, fish.position.x));
    fish.position.y = Math.max(-(tankHeight/2) * bounds, Math.min((tankHeight/2) * bounds, fish.position.y));
    fish.position.z = Math.max(-(tankDepth/2) * bounds, Math.min((tankDepth/2) * bounds, fish.position.z));
    
    // Fish rotation - face direction of movement
    if (velocityRef.current.length() > 0.001) {
      const lookTarget = new Vector3().copy(fish.position).add(velocityRef.current.normalize());
      fish.lookAt(lookTarget);
      
      // Add slight tilt for realism
      fish.rotation.z = Math.sin(time * 3 * speedFactor + fishIndex) * 0.2;
    }
    
    // Fish "breathing" animation
    const breathScale = 1 + Math.sin(time * 5 * speedFactor + fishIndex) * 0.05;
    fish.scale.set(scale, scale * breathScale, scale);
  });

  // Improved fish shape with two tetrahedrons
  return (
    <group>
      {/* Fish body */}
      <mesh ref={fishRef} scale={[1, 0.6, 0.5]}>
        <tetrahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.2}
          roughness={0.4}
        />
      </mesh>
      
      {/* Fish tail */}
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI]} scale={[0.4, 0.3, 0.2]}>
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

Fish.displayName = 'Fish';
