
import { Plant } from '../Plant';
import { Crystal } from '../Crystal';
import { Vector3 } from 'three';

interface AquariumEnvironmentProps {
  tankSize: [number, number, number];
  onCrystalExplode: (position: [number, number, number]) => void;
}

export function AquariumEnvironment({ tankSize, onCrystalExplode }: AquariumEnvironmentProps) {
  const plantPositions = useMemo(() => {
    return Array.from({ length: 6 }, () => ([
      (Math.random() - 0.5) * tankSize[0] * 0.7,
      -tankSize[1] / 2 * 0.9,
      (Math.random() - 0.5) * tankSize[2] * 0.7
    ] as [number, number, number]));
  }, [tankSize]);

  const crystalData = useMemo(() => {
    const safeRadius = 2;
    const crystals = [];
    const positions: Vector3[] = [];
    
    for (let i = 0; i < 3; i++) {
      const position = new Vector3(
        (Math.random() - 0.5) * (tankSize[0] - safeRadius * 2),
        -tankSize[1] / 2 * 0.7 + Math.random() * 2,
        (Math.random() - 0.5) * (tankSize[2] - safeRadius * 2)
      );
      
      positions.push(position);
      
      crystals.push({
        position: position.toArray() as [number, number, number],
        rotation: [
          Math.random() * Math.PI * 0.2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 0.2
        ] as [number, number, number],
        color: `hsl(${Math.random() * 60 + 240}, 70%, 60%)`,
        height: 0.8 + Math.random() * 1.2
      });
    }
    
    return { crystals, positions };
  }, [tankSize]);

  return (
    <>
      {plantPositions.map((position, i) => (
        <Plant
          key={`plant-${i}`}
          position={position}
          height={1.5 + Math.random() * 1.5}
          color={`hsl(${120 + Math.random() * 40}, 70%, 60%)`}
        />
      ))}
      
      {crystalData.crystals.map((crystal, i) => (
        <Crystal
          key={`crystal-${i}`}
          position={crystal.position}
          rotation={crystal.rotation}
          color={crystal.color}
          height={crystal.height}
          onExplode={onCrystalExplode}
        />
      ))}
    </>
  );
}
