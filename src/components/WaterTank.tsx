
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
  
  // Enhanced water material with better transparency and light effects
  const waterMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: "#66ccff",
      transparent: true,
      opacity: 0.6, // Increased opacity for better visibility
      side: THREE.DoubleSide,
      depthWrite: false, // Changed to false to prevent depth issues with transparent objects
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.5,
      transmission: 0.95,
      ior: 1.33
    });
  }, []);

  // Improved glass material with better reflections
  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: "#F6F7FF",
      transparent: true,
      opacity: 0.2, // Slightly increased opacity
      side: THREE.DoubleSide, // Changed to DoubleSide to see both faces
      depthWrite: false,
      depthTest: true,
      roughness: 0.05,
      metalness: 0.9,
      envMapIntensity: 1.5,
      transmission: 0.98,
      reflectivity: 0.9,
      clearcoat: 1.0
    });
  }, []);

  // Simple material for low-performance mode
  const simpleMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#66ccff",
      transparent: true,
      opacity: 0.4, // Increased opacity
      side: THREE.DoubleSide
    });
  }, []);

  // Material for water volume based on performance setting
  const actualWaterMaterial = useSimpleMaterial ? simpleMaterial : waterMaterial;

  useFrame(({ clock }) => {
    if (!waterRef.current) return;
    const time = clock.getElapsedTime();
    waterRef.current.rotation.y = Math.sin(time * 0.1) * 0.02;
    
    // Subtle water movement
    if (waterRef.current.material instanceof THREE.Material) {
      const material = waterRef.current.material;
      if ('roughness' in material && material.roughness !== undefined) {
        material.roughness = 0.1 + Math.sin(time * 0.5) * 0.05;
      }
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} castShadow />
      
      {/* Water volume with direct material assignment */}
      <mesh ref={waterRef} position={[0, 0, 0]} renderOrder={1}>
        <boxGeometry args={[width * 0.98, height * 0.98, depth * 0.98]} />
        <meshPhysicalMaterial 
          color="#66ccff"
          transparent={true}
          opacity={0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
          roughness={0.1}
          metalness={0.2}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          transmission={0.95}
          ior={1.33}
        />
      </mesh>
      
      {/* Glass walls with direct material assignment */}
      <mesh ref={glassRef} position={[0, 0, 0]} renderOrder={2}>
        <boxGeometry args={[width + 0.25, height + 0.25, depth + 0.25]} />
        <meshPhysicalMaterial 
          color="#F6F7FF"
          transparent={true}
          opacity={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
          depthTest={true}
          roughness={0.05}
          metalness={0.9}
          envMapIntensity={1.5}
          transmission={0.98}
          reflectivity={0.9}
          clearcoat={1.0}
        />
      </mesh>

      {/* Tank edges with increased opacity */}
      <lineSegments ref={edgesRef} renderOrder={3}>
        <edgesGeometry args={[new THREE.BoxGeometry(width + 0.25, height + 0.25, depth + 0.25)]} />
        <lineBasicMaterial color="#ffffff" opacity={0.8} transparent linewidth={1} />
      </lineSegments>
      
      {/* Tank contents */}
      <group position={[0, 0, 0]}>
        {children}
      </group>
    </group>
  );
}
