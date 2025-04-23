
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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
  
  const waterMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#66ccff",
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: true,
      roughness: 0.2,
      metalness: 0.1
    });
  }, []);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#F6F7FF",
      transparent: true,
      opacity: 0.15,
      side: THREE.FrontSide,
      depthWrite: false,
      depthTest: true,
      roughness: 0.05,
      metalness: 0.9,
      envMapIntensity: 1.5
    });
  }, []);

  // Create edges geometry
  const edgesGeometry = useMemo(() => {
    const boxGeometry = new THREE.BoxGeometry(
      width + 0.25,
      height + 0.25,
      depth + 0.25
    );
    return new THREE.EdgesGeometry(boxGeometry);
  }, [width, height, depth]);

  useFrame(({ clock }) => {
    if (!waterRef.current) return;
    const time = clock.getElapsedTime();
    waterRef.current.rotation.y = Math.sin(time * 0.1) * 0.02;
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} castShadow />
      
      {/* Water volume */}
      <mesh ref={waterRef} position={[0, 0, 0]}>
        <boxGeometry args={[width * 0.98, height * 0.98, depth * 0.98]} />
        <primitive object={waterMaterial} />
      </mesh>
      
      {/* Glass walls */}
      <mesh ref={glassRef} position={[0, 0, 0]}>
        <boxGeometry args={[width + 0.25, height + 0.25, depth + 0.25]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Tank edges */}
      <lineSegments ref={edgesRef}>
        <primitive object={edgesGeometry} />
        <lineBasicMaterial color="#ffffff" opacity={0.5} transparent />
      </lineSegments>
      
      {/* Tank contents */}
      <group position={[0, 0, 0]}>
        {children}
      </group>
    </group>
  );
}
