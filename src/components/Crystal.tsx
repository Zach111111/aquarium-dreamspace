
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
  const [isHovered, setIsHovered] = useState(false);
  const colorShift = useAquariumStore(state => state.colorShift);
  const originalPosition = useRef(new Vector3(...position));
  const floorY = -2.8; // Matches SandFloor position
  const [lastClickTime, setLastClickTime] = useState(0);
  
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

      // Hover effect - pulsing glow
      if (isHovered && material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = 0.3 + Math.sin(time * 6) * 0.3;
      } else if (material.emissiveIntensity !== undefined && !isExploding) {
        material.emissiveIntensity = 0.3;
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

  const handlePointerDown = (e: any) => {
    // Stop event propagation to prevent it from reaching objects behind
    e.stopPropagation();
    
    const currentTime = Date.now();
    if (isExploding || currentTime - lastClickTime < 300) return;
    
    setLastClickTime(currentTime);
    setIsExploding(true);
    
    if (onExplode && crystalRef.current) {
      const pos = crystalRef.current.position.toArray() as [number, number, number];
      onExplode(pos);
    }

    // Reset after animation
    setTimeout(() => {
      if (crystalRef.current) {
        // Find a new position farther from the original position
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

  // Visual feedback scale based on hover state
  const hoverScale = isHovered ? 1.1 : 1;
  const explodeScale = isExploding ? 1.5 : 1;
  const finalScale = hoverScale * explodeScale;

  return (
    <mesh
      ref={crystalRef}
      position={position}
      rotation={rotation}
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        setIsHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
        setIsHovered(false);
      }}
      scale={[finalScale, finalScale, finalScale]}
      renderOrder={10} // Higher render order to ensure it renders on top
    >
      <octahedronGeometry args={[0.5, 0]} />
      <primitive object={material} />
    </mesh>
  );
}
