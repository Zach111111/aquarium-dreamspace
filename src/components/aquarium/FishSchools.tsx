
import { useRef, useMemo } from 'react';
import { Fish } from '../Fish';
import { Vector3 } from 'three';
import { toast } from "@/components/ui/use-toast";

interface FishSchoolsProps {
  tankSize: [number, number, number];
  crystalPositions: Vector3[];
  onNewGroupCreated?: (position: [number, number, number]) => void;
}

export function FishSchools({ tankSize, crystalPositions, onNewGroupCreated }: FishSchoolsProps) {
  const fishSchools = useMemo(() => {
    const schools = [];
    const numSchools = 3 + Math.floor(Math.random() * 2); // 3-4 schools
    
    for (let i = 0; i < numSchools; i++) {
      const schoolSize = 3 + Math.floor(Math.random() * 3); // 3-5 fish per school
      const schoolBase = {
        x: (Math.random() - 0.5) * tankSize[0] * 0.7,
        y: (Math.random() - 0.5) * tankSize[1] * 0.7,
        z: (Math.random() - 0.5) * tankSize[2] * 0.7,
        speed: 0.5 + Math.random() * 1.5,
        color: `hsl(${180 + Math.random() * 60}, 70%, ${50 + i * 5}%)`
      };
      
      const schoolFishRefs = Array.from({ length: schoolSize }, () => 
        useRef<THREE.Group>(null)
      );
      
      const school = {
        basePosition: schoolBase,
        fishes: Array.from({ length: schoolSize }, (_, index) => ({
          ref: schoolFishRefs[index],
          scale: index === 0 ? 1.0 : 0.7 + Math.random() * 0.3,
          speed: schoolBase.speed * (index === 0 ? 0.9 : 0.9 + Math.random() * 0.2),
          color: index === 0 ? 
            `hsl(${180 + Math.random() * 60}, 80%, 60%)` : 
            `hsl(${180 + Math.random() * 60}, 70%, ${50 + index * 5}%)`,
          offset: {
            x: (Math.random() - 0.5) * 0.8,
            y: (Math.random() - 0.5) * 0.8,
            z: (Math.random() - 0.5) * 0.8
          },
          isLeader: index === 0,
          personalityFactor: index === 0 ? 1.5 : 0.8 + Math.random() * 0.4
        })),
        refs: schoolFishRefs
      };
      
      schools.push(school);
    }
    return schools;
  }, [tankSize]);

  return (
    <>
      {fishSchools.map((school, schoolIndex) => (
        <group key={`school-${schoolIndex}`}>
          {school.fishes.map((fish, fishIndex) => (
            <Fish
              key={`fish-${schoolIndex}-${fishIndex}`}
              color={fish.color}
              scale={fish.scale}
              speed={fish.speed}
              tankSize={tankSize}
              index={schoolIndex * 10 + fishIndex}
              groupOffset={fish.offset}
              groupIndex={schoolIndex}
              crystalPositions={crystalPositions}
              groupFishRefs={school.refs}
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
