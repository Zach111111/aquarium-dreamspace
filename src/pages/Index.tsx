
import { useState, useEffect } from 'react';
import { AquariumScene } from '../components/AquariumScene';
import { useAquariumStore } from '../store/aquariumStore';
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isMenuOpen = useAquariumStore(state => state.isMenuOpen);
  
  // Simulate loading progress with shorter timing
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25; // Faster loading
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Shorter delay before showing scene
        setTimeout(() => {
          setIsLoading(false);
          console.log("Loading complete, showing aquarium scene");
        }, 100);
      }
      setLoadingProgress(progress);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  const skipLoading = () => {
    setIsLoading(false);
    console.log("Loading skipped, showing aquarium scene");
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      {isLoading ? (
        // Simplified loading screen
        <div className="flex flex-col items-center justify-center h-full bg-[#1A1F2C] text-white">
          <h1 className="text-3xl font-bold mb-4">
            AQUARIUM<span className="text-cyan-500">DREAMSPACE</span>
          </h1>
          
          <div className="w-64 bg-gray-700 rounded-full h-4 mb-6">
            <div 
              className="bg-cyan-500 h-4 rounded-full transition-all duration-200" 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          
          <button 
            onClick={skipLoading}
            className="mt-4 text-sm text-gray-400 hover:text-white"
          >
            Skip Loading
          </button>
        </div>
      ) : (
        // Main aquarium scene - simplified
        <div className="relative h-full w-full">
          {/* Core aquarium scene */}
          <AquariumScene />
          
          {/* Info text */}
          <div className="absolute top-5 left-5 text-white z-10">
            <h1 className="text-xl font-bold tracking-wider bg-black/50 px-3 py-1 rounded">
              AQUARIUM<span className="text-cyan-500">DREAMSPACE</span>
            </h1>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
