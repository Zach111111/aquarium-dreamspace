
import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Fish } from '../Fish';
import { Vector3, Group } from 'three';

interface DynamicFishGroupsProps {
  tankSize: [number, number, number];
  crystalPositions: Vector3[];
}

export interface DynamicFishGroupsHandle {
  createNewFishGroup: (position: [number, number, number]) => void;
}

export const DynamicFishGroups = forwardRef<DynamicFishGroupsHandle, DynamicFishGroupsProps>(
  ({ tankSize, crystalPositions }, ref) => {
    const [dynamicFishGroups, setDynamicFishGroups] = useState<any[]>([]);
    
    const createNewFishGroup = (position: [number, number, number]) => {
      const groupSize = 2 + Math.floor(Math.random() * 2);
      const groupRefs = Array.from({ length: groupSize }, () => useRef<Group>(null));
      
      const group = {
        fishes: Array.from({ length: groupSize }, (_, index) => ({
          ref: groupRefs[index],
          scale: 0.6 + Math.random() * 0.3,
          speed: 0.7 + Math.random() * 1.5,
          color: `hsl(${120 + Math.random() * 60}, 70%, ${50 + index * 5}%)`,
          offset: {
            x: position[0] + (Math.random() - 0.5) * 1,
            y: position[1] + (Math.random() - 0.5) * 1,
            z: position[2] + (Math.random() - 0.5) * 1
          },
          isLeader: index === 0,
          personalityFactor: 1.2 + Math.random() * 0.5
        })),
        refs: groupRefs
      };
      
      setDynamicFishGroups(prevGroups => [...prevGroups, group]);
    };

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      createNewFishGroup
    }));

    return (
      <>
        {dynamicFishGroups.map((group, groupIndex) => (
          <group key={`dynamic-group-${groupIndex}`}>
            {group.fishes.map((fish, fishIndex) => (
              <Fish
                key={`dynamic-fish-${groupIndex}-${fishIndex}`}
                color={fish.color}
                scale={fish.scale}
                speed={fish.speed}
                tankSize={tankSize}
                index={(groupIndex) * 10 + fishIndex}
                groupOffset={fish.offset}
                groupIndex={groupIndex}
                crystalPositions={crystalPositions}
                groupFishRefs={group.refs}
                isGroupLeader={fish.isLeader}
                personalityFactor={fish.personalityFactor}
                ref={fish.ref}
              />
            ))}
          </group>
        ))}
      </>
    );
  }
);

DynamicFishGroups.displayName = 'DynamicFishGroups';
