import React, { useState, useEffect, Suspense, useRef } from 'react';
import * as THREE from 'three';
import { WaterTank } from './WaterTank';
import { Fish } from './Fish';
import { Plant } from './Plant';
import { Crystal } from './Crystal';
import { Particles } from './Particles';
import { ParticlesUpdater } from './ParticlesUpdater';
import { PostProcessing } from './PostProcessing';
import { audioManager } from '../utils/audio';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingFallback } from './LoadingFallback';
import { toast } from "@/components/ui/use-toast";

interface AudioReactiveElementsProps {
  mousePosition: THREE.Vector3 | null;
  tankSize: [number, number, number];
  fishData: Array<{ scale: number; speed: number; color: string }>;
  plantPositions: Array<[number, number, number]>;
  crystalData: Array<{
    position: [number, number, number];
    rotation: [number, number, number];
    color: string;
    height: number;
  }>;
}

const MinimalFish = ({ tankSize, index }: { tankSize: [number, number, number], index: number }) => (
  <mesh position={[(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 5]}>
    <tetrahedronGeometry args={[0.5, 0]} />
    <meshBasicMaterial color={`hsl(${index * 36 + 180}, 70%, ${50 + index * 5}%)`} />
  </mesh>
);

const MinimalPlant = ({ position }: { position: [number, number, number] }) => (
  <mesh position={position}>
    <cylinderGeometry args={[0.1, 0.2, 1.5, 4]} />
    <meshBasicMaterial color="green" />
  </mesh>
);

const MinimalCrystal = ({ position }: { position: [number, number, number] }) => (
  <mesh position={position}>
    <octahedronGeometry args={[0.4, 0]} />
    <meshBasicMaterial color="cyan" />
  </mesh>
);

export function AudioReactiveElements({
  mousePosition,
  tankSize,
  fishData,
  plantPositions,
  crystalData,
}: AudioReactiveElementsProps) {
  const [audioLevels, setAudioLevels] = useState({ bass: 0, mid: 0, treble: 0 });
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [simpleMaterials, setSimpleMaterials] = useState(false);
  const [componentStatus, setComponentStatus] = useState({
    fish: true,
    plants: true,
    crystals: true,
    particles: true,
    postprocessing: true
  });
  
  const particlesRef = useRef<THREE.Points>(null);
  const particleVelocitiesRef = useRef<THREE.Vector3[]>([]);
  const particleCount = simpleMaterials ? 30 : 50;

  useEffect(() => {
    particleVelocitiesRef.current = Array(particleCount).fill(0).map(() => new THREE.Vector3(
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01
    ));
  }, [particleCount]);

  return (
    <WaterTank size={tankSize} audioLevel={audioLevels.bass} useSimpleMaterial={simpleMaterials}>
      <AquariumInitializer onAudioInit={(initialized) => setAudioInitialized(initialized)} />
      <PerformanceMonitor onPerformanceChange={(simple) => setSimpleMaterials(simple)} />
      <AudioLevelMonitor 
        audioInitialized={audioInitialized}
        onLevelsChange={setAudioLevels}
      />

      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          {componentStatus.fish && fishData.map((fish, i) => (
            <ErrorBoundary key={`fish-boundary-${i}`}>
              <Suspense fallback={<MinimalFish tankSize={tankSize} index={i} />}>
                <Fish
                  key={`fish-${i}`}
                  color={fish.color}
                  scale={fish.scale}
                  speed={fish.speed}
                  tankSize={tankSize}
                  index={i}
                  audioLevel={audioLevels.mid}
                />
              </Suspense>
            </ErrorBoundary>
          ))}
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          {componentStatus.plants && plantPositions.map((position, i) => (
            <ErrorBoundary key={`plant-boundary-${i}`}>
              <Suspense fallback={<MinimalPlant position={position} />}>
                <Plant
                  key={`plant-${i}`}
                  position={position}
                  height={1.5 + Math.random() * 1.5}
                  color={`hsl(${120 + Math.random() * 40}, 70%, 60%)`}
                  audioLevel={audioLevels.treble}
                />
              </Suspense>
            </ErrorBoundary>
          ))}
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          {componentStatus.crystals && crystalData.map((crystal, i) => (
            <ErrorBoundary key={`crystal-boundary-${i}`}>
              <Suspense fallback={<MinimalCrystal position={crystal.position} />}>
                <Crystal
                  key={`crystal-${i}`}
                  position={crystal.position}
                  rotation={crystal.rotation}
                  color={crystal.color}
                  height={crystal.height}
                  audioLevel={audioLevels.treble}
                />
              </Suspense>
            </ErrorBoundary>
          ))}
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Suspense fallback={null}>
          {componentStatus.particles && (
            <>
              <Particles
                ref={particlesRef}
                count={particleCount}
                tankSize={tankSize}
                mousePosition={mousePosition}
                audioLevel={audioLevels.bass}
              />
              {particlesRef.current && particleVelocitiesRef.current.length > 0 && (
                <ParticlesUpdater
                  particlesRef={particlesRef}
                  velocities={particleVelocitiesRef.current}
                  tankSize={tankSize}
                  mousePosition={mousePosition}
                  audioLevel={audioLevels.bass}
                  size={0.05}
                />
              )}
            </>
          )}
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Suspense fallback={null}>
          {componentStatus.postprocessing && (
            <PostProcessing audioLevel={audioLevels.mid} />
          )}
        </Suspense>
      </ErrorBoundary>
    </WaterTank>
  );
}
