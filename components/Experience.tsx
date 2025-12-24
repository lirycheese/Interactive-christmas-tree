import React, { Suspense } from 'react';
import { PerspectiveCamera, Environment, OrbitControls, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { PhotoCloud } from './PhotoCloud';
import { useStore } from '../store';
import { AppMode } from '../types';

export const Experience: React.FC = () => {
  const mode = useStore(state => state.mode);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={50} />
      
      {/* Lighting */}
      <Environment preset="lobby" background={false} />
      <ambientLight intensity={0.2} color="#022D36" />
      <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
      <spotLight 
        position={[0, 20, 0]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color="#fff" 
        castShadow 
      />

      {/* Content */}
      <group position={[0, -4, 0]}>
        <Suspense fallback={null}>
            <Foliage />
            <Ornaments />
            <PhotoCloud />
        </Suspense>
        
        {/* Background Ambient Particles */}
        <Sparkles 
            count={200} 
            scale={20} 
            size={4} 
            speed={0.4} 
            opacity={0.5} 
            color="#D4AF37" 
        />
      </group>

      {/* Post Processing */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
            luminanceThreshold={0.8} 
            intensity={1.5} 
            levels={9} 
            mipmapBlur 
            radius={0.8}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
      </EffectComposer>

      {/* Controls - Restricted in production, enabled for debug/desktop without camera */}
      <OrbitControls 
        enablePan={false} 
        enableZoom={mode !== AppMode.FORMED} // Disable zoom in Formed mode to keep cinematic view
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
};