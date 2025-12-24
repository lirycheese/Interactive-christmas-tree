import { Vector3, MathUtils } from 'three';

// Generate a random point inside a sphere
export const getRandomSpherePoint = (radius: number): Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Generate a point on a cone surface (Tree shape)
export const getTreePoint = (height: number, radiusBase: number, yOffset: number = -2): Vector3 => {
  const y = Math.random() * height; // Height from base
  const currentRadius = (1 - y / height) * radiusBase; // Radius at this height
  const angle = Math.random() * Math.PI * 2;
  
  // Add some "volume" not just surface
  const r = currentRadius * Math.sqrt(Math.random()); 

  return new Vector3(
    Math.cos(angle) * r,
    y + yOffset,
    Math.sin(angle) * r
  );
};

// Calculate distance for gesture detection
export const getDistance = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};
