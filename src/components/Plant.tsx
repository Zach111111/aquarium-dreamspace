
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { useAquariumStore } from '../store/aquariumStore';

interface PlantProps {
  position: [number, number, number];
  color?: string;
  height?: number;
  width?: number;
  segments?: number;
  audioLevel?: number;
}

export function Plant({ 
  position, 
  color = '#B9FFCE', 
  height = 2, 
  width = 0.5,
  segments = 3,
  audioLevel = 0 
}: PlantProps) {
  const plantRef = useRef<Mesh>(null);
  const speedFactor = useAquariumStore(state => state.speedFactor);

  // Animate plant swaying with steady, controlled motion
  useFrame(({ clock }) => {
    if (!plantRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // Steady, predictable movement based on global speed factor
    const baseSway = 0.05;
    const swaySpeed = 0.8 * speedFactor;
    const sway = Math.sin(time * swaySpeed) * baseSway;
    
    plantRef.current.rotation.z = sway;
  });

  // Ensure plant is visible on load with improved geometry
  return (
    <group position={position}>
      <mesh ref={plantRef} position={[0, height/2, 0]}>
        <cylinderGeometry args={[width * 0.2, width * 0.4, height, segments]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.1} 
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

Plant.displayName = 'Plant';
