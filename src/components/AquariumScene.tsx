
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingFallback } from './LoadingFallback';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useAquariumStore } from '../store/aquariumStore';
import { WaterTank } from './WaterTank';
import { Fish } from './Fish';
import { Plant } from './Plant';
import { Crystal } from './Crystal';
import { toast } from "@/components/ui/use-toast";

export function AquariumScene() {
  const orbitSpeed = useAquariumStore(state => state.orbitSpeed);
  const tankSize: [number, number, number] = [10, 6, 10];

  // Generate consistent data for components
  const fishData = Array.from({ length: 5 }, (_, index) => ({
    scale: 0.7 + Math.random() * 0.6,
    speed: 0.5 + Math.random() * 1.5,
    color: `hsl(${index * 36 + 180}, 70%, ${50 + index * 5}%)`
  }));

  const plantPositions = Array.from({ length: 6 }, () => ([
    (Math.random() - 0.5) * tankSize[0] * 0.7,
    -tankSize[1] / 2 * 0.9,
    (Math.random() - 0.5) * tankSize[2] * 0.7
  ] as [number, number, number]));

  const crystalData = Array.from({ length: 3 }, () => ({
    position: [
      (Math.random() - 0.5) * tankSize[0] * 0.6,
      -tankSize[1] / 2 * 0.7 + Math.random() * 0.5,
      (Math.random() - 0.5) * tankSize[2] * 0.6
    ] as [number, number, number],
    rotation: [
      Math.random() * Math.PI * 0.2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 0.2
    ] as [number, number, number],
    color: `hsl(${Math.random() * 60 + 240}, 70%, 60%)`,
    height: 0.8 + Math.random() * 1.2
  }));

  const handleCanvasError = (event: React.SyntheticEvent) => {
    console.error("Canvas render error:", event);
    toast({
      title: "Render Error",
      description: "There was a problem rendering the 3D scene. Attempting to recover...",
      variant: "destructive"
    });
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas 
          className="w-full h-full"
          style={{ background: '#1A1F2C' }}
          gl={{ 
            antialias: true,
            powerPreference: 'default',
            alpha: false,
            stencil: false,
            depth: true,
          }}
          dpr={[1, 1.5]}
          onError={handleCanvasError}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={60} />
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            autoRotate={orbitSpeed > 0} 
            autoRotateSpeed={orbitSpeed * 2}
            maxDistance={20}
            minDistance={8}
          />

          <WaterTank size={tankSize}>
            {fishData.map((fish, i) => (
              <Fish
                key={`fish-${i}`}
                color={fish.color}
                scale={fish.scale}
                tankSize={tankSize}
                index={i}
              />
            ))}
            
            {plantPositions.map((position, i) => (
              <Plant
                key={`plant-${i}`}
                position={position}
                height={1.5 + Math.random() * 1.5}
                color={`hsl(${120 + Math.random() * 40}, 70%, 60%)`}
              />
            ))}
            
            {crystalData.map((crystal, i) => (
              <Crystal
                key={`crystal-${i}`}
                position={crystal.position}
                rotation={crystal.rotation}
                color={crystal.color}
                height={crystal.height}
              />
            ))}
          </WaterTank>
        </Canvas>
      </Suspense>
    </ErrorBoundary>
  );
}
