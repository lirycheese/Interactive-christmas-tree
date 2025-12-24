import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTreePoint, getRandomSpherePoint } from '../utils';
import { useStore } from '../store';
import { AppMode } from '../types';

const COUNT = 3500;
const DUMMY = new THREE.Object3D();

export const Foliage: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const mode = useStore((state) => state.mode);
  const handRotation = useStore((state) => state.handRotation);

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < COUNT; i++) {
      const target = getTreePoint(12, 5, -5); // Height 12, Base Radius 5, Offset -5
      const chaos = getRandomSpherePoint(15);
      data.push({
        chaos,
        target,
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.35, 0.8, Math.random() * 0.2 + 0.1), // Emerald Greens
        size: Math.random() * 0.15 + 0.05
      });
    }
    return data;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);

    particles.forEach((p, i) => {
      // Start at tree
      positions[i * 3] = p.target.x;
      positions[i * 3 + 1] = p.target.y;
      positions[i * 3 + 2] = p.target.z;

      colors[i * 3] = p.color.r;
      colors[i * 3 + 1] = p.color.g;
      colors[i * 3 + 2] = p.color.b;
      
      sizes[i] = p.size;
    });

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [particles]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const lerpFactor = delta * 2.5; // Animation Speed

    const isChaos = mode === AppMode.CHAOS || mode === AppMode.PHOTO_ZOOM;
    
    // Rotate group based on hand
    if (isChaos) {
        pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, handRotation, 0.05);
    } else {
        pointsRef.current.rotation.y += delta * 0.1; // Gentle auto spin
    }

    // Update positions
    for (let i = 0; i < COUNT; i++) {
      const idx = i * 3;
      const p = particles[i];
      const target = isChaos ? p.chaos : p.target;

      // Simple Lerp
      positions[idx] = THREE.MathUtils.lerp(positions[idx], target.x, lerpFactor);
      positions[idx + 1] = THREE.MathUtils.lerp(positions[idx + 1], target.y, lerpFactor);
      positions[idx + 2] = THREE.MathUtils.lerp(positions[idx + 2], target.z, lerpFactor);
      
      // Add "Breathing" / "Wiggle"
      if (!isChaos) {
          positions[idx] += Math.sin(state.clock.elapsedTime * 2 + i) * 0.002;
          positions[idx + 1] += Math.cos(state.clock.elapsedTime * 2 + i) * 0.002;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        vertexShader={`
          attribute float size;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          void main() {
            float r = distance(gl_PointCoord, vec2(0.5));
            if (r > 0.5) discard;
            float glow = 1.0 - (r * 2.0);
            glow = pow(glow, 2.0);
            gl_FragColor = vec4(vColor, glow);
          }
        `}
      />
    </points>
  );
};
