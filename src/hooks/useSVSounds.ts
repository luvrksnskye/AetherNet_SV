import { useRef, useCallback } from 'react';

type SFXKey = 'scan' | 'click' | 'hint' | 'affirmation' | 'hover';
const BASE = import.meta.env.BASE_URL;
const SFX_MAP: Record<SFXKey, string> = {
  scan: `${BASE}sfx/scan-zoom.wav`,
  click: `${BASE}sfx/click.wav`,
  hint: `${BASE}sfx/hint-notification.wav`,
  affirmation: `${BASE}sfx/affirmation-tech.wav`,
  hover: `${BASE}sfx/UI_menu_text_rollover.mp3`,
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
      if (audio) { audio.volume = volume; audio.currentTime = 0; audio.play().catch(() => {}); }
    } catch {}
  }, [preload]);

  return { play, preload };
};
