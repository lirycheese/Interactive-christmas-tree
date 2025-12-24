import { Vector3 } from 'three';

export enum AppMode {
  FORMED = 'FORMED', // Tree shape
  CHAOS = 'CHAOS',   // Exploded shape
  PHOTO_ZOOM = 'PHOTO_ZOOM' // Viewing a specific photo
}

export enum HandGesture {
  NONE = 'NONE',
  OPEN_PALM = 'OPEN_PALM', // Trigger Chaos
  FIST = 'FIST',           // Trigger Formed
  PINCH = 'PINCH',         // Trigger Photo Selection
  POINT = 'POINT'          // Navigation
}

export interface ParticleData {
  id: number;
  chaosPos: Vector3;
  targetPos: Vector3;
  color: string;
  size: number;
  type: 'leaf' | 'box' | 'ball' | 'light' | 'photo';
  speed: number;
  rotationSpeed: Vector3;
}

export interface PhotoData {
  id: string;
  url: string;
  aspectRatio: number;
}
