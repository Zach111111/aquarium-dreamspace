
import { useState, useMemo, useRef, forwardRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Group, Vector3, MathUtils } from 'three';
import { useAquariumStore } from '../store/aquariumStore';
import { toast } from "@/components/ui/use-toast";
import { useFishBehavior } from '../hooks/useFishBehavior';
import { FishBody, FishTail } from './FishMesh';

interface FishProps {
  color?: string;
  scale?: number;
  speed?: number;
  tankSize: [number, number, number];
  index: number;
  audioLevel?: number;
  groupOffset?: { x: number; y: number; z: number };
  groupIndex?: number;
  crystalPositions?: Vector3[];
  groupFishRefs?: React.MutableRefObject<Group | null>[];
  isGroupLeader?: boolean;
  personalityFactor?: number;
}

export const Fish = forwardRef<Group, FishProps>(({ 
  color = '#A5F3FF',
  scale = 1, 
  speed = 1,
  tankSize,
  index,
  groupOffset = { x: 0, y: 0, z: 0 },
  groupIndex = 0,
  crystalPositions = [],
  groupFishRefs = [],
  isGroupLeader = false,
  personalityFactor = 1.0
}: FishProps, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const decrementScore = useAquariumStore(state => state.decrementScore);
  
  // Define a size variation based on position in the school
  const sizeVariation = useMemo(() => {
    return isGroupLeader ? 1.2 : 0.8 + Math.random() * 0.4;
  }, [isGroupLeader]);
  
  const adjustedScale = scale * sizeVariation;
  
  // Define initial position offset by group
  const initialPosition = useMemo(() => new Vector3(
    MathUtils.lerp(-(tankSize[0]/2) * 0.7, (tankSize[0]/2) * 0.7, Math.random()) + groupOffset.x,
    MathUtils.lerp(-(tankSize[1]/2) * 0.7, (tankSize[1]/2) * 0.7, Math.random()) + groupOffset.y,
    MathUtils.lerp(-(tankSize[2]/2) * 0.7, (tankSize[2]/2) * 0.7, Math.random()) + groupOffset.z
  ), [tankSize, groupOffset]);

  // Calculate speed variations based on size
  const adjustedSpeed = useMemo(() => {
    // Smaller fish move faster
    const sizeSpeedFactor = 1.5 - (adjustedScale * 0.5);
    return speed * sizeSpeedFactor;
  }, [speed, adjustedScale]);
  
  // Use the fish behavior hook
  const internalFishRef = useRef<Group>(null);
  const fishRef = ref || internalFishRef;
  
  useFishBehavior({
    initialPosition,
    fishSize: adjustedScale,
    speed: adjustedSpeed,
    personalityFactor,
    tankSize,
    groupIndex,
    fishIndex: index,
    crystalPositions,
    fishRefs: groupFishRefs,
    isFishLeader: isGroupLeader,
    fishRef: fishRef as React.MutableRefObject<Group | null>
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

  // Scale fish based on size variation
  const bodyScale = [adjustedScale, adjustedScale * 0.6, adjustedScale * 0.5];
  const tailScale = [adjustedScale * 0.4, adjustedScale * 0.3, adjustedScale * 0.2];

  // Use different colors for leader fish
  const fishColor = isGroupLeader ? 
    color.replace('hsl(', 'hsl(').replace(', ', ', ').replace('%)', '%)') : 
    color;

  return (
    <group ref={fishRef} position={initialPosition.toArray()} renderOrder={5}>
      <FishBody 
        color={fishColor}
        isHovered={isHovered}
        isClicked={isClicked}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={bodyScale}
      />
      <FishTail 
        color={fishColor}
        isHovered={isHovered}
        isClicked={isClicked}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={tailScale}
      />
    </group>
  );
});

// Add display name for better debugging
Fish.displayName = 'Fish';

