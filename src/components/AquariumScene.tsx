import { ErrorBoundary } from './ErrorBoundary';
import { LoadingFallback } from './LoadingFallback';
import { Suspense, useMemo, useRef, useState } from 'react';
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
  const [dynamicFishGroups, setDynamicFishGroups] = useState<any[]>([]);
  
  const [crystalPositions, setCrystalPositions] = useState<THREE.Vector3[]>([]);
  
  const fishSchools = useMemo(() => {
    const schools = [];
    const numSchools = 3 + Math.floor(Math.random() * 2); // 3-4 schools
    
    for (let i = 0; i < numSchools; i++) {
      const schoolSize = 3 + Math.floor(Math.random() * 3); // 3-5 fish per school
      const schoolBase = {
        x: (Math.random() - 0.5) * tankSize[0] * 0.7,
        y: (Math.random() - 0.5) * tankSize[1] * 0.7,
        z: (Math.random() - 0.5) * tankSize[2] * 0.7,
        speed: 0.5 + Math.random() * 1.5,
        color: `hsl(${180 + Math.random() * 60}, 70%, ${50 + i * 5}%)`
      };
      
      const schoolFishRefs = Array.from({ length: schoolSize }, () => 
        useRef<THREE.Group>(null)
      );
      
      const school = {
        basePosition: schoolBase,
        fishes: Array.from({ length: schoolSize }, (_, index) => ({
          ref: schoolFishRefs[index],
          scale: index === 0 ? 1.0 : 0.7 + Math.random() * 0.3,
          speed: schoolBase.speed * (index === 0 ? 0.9 : 0.9 + Math.random() * 0.2),
          color: index === 0 ? 
            `hsl(${180 + Math.random() * 60}, 80%, 60%)` : 
            `hsl(${180 + Math.random() * 60}, 70%, ${50 + index * 5}%)`,
          offset: {
            x: (Math.random() - 0.5) * 0.8,
            y: (Math.random() - 0.5) * 0.8,
            z: (Math.random() - 0.5) * 0.8
          },
          isLeader: index === 0,
          personalityFactor: index === 0 ? 1.5 : 0.8 + Math.random() * 0.4
        })),
        refs: schoolFishRefs
      };
      
      schools.push(school);
    }
    
    const numSolitaryFish = 2 + Math.floor(Math.random() * 3); // 2-4 solitary fish
    
    for (let i = 0; i < numSolitaryFish; i++) {
      const solitaryRef = useRef<THREE.Group>(null);
      
      const solitaryFish = {
        basePosition: {
          x: (Math.random() - 0.5) * tankSize[0] * 0.7,
          y: (Math.random() - 0.5) * tankSize[1] * 0.7,
          z: (Math.random() - 0.5) * tankSize[2] * 0.7,
          speed: 0.7 + Math.random() * 2.0,
          color: `hsl(${120 + Math.random() * 60}, 70%, 60%)`
        },
        fishes: [{
          ref: solitaryRef,
          scale: 0.8 + Math.random() * 0.6,
          speed: 0.7 + Math.random() * 2.0,
          color: `hsl(${120 + Math.random() * 60}, 70%, 60%)`,
          offset: { x: 0, y: 0, z: 0 },
          isLeader: true,
          personalityFactor: 2.0 + Math.random()
        }],
        refs: [solitaryRef]
      };
      
      schools.push(solitaryFish);
    }
    
    return schools;
  }, [tankSize]);

  const plantPositions = useMemo(() => {
    return Array.from({ length: 6 }, () => ([
      (Math.random() - 0.5) * tankSize[0] * 0.7,
      -tankSize[1] / 2 * 0.9,
      (Math.random() - 0.5) * tankSize[2] * 0.7
    ] as [number, number, number]));
  }, [tankSize]);

  const crystalData = useMemo(() => {
    const safeRadius = 2;
    const crystals = [];
    const positions: THREE.Vector3[] = [];
    
    for (let i = 0; i < 3; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * (tankSize[0] - safeRadius * 2),
        -tankSize[1] / 2 * 0.7 + Math.random() * 2,
        (Math.random() - 0.5) * (tankSize[2] - safeRadius * 2)
      );
      
      positions.push(position);
      
      crystals.push({
        position: position.toArray() as [number, number, number],
        rotation: [
          Math.random() * Math.PI * 0.2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 0.2
        ] as [number, number, number],
        color: `hsl(${Math.random() * 60 + 240}, 70%, 60%)`,
        height: 0.8 + Math.random() * 1.2
      });
    }
    
    setCrystalPositions(positions);
    
    return crystals;
  }, [tankSize]);

  const createNewFishGroup = (position: [number, number, number]) => {
    const pos = new THREE.Vector3(...position);
    const groupSize = 2 + Math.floor(Math.random() * 2);
    const groupRefs = Array.from({ length: groupSize }, () => useRef<THREE.Group>(null));
    
    const group = {
      fishes: Array.from({ length: groupSize }, (_, index) => ({
        ref: groupRefs[index],
        scale: 0.6 + Math.random() * 0.3,
        speed: 0.7 + Math.random() * 1.5,
        color: `hsl(${120 + Math.random() * 60}, 70%, ${50 + index * 5}%)`,
        offset: {
          x: pos.x + (Math.random() - 0.5) * 1,
          y: pos.y + (Math.random() - 0.5) * 1,
          z: pos.z + (Math.random() - 0.5) * 1
        },
        isLeader: index === 0,
        personalityFactor: 1.2 + Math.random() * 0.5
      })),
      refs: groupRefs
    };
    
    setDynamicFishGroups(prevGroups => [...prevGroups, group]);
  };

  const handleCrystalExplode = (position: [number, number, number]) => {
    incrementScore();
    
    const newGroupsCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < newGroupsCount; i++) {
      createNewFishGroup(position);
    }
    
    toast({
      title: "Crystal collected!",
      description: "+1",
      variant: "default",
      className: "bg-[#1A1F2C] border-[#7E69AB] text-[#D6BCFA] compact-toast",
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

            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
            <hemisphereLight args={['#F6F7FF', '#A5F3FF', 0.6]} />

            <WaterTank size={tankSize} useSimpleMaterial={false}>
              <SandFloor width={tankSize[0]} depth={tankSize[2]} />
              
              {fishSchools.map((school, schoolIndex) => (
                <group key={`school-${schoolIndex}`}>
                  {school.fishes.map((fish, fishIndex) => (
                    <Fish
                      key={`fish-${schoolIndex}-${fishIndex}`}
                      color={fish.color}
                      scale={fish.scale}
                      speed={fish.speed}
                      tankSize={tankSize}
                      index={schoolIndex * 10 + fishIndex}
                      groupOffset={fish.offset}
                      groupIndex={schoolIndex}
                      crystalPositions={crystalPositions}
                      groupFishRefs={school.refs}
                      isGroupLeader={fish.isLeader}
                      personalityFactor={fish.personalityFactor}
                      ref={fish.ref}
                    />
                  ))}
                </group>
              ))}
              
              {dynamicFishGroups.map((group, groupIndex) => (
                <group key={`dynamic-group-${groupIndex}`}>
                  {group.fishes.map((fish, fishIndex) => (
                    <Fish
                      key={`dynamic-fish-${groupIndex}-${fishIndex}`}
                      color={fish.color}
                      scale={fish.scale}
                      speed={fish.speed}
                      tankSize={tankSize}
                      index={(groupIndex + fishSchools.length) * 10 + fishIndex}
                      groupOffset={fish.offset}
                      groupIndex={groupIndex + fishSchools.length}
                      crystalPositions={crystalPositions}
                      groupFishRefs={group.refs}
                      isGroupLeader={fish.isLeader}
                      personalityFactor={fish.personalityFactor}
                      ref={fish.ref}
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
        
        <ScoreDisplay />
      </div>
    </ErrorBoundary>
  );
}
