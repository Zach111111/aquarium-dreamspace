
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { WaterTank } from './WaterTank';
import { DebugCube } from './scene/DebugCube';
import { ErrorBoundary } from './ErrorBoundary';

export function FishTankDemo() {
  return (
    <div className="w-full h-screen">
      <ErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 12], fov: 60 }}
          style={{ background: '#1A1F2C' }}
        >
          {/* Lights */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          {/* Debug Cube - shows a rotating pink cube */}
          <DebugCube />
          
          {/* Water Tank with Suspense for async loading */}
          <Suspense fallback={null}>
            <WaterTank size={[5, 4, 5]} />
          </Suspense>
          
          {/* Controls to move around the scene */}
          <OrbitControls enableDamping dampingFactor={0.1} />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}

FishTankDemo.displayName = 'FishTankDemo';
