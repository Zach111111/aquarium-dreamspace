
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

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

  // Animate plant swaying in the water current with simplified animation
  useFrame(({ clock }) => {
    if (!plantRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // Base sway plus audio reactivity
    const sway = Math.sin(time * 1.5) * 0.1 * (1 + audioLevel * 0.5);
    
    plantRef.current.rotation.z = sway;
  });

  // Very simplified plant - just a single stem
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
