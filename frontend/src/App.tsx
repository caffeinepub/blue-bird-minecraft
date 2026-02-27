import { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import World from './components/World';
import Bird from './components/Bird';
import GameCamera from './components/GameCamera';
import SkyScene from './components/SkyScene';
import HUD from './components/HUD';
import TitleScreen from './components/TitleScreen';

export type GameState = 'title' | 'playing';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('title');
  const birdPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 5, 0));

  const handlePlay = () => {
    setGameState('playing');
  };

  return (
    <div className="game-root">
      {gameState === 'title' && <TitleScreen onPlay={handlePlay} />}
      {gameState === 'playing' && (
        <div className="game-container">
          <Canvas
            shadows
            camera={{ fov: 70, near: 0.1, far: 500, position: [0, 8, 12] }}
            gl={{ antialias: true }}
            style={{ width: '100vw', height: '100vh', display: 'block' }}
          >
            <SkyScene />
            <World />
            <Bird birdPositionRef={birdPositionRef} />
            <GameCamera birdPositionRef={birdPositionRef} />
          </Canvas>
          <HUD birdPositionRef={birdPositionRef} />
        </div>
      )}
    </div>
  );
}
