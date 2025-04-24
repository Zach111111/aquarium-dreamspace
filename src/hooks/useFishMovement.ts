
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Group, Vector3, MathUtils } from 'three';
import { useAquariumStore } from '../store/aquariumStore';

interface FishMovementProps {
  initialPosition: Vector3;
  movementParams: {
    amplitude: number;
    frequency: number;
    phaseOffset: number;
    verticalFactor: number;
  };
  speed: number;
  tankSize: [number, number, number];
  groupOffset: { x: number; y: number; z: number };
}

export const useFishMovement = ({
  initialPosition,
  movementParams,
  speed,
  tankSize,
  groupOffset
}: FishMovementProps) => {
  const fishRef = useRef<Group>(null);
  const speedFactor = useAquariumStore(state => state.speedFactor);
  
  const [tankWidth, tankHeight, tankDepth] = tankSize;
  const bounds = useMemo(() => ({
    minX: -(tankWidth/2) * 0.8,
    maxX: (tankWidth/2) * 0.8,
    minY: -(tankHeight/2) * 0.8,
    maxY: (tankHeight/2) * 0.8,
    minZ: -(tankDepth/2) * 0.8,
    maxZ: (tankDepth/2) * 0.8
  }), [tankWidth, tankHeight, tankDepth]);

  // Create reusable vector outside the frame loop
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    
    const time = clock.getElapsedTime();
    const actualSpeed = speed * speedFactor;
    
    const phase = time * movementParams.frequency * actualSpeed + movementParams.phaseOffset;
    
    // Reuse targetPos instead of creating new Vector3
    targetPos.set(
      initialPosition.x + Math.sin(phase) * 6 + groupOffset.x,
      initialPosition.y + Math.sin(phase * movementParams.verticalFactor) * 4 + groupOffset.y,
      initialPosition.z + Math.cos(phase * 0.7) * 5 + groupOffset.z
    );
    
    targetPos.x = MathUtils.clamp(targetPos.x, bounds.minX, bounds.maxX);
    targetPos.y = MathUtils.clamp(targetPos.y, bounds.minY, bounds.maxY);
    targetPos.z = MathUtils.clamp(targetPos.z, bounds.minZ, bounds.maxZ);
    
    fishRef.current.position.lerp(targetPos, 0.02 * actualSpeed);
    
    // Reuse direction vector
    direction.subVectors(targetPos, fishRef.current.position).normalize();
    
    if (direction.length() > 0.1) {
      fishRef.current.lookAt(fishRef.current.position.clone().add(direction));
      fishRef.current.rotation.z = Math.sin(time * 3 * speedFactor) * 0.2;
    }
  });

  return { fishRef };
};
