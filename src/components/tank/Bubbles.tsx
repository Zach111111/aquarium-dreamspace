
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useBubbleAnimation } from '../../hooks/useBubbleAnimation';

interface BubblesProps {
  width: number;
  height: number;
  depth: number;
  bubbleCount?: number;
}

export const Bubbles = ({ width, height, depth, bubbleCount = 30 }: BubblesProps) => {
  const bubblesRef = useRef<THREE.Points>(null);
  const bubbleVelocitiesRef = useRef<THREE.Vector3[]>([]);

  const bubbleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(bubbleCount * 3);
    
    for (let i = 0; i < bubbleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * width * 0.8;
      positions[i * 3 + 1] = -height * 0.45 + Math.random() * height * 0.1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * depth * 0.8;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [width, height, depth, bubbleCount]);

  useEffect(() => {
    bubbleVelocitiesRef.current = Array(bubbleCount).fill(0).map(() => 
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.003,
        0.005 + Math.random() * 0.01,
        (Math.random() - 0.5) * 0.003
      )
    );
  }, [bubbleCount]);

  useBubbleAnimation({ bubblesRef, bubbleVelocitiesRef, bubbleCount, width, height, depth });

  return (
    <points ref={bubblesRef} renderOrder={5}>
      <primitive object={bubbleGeometry} />
      <pointsMaterial
        color="#ffffff"
        size={0.05}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
