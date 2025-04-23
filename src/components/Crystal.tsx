
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, MeshStandardMaterial } from 'three';
import { useAquariumStore } from '../store/aquariumStore';

interface CrystalProps {
  position: [number, number, number];
  color?: string;
  height?: number;
  rotation?: [number, number, number];
  audioLevel?: number;
  onExplode?: () => void;
}

export function Crystal({ 
  position, 
  color = '#C9B7FF', 
  height = 1,
  rotation = [0, 0, 0],
  audioLevel = 0,
  onExplode
}: CrystalProps) {
  const crystalRef = useRef<Mesh>(null);
  const velocityRef = useRef(new Vector3(0, 0, 0));
  const [isExploding, setIsExploding] = useState(false);
  const colorShift = useAquariumStore(state => state.colorShift);
  const incrementScore = useAquariumStore(state => state.incrementScore);
  const originalPosition = useRef(new Vector3(...position));
  
  useFrame(({ clock }) => {
    if (!crystalRef.current) return;
    
    const time = clock.getElapsedTime();
    
    if (!isExploding) {
      // Gentle bouncing motion
      const bounceFactor = Math.sin(time * 2) * 0.05;
      crystalRef.current.position.y = originalPosition.current.y + bounceFactor;
      
      // Slow rotation
      crystalRef.current.rotation.y += 0.01;
      
      // Color shifting effect
      if (colorShift) {
        const hueShift = (Math.sin(time * 0.5) + 1) * 0.5;
        const material = crystalRef.current.material as MeshStandardMaterial;
        if (material.emissive) {
          material.emissive.setHSL(hueShift, 0.8, 0.5);
        }
      }
    }
  });

  const handleClick = () => {
    if (isExploding) return;
    
    setIsExploding(true);
    incrementScore();
    if (onExplode) onExplode();

    // Reset crystal after explosion
    setTimeout(() => {
      setIsExploding(false);
      if (crystalRef.current) {
        crystalRef.current.position.set(...position);
      }
    }, 1000);
  };

  return (
    <mesh
      ref={crystalRef}
      position={position}
      rotation={rotation}
      onClick={handleClick}
    >
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isExploding ? 1 : 0.3}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={isExploding ? 0.5 : 1}
      />
    </mesh>
  );
}
