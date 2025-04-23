
import { Button } from "@/components/ui/button";
import { useAquariumStore } from "../store/aquariumStore";
import { RefreshCw } from "lucide-react";

export function LoseScreen() {
  const { score, highScore, resetGame } = useAquariumStore();
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#1A1F2C]/90 p-8 rounded-lg border border-red-500/20 shadow-2xl max-w-md w-full mx-4 text-center space-y-6">
        <h1 className="text-4xl font-bold text-red-500 glow animate-pulse-light">
          GAME OVER!
        </h1>
        
        <div className="space-y-2 text-aquarium-white">
          <p className="text-xl">Final Score: {score}</p>
          <p className="text-sm text-red-400">High Score: {highScore}</p>
        </div>
        
        <Button
          onClick={resetGame}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 animate-pulse-light flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </Button>
      </div>
    </div>
  );
}

