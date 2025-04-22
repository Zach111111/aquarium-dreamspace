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
  onClick?: () => void;
}

export function Crystal({ 
  position, 
  color = '#C9B7FF', 
  height = 1,
  rotation = [0, 0, 0],
  audioLevel = 0,
  onClick
}: CrystalProps) {
  const crystalRef = useRef<Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragged, setIsDragged] = useState(false);
  const colorShift = useAquariumStore(state => state.colorShift);
  const originalPosition = useRef(new Vector3(...position));

  useFrame(({ clock }) => {
    if (!crystalRef.current) return;
    
    const time = clock.getElapsedTime();
    
    const pulseIntensity = 0.05 * (1 + audioLevel * 0.5);
    const pulse = 1 + Math.sin(time * 3) * pulseIntensity;
    
    crystalRef.current.scale.y = height * pulse;
    
    if (!isDragged) {
      crystalRef.current.position.y = originalPosition.current.y + Math.sin(time) * 0.05;
    }
    
    if (colorShift) {
      const hueShift = (Math.sin(time * 0.5) + 1) * 0.5;
      
      if (crystalRef.current.material instanceof Array) {
        crystalRef.current.material.forEach(mat => {
          const standardMat = mat as MeshStandardMaterial;
          if (standardMat.emissive) {
            standardMat.emissive.setHSL(hueShift, 0.8, 0.5);
          }
        });
      } else if (crystalRef.current.material) {
        const standardMat = crystalRef.current.material as MeshStandardMaterial;
        if (standardMat.emissive) {
          standardMat.emissive.setHSL(hueShift, 0.8, 0.5);
        }
      }
    }
    
    const emissiveIntensity = isHovered || isDragged ? 0.6 : 0.3;
    
    if (crystalRef.current.material instanceof Array) {
      crystalRef.current.material.forEach(mat => {
        const standardMat = mat as MeshStandardMaterial;
        if (standardMat.emissiveIntensity !== undefined) {
          standardMat.emissiveIntensity = emissiveIntensity * (1 + audioLevel * 0.5);
        }
      });
    } else if (crystalRef.current.material) {
      const standardMat = crystalRef.current.material as MeshStandardMaterial;
      if (standardMat.emissiveIntensity !== undefined) {
        standardMat.emissiveIntensity = emissiveIntensity * (1 + audioLevel * 0.5);
      }
    }
  });

  return (
    <mesh
      ref={crystalRef}
      position={position}
      rotation={rotation}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onPointerDown={(e) => {
        e.stopPropagation();
        setIsDragged(true);
        if (onClick) onClick();
      }}
      onPointerUp={() => setIsDragged(false)}
      onPointerMove={(e) => {
        if (isDragged && crystalRef.current) {
          const x = e.point.x;
          const z = e.point.z;
          crystalRef.current.position.x = x;
          crystalRef.current.position.z = z;
        }
      }}
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

Crystal.displayName = 'Crystal';
