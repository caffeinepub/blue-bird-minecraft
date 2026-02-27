// World generation utilities for Minecraft-style voxel terrain

export interface BlockData {
  x: number;
  y: number;
  z: number;
  type: BlockType;
}

export type BlockType = 'grass' | 'dirt' | 'stone' | 'wood' | 'leaves' | 'water';

// Simple noise function using sine waves for terrain height variation
function pseudoNoise(x: number, z: number): number {
  return (
    Math.sin(x * 0.3 + 1.7) * Math.cos(z * 0.25 + 0.9) * 0.5 +
    Math.sin(x * 0.15 + z * 0.2 + 3.1) * 0.3 +
    Math.cos(x * 0.4 + z * 0.35 + 1.2) * 0.2
  );
}

export function getTerrainHeight(x: number, z: number): number {
  const noise = pseudoNoise(x, z);
  return Math.floor(noise * 2) + 1; // Height between -1 and 3
}

export function shouldPlaceTree(x: number, z: number): boolean {
  // Deterministic tree placement using a hash
  const hash = Math.abs(Math.sin(x * 127.1 + z * 311.7) * 43758.5453);
  return (hash % 1) > 0.92 && x % 3 !== 0; // ~8% chance, spaced out
}

export function generateWorld(radius: number): BlockData[] {
  const blocks: BlockData[] = [];
  const treePositions: Set<string> = new Set();

  // First pass: determine tree positions
  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      if (shouldPlaceTree(x, z)) {
        treePositions.add(`${x},${z}`);
      }
    }
  }

  // Second pass: generate terrain blocks
  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      const topY = getTerrainHeight(x, z);

      // Grass top layer
      blocks.push({ x, y: topY, z, type: 'grass' });

      // Dirt layers below grass
      for (let y = topY - 1; y >= topY - 3; y--) {
        blocks.push({ x, y, z, type: 'dirt' });
      }

      // Stone below dirt
      for (let y = topY - 4; y >= -3; y--) {
        blocks.push({ x, y, z, type: 'stone' });
      }

      // Trees
      if (treePositions.has(`${x},${z}`)) {
        const trunkHeight = 4 + Math.floor(Math.abs(Math.sin(x * 31.7 + z * 17.3)) * 2);
        // Trunk
        for (let ty = 1; ty <= trunkHeight; ty++) {
          blocks.push({ x, y: topY + ty, z, type: 'wood' });
        }
        // Leaves (3x3x3 canopy at top)
        const leafBase = topY + trunkHeight;
        for (let lx = -2; lx <= 2; lx++) {
          for (let lz = -2; lz <= 2; lz++) {
            for (let ly = 0; ly <= 2; ly++) {
              // Skip corners for rounder look
              if (Math.abs(lx) === 2 && Math.abs(lz) === 2 && ly === 0) continue;
              blocks.push({ x: x + lx, y: leafBase + ly, z: z + lz, type: 'leaves' });
            }
          }
        }
      }
    }
  }

  return blocks;
}

// Build a fast lookup set for collision detection
export function buildBlockSet(blocks: BlockData[]): Set<string> {
  const set = new Set<string>();
  for (const b of blocks) {
    set.add(`${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.z)}`);
  }
  return set;
}

export function isBlockAt(blockSet: Set<string>, x: number, y: number, z: number): boolean {
  return blockSet.has(`${Math.round(x)},${Math.round(y)},${Math.round(z)}`);
}
