import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SkyScene() {
  const sunRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      {/* Sky background color */}
      <color attach="background" args={['#87CEEB']} />

      {/* Fog for depth */}
      <fog attach="fog" args={['#87CEEB', 30, 120]} />

      {/* Ambient light */}
      <ambientLight intensity={0.6} color="#fff8e7" />

      {/* Sun directional light */}
      <directionalLight
        ref={sunRef}
        position={[50, 80, 30]}
        intensity={1.4}
        color="#fff8e7"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />

      {/* Hemisphere light for sky/ground color */}
      <hemisphereLight args={['#87CEEB', '#5a8a3c', 0.4]} />

      {/* Clouds */}
      <Cloud position={[-15, 25, -20]} />
      <Cloud position={[10, 28, -30]} />
      <Cloud position={[25, 22, -10]} />
      <Cloud position={[-5, 30, 15]} />
    </>
  );
}

function Cloud({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[4, 1.5, 2]} />
        <meshLambertMaterial color="white" />
      </mesh>
      <mesh position={[-1.5, 0.5, 0]}>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshLambertMaterial color="white" />
      </mesh>
      <mesh position={[1.5, 0.5, 0]}>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshLambertMaterial color="white" />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2.5, 1.2, 1.8]} />
        <meshLambertMaterial color="white" />
      </mesh>
    </group>
  );
}
