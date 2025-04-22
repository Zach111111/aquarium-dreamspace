
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

  // Animate plant swaying in the water current
  useFrame(({ clock }) => {
    if (!plantRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // Base sway plus audio reactivity
    const sway = Math.sin(time * 1.5) * 0.1 * (1 + audioLevel * 0.5);
    
    plantRef.current.rotation.x = sway * 0.2;
    plantRef.current.rotation.z = sway;
  });

  return (
    <group position={position}>
      {/* Base/stem of plant */}
      <mesh ref={plantRef} position={[0, height/2, 0]}>
        <cylinderGeometry args={[width * 0.2, width * 0.5, height, segments]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.2} 
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Plant leaves */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (i - 1) * width * 0.7, 
            height * 0.6 + i * height * 0.1, 
            0
          ]}
          rotation={[0, 0, ((i - 1) * Math.PI / 4)]}
        >
          <coneGeometry args={[width * 0.6, height * 0.7, segments]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.2} 
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}
