
import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WaterTank } from './WaterTank';
import { Fish } from './Fish';
import { Plant } from './Plant';
import { Crystal } from './Crystal';
import { Particles } from './Particles';
// Import PostProcessing but we won't use it yet
// import { PostProcessing } from './PostProcessing';
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

  // Safely get audio levels but with minimal processing
  useFrame(() => {
    try {
      const levels = audioManager.getAudioLevels();
      setAudioLevels(levels);
    } catch (error) {
      // Silent catch - default to zero levels
      setAudioLevels({ bass: 0, mid: 0, treble: 0 });
    }
  });

  return (
    <WaterTank size={tankSize} audioLevel={0}>
      {/* Debug cube to confirm rendering works */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="hotpink" />
      </mesh>

      {/* Just one fish for testing */}
      {fishData.slice(0, 1).map((fish, i) => (
        <Fish
          key={`fish-${i}`}
          color={fish.color}
          scale={fish.scale}
          speed={fish.speed}
          tankSize={tankSize}
          index={i}
          audioLevel={0}
        />
      ))}

      {/* No plants for now */}
      
      {/* No crystals for now */}
      
      {/* Minimal particles */}
      <Particles
        count={5}
        tankSize={tankSize}
        mousePosition={null}
        audioLevel={0}
      />
      
      {/* No post-processing yet */}
    </WaterTank>
  );
}
