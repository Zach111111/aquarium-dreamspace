
import { useRef } from 'react';
import * as THREE from 'three';
import { useWaterAnimation } from '../hooks/useWaterAnimation';
import { WaterMaterial } from './tank/WaterMaterial';
import { GlassMaterial } from './tank/GlassMaterial';
import { Bubbles } from './tank/Bubbles';

interface WaterTankProps {
  size: [number, number, number];
  children: React.ReactNode;
  audioLevel?: number;
  useSimpleMaterial?: boolean;
}

export function WaterTank({ size, children, audioLevel = 0, useSimpleMaterial = false }: WaterTankProps) {
  const [width, height, depth] = size;
  const waterRef = useRef<THREE.Mesh>(null);
  const waterSurfaceRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  useWaterAnimation({ waterRef, waterSurfaceRef, width, height, depth, audioLevel });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} castShadow />
      
      {/* Water volume */}
      <mesh ref={waterRef} position={[0, 0, 0]} renderOrder={1}>
        <boxGeometry args={[width * 0.98, height * 0.98, depth * 0.98]} />
        <WaterMaterial useSimpleMaterial={useSimpleMaterial} />
      </mesh>
      
      {/* Dynamic water surface */}
      <mesh ref={waterSurfaceRef} renderOrder={3}>
        <planeGeometry args={[width * 0.98, depth * 0.98, 16, 16]} />
        <meshPhysicalMaterial 
          color="#77ddff"
          transparent
          opacity={0.7}
          metalness={0.5}
          roughness={0.1}
          clearcoat={1.0}
        />
      </mesh>
      
      {/* Glass walls */}
      <mesh ref={glassRef} position={[0, 0, 0]} renderOrder={2}>
        <boxGeometry args={[width + 0.25, height + 0.25, depth + 0.25]} />
        <GlassMaterial />
      </mesh>

      {/* Tank edges */}
      <lineSegments ref={edgesRef} renderOrder={4}>
        <edgesGeometry args={[new THREE.BoxGeometry(width + 0.25, height + 0.25, depth + 0.25)]} />
        <lineBasicMaterial color="#ffffff" opacity={0.8} transparent />
      </lineSegments>
      
      <Bubbles width={width} height={height} depth={depth} />
      
      {children}
    </group>
  );
}
