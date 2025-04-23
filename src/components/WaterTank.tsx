
import { useRef, useState, useMemo } from 'react';
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
  
  // Create optimized materials that won't cause property access issues
  const waterMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#66ccff",
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false, // Prevents z-fighting with contents
      roughness: 0.2,
      metalness: 0.1
    });
  }, []);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#F6F7FF",
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      depthWrite: true, // Enable depth writing for glass
      roughness: 0.05,
      metalness: 0.9,
      envMapIntensity: 1.5
    });
  }, []);

  useFrame(({ clock }) => {
    if (!waterRef.current) return;
    
    try {
      // Subtle water animation
      const time = clock.getElapsedTime();
      waterRef.current.rotation.y = Math.sin(time * 0.1) * 0.02;
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
        <primitive object={waterMaterial} />
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
        <primitive object={glassMaterial} />
      </mesh>
      
      {/* Tank contents */}
      <group position={[0, 0, 0]}>
        {children}
      </group>
    </group>
  );
}

WaterTank.displayName = 'WaterTank';
