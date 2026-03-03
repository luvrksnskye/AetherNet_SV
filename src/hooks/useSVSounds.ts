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

/**
 * We try the public/ path first.
 * Vite's BASE_URL defaults to '/' in dev and can be customised for deploys.
 */
const BASE = import.meta.env.BASE_URL ?? '/';

/**
 * Fallback prefix if the file isn't found in public/sfx/.
 * In Vite dev-server, /src/ is accessible because the server serves
 * the project root. This will NOT work after `vite build`.
 */
const FALLBACK = '/src/';

const SFX_FILES: Record<SFXKey, string> = {
  click: '../sfx/click.wav',
  click2: '../sfx/Click_2.wav',
  click3: '../sfx/Click3.wav',
  click4: '../sfx/Click4.wav',
  click5: '../sfx/Click5.wav',
  click6: '../sfx/Click6.wav',
  hover: '../sfx/UI_menu_text_rollover.mp3',
  scan: '../sfx/scan-zoom.wav',
  hint: '../sfx/hint-notification.wav',
  affirmation: '../sfx/affirmation-tech.wav',
  nock: '../sfx/nock.wav',
  scrollwheel: '../sfx/scrollwheel.wav',
  takeout: '../sfx/takeout-click.wav',
};

export const useSVSounds = () => {
  const cache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const failedPrimary = useRef<Set<string>>(new Set());

  /**
   * Creates an Audio element and attaches an error handler that
   * retries with the fallback /src/ prefix once.
   */
  const createAudio = useCallback((key: SFXKey): HTMLAudioElement => {
    const file = SFX_FILES[key];

    /* If primary already failed for this key, go straight to fallback */
    const src = failedPrimary.current.has(key)
      ? `${FALLBACK}${file}`
      : `${BASE}${file}`;

    const audio = new Audio(src);
    audio.preload = 'auto';

    /* One-time error handler: swap to fallback path */
    const onError = () => {
      if (!failedPrimary.current.has(key)) {
        failedPrimary.current.add(key);
        const fallbackSrc = `${FALLBACK}${file}`;
        audio.src = fallbackSrc;
        audio.load();
      }
      audio.removeEventListener('error', onError);
    };
    audio.addEventListener('error', onError);

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
      try {
        if (!cache.current.has(key)) preload(key);
        const audio = cache.current.get(key);
        if (audio) {
          audio.volume = Math.min(1, Math.max(0, volume));
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      } catch {
        /* silent */
      }
    },
    [preload],
  );

  const stop = useCallback((key: SFXKey) => {
    const audio = cache.current.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const preloadAll = useCallback(() => {
    (Object.keys(SFX_FILES) as SFXKey[]).forEach(preload);
  }, [preload]);

  return { play, preload, preloadAll, stop };
};
