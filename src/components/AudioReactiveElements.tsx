
import React, { useEffect, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import WaterTank from './WaterTank';
import { Fish } from './Fish';
import { Plant } from './Plant';
import { Crystal } from './Crystal';
import { Particles } from './Particles';
import { PostProcessing } from './PostProcessing';
import { audioManager } from '../utils/audio';
import { random } from '../utils/noise';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingFallback } from './LoadingFallback';
import { toast } from "@/components/ui/use-toast";
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';

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

// Simplified fallback components
const MinimalFish = ({ tankSize, index }: { tankSize: [number, number, number], index: number }) => (
  <mesh position={[(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 5]}>
    <boxGeometry args={[0.5, 0.2, 0.3]} />
    <meshBasicMaterial color={`hsl(${index * 36 + 180}, 70%, ${50 + index * 5}%)`} />
  </mesh>
);

const MinimalPlant = ({ position }: { position: [number, number, number] }) => (
  <mesh position={position}>
    <boxGeometry args={[0.1, 1.0, 0.1]} />
    <meshBasicMaterial color="green" />
  </mesh>
);

const MinimalCrystal = ({ position }: { position: [number, number, number] }) => (
  <mesh position={position}>
    <boxGeometry args={[0.4, 0.4, 0.4]} />
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
  const { audioLevels, isInitialized, initializeAudio } = useAudioAnalyzer();
  const [simpleMaterials, setSimpleMaterials] = useState(true);
  const [componentStatus, setComponentStatus] = useState({
    fish: true,
    plants: true,
    crystals: true,
    particles: false,
    postprocessing: false
  });

  // Initialize audio on user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!isInitialized) {
        initializeAudio();
      }
    };
    
    // Add one-time event listeners for user interaction
    const handleInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
    
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [isInitialized, initializeAudio]);

  // Check for low performance and toggle simple materials
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const checkPerformance = () => {
      frameCount++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = now;
        
        if (fps < 30 && !simpleMaterials) {
          console.log('Low FPS detected, switching to simple materials');
          setSimpleMaterials(true);
          toast({
            title: "Performance Mode Enabled",
            description: "Switched to simpler materials for better performance.",
          });
        }
      }
      
      requestAnimationFrame(checkPerformance);
    };
    
    const handle = requestAnimationFrame(checkPerformance);
    return () => cancelAnimationFrame(handle);
  }, [simpleMaterials]);

  return (
    <WaterTank size={tankSize} audioLevel={audioLevels.bass} useSimpleMaterial={simpleMaterials}>
      {/* Fish with error boundaries */}
      <ErrorBoundary>
        {componentStatus.fish && fishData.map((fish, i) => (
          <MinimalFish key={`fish-${i}`} tankSize={tankSize} index={i} />
        ))}
      </ErrorBoundary>
      
      {/* Plants with error boundaries */}
      <ErrorBoundary>
        {componentStatus.plants && plantPositions.map((position, i) => (
          <MinimalPlant key={`plant-${i}`} position={position} />
        ))}
      </ErrorBoundary>
      
      {/* Crystals with error boundaries */}
      <ErrorBoundary>
        {componentStatus.crystals && crystalData.map((crystal, i) => (
          <MinimalCrystal key={`crystal-${i}`} position={crystal.position} />
        ))}
      </ErrorBoundary>
    </WaterTank>
  );
}
