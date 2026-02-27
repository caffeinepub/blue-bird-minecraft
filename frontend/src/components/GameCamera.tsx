import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface GameCameraProps {
  birdPositionRef: React.MutableRefObject<THREE.Vector3>;
}

const CAMERA_OFFSET = new THREE.Vector3(0, 5, 10);
const CAMERA_LERP = 8;

export default function GameCamera({ birdPositionRef }: GameCameraProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const lookAtTarget = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const birdPos = birdPositionRef.current;
    const dt = Math.min(delta, 0.05);

    // Desired camera position: behind and above the bird
    const desired = new THREE.Vector3(
      birdPos.x + CAMERA_OFFSET.x,
      birdPos.y + CAMERA_OFFSET.y,
      birdPos.z + CAMERA_OFFSET.z
    );

    // Smooth camera follow
    targetPos.current.lerp(desired, Math.min(1, dt * CAMERA_LERP));
    camera.position.copy(targetPos.current);

    // Look at bird (slightly above center)
    lookAtTarget.current.lerp(
      new THREE.Vector3(birdPos.x, birdPos.y + 0.5, birdPos.z),
      Math.min(1, dt * CAMERA_LERP)
    );
    camera.lookAt(lookAtTarget.current);
  });

  return null;
}
