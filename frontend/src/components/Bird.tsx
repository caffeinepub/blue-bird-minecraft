import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerControls } from '../hooks/usePlayerControls';
import { generateWorld, buildBlockSet, getTerrainHeight } from '../utils/worldGenerator';
import { isOnGround, getGroundY } from '../utils/collision';

const GRAVITY = -18;
const FLAP_FORCE = 9;
const MOVE_SPEED = 5;
const WORLD_RADIUS = 20;

interface BirdProps {
  birdPositionRef: React.MutableRefObject<THREE.Vector3>;
}

export default function Bird({ birdPositionRef }: BirdProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  const controls = usePlayerControls();

  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const isGroundedRef = useRef(false);
  const flapCooldownRef = useRef(0);
  const wingAnimRef = useRef(0);
  const isFlappingRef = useRef(false);
  const facingAngleRef = useRef(0);

  // Build block set for collision
  const blockSet = useMemo(() => {
    const blocks = generateWorld(WORLD_RADIUS);
    return buildBlockSet(blocks);
  }, []);

  // Spawn position: on top of terrain at origin
  const spawnY = useMemo(() => {
    const h = getTerrainHeight(0, 0);
    return h + 1.5;
  }, []);

  // Initialize position
  useMemo(() => {
    birdPositionRef.current.set(0, spawnY, 0);
  }, [spawnY, birdPositionRef]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const dt = Math.min(delta, 0.05); // Cap delta to avoid huge jumps
    const pos = birdPositionRef.current;
    const vel = velocityRef.current;
    const ctrl = controls.current;

    // --- Horizontal movement ---
    const moveDir = new THREE.Vector3(0, 0, 0);
    if (ctrl.forward) moveDir.z -= 1;
    if (ctrl.backward) moveDir.z += 1;
    if (ctrl.left) moveDir.x -= 1;
    if (ctrl.right) moveDir.x += 1;

    const isMoving = moveDir.lengthSq() > 0;
    if (isMoving) {
      moveDir.normalize();
      // Update facing direction
      facingAngleRef.current = Math.atan2(moveDir.x, moveDir.z);
    }

    // Apply horizontal velocity
    vel.x = moveDir.x * MOVE_SPEED;
    vel.z = moveDir.z * MOVE_SPEED;

    // --- Flapping ---
    flapCooldownRef.current = Math.max(0, flapCooldownRef.current - dt);

    if (ctrl.flap && flapCooldownRef.current <= 0) {
      vel.y = FLAP_FORCE;
      isGroundedRef.current = false;
      flapCooldownRef.current = 0.15;
      isFlappingRef.current = true;
    }

    // --- Gravity ---
    if (!isGroundedRef.current) {
      vel.y += GRAVITY * dt;
    }

    // --- Integrate position ---
    const newX = pos.x + vel.x * dt;
    const newY = pos.y + vel.y * dt;
    const newZ = pos.z + vel.z * dt;

    // --- Ground collision ---
    const groundY = getGroundY(blockSet, newX, newZ, newY, 0.4);
    let finalY = newY;

    if (newY <= groundY) {
      finalY = groundY;
      vel.y = 0;
      isGroundedRef.current = true;
      isFlappingRef.current = false;
    } else {
      isGroundedRef.current = false;
    }

    // --- World bounds ---
    const clampedX = Math.max(-WORLD_RADIUS + 1, Math.min(WORLD_RADIUS - 1, newX));
    const clampedZ = Math.max(-WORLD_RADIUS + 1, Math.min(WORLD_RADIUS - 1, newZ));

    // Update position
    pos.set(clampedX, finalY, clampedZ);
    groupRef.current.position.copy(pos);

    // --- Rotation (face movement direction) ---
    if (isMoving) {
      const targetAngle = facingAngleRef.current;
      const currentAngle = groupRef.current.rotation.y;
      const diff = targetAngle - currentAngle;
      const wrappedDiff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;
      groupRef.current.rotation.y += wrappedDiff * Math.min(1, dt * 12);
    }

    // --- Wing animation ---
    const isAirborne = !isGroundedRef.current;
    if (isAirborne || isFlappingRef.current) {
      wingAnimRef.current += dt * 12;
    } else if (isMoving) {
      wingAnimRef.current += dt * 4;
    } else {
      wingAnimRef.current *= 0.9;
    }

    const wingFlap = Math.sin(wingAnimRef.current) * (isAirborne ? 0.7 : 0.2);

    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = wingFlap;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = -wingFlap;
    }

    // Tail bob
    if (tailRef.current) {
      tailRef.current.rotation.x = Math.sin(wingAnimRef.current * 0.5) * 0.15;
    }

    // Body tilt when flying
    if (bodyRef.current) {
      const targetTilt = isAirborne ? -0.2 : 0;
      bodyRef.current.rotation.x += (targetTilt - bodyRef.current.rotation.x) * dt * 5;
    }
  });

  return (
    <group ref={groupRef} position={[0, spawnY, 0]}>
      {/* Body - main blue block */}
      <mesh ref={bodyRef} position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.45, 0.6]} />
        <meshLambertMaterial color="#2563eb" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.35, 0.1]} castShadow>
        <boxGeometry args={[0.38, 0.35, 0.38]} />
        <meshLambertMaterial color="#3b82f6" />
      </mesh>

      {/* Beak */}
      <mesh position={[0, 0.3, 0.32]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.14]} />
        <meshLambertMaterial color="#f59e0b" />
      </mesh>

      {/* Left eye */}
      <mesh position={[-0.14, 0.4, 0.26]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshLambertMaterial color="#1e1e1e" />
      </mesh>

      {/* Right eye */}
      <mesh position={[0.14, 0.4, 0.26]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshLambertMaterial color="#1e1e1e" />
      </mesh>

      {/* Left wing */}
      <mesh
        ref={leftWingRef}
        position={[-0.32, 0.02, 0]}
        rotation={[0, 0, 0.2]}
        castShadow
      >
        <boxGeometry args={[0.22, 0.08, 0.45]} />
        <meshLambertMaterial color="#1d4ed8" />
      </mesh>

      {/* Right wing */}
      <mesh
        ref={rightWingRef}
        position={[0.32, 0.02, 0]}
        rotation={[0, 0, -0.2]}
        castShadow
      >
        <boxGeometry args={[0.22, 0.08, 0.45]} />
        <meshLambertMaterial color="#1d4ed8" />
      </mesh>

      {/* Tail */}
      <mesh ref={tailRef} position={[0, -0.05, -0.35]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.28, 0.08, 0.22]} />
        <meshLambertMaterial color="#1e40af" />
      </mesh>

      {/* Feet (left) */}
      <mesh position={[-0.1, -0.25, 0.05]}>
        <boxGeometry args={[0.08, 0.08, 0.14]} />
        <meshLambertMaterial color="#f59e0b" />
      </mesh>

      {/* Feet (right) */}
      <mesh position={[0.1, -0.25, 0.05]}>
        <boxGeometry args={[0.08, 0.08, 0.14]} />
        <meshLambertMaterial color="#f59e0b" />
      </mesh>

      {/* Belly (lighter blue) */}
      <mesh position={[0, -0.05, 0.22]}>
        <boxGeometry args={[0.3, 0.3, 0.08]} />
        <meshLambertMaterial color="#93c5fd" />
      </mesh>
    </group>
  );
}
