
import React, { useEffect, useState } from 'react';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { toast } from "@/components/ui/use-toast";
import { MinimalFish } from './minimal/MinimalFish';
import { MinimalPlant } from './minimal/MinimalPlant';
import { MinimalCrystal } from './minimal/MinimalCrystal';
import WaterTank from './WaterTank';
import { ErrorBoundary } from './ErrorBoundary';

interface AudioReactiveElementsProps {
  mousePosition: any;
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

export function AudioReactiveElements({
  mousePosition,
  tankSize,
  fishData,
  plantPositions,
  crystalData,
}: AudioReactiveElementsProps) {
  const { audioLevels, isInitialized, initializeAudio } = useAudioAnalyzer();
  const [simpleMaterials, setSimpleMaterials] = useState(true);
  const [componentStatus] = useState({
    fish: true,
    plants: true,
    crystals: true,
    particles: false,
    postprocessing: false,
  });

  // Initialize audio on user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!isInitialized) {
        initializeAudio();
      }
    };

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

  // Simple FPS check for performance adjustments
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
      <ErrorBoundary>
        {componentStatus.fish &&
          fishData.map((fish, i) => (
            <MinimalFish key={`fish-${i}`} tankSize={tankSize} index={i} />
          ))}
      </ErrorBoundary>
      <ErrorBoundary>
        {componentStatus.plants &&
          plantPositions.map((position, i) => (
            <MinimalPlant key={`plant-${i}`} position={position} />
          ))}
      </ErrorBoundary>
      <ErrorBoundary>
        {componentStatus.crystals &&
          crystalData.map((crystal, i) => (
            <MinimalCrystal key={`crystal-${i}`} position={crystal.position} />
          ))}
      </ErrorBoundary>
    </WaterTank>
  );
}
