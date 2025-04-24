
import { useState, useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { useAquariumStore } from '../store/aquariumStore';
import { toast } from "@/components/ui/use-toast";
import { useFishMovement } from '../hooks/useFishMovement';
import { FishBody, FishTail } from './FishMesh';

interface FishProps {
  color?: string;
  scale?: number;
  speed?: number;
  tankSize: [number, number, number];
  index: number;
  audioLevel?: number;
  groupOffset?: { x: number; y: number; z: number };
}

export function Fish({ 
  color = '#A5F3FF',
  scale = 1, 
  speed = 1,
  tankSize,
  index,
  groupOffset = { x: 0, y: 0, z: 0 }
}: FishProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const decrementScore = useAquariumStore(state => state.decrementScore);

  const initialPosition = useMemo(() => new Vector3(
    MathUtils.lerp(-(tankSize[0]/2) * 0.8, (tankSize[0]/2) * 0.8, Math.random()),
    MathUtils.lerp(-(tankSize[1]/2) * 0.8, (tankSize[1]/2) * 0.8, Math.random()),
    MathUtils.lerp(-(tankSize[2]/2) * 0.8, (tankSize[2]/2) * 0.8, Math.random())
  ), [tankSize]);

  const movementParams = useMemo(() => ({
    amplitude: 0.01 + Math.random() * 0.01,
    frequency: 0.5 + Math.random() * 1.0,
    phaseOffset: Math.random() * Math.PI * 2 + index * (Math.PI / 4),
    verticalFactor: 0.3 + Math.random() * 0.7
  }), [index]);

  const { fishRef } = useFishMovement({
    initialPosition,
    movementParams,
    speed,
    tankSize,
    groupOffset
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.nativeEvent.stopPropagation();
    decrementScore();
    setIsClicked(true);
    toast({
      title: "You touched a fish, oh no!",
      description: "-1",
      variant: "destructive",
      className: "compact-toast bg-[#1A1F2C] border-[#E5DEFF] text-[#E5DEFF]",
    });
    setTimeout(() => setIsClicked(false), 300);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
    setIsHovered(false);
  };

  return (
    <group ref={fishRef} position={initialPosition.toArray()} renderOrder={5}>
      <FishBody 
        color={color}
        isHovered={isHovered}
        isClicked={isClicked}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      <FishTail 
        color={color}
        isHovered={isHovered}
        isClicked={isClicked}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </group>
  );
}
