import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { getTreePoint, getRandomSpherePoint } from '../utils';
import { AppMode } from '../types';

const PhotoItem: React.FC<{ 
    id: string; 
    url: string; 
    index: number; 
    total: number 
}> = ({ id, url, index, total }) => {
    const meshRef = useRef<THREE.Group>(null);
    const texture = useLoader(THREE.TextureLoader, url);
    const { mode, handRotation, activePhotoId } = useStore();
    
    const vTargetPos = useMemo(() => new THREE.Vector3(), []);
    const qTargetRot = useMemo(() => new THREE.Quaternion(), []);
    const eTargetRot = useMemo(() => new THREE.Euler(), []);

    const { chaos, target, rotationOffset } = useMemo(() => {
        return {
            chaos: getRandomSpherePoint(8),
            target: getTreePoint(10, 5, -5),
            rotationOffset: new THREE.Euler(
                (Math.random() - 0.5) * 0.4, 
                (Math.random() - 0.5) * 0.4, 
                (Math.random() - 0.5) * 0.4
            )
        };
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const isZoom = mode === AppMode.PHOTO_ZOOM && activePhotoId === id;
        const isOtherZoom = mode === AppMode.PHOTO_ZOOM && activePhotoId !== id;
        const isChaos = mode === AppMode.CHAOS;
        
        let targetScale = 1;

        if (isZoom) {
            // Perfectly center relative to camera at [0, 4, 20]
            // We put it at z=14 (6 units away from camera) to fill the view stably
            vTargetPos.set(0, 4, 14); 
            eTargetRot.set(0, 0, 0);
            targetScale = 2.2; 
        } else if (isChaos || isOtherZoom) {
            vTargetPos.copy(chaos);
            const radius = Math.sqrt(chaos.x * chaos.x + chaos.z * chaos.z);
            const angle = Math.atan2(chaos.z, chaos.x) + handRotation;
            vTargetPos.x = Math.cos(angle) * radius;
            vTargetPos.z = Math.sin(angle) * radius;

            eTargetRot.set(rotationOffset.x, rotationOffset.y, rotationOffset.z);
            targetScale = isOtherZoom ? 0.1 : 1.1; 
        } else {
            vTargetPos.copy(target);
            const angle = Math.atan2(target.x, target.z);
            eTargetRot.set(0, angle, 0); 
            targetScale = 0.85;
        }

        qTargetRot.setFromEuler(eTargetRot);

        // Increased damping for zoom to prevent flickering from slight hand movements
        const alpha = isZoom ? 0.08 : Math.min(delta * 3, 1.0);
        
        meshRef.current.position.lerp(vTargetPos, alpha);
        meshRef.current.quaternion.slerp(qTargetRot, alpha);
        
        const currentScale = meshRef.current.scale.x;
        const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, alpha);
        meshRef.current.scale.setScalar(nextScale);
        
        if (isChaos && !isZoom) {
            meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.002;
        }
    });

    return (
        <group ref={meshRef}>
            <mesh position={[0, 0, -0.01]}>
                <boxGeometry args={[1.2, 1.5, 0.02]} />
                <meshStandardMaterial color="#fff" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial map={texture} />
            </mesh>
        </group>
    );
};

export const PhotoCloud: React.FC = () => {
    const photos = useStore(state => state.photos);
    return (
        <group>
            {photos.map((photo, index) => (
                <PhotoItem 
                    key={photo.id} 
                    id={photo.id} 
                    url={photo.url} 
                    index={index}
                    total={photos.length} 
                />
            ))}
        </group>
    );
};