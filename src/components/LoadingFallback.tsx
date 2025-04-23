
import React from 'react';

export function LoadingFallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#A5F3FF" wireframe />
    </mesh>
  );
}
