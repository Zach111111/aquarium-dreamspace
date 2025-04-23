
import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, MeshStandardMaterial } from 'three';
import { useAquariumStore } from '../store/aquariumStore';

interface CrystalProps {
  position: [number, number, number];
  color?: string;
  height?: number;
  rotation?: [number, number, number];
  audioLevel?: number;
  onExplode?: (position: [number, number, number]) => void;
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
  const originalPosition = useRef(new Vector3(...position));
  const floorY = -2.8; // Matches SandFloor position
  
  useFrame(({ clock }, delta) => {
    if (!crystalRef.current) return;
    
    const time = clock.getElapsedTime();
    
    if (!isExploding) {
      // Apply gravity and bouncing
      velocityRef.current.y -= 9.8 * delta * 0.1; // Reduced gravity for underwater feel
      crystalRef.current.position.y += velocityRef.current.y;
      
      // Bounce off floor
      if (crystalRef.current.position.y <= floorY) {
        crystalRef.current.position.y = floorY;
        velocityRef.current.y = Math.abs(velocityRef.current.y) * 0.6; // Dampened bounce
      }
      
      // Gentle floating motion
      const floatOffset = Math.sin(time * 2) * 0.05;
      crystalRef.current.position.y += floatOffset;
      
      // Slow rotation
      crystalRef.current.rotation.y += 0.01;
      
      if (colorShift) {
        const material = crystalRef.current.material as MeshStandardMaterial;
        if (material.emissive) {
          const hue = (Math.sin(time * 0.5) + 1) * 0.5;
          material.emissive.setHSL(hue, 0.8, 0.5);
        }
      }
    }
  });

  const handleClick = () => {
    if (isExploding) return;
    
    setIsExploding(true);
    if (onExplode && crystalRef.current) {
      const pos = crystalRef.current.position.toArray() as [number, number, number];
      onExplode(pos);
    }

    setTimeout(() => {
      setIsExploding(false);
      if (crystalRef.current) {
        crystalRef.current.position.set(...position);
        velocityRef.current.set(0, 0, 0);
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
