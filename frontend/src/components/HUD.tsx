import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

interface HUDProps {
  birdPositionRef: React.MutableRefObject<THREE.Vector3>;
}

export default function HUD({ birdPositionRef }: HUDProps) {
  const [pos, setPos] = useState({ x: 0, y: 0, z: 0 });
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      const p = birdPositionRef.current;
      setPos({
        x: Math.round(p.x * 10) / 10,
        y: Math.round(p.y * 10) / 10,
        z: Math.round(p.z * 10) / 10,
      });
      animFrameRef.current = requestAnimationFrame(update);
    };
    animFrameRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [birdPositionRef]);

  return (
    <div className="hud-overlay">
      {/* Controls panel - bottom left */}
      <div className="hud-panel hud-controls">
        <div className="hud-title">🐦 CONTROLS</div>
        <div className="hud-row">
          <span className="hud-key">W A S D</span>
          <span className="hud-label">Move</span>
        </div>
        <div className="hud-row">
          <span className="hud-key">↑ ↓ ← →</span>
          <span className="hud-label">Move</span>
        </div>
        <div className="hud-row">
          <span className="hud-key">SPACE</span>
          <span className="hud-label">Flap / Fly</span>
        </div>
      </div>

      {/* Position display - top right */}
      <div className="hud-panel hud-coords">
        <div className="hud-title">📍 POSITION</div>
        <div className="hud-coord-row">
          <span className="hud-axis x-axis">X</span>
          <span className="hud-value">{pos.x}</span>
        </div>
        <div className="hud-coord-row">
          <span className="hud-axis y-axis">Y</span>
          <span className="hud-value">{pos.y}</span>
        </div>
        <div className="hud-coord-row">
          <span className="hud-axis z-axis">Z</span>
          <span className="hud-value">{pos.z}</span>
        </div>
      </div>

      {/* Game title - top center */}
      <div className="hud-game-title">
        🐦 BlueBirdCraft
      </div>
    </div>
  );
}
