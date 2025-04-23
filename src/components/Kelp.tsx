
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface KelpProps {
  position: [number, number, number];
  color?: string;
  height?: number;
  segments?: number;
  swayScale?: number;
  audioLevel?: number;
}

export function Kelp({
  position,
  color = '#39FF96',
  height = 3.2,
  segments = 7,
  swayScale = 1,
  audioLevel = 0,
}: KelpProps) {
  const kelpRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!kelpRef.current) return;
    const t = clock.getElapsedTime();
    // gentle sway with a bit of randomness & audio reactivity
    kelpRef.current.rotation.z =
      Math.sin(t * 0.82 + position[0] * 0.6) *
      swayScale *
      0.16 *
      (1 + (audioLevel || 0) * 0.35);

    // gentle vertical swaying (lean forward/back)
    kelpRef.current.rotation.x =
      Math.cos(t * 0.6 + position[2] * 0.3) * (swayScale * 0.07);
  });

  return (
    <group position={position}>
      <mesh ref={kelpRef} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.11, 0.22, height, segments]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.07}
          roughness={0.62}
          transparent
          opacity={0.81}
        />
      </mesh>
      {/* Top leaf */}
      <mesh position={[0, height + 0.2, 0]} scale={[0.40, 0.18, 0.10]} rotation={[0, 0, Math.PI / 4]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.09} opacity={0.7} transparent />
      </mesh>
    </group>
  );
}

Kelp.displayName = 'Kelp';
