import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience } from './components/Experience';
import HandTracker from './components/HandTracker';
import { UI } from './components/UI';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#011418] via-[#022D36] to-[#011418] overflow-hidden">
      
      {/* 3D Scene */}
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: false, stencil: false, depth: true, alpha: false }}
      >
        <Experience />
      </Canvas>
      
      {/* Overlays */}
      <UI />
      <HandTracker />
      
      {/* Loading Overlay */}
      <Loader 
        containerStyles={{ background: '#022D36' }} 
        innerStyles={{ width: '400px', height: '4px', background: '#333' }}
        barStyles={{ background: '#D4AF37', height: '4px' }}
        dataStyles={{ fontFamily: 'serif', color: '#D4AF37', fontSize: '1.5rem' }}
        dataInterpolation={(p) => `Loading Luxury Experience ${p.toFixed(0)}%`}
      />
    </div>
  );
};

export default App;
