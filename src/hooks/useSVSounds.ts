import { useRef, useCallback } from 'react';

export type SFXKey =
  | 'click'
  | 'click2'
  | 'click3'
  | 'click4'
  | 'click5'
  | 'click6'
  | 'hover'
  | 'scan'
  | 'hint'
  | 'affirmation'
  | 'nock'
  | 'scrollwheel'
  | 'takeout';

const BASE = import.meta.env.BASE_URL ?? '/';

const SFX_FILES: Record<SFXKey, string> = {
  click: 'sfx/click.wav',
  click2: 'sfx/Click_2.wav',
  click3: 'sfx/Click3.wav',
  click4: 'sfx/Click4.wav',
  click5: 'sfx/Click5.wav',
  click6: 'sfx/Click6.wav',
  hover: 'sfx/UI_menu_text_rollover.mp3',
  scan: 'sfx/scan-zoom.wav',
  hint: 'sfx/hint-notification.wav',
  affirmation: 'sfx/affirmation-tech.wav',
  nock: 'sfx/nock.wav',
  scrollwheel: 'sfx/scrollwheel.wav',
  takeout: 'sfx/takeout-click.wav',
};

export const useSVSounds = () => {
  const cache = useRef<Map<SFXKey, HTMLAudioElement>>(new Map());

  const createAudio = useCallback((key: SFXKey): HTMLAudioElement => {
    const file = SFX_FILES[key];
    const audio = new Audio(`${BASE}${file}`);
    audio.preload = 'auto';
    return audio;
  }, []);

  const preload = useCallback(
    (key: SFXKey) => {
      if (!cache.current.has(key)) {
        cache.current.set(key, createAudio(key));
      }
    },
    [createAudio],
  );

  const play = useCallback(
    (key: SFXKey, volume = 0.5) => {
      if (!cache.current.has(key)) {
        preload(key);
      }

      const audio = cache.current.get(key);
      if (!audio) return;

      audio.volume = Math.min(1, Math.max(0, volume));
      audio.currentTime = 0;

      audio.play().catch(() => {});
    },
    [preload],
  );

  const stop = useCallback((key: SFXKey) => {
    const audio = cache.current.get(key);
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  }, []);

  const preloadAll = useCallback(() => {
    (Object.keys(SFX_FILES) as SFXKey[]).forEach(preload);
  }, [preload]);

  return { play, preload, preloadAll, stop };
};