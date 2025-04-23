
import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WaterTank } from './WaterTank';
import { Fish } from './Fish';
import { Plant } from './Plant';
import { Crystal } from './Crystal';
import { Particles } from './Particles';
import { PostProcessing } from './PostProcessing';
import { audioManager } from '../utils/audio';
import { random } from '../utils/noise';

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

export function AudioReactiveElements({
  mousePosition,
  tankSize,
  fishData,
  plantPositions,
  crystalData,
}: AudioReactiveElementsProps) {
  const [audioLevels, setAudioLevels] = useState({ bass: 0, mid: 0, treble: 0 });

  // Safe audio processing
  useFrame(() => {
    try {
      const levels = audioManager.getAudioLevels();
      setAudioLevels(levels);
    } catch (error) {
      console.error("Audio levels error:", error);
      // Default to zero if there's an error
      setAudioLevels({ bass: 0, mid: 0, treble: 0 });
    }
  });

  return (
    <WaterTank size={tankSize} audioLevel={audioLevels.bass}>
      {/* Start with fewer fish for stability */}
      {fishData.slice(0, 3).map((fish, i) => (
        <Fish
          key={`fish-${i}`}
          color={fish.color}
          scale={fish.scale}
          speed={fish.speed}
          tankSize={tankSize}
          index={i}
          audioLevel={audioLevels.bass}
        />
      ))}

      {/* Start with fewer plants for stability */}
      {plantPositions.slice(0, 2).map((position, i) => (
        <Plant
          key={`plant-${i}`}
          position={position}
          height={random(1.5, 3)}
          width={random(0.4, 0.8)}
          color={i % 2 === 0 ? '#B9FFCE' : '#A5F3FF'}
          audioLevel={audioLevels.bass}
        />
      ))}

      {/* Start with fewer crystals for stability */}
      {crystalData.slice(0, 1).map((crystal, i) => (
        <Crystal
          key={`crystal-${i}`}
          position={crystal.position}
          rotation={crystal.rotation}
          color={crystal.color}
          height={crystal.height}
          audioLevel={audioLevels.bass}
          onClick={() => console.log(`Crystal ${i} clicked`)}
        />
      ))}

      {/* Reduced particle count for better performance */}
      <Particles
        count={25}
        tankSize={tankSize}
        mousePosition={mousePosition}
        audioLevel={audioLevels.bass}
      />

      {/* Re-enable post-processing with minimal settings */}
      <PostProcessing audioLevel={audioLevels.bass} />
    </WaterTank>
  );
}
