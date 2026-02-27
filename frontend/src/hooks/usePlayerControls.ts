import { useEffect, useRef } from 'react';

export interface PlayerControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  flap: boolean;
}

export function usePlayerControls(): React.MutableRefObject<PlayerControls> {
  const controls = useRef<PlayerControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    flap: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for game keys to avoid page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          controls.current.forward = true;
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          controls.current.backward = true;
          break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
          controls.current.left = true;
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          controls.current.right = true;
          break;
        case ' ':
          controls.current.flap = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          controls.current.forward = false;
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          controls.current.backward = false;
          break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
          controls.current.left = false;
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          controls.current.right = false;
          break;
        case ' ':
          controls.current.flap = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return controls;
}
