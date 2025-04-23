
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAquariumStore } from '../store/aquariumStore';

interface WaterTankProps {
  size: [number, number, number];
  children: React.ReactNode;
  audioLevel?: number;
}

export function WaterTank({ size, children, audioLevel = 0 }: WaterTankProps) {
  const [width, height, depth] = size;
  const toggleMenu = useAquariumStore(state => state.toggleMenu);
  const waterRef = useRef<THREE.Mesh>(null);

  // Basic interaction without timers for now
  const handlePointerDown = () => {
    toggleMenu();
  };

  useFrame(({ clock }) => {
    if (!waterRef.current) return;
    // Very simple animation for the water
    const time = clock.getElapsedTime();
    waterRef.current.rotation.y = Math.sin(time * 0.1) * 0.05;
  });

  // thickness for the glass walls
  const wallThickness = 0.25;

  return (
    <group>
      {/* Water volume */}
      <mesh
        ref={waterRef}
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial
          color="#66ccff"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Glass walls - using basic material */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry
          args={[
            width + wallThickness,
            height + wallThickness,
            depth + wallThickness,
          ]}
        />
        <meshBasicMaterial
          color="#F6F7FF"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Tank contents */}
      <group position={[0, 0, 0]}>
        {children}
      </group>
    </group>
  );
}

WaterTank.displayName = 'WaterTank';
