import { useRef, useState, useMemo, useEffect } from 'react';
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
  
  // Create material once and reuse
  const material = useMemo(() => {
    return new MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 1
    });
  }, [color]);
  
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
      
      if (colorShift && material.emissive) {
        const hue = (Math.sin(time * 0.5) + 1) * 0.5;
        material.emissive.setHSL(hue, 0.8, 0.5);
      }
    }
  });

  // Update material properties when exploding state changes
  useEffect(() => {
    if (material) {
      material.emissiveIntensity = isExploding ? 1 : 0.3;
      material.opacity = isExploding ? 0.5 : 1;
    }
  }, [isExploding, material]);

  // Clean up resources
  useEffect(() => {
    return () => {
      if (material) {
        material.dispose();
      }
    };
  }, [material]);

  const handleClick = (event: any) => {
    event.stopPropagation();
    if (isExploding) return;
    
    setIsExploding(true);
    if (onExplode && crystalRef.current) {
      const pos = crystalRef.current.position.toArray() as [number, number, number];
      onExplode(pos);
    }

    // Reset after animation
    setTimeout(() => {
      if (crystalRef.current) {
        const randomPos: [number, number, number] = [
          (Math.random() - 0.5) * 8,  // Random X within tank
          -1 + Math.random() * 2,     // Random Y above floor
          (Math.random() - 0.5) * 8   // Random Z within tank
        ];
        crystalRef.current.position.set(...randomPos);
        setIsExploding(false);
      }
    }, 1000);
  };

  return (
    <mesh
      ref={crystalRef}
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'default'}
    >
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isExploding ? 1 : 0.3}
        transparent
        opacity={isExploding ? 0.5 : 1}
      />
    </mesh>
  );
}
