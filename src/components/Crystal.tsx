
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, MeshStandardMaterial } from 'three';
import { useAquariumStore } from '../store/aquariumStore';

interface CrystalProps {
  position: [number, number, number];
  color?: string;
  height?: number;
  rotation?: [number, number, number];
  audioLevel?: number;
}

export function Crystal({ 
  position, 
  color = '#C9B7FF', 
  height = 1,
  rotation = [0, 0, 0],
  audioLevel = 0,
}: CrystalProps) {
  const crystalRef = useRef<Mesh>(null);
  const colorShift = useAquariumStore(state => state.colorShift);
  const originalPosition = useRef(new Vector3(...position));

  useFrame(({ clock }) => {
    if (!crystalRef.current) return;
    
    const time = clock.getElapsedTime();
    
    const pulseIntensity = 0.05 * (1 + audioLevel * 0.5);
    const pulse = 1 + Math.sin(time * 3) * pulseIntensity;
    
    crystalRef.current.scale.y = height * pulse;
    crystalRef.current.position.y = originalPosition.current.y + Math.sin(time) * 0.05;
    
    if (colorShift) {
      const hueShift = (Math.sin(time * 0.5) + 1) * 0.5;
      const standardMat = crystalRef.current.material as MeshStandardMaterial;
      if (standardMat.emissive) {
        standardMat.emissive.setHSL(hueShift, 0.8, 0.5);
      }
    }
  });

  return (
    <mesh
      ref={crystalRef}
      position={position}
      rotation={rotation}
    >
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}
