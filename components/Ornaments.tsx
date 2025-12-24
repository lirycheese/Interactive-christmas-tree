
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTreePoint, getRandomSpherePoint } from '../utils';
import { useStore } from '../store';
import { AppMode } from '../types';

const BOX_COUNT = 80;
const SPHERE_COUNT = 120;
const TEMP_OBJ = new THREE.Object3D();

// Define Colors
const PALETTE = [
  '#D4AF37', // Gold
  '#8a0303', // Velvet Red
  '#022D36', // Deep Green
  '#FFFFFF', // White
  '#C0C0C0'  // Silver
];

// Custom hook to create a 3D Star Shape
const useStarGeometry = () => {
  return useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.8;
    const innerRadius = 0.35;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points + Math.PI / 2; // Offset to point up
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 3
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center(); // Center to rotate around its middle
    return geometry;
  }, []);
};

export const Ornaments: React.FC = () => {
  const boxMesh = useRef<THREE.InstancedMesh>(null);
  const sphereMesh = useRef<THREE.InstancedMesh>(null);
  const starMesh = useRef<THREE.Mesh>(null);
  const starGeo = useStarGeometry();
  
  const mode = useStore((state) => state.mode);
  const handRotation = useStore((state) => state.handRotation);

  const { boxData, sphereData } = useMemo(() => {
    const bData = [];
    const sData = [];
    
    // Generate Boxes (Gifts)
    for (let i = 0; i < BOX_COUNT; i++) {
      bData.push({
        chaos: getRandomSpherePoint(12),
        target: getTreePoint(11, 4.5, -5), 
        color: PALETTE[Math.floor(Math.random() * 3)], 
        scale: Math.random() * 0.4 + 0.3,
        rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI)
      });
    }

    // Generate Spheres (Baubles)
    for (let i = 0; i < SPHERE_COUNT; i++) {
      sData.push({
        chaos: getRandomSpherePoint(14),
        target: getTreePoint(12, 5.2, -5), 
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        scale: Math.random() * 0.25 + 0.15
      });
    }
    return { boxData: bData, sphereData: sData };
  }, []);

  useFrame((state, delta) => {
    const lerpSpeed = delta * 2;
    const isChaos = mode === AppMode.CHAOS || mode === AppMode.PHOTO_ZOOM;
    
    // Animate Boxes
    if (boxMesh.current) {
      if (isChaos) boxMesh.current.rotation.y = THREE.MathUtils.lerp(boxMesh.current.rotation.y, handRotation, 0.05);
      else boxMesh.current.rotation.y += delta * 0.05;

      boxData.forEach((d, i) => {
        const targetPos = isChaos ? d.chaos : d.target;
        
        boxMesh.current!.getMatrixAt(i, TEMP_OBJ.matrix);
        TEMP_OBJ.matrix.decompose(TEMP_OBJ.position, TEMP_OBJ.quaternion, TEMP_OBJ.scale);
        
        TEMP_OBJ.position.lerp(targetPos, lerpSpeed);
        
        if (isChaos) {
            TEMP_OBJ.rotation.x += delta * 0.5;
            TEMP_OBJ.rotation.z += delta * 0.5;
        } else {
            TEMP_OBJ.rotation.copy(d.rotation);
        }

        TEMP_OBJ.scale.setScalar(d.scale);
        TEMP_OBJ.updateMatrix();
        boxMesh.current!.setMatrixAt(i, TEMP_OBJ.matrix);
        boxMesh.current!.setColorAt(i, new THREE.Color(d.color));
      });
      boxMesh.current.instanceMatrix.needsUpdate = true;
      if (boxMesh.current.instanceColor) boxMesh.current.instanceColor.needsUpdate = true;
    }

    // Animate Spheres
    if (sphereMesh.current) {
        if (isChaos) sphereMesh.current.rotation.y = THREE.MathUtils.lerp(sphereMesh.current.rotation.y, handRotation, 0.05);
        else sphereMesh.current.rotation.y += delta * 0.05;

        sphereData.forEach((d, i) => {
          const targetPos = isChaos ? d.chaos : d.target;
          
          sphereMesh.current!.getMatrixAt(i, TEMP_OBJ.matrix);
          TEMP_OBJ.matrix.decompose(TEMP_OBJ.position, TEMP_OBJ.quaternion, TEMP_OBJ.scale);
          
          TEMP_OBJ.position.lerp(targetPos, lerpSpeed * 1.2); 
          TEMP_OBJ.scale.setScalar(d.scale);
          TEMP_OBJ.updateMatrix();
          sphereMesh.current!.setMatrixAt(i, TEMP_OBJ.matrix);
          sphereMesh.current!.setColorAt(i, new THREE.Color(d.color));
        });
        sphereMesh.current.instanceMatrix.needsUpdate = true;
        if (sphereMesh.current.instanceColor) sphereMesh.current.instanceColor.needsUpdate = true;
    }

    // Animate Star
    if (starMesh.current) {
        const targetY = isChaos ? 10 : 7.5;
        starMesh.current.position.y = THREE.MathUtils.lerp(starMesh.current.position.y, targetY, lerpSpeed);
        
        // Vertical standing rotation (spin horizontally)
        starMesh.current.rotation.y += delta * 1.5;
        
        starMesh.current.scale.setScalar(isChaos ? 1.5 : 1);
    }
  });

  return (
    <group>
      {/* Gifts */}
      <instancedMesh ref={boxMesh} args={[undefined, undefined, BOX_COUNT]}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.3} metalness={0.6} />
      </instancedMesh>

      {/* Baubles */}
      <instancedMesh ref={sphereMesh} args={[undefined, undefined, SPHERE_COUNT]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial roughness={0.1} metalness={0.9} />
      </instancedMesh>

      {/* Top Star - 3D Five-Pointed Star */}
      <mesh ref={starMesh} geometry={starGeo} position={[0, 7.5, 0]}>
        <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={2} 
            toneMapped={false}
        />
        <pointLight distance={10} intensity={5} color="#FFD700" decay={2} />
      </mesh>
    </group>
  );
};
