import { useRef, useCallback } from 'react';

type SFXKey = 'scan' | 'click' | 'hint' | 'affirmation' | 'hover';

const SFX_MAP: Record<SFXKey, string> = {
  scan: '/src/sfx/scan-zoom.wav',
  click: '/src/sfx/click.wav',
  hint: '/src/sfx/hint-notification.wav',
  affirmation: '/src/sfx/affirmation-tech.wav',
  hover: '/src/sfx/UI_menu_text_rollover.mp3',
};

export const useSVSounds = () => {
  const cache = useRef<Map<string, HTMLAudioElement>>(new Map());

  const preload = useCallback((key: SFXKey) => {
    if (!cache.current.has(key)) {
      const audio = new Audio(SFX_MAP[key]);
      audio.preload = 'auto';
      cache.current.set(key, audio);
    }
  }, []);

  const play = useCallback((key: SFXKey, volume = 0.5) => {
    try {
      if (!cache.current.has(key)) preload(key);
      const audio = cache.current.get(key);
      if (audio) {
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    } catch {}
  }, [preload]);

  return { play, preload };
};
