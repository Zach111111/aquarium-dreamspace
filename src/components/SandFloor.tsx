
import { useRef, useMemo } from 'react';
import { noise2D } from '../utils/noise';
import * as THREE from 'three';

interface SandFloorProps {
  width: number;
  depth: number;
  resolution?: number;
}

export function SandFloor({ width, depth, resolution = 32 }: SandFloorProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Generate heightmap for sand mounds
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, resolution, resolution);
    const positions = geo.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      positions[i + 1] = noise2D(x * 0.5, z * 0.5) * 0.2; // Y position (height)
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [width, depth, resolution]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#f0f5f9',
      metalness: 0.2,
      roughness: 0.8,
      envMapIntensity: 1,
    });
  }, []);

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry} 
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -3, 0]}
      receiveShadow
    />
  );
}
