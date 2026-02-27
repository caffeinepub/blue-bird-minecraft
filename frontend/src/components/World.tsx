import { useMemo } from 'react';
import * as THREE from 'three';
import { generateWorld, BlockType } from '../utils/worldGenerator';

// Block colors matching Minecraft palette
const BLOCK_COLORS: Record<BlockType, { top?: string; side?: string; bottom?: string; color: string }> = {
  grass: { color: '#5a8a3c', top: '#5a8a3c', side: '#8B6914', bottom: '#8B6914' },
  dirt: { color: '#8B6914' },
  stone: { color: '#7a7a7a' },
  wood: { color: '#6B4C11' },
  leaves: { color: '#2d7a1f' },
  water: { color: '#1a6fa8' },
};

const WORLD_RADIUS = 20;

interface InstanceGroup {
  positions: THREE.Matrix4[];
  type: BlockType;
}

export default function World() {
  const blocks = useMemo(() => generateWorld(WORLD_RADIUS), []);

  // Group blocks by type for instanced rendering
  const instanceGroups = useMemo(() => {
    const groups: Record<BlockType, THREE.Matrix4[]> = {
      grass: [],
      dirt: [],
      stone: [],
      wood: [],
      leaves: [],
      water: [],
    };

    const dummy = new THREE.Object3D();
    for (const block of blocks) {
      dummy.position.set(block.x, block.y, block.z);
      dummy.updateMatrix();
      groups[block.type].push(dummy.matrix.clone());
    }

    return groups;
  }, [blocks]);

  const boxGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  const materials = useMemo(() => {
    const createMat = (color: string, roughness = 0.9) => {
      return new THREE.MeshLambertMaterial({ color });
    };

    return {
      grass: [
        createMat('#8B6914'), // right
        createMat('#8B6914'), // left
        createMat('#5a8a3c'), // top
        createMat('#8B6914'), // bottom
        createMat('#8B6914'), // front
        createMat('#8B6914'), // back
      ],
      dirt: createMat('#8B6914'),
      stone: createMat('#7a7a7a'),
      wood: [
        createMat('#6B4C11'), // right
        createMat('#6B4C11'), // left
        createMat('#4a3508'), // top
        createMat('#4a3508'), // bottom
        createMat('#6B4C11'), // front
        createMat('#6B4C11'), // back
      ],
      leaves: createMat('#2d7a1f'),
      water: createMat('#1a6fa8'),
    };
  }, []);

  return (
    <group>
      {/* Grass blocks */}
      {instanceGroups.grass.length > 0 && (
        <instancedMesh
          args={[boxGeometry, undefined, instanceGroups.grass.length]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshLambertMaterial color="#8B6914" />
          {instanceGroups.grass.map((matrix, i) => {
            return null; // handled via setMatrixAt below
          })}
          <GrassInstances matrices={instanceGroups.grass} />
        </instancedMesh>
      )}

      {/* Render each block type with instanced meshes */}
      <BlockInstances
        matrices={instanceGroups.grass}
        geometry={boxGeometry}
        materials={materials.grass}
        castShadow
        receiveShadow
      />
      <BlockInstances
        matrices={instanceGroups.dirt}
        geometry={boxGeometry}
        materials={[materials.dirt as THREE.MeshLambertMaterial]}
        castShadow
        receiveShadow
      />
      <BlockInstances
        matrices={instanceGroups.stone}
        geometry={boxGeometry}
        materials={[materials.stone as THREE.MeshLambertMaterial]}
        castShadow
        receiveShadow
      />
      <BlockInstances
        matrices={instanceGroups.wood}
        geometry={boxGeometry}
        materials={materials.wood}
        castShadow
        receiveShadow
      />
      <BlockInstances
        matrices={instanceGroups.leaves}
        geometry={boxGeometry}
        materials={[materials.leaves as THREE.MeshLambertMaterial]}
        castShadow={false}
        receiveShadow
        transparent
        opacity={0.85}
      />
    </group>
  );
}

// Dummy component to satisfy TS - actual rendering done in BlockInstances
function GrassInstances({ matrices }: { matrices: THREE.Matrix4[] }) {
  return null;
}

interface BlockInstancesProps {
  matrices: THREE.Matrix4[];
  geometry: THREE.BufferGeometry;
  materials: THREE.MeshLambertMaterial | THREE.MeshLambertMaterial[];
  castShadow?: boolean;
  receiveShadow?: boolean;
  transparent?: boolean;
  opacity?: number;
}

function BlockInstances({
  matrices,
  geometry,
  materials,
  castShadow = true,
  receiveShadow = true,
  transparent = false,
  opacity = 1,
}: BlockInstancesProps) {
  const meshRef = useMemo(() => {
    if (matrices.length === 0) return null;

    const mat = Array.isArray(materials)
      ? materials
      : [materials];

    // For multi-material, we need to use the array
    const finalMat = mat.length === 1 ? mat[0] : mat;

    if (transparent) {
      (Array.isArray(finalMat) ? finalMat : [finalMat]).forEach((m) => {
        m.transparent = true;
        m.opacity = opacity;
      });
    }

    const mesh = new THREE.InstancedMesh(
      geometry,
      finalMat as THREE.Material | THREE.Material[],
      matrices.length
    );

    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;

    for (let i = 0; i < matrices.length; i++) {
      mesh.setMatrixAt(i, matrices[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;

    return mesh;
  }, [matrices, geometry, materials, castShadow, receiveShadow, transparent, opacity]);

  if (!meshRef) return null;

  return <primitive object={meshRef} />;
}
