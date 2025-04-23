
import React from 'react';

interface MinimalFishProps {
  tankSize: [number, number, number];
  index: number;
}

export const MinimalFish = ({ tankSize, index }: MinimalFishProps) => (
  <mesh position={[(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 5]}>
    <boxGeometry args={[0.5, 0.2, 0.3]} />
    <meshBasicMaterial color={`hsl(${index * 36 + 180}, 70%, ${50 + index * 5}%)`} />
  </mesh>
);
