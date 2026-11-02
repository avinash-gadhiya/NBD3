import { useEffect, useRef, useState } from 'react';
import { createMusicController, initialMusicState } from '../lib/musicController.js';

export function useMusicPlayer() {
  const audioRef = useRef(null);
  const controller = useRef(null);
  const [music, setMusic] = useState(initialMusicState);

  useEffect(() => {
    const player = createMusicController(audioRef.current, setMusic);
    controller.current = player;
    return () => { player.destroy(); controller.current = null; };
  }, []);

  const actions = useRef(new Proxy({}, {
    get: (_, name) => (...args) => controller.current?.[name]?.(...args),
  })).current;

  return { audioRef, music, actions };
}
