
import React, { useState, useEffect } from 'react';
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
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [simpleMaterials, setSimpleMaterials] = useState(false);

  // Initialize audio on user interaction
  useEffect(() => {
    const initAudio = () => {
      if (audioInitialized) return;
      
      try {
        audioManager.initialize('/audio/main_theme.wav');
        audioManager.play();
        audioManager.setVolume(0.5); // Default volume
        setAudioInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
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
  }, [audioInitialized]);

  // Safely get audio levels
  useFrame(() => {
    if (!audioInitialized) return;
    
    try {
      const levels = audioManager.getAudioLevels();
      setAudioLevels(levels);
    } catch (error) {
      // Silent fail with default values
      setAudioLevels({ bass: 0, mid: 0, treble: 0 });
    }
  });
  
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
        } else if (fps > 50 && simpleMaterials) {
          console.log('Performance improved, using advanced materials');
          setSimpleMaterials(false);
        }
      }
      
      requestAnimationFrame(checkPerformance);
    };
    
    const handle = requestAnimationFrame(checkPerformance);
    return () => cancelAnimationFrame(handle);
  }, [simpleMaterials]);

  return (
    <WaterTank size={tankSize} audioLevel={audioLevels.bass} useSimpleMaterial={simpleMaterials}>
      {/* All fish */}
      {fishData.map((fish, i) => (
        <Fish
          key={`fish-${i}`}
          color={fish.color}
          scale={fish.scale}
          speed={fish.speed}
          tankSize={tankSize}
          index={i}
          audioLevel={audioLevels.mid}
        />
      ))}
      
      {/* Plants */}
      {plantPositions.map((position, i) => (
        <Plant
          key={`plant-${i}`}
          position={position}
          height={1.5 + Math.random() * 1.5}
          color={`hsl(${120 + Math.random() * 40}, 70%, 60%)`}
          audioLevel={audioLevels.treble}
        />
      ))}
      
      {/* Crystals */}
      {crystalData.map((crystal, i) => (
        <Crystal
          key={`crystal-${i}`}
          position={crystal.position}
          rotation={crystal.rotation}
          color={crystal.color}
          height={crystal.height}
          audioLevel={audioLevels.treble}
        />
      ))}
      
      {/* Particles */}
      <Particles
        count={50} // Reduced count for better performance
        tankSize={tankSize}
        mousePosition={mousePosition}
        audioLevel={audioLevels.bass}
      />
      
      {/* Post-processing */}
      <PostProcessing audioLevel={audioLevels.mid} />
    </WaterTank>
  );
}
