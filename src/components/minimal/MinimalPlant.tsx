
import React from 'react';

interface MinimalPlantProps {
  position: [number, number, number];
}

export const MinimalPlant = ({ position }: MinimalPlantProps) => (
  <mesh position={position}>
    <boxGeometry args={[0.1, 1.0, 0.1]} />
    <meshBasicMaterial color="green" />
  </mesh>
);
