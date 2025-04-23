
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
}

export function FishBody({ 
  color,
  isHovered,
  isClicked,
  onPointerDown,
  onPointerOver,
  onPointerOut
}: FishMeshProps) {
  const bodyRef = useRef<THREE.Mesh>(null);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: isClicked ? '#ff6666' : color,
    emissive: color,
    emissiveIntensity: isHovered ? 0.5 : 0.2,
    roughness: 0.4
  }), [color, isHovered, isClicked]);

  return (
    <mesh 
      ref={bodyRef}
      scale={[1, 0.6, 0.5]}
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
  onPointerOut
}: FishMeshProps) {
  const tailRef = useRef<THREE.Mesh>(null);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: isClicked ? '#ff6666' : color,
    emissive: color,
    emissiveIntensity: isHovered ? 0.5 : 0.2,
    roughness: 0.4
  }), [color, isHovered, isClicked]);

  return (
    <mesh 
      ref={tailRef}
      position={[-0.4, 0, 0]} 
      scale={[0.4, 0.3, 0.2]}
      onPointerDown={onPointerDown}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <tetrahedronGeometry args={[0.5, 0]} />
      <primitive object={material} />
    </mesh>
  );
}
