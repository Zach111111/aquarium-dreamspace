
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
  const bounds = {
    minX: -(tankWidth/2) * 0.8,
    maxX: (tankWidth/2) * 0.8,
    minY: -(tankHeight/2) * 0.8,
    maxY: (tankHeight/2) * 0.8,
    minZ: -(tankDepth/2) * 0.8,
    maxZ: (tankDepth/2) * 0.8
  };

  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    
    const time = clock.getElapsedTime();
    const actualSpeed = speed * speedFactor;
    
    const phase = time * movementParams.frequency * actualSpeed + movementParams.phaseOffset;
    
    const targetPos = new Vector3(
      initialPosition.x + Math.sin(phase) * 6 + groupOffset.x,
      initialPosition.y + Math.sin(phase * movementParams.verticalFactor) * 4 + groupOffset.y,
      initialPosition.z + Math.cos(phase * 0.7) * 5 + groupOffset.z
    );
    
    targetPos.x = MathUtils.clamp(targetPos.x, bounds.minX, bounds.maxX);
    targetPos.y = MathUtils.clamp(targetPos.y, bounds.minY, bounds.maxY);
    targetPos.z = MathUtils.clamp(targetPos.z, bounds.minZ, bounds.maxZ);
    
    fishRef.current.position.lerp(targetPos, 0.02 * actualSpeed);
    
    const direction = new Vector3().subVectors(targetPos, fishRef.current.position).normalize();
    if (direction.length() > 0.1) {
      fishRef.current.lookAt(fishRef.current.position.clone().add(direction));
      fishRef.current.rotation.z = Math.sin(time * 3 * speedFactor) * 0.2;
    }
  });

  return { fishRef };
};
