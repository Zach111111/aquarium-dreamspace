
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingFallback } from './LoadingFallback';
import { Suspense, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useAquariumStore } from '../store/aquariumStore';
import { WaterTank } from './WaterTank';
import { SandFloor } from './SandFloor';
import { ScoreDisplay } from './ScoreDisplay';
import { FishSchools } from './aquarium/FishSchools';
import { DynamicFishGroups, DynamicFishGroupsHandle } from './aquarium/DynamicFishGroups';
import { AquariumEnvironment } from './aquarium/AquariumEnvironment';
import { toast } from "@/components/ui/use-toast";
import { Vector3 } from 'three';

export function AquariumScene() {
  const orbitSpeed = useAquariumStore(state => state.orbitSpeed);
  const incrementScore = useAquariumStore(state => state.incrementScore);
  const tankSize: [number, number, number] = [10, 6, 10];
  const [crystalPositions, setCrystalPositions] = useState<Vector3[]>([]);
  
  // Use useRef with the correct type for DynamicFishGroups
  const dynamicFishGroupsRef = useRef<DynamicFishGroupsHandle>(null);
  const pendingFishGroups = useRef<Array<{ position: [number, number, number], delay: number }>>([]);
  const processingGroups = useRef(false);
  
  // Process fish group creation in batches to avoid UI freezing
  const processFishGroups = useCallback(() => {
    if (processingGroups.current) return;
    
    processingGroups.current = true;
    const nextGroup = pendingFishGroups.current.shift();
    
    if (nextGroup && dynamicFishGroupsRef.current) {
      setTimeout(() => {
        dynamicFishGroupsRef.current?.createNewFishGroup(nextGroup.position);
        processingGroups.current = false;
        
        if (pendingFishGroups.current.length > 0) {
          processFishGroups();
        }
      }, nextGroup.delay);
    } else {
      processingGroups.current = false;
    }
  }, []);
  
  const handleCrystalExplode = useCallback((position: [number, number, number]) => {
    incrementScore();
    
    // Schedule creation of fish groups with slight delays for better performance
    const newGroupsCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < newGroupsCount; i++) {
      // Add each new fish group to the queue with a staggered delay
      pendingFishGroups.current.push({
        position,
        delay: i * 100 // Stagger creation by 100ms
      });
    }
    
    // Start processing the queue if not already
    processFishGroups();
    
    toast({
      title: "Crystal collected!",
      description: "+1",
      variant: "default",
      className: "bg-[#1A1F2C] border-[#7E69AB] text-[#D6BCFA] compact-toast",
    });
  }, [incrementScore, processFishGroups]);

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
              logarithmicDepthBuffer: true,
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

            <WaterTank size={tankSize} useSimpleMaterial={false}>
              <SandFloor width={tankSize[0]} depth={tankSize[2]} />
              <FishSchools 
                tankSize={tankSize}
                crystalPositions={crystalPositions}
              />
              <DynamicFishGroups 
                tankSize={tankSize}
                crystalPositions={crystalPositions}
                ref={dynamicFishGroupsRef}
              />
              <AquariumEnvironment 
                tankSize={tankSize}
                onCrystalExplode={handleCrystalExplode}
              />
            </WaterTank>
          </Canvas>
        </Suspense>
        <ScoreDisplay />
      </div>
    </ErrorBoundary>
  );
}
