
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useMovement } from './fish/useMovement';
import { useTargeting } from './fish/useTargeting';
import { useDarting } from './fish/useDarting';

interface FishBehaviorProps {
  initialPosition: THREE.Vector3;
  fishSize: number;
  speed: number;
  personalityFactor: number;
  tankSize: [number, number, number];
  groupIndex: number;
  fishIndex: number;
  crystalPositions?: THREE.Vector3[];
  fishRefs?: React.MutableRefObject<THREE.Group | null>[];
  isFishLeader?: boolean;
  fishRef: React.MutableRefObject<THREE.Group | null>;
}

export const useFishBehavior = ({
  initialPosition,
  fishSize,
  speed,
  personalityFactor,
  tankSize,
  crystalPositions = [],
  fishRefs = [],
  isFishLeader = false,
  fishRef
}: FishBehaviorProps) => {
  const personality = useMemo(() => ({
    wanderlust: 0.5 + Math.random() * 0.5 * personalityFactor,
    crystalAttraction: 0.7 + Math.random() * 0.3,
    groupCohesion: isFishLeader ? 0.3 : 0.6 + Math.random() * 0.4,
    dartingChance: 0.005 * personalityFactor,
    dartingForce: 1.5 + Math.random() * 1.0,
    dartingDuration: 0.5 + Math.random() * 0.5
  }), [personalityFactor, isFishLeader]);
  
  const bounds = useMemo(() => {
    const [width, height, depth] = tankSize;
    return {
      minX: -(width/2) * 0.8,
      maxX: (width/2) * 0.8,
      minY: -(height/2) * 0.8,
      maxY: (height/2) * 0.8,
      minZ: -(depth/2) * 0.8,
      maxZ: (depth/2) * 0.8
    };
  }, [tankSize]);
  
  // Handle darting behavior
  const { isDarting, dartDirection } = useDarting({
    fishPosition: fishRef.current?.position || initialPosition,
    crystalPositions,
    dartingChance: personality.dartingChance,
    dartingForce: personality.dartingForce,
    dartingDuration: personality.dartingDuration
  });
  
  // Get current targets
  const targets = useTargeting({
    fishPosition: fishRef.current?.position || initialPosition,
    crystalPositions,
    groupFishRefs: fishRefs,
    personalityFactor,
    crystalAttraction: personality.crystalAttraction,
    groupCohesion: personality.groupCohesion
  });
  
  // Calculate blended target position
  const targetPosition = useMemo(() => {
    const blendedTarget = new THREE.Vector3();
    let totalWeight = 0;
    
    targets.forEach(target => {
      blendedTarget.add(target.position.clone().multiplyScalar(target.weight));
      totalWeight += target.weight;
    });
    
    if (totalWeight > 0) {
      blendedTarget.divideScalar(totalWeight);
    } else {
      blendedTarget.copy(initialPosition);
    }
    
    return blendedTarget;
  }, [targets, initialPosition]);
  
  // Apply movement
  useMovement({
    fishRef,
    speed,
    bounds,
    isDarting,
    dartDirection,
    targetPosition
  });
};
