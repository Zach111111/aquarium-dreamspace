
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
  segments = 12,
  audioLevel = 0
}: PlantProps) {
  const plantRef = useRef<Mesh>(null);
  const speedFactor = useAquariumStore(state => state.speedFactor);
  
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
      transparent: false,
      depthWrite: true
    }), 
    [color]
  );

  useFrame(({ clock }) => {
    if (!plantRef.current) return;
    const time = clock.getElapsedTime();
    plantRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
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
