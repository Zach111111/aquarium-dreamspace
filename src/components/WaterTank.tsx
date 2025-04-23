
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAquariumStore } from '../store/aquariumStore';

interface WaterTankProps {
  size?: [number, number, number];
  children?: React.ReactNode;
  audioLevel?: number;
  useSimpleMaterial?: boolean;
}

function WaterTank({ 
  size = [5, 4, 5], 
  children, 
  audioLevel = 0,
  useSimpleMaterial = true
}: WaterTankProps) {
  const [width, height, depth] = size;
  const toggleMenu = useAquariumStore(state => state.toggleMenu);
  const waterRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);

  const handlePointerDown = () => {
    try {
      toggleMenu();
    } catch (error) {
      console.error("Error in menu toggle:", error);
    }
  };

  useFrame(({ clock }) => {
    if (!waterRef.current) return;
    
    try {
      const time = clock.getElapsedTime();
      waterRef.current.rotation.y = Math.sin(time * 0.1) * 0.05;
    } catch (error) {
      console.error("Water animation error:", error);
    }
  });

  // Simple materials to ensure rendering
  const waterMaterial = new THREE.MeshBasicMaterial({
    color: "#66ccff",
    transparent: true,
    opacity: 0.6
  });

  const glassMaterial = new THREE.MeshBasicMaterial({
    color: "#F6F7FF",
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide
  });

  const wallThickness = 0.25;

  return (
    <group>
      <mesh
        ref={waterRef}
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
      >
        <boxGeometry args={[width * 0.98, height * 0.98, depth * 0.98]} />
        <primitive object={waterMaterial} attach="material" />
      </mesh>
      
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
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      
      <group position={[0, 0, 0]}>
        {children}
      </group>
    </group>
  );
}

WaterTank.displayName = 'WaterTank';

export default WaterTank;
