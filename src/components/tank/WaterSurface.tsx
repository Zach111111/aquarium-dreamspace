
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { noise2D } from '../../utils/noise';

interface WaterSurfaceProps {
  width: number;
  depth: number;
  height: number;
  audioLevel?: number;
  resolution?: number;
}

export function WaterSurface({ 
  width, 
  depth, 
  height, 
  audioLevel = 0,
  resolution = 16 
}: WaterSurfaceProps) {
  const waterSurfaceRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!waterSurfaceRef.current || !waterSurfaceRef.current.geometry) return;
    
    const time = clock.getElapsedTime();
    const geometry = waterSurfaceRef.current.geometry;
    const position = geometry.attributes.position;
    
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      
      const noiseScale = 0.3;
      const waveSpeed = 0.4;
      const nx = noise2D(x * noiseScale + time * waveSpeed, z * noiseScale + time * waveSpeed * 0.8);
      const waveHeight = 0.05 * nx;
      
      const audioFactor = audioLevel * 0.15;
      const audioWave = audioFactor * Math.sin(time * 5 + x * 2 + z * 2);
      
      const y = waveHeight + audioWave;
      position.setY(i, y + height * 0.95 / 2);
    }
    
    position.needsUpdate = true;
  });

  return (
    <mesh ref={waterSurfaceRef} position={[0, height * 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
      <planeGeometry args={[width * 0.98, depth * 0.98, resolution, resolution]} />
      <meshPhysicalMaterial 
        color="#77ddff"
        transparent
        opacity={0.7}
        metalness={0.5}
        roughness={0.1}
        clearcoat={1.0}
      />
    </mesh>
  );
}
