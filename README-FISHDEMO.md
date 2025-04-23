
# Fish Tank Demo with React Three Fiber

This is a 3D fish tank demo built with React Three Fiber and Three.js.

## Features

- Rotating debug cube (hot pink)
- Custom shader-based water effect
- Glass tank with realistic materials
- Interactive controls to explore the 3D scene

## How to Run

1. Make sure all dependencies are installed:

```bash
npm install
# or
yarn
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Technologies Used

- React
- Three.js
- React Three Fiber
- React Three Drei

## Project Structure

- `src/components/FishTankDemo.tsx` - Main component setting up the 3D scene
- `src/components/WaterTank.tsx` - Custom water tank with shader effects
- `src/components/scene/DebugCube.tsx` - Simple rotating debug cube

## Notes

- The water effect uses a custom shader material created with @react-three/drei's `shaderMaterial`
- Performance monitoring will automatically switch to simpler materials if FPS drops below 30
- You can interact with the scene using mouse controls (orbit, pan, zoom)
