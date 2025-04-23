
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

  useFrame(() => {
    const levels = audioManager.getAudioLevels();
    setAudioLevels(levels);
  });

  return (
    <WaterTank size={tankSize} audioLevel={audioLevels.bass}>
      {/* Generate fish */}
      {fishData.map((fish, i) => (
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

      {/* Generate plants */}
      {plantPositions.map((position, i) => (
        <Plant
          key={`plant-${i}`}
          position={position}
          height={random(1.5, 3)}
          width={random(0.4, 0.8)}
          color={i % 2 === 0 ? '#B9FFCE' : '#A5F3FF'}
          audioLevel={audioLevels.bass}
        />
      ))}

      {/* Generate crystals */}
      {crystalData.map((crystal, i) => (
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

      {/* Particles */}
      <Particles
        count={150}
        tankSize={tankSize}
        mousePosition={mousePosition}
        audioLevel={audioLevels.bass}
      />

      {/* Post-processing effects */}
      <PostProcessing audioLevel={audioLevels.bass} />
    </WaterTank>
  );
}
