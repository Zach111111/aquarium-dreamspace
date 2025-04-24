
import { useState } from 'react';
import { Fish } from '../Fish';
import { Vector3 } from 'three';

interface DynamicFishGroupsProps {
  tankSize: [number, number, number];
  crystalPositions: Vector3[];
}

export function DynamicFishGroups({ tankSize, crystalPositions }: DynamicFishGroupsProps) {
  const [dynamicFishGroups, setDynamicFishGroups] = useState<any[]>([]);

  const createNewFishGroup = (position: [number, number, number]) => {
    const groupSize = 2 + Math.floor(Math.random() * 2);
    const groupRefs = Array.from({ length: groupSize }, () => useRef<THREE.Group>(null));
    
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
              index={(groupIndex + fishSchools.length) * 10 + fishIndex}
              groupOffset={fish.offset}
              groupIndex={groupIndex + fishSchools.length}
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
