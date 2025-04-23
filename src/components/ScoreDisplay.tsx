
import { useAquariumStore } from '../store/aquariumStore';

export function ScoreDisplay() {
  const score = useAquariumStore(state => state.score);
  const highScore = useAquariumStore(state => state.highScore);

  return (
    <div className="absolute top-16 right-5 text-aquarium-white z-10 bg-black/30 px-4 py-2 rounded-lg">
      <div className="text-sm font-mono">
        <div>SCORE: {score}</div>
        <div className="text-aquarium-blue">HIGH: {highScore}</div>
      </div>
    </div>
  );
}
