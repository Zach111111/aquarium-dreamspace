
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial, CylinderGeometry } from 'three';
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
  segments = 8, // Increased segments for smoother geometry
  audioLevel = 0
}: PlantProps) {
  const plantRef = useRef<Mesh>(null);
  const speedFactor = useAquariumStore(state => state.speedFactor);
  
  // Memoize geometry and material to avoid recreation every frame
  const geometry = useMemo(() => 
    new CylinderGeometry(width * 0.2, width * 0.4, height, segments), 
    [width, height, segments]
  );
  
  const material = useMemo(() => 
    new MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.1,
      roughness: 0.7,
      metalness: 0.1,
      depthWrite: true // Enable depth writing to fix z-fighting
    }), 
    [color]
  );

  // Generate unique sway parameters for this plant
  const swayParams = useMemo(() => ({
    frequency: 0.5 + Math.random() * 0.5,
    amplitude: 0.04 + Math.random() * 0.03,
    phaseOffset: Math.random() * Math.PI * 2
  }), []);

  // Animate plant swaying with steady, controlled motion
  useFrame(({ clock }) => {
    if (!plantRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // Steady, predictable movement with unique parameters
    const swaySpeed = swayParams.frequency * speedFactor;
    // Simple sway with unique phase to avoid synchronization
    const sway = Math.sin(time * swaySpeed + swayParams.phaseOffset) * swayParams.amplitude;
    
    plantRef.current.rotation.z = sway;
  });

  return (
    <group position={position}>
      <mesh 
        ref={plantRef} 
        position={[0, height/2, 0]}
        geometry={geometry}
        material={material}
      />
    </group>
  );
}
