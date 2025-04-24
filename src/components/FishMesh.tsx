
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';

interface FishMeshProps {
  color: string;
  isHovered: boolean;
  isClicked: boolean;
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
  scale?: THREE.Vector3 | [number, number, number] | number;
}

export function FishBody({ 
  color,
  isHovered,
  isClicked,
  onPointerDown,
  onPointerOver,
  onPointerOut,
  scale = [1, 0.6, 0.5]
}: FishMeshProps) {
  const bodyRef = useRef<THREE.Mesh>(null);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: isClicked ? '#ff6666' : color,
    emissive: color,
    emissiveIntensity: isHovered ? 0.5 : 0.2,
    roughness: 0.4
  }), [color, isHovered, isClicked]);

  // Convert scale to a proper Three.js scale format
  const scaleVector = useMemo(() => {
    if (typeof scale === 'number') {
      return [scale, scale, scale] as [number, number, number];
    }
    return scale;
  }, [scale]);

  return (
    <mesh 
      ref={bodyRef}
      scale={scaleVector}
      onPointerDown={onPointerDown}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <tetrahedronGeometry args={[0.5, 0]} />
      <primitive object={material} />
    </mesh>
  );
}

export function FishTail({ 
  color,
  isHovered,
  isClicked,
  onPointerDown,
  onPointerOver,
  onPointerOut,
  scale = [0.4, 0.3, 0.2]
}: FishMeshProps) {
  const tailRef = useRef<THREE.Mesh>(null);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: isClicked ? '#ff6666' : color,
    emissive: color,
    emissiveIntensity: isHovered ? 0.5 : 0.2,
    roughness: 0.4
  }), [color, isHovered, isClicked]);

  // Convert scale to a proper Three.js scale format
  const scaleVector = useMemo(() => {
    if (typeof scale === 'number') {
      return [scale, scale, scale] as [number, number, number];
    }
    return scale;
  }, [scale]);

  return (
    <mesh 
      ref={tailRef}
      position={[-0.4, 0, 0]} 
      scale={scaleVector}
      onPointerDown={onPointerDown}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <tetrahedronGeometry args={[0.5, 0]} />
      <primitive object={material} />
    </mesh>
  );
}
