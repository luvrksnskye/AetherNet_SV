import { useRef, useCallback } from 'react';

interface SoundEffects {
  scan: string;
  click: string;
  hint: string;
  affirmation: string;
  hover: string;
}

const defaultSounds: SoundEffects = {
  scan: '/src/sfx/scan-zoom.wav',
  click: '/src/sfx/click.wav',
  hint: '/src/sfx/hint-notification.wav',
  affirmation: '/src/sfx/affirmation-tech.wav',
  hover: '/src/sfx/UI_menu_text_rollover.mp3',
};

export const useAetherNetSounds = (customSounds?: Partial<SoundEffects>) => {
  const sounds = { ...defaultSounds, ...customSounds };
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  const preloadSound = useCallback((soundKey: keyof SoundEffects) => {
    if (!audioCache.current.has(soundKey)) {
      const audio = new Audio(sounds[soundKey]);
      audio.preload = 'auto';
      audioCache.current.set(soundKey, audio);
    }
  }, [sounds]);

  const playSound = useCallback((soundKey: keyof SoundEffects, volume: number = 0.5) => {
    try {
      if (!audioCache.current.has(soundKey)) {
        preloadSound(soundKey);
      }
      
      const audio = audioCache.current.get(soundKey);
      if (audio) {
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Silenciar errores de autoplay
        });
      }
    } catch (error) {
      console.warn(`Error playing sound: ${soundKey}`, error);
    }
  }, [preloadSound]);

  const stopSound = useCallback((soundKey: keyof SoundEffects) => {
    const audio = audioCache.current.get(soundKey);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const stopAllSounds = useCallback(() => {
    audioCache.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  return {
    playSound,
    stopSound,
    stopAllSounds,
    preloadSound,
  };
};
