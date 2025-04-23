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
import { SandFloor } from './SandFloor';
import { ScoreDisplay } from './ScoreDisplay';
import { toast } from "@/components/ui/use-toast";

export function AquariumScene() {
  const orbitSpeed = useAquariumStore(state => state.orbitSpeed);
  const incrementScore = useAquariumStore(state => state.incrementScore);
  const tankSize: [number, number, number] = [10, 6, 10];

  // Create fish groups (4-5 groups of 2-3 fish each)
  const fishGroups = useMemo(() => {
    const groups = [];
    const numGroups = 4 + Math.floor(Math.random() * 2); // 4-5 groups
    
    for (let i = 0; i < numGroups; i++) {
      const groupSize = 2 + Math.floor(Math.random() * 2); // 2-3 fish per group
      const groupBase = {
        x: (Math.random() - 0.5) * tankSize[0] * 0.7,
        y: (Math.random() - 0.5) * tankSize[1] * 0.7,
        z: (Math.random() - 0.5) * tankSize[2] * 0.7,
        speed: 0.5 + Math.random() * 1.5
      };
      
      const group = Array.from({ length: groupSize }, (_, index) => ({
        scale: 0.7 + Math.random() * 0.3,
        speed: groupBase.speed * (0.9 + Math.random() * 0.2),
        color: `hsl(${180 + Math.random() * 60}, 70%, ${50 + index * 5}%)`,
        offset: {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.5
        }
      }));
      groups.push(group);
    }
    return groups;
  }, []);

  // Generate crystal positions
  const crystalData = Array.from({ length: 3 }, () => {
    const safeRadius = 1; // Minimum distance from tank edges
    return {
      position: [
        (Math.random() - 0.5) * (tankSize[0] - safeRadius * 2),
        -tankSize[1] / 2 * 0.7 + Math.random() * 2,
        (Math.random() - 0.5) * (tankSize[2] - safeRadius * 2)
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI * 0.2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 0.2
      ] as [number, number, number],
      color: `hsl(${Math.random() * 60 + 240}, 70%, 60%)`,
      height: 0.8 + Math.random() * 1.2
    };
  });

  const handleCrystalExplode = (position: [number, number, number]) => {
    incrementScore();
    toast({
      title: "Crystal Collected!",
      description: "A new fish has appeared in the tank.",
    });
  };

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
      <div className="relative w-full h-full">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas 
            className="w-full h-full"
            style={{ background: '#0a1a26' }}
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

            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
            <hemisphereLight args={['#F6F7FF', '#A5F3FF', 0.6]} />

            <WaterTank size={tankSize} useSimpleMaterial={true}>
              <SandFloor width={tankSize[0]} depth={tankSize[2]} />
              
              {fishGroups.map((group, groupIndex) => (
                <group key={`group-${groupIndex}`}>
                  {group.map((fish, fishIndex) => (
                    <Fish
                      key={`fish-${groupIndex}-${fishIndex}`}
                      color={fish.color}
                      scale={fish.scale}
                      speed={fish.speed}
                      tankSize={tankSize}
                      index={groupIndex * 3 + fishIndex}
                      groupOffset={fish.offset}
                    />
                  ))}
                </group>
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
                  onExplode={handleCrystalExplode}
                />
              ))}
            </WaterTank>
          </Canvas>
        </Suspense>
        
        {/* ScoreDisplay moved outside the Canvas */}
        <ScoreDisplay />
      </div>
    </ErrorBoundary>
  );
}
