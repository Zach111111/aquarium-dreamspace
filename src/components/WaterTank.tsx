
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
      
      // Gentle water movement
      if (waterRef.current.material instanceof THREE.Material) {
        const waterOpacity = 0.6 + Math.sin(time * 0.5) * 0.03 + (audioLevel || 0) * 0.1;
        if ('opacity' in waterRef.current.material) {
          waterRef.current.material.opacity = waterOpacity;
        }
      }
      
      // Very subtle tank movement
      waterRef.current.rotation.y = Math.sin(time * 0.1) * 0.02;
    } catch (error) {
      console.error("Water animation error:", error);
    }
  });

  // More visually appealing materials
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.4, 0.7, 0.9),
    transparent: true,
    opacity: 0.7,
    roughness: 0.2,
    metalness: 0.1
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.95, 0.95, 1.0),
    transparent: true,
    opacity: 0.15,
    roughness: 0.05,
    metalness: 0.2,
    side: THREE.BackSide
  });

  const wallThickness = 0.15;

  return (
    <group>
      {/* Water volume */}
      <mesh
        ref={waterRef}
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
      >
        <boxGeometry args={[width * 0.98, height * 0.98, depth * 0.98]} />
        <primitive object={waterMaterial} attach="material" />
      </mesh>
      
      {/* Glass tank */}
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
      
      {/* Tank contents */}
      <group position={[0, 0, 0]}>
        {children}
      </group>
      
      {/* Tank bottom */}
      <mesh position={[0, -height/2 * 0.99, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[width * 0.98, depth * 0.98]} />
        <meshStandardMaterial color="#cccccc" roughness={0.9} />
      </mesh>
    </group>
  );
}

WaterTank.displayName = 'WaterTank';

export default WaterTank;
