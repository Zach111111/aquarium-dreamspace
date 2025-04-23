
import React from 'react';

interface MinimalCrystalProps {
  position: [number, number, number];
}

export const MinimalCrystal = ({ position }: MinimalCrystalProps) => (
  <mesh position={position}>
    <boxGeometry args={[0.4, 0.4, 0.4]} />
    <meshBasicMaterial color="cyan" />
  </mesh>
);
