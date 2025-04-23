
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { toast } from "@/components/ui/use-toast"

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('[GlobalError]', event.error);
  
  // Only show toast for specific errors, not for all errors
  if (event.error?.message?.includes('THREE') || 
      event.error?.message?.includes('WebGL') ||
      event.error?.message?.includes('shader')) {
    toast({
      title: "Application Error",
      description: "A rendering error occurred. The application will try to recover.",
      variant: "destructive"
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[PromiseRejection]', event.reason);
});

// Add a function to check if WebGL is available
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

// Check WebGL support on load
if (!checkWebGLSupport()) {
  console.error('WebGL not supported in this browser');
  setTimeout(() => {
    toast({
      title: "WebGL Not Supported",
      description: "Your browser doesn't support WebGL, which is required for 3D graphics.",
      variant: "destructive"
    });
  }, 1000);
}

// Console messages for successful initialization
console.log("✅ Application initialized");

createRoot(document.getElementById("root")!).render(<App />);
