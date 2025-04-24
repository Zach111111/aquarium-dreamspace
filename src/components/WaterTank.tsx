
import { useRef } from 'react';
import * as THREE from 'three';
import { WaterMaterial } from './tank/WaterMaterial';
import { GlassMaterial } from './tank/GlassMaterial';
import { Bubbles } from './tank/Bubbles';
import { WaterSurface } from './tank/WaterSurface';

interface WaterTankProps {
  size: [number, number, number];
  children: React.ReactNode;
  audioLevel?: number;
  useSimpleMaterial?: boolean;
}

export function WaterTank({ size, children, audioLevel = 0, useSimpleMaterial = false }: WaterTankProps) {
  const [width, height, depth] = size;
  const waterRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} castShadow />
      
      {/* Water volume */}
      <mesh ref={waterRef} position={[0, 0, 0]} renderOrder={1}>
        <boxGeometry args={[width * 0.98, height * 0.98, depth * 0.98]} />
        <WaterMaterial useSimpleMaterial={useSimpleMaterial} />
      </mesh>
      
      {/* Dynamic water surface - now using the extracted component */}
      <WaterSurface 
        width={width} 
        depth={depth} 
        height={height} 
        audioLevel={audioLevel} 
      />
      
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
