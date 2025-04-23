
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import WaterTank from './WaterTank';
import { DebugCube } from './scene/DebugCube';
import { ErrorBoundary } from './ErrorBoundary';
import { Lighting } from './Lighting';

export function FishTankDemo() {
  return (
    <div className="w-full h-screen">
      <ErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 12], fov: 60 }}
          style={{ background: '#1A1F2C' }}
          gl={{ 
            antialias: true, 
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: 'default'
          }}
          dpr={[0.6, 1]} // Reduced DPR for better performance
        >
          {/* Improved lighting setup */}
          <Lighting />
          
          {/* Debug Cube - shows a rotating pink cube */}
          <DebugCube />
          
          {/* Water Tank with Suspense for async loading */}
          <Suspense fallback={null}>
            <WaterTank size={[5, 4, 5]} useSimpleMaterial={true} />
          </Suspense>
          
          {/* Controls to move around the scene */}
          <OrbitControls enableDamping dampingFactor={0.1} />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}

FishTankDemo.displayName = 'FishTankDemo';
