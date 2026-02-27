import { isBlockAt } from './worldGenerator';

// Check if a position is inside a solid block
export function checkBlockCollision(
  blockSet: Set<string>,
  x: number,
  y: number,
  z: number,
  radius: number = 0.3
): boolean {
  // Check surrounding block positions
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        const bx = Math.round(x + dx * radius);
        const by = Math.round(y + dy * radius);
        const bz = Math.round(z + dz * radius);
        if (isBlockAt(blockSet, bx, by, bz)) {
          // Check actual overlap
          if (
            Math.abs(x - bx) < radius + 0.5 &&
            Math.abs(y - by) < radius + 0.5 &&
            Math.abs(z - bz) < radius + 0.5
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

// Get the ground Y position at a given X,Z (top of the highest block below the bird)
export function getGroundY(
  blockSet: Set<string>,
  x: number,
  z: number,
  startY: number,
  birdRadius: number = 0.4
): number {
  const bx = Math.round(x);
  const bz = Math.round(z);

  // Search downward from current position
  for (let y = Math.ceil(startY); y >= -5; y--) {
    if (isBlockAt(blockSet, bx, y, bz)) {
      return y + 0.5 + birdRadius; // Stand on top of block
    }
  }
  return -5; // Fallback ground
}

// Check if bird is standing on a block
export function isOnGround(
  blockSet: Set<string>,
  x: number,
  y: number,
  z: number,
  birdRadius: number = 0.4
): boolean {
  const bx = Math.round(x);
  const bz = Math.round(z);
  const checkY = Math.round(y - birdRadius - 0.1);
  return isBlockAt(blockSet, bx, checkY, bz);
}
