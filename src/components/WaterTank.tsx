
import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WaterTankProps {
  size: [number, number, number];
  children: React.ReactNode;
  audioLevel?: number;
  useSimpleMaterial?: boolean;
}

export function WaterTank({ 
  size, 
  children, 
  audioLevel = 0,
  useSimpleMaterial = false
}: WaterTankProps) {
  const [width, height, depth] = size;
  const waterRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  
  // Always use simple materials to avoid errors
  const [shouldUseSimpleMaterial, setShouldUseSimpleMaterial] = useState(true);
  
  // Create simple materials that won't cause property access issues
  const waterMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#66ccff",
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
  }, []);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#F6F7FF",
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
  }, []);

  useFrame(({ clock }) => {
    if (!waterRef.current) return;
    
    try {
      // Simple water animation
      const time = clock.getElapsedTime();
      waterRef.current.rotation.y = Math.sin(time * 0.1) * 0.05;
    } catch (error) {
      console.error("Water animation error:", error);
    }
  });

  // thickness for the glass walls
  const wallThickness = 0.25;

  return (
    <group>
      {/* Water volume */}
      <mesh
        ref={waterRef}
        position={[0, 0, 0]}
      >
        <boxGeometry args={[width * 0.98, height * 0.98, depth * 0.98]} />
        <meshBasicMaterial
          color="#66ccff"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Glass walls */}
      <mesh 
        ref={glassRef}
        position={[0, 0, 0]}
      >
        <boxGeometry
          args={[
            width + wallThickness,
            height + wallThickness,
            depth + wallThickness,
          ]}
        />
        <meshBasicMaterial
          color="#F6F7FF"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Tank contents */}
      <group position={[0, 0, 0]}>
        {children}
      </group>
    </group>
  );
}

WaterTank.displayName = 'WaterTank';
