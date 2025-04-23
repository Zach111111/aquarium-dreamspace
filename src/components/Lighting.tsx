
import React from 'react';

export function Lighting() {
  return (
    <>
      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <hemisphereLight args={['#F6F7FF', '#A5F3FF', 0.6]} />
    </>
  );
}
