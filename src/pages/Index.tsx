
import { useState, useEffect } from 'react';
import { AquariumScene } from '../components/AquariumScene';
import { useAquariumStore } from '../store/aquariumStore';
import { toast } from "@/components/ui/use-toast";
import { ErrorBoundary } from '../components/ErrorBoundary';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [renderError, setRenderError] = useState(false);
  const isMenuOpen = useAquariumStore(state => state.isMenuOpen);
  
  // Simulate loading progress with shorter timing
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
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

  const handleSceneError = () => {
    setRenderError(true);
    toast({
      title: "Rendering Error",
      description: "There was an issue with the 3D scene. Showing simplified view.",
      variant: "destructive"
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {isLoading ? (
        // Loading screen
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
        <>
          {/* 3D Canvas Background - z-index 0 */}
          <div className="absolute inset-0 z-0">
            <ErrorBoundary>
              <AquariumScene />
            </ErrorBoundary>
            
            {/* Fallback if scene fails to render */}
            {renderError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1A1F2C]">
                <div className="text-white text-center p-4">
                  <h2 className="text-xl mb-2">3D Rendering Issue</h2>
                  <p>We encountered a problem with the 3D scene.</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* UI Overlay - z-index 1 */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="p-5">
              <h1 className="text-xl font-bold tracking-wider bg-black/50 px-3 py-1 rounded inline-block pointer-events-auto">
                AQUARIUM<span className="text-cyan-500">DREAMSPACE</span>
              </h1>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
