import { useState, useEffect, useCallback } from 'react';

interface AssetStatus {
  loaded: number;
  total: number;
  ready: boolean;
  errors: string[];
}

const VIDEO_BG = 'https://dl.dropbox.com/scl/fi/qxh4lv0qcydnw9str6gju/bg-alt.mp4?rlkey=caqgw260cqamexollkco4wu3p&st=we2x7r1a&dl=0';

const BASE = import.meta.env.BASE_URL;

const SFX_ASSETS = [
  `${BASE}sfx/scan-zoom.wav`,
  `${BASE}sfx/click.wav`,
  `${BASE}sfx/hint-notification.wav`,
  `${BASE}sfx/affirmation-tech.wav`,
  `${BASE}sfx/UI_menu_text_rollover.mp3`,
];

const FONT_ASSETS = [
  { family: 'SV-Tech', url: `${BASE}starvortex_assets/tech.ttf` },
  { family: 'SV-Hexaframe', url: `${BASE}starvortex_assets/Hexaframe.woff` },
];

const IMAGE_ASSETS = [
  `${BASE}starvortex_assets/fill-black-short.png`,
];

const SYMBOL_ASSETS = [
  `${BASE}starvortex_assets/exp_symbol_exposition.webm`,
  `${BASE}starvortex_assets/exp_symbol_focus.webm`,
  `${BASE}starvortex_assets/exp_symbol_mark.webm`,
  `${BASE}starvortex_assets/exp_symbol_portal.webm`,
];

const preloadAudio = (url: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.oncanplaythrough = () => resolve();
    audio.onerror = () => reject(new Error(`Audio: ${url}`));
    audio.src = url;
    setTimeout(resolve, 3000); // timeout fallback
  });

const preloadImage = (url: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Image: ${url}`));
    img.src = url;
    setTimeout(resolve, 5000);
  });

const preloadFont = (family: string, url: string): Promise<void> =>
  new Promise((resolve) => {
    const font = new FontFace(family, `url(${url})`);
    font.load().then((loaded) => {
      document.fonts.add(loaded);
      resolve();
    }).catch(() => resolve()); // Non-blocking
  });

const preloadVideo = (url: string): Promise<void> =>
  new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.oncanplaythrough = () => resolve();
    video.onerror = () => resolve(); // Non-blocking
    video.src = url;
    setTimeout(resolve, 8000); // generous timeout for video
  });

interface PreloadScreenProps {
  onReady: () => void;
  skipDelay?: number;
}

export const PreloadScreen: React.FC<PreloadScreenProps> = ({ onReady, skipDelay = 500 }) => {
  const [status, setStatus] = useState<AssetStatus>({ loaded: 0, total: 0, ready: false, errors: [] });
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), skipDelay);
    return () => clearTimeout(timer);
  }, [skipDelay]);

  const runPreload = useCallback(async () => {
    const tasks: { name: string; fn: () => Promise<void> }[] = [];

    // Fonts first (critical for UI)
    FONT_ASSETS.forEach((f) => tasks.push({ name: f.family, fn: () => preloadFont(f.family, f.url) }));

    // Images
    IMAGE_ASSETS.forEach((url) => tasks.push({ name: url, fn: () => preloadImage(url) }));

    // SFX
    SFX_ASSETS.forEach((url) => tasks.push({ name: url, fn: () => preloadAudio(url) }));

    // Video background (last, largest)
    tasks.push({ name: 'video-bg', fn: () => preloadVideo(VIDEO_BG) });

    // Symbols (non-blocking, load in background)
    SYMBOL_ASSETS.forEach((url) => tasks.push({ name: url, fn: () => preloadVideo(url) }));

    setStatus((s) => ({ ...s, total: tasks.length }));

    const errors: string[] = [];
    for (const task of tasks) {
      try {
        await task.fn();
      } catch (e) {
        errors.push(task.name);
      }
      setStatus((s) => ({ ...s, loaded: s.loaded + 1, errors }));
    }

    setStatus((s) => ({ ...s, ready: true, errors }));
  }, []);

  useEffect(() => {
    runPreload();
  }, [runPreload]);

  useEffect(() => {
    if (status.ready && canSkip) {
      const timer = setTimeout(onReady, 300);
      return () => clearTimeout(timer);
    }
  }, [status.ready, canSkip, onReady]);

  const pct = status.total > 0 ? Math.round((status.loaded / status.total) * 100) : 0;

  return (
    <div className="sv-preload">
      <div className="sv-preload-inner">
        <div className="sv-preload-logo">AETHERNET</div>
        <div className="sv-preload-subtitle">CARGANDO SISTEMA</div>
        <div className="sv-preload-bar-track">
          <div className="sv-preload-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="sv-preload-pct">{pct}%</div>
        {status.loaded > 0 && status.total > 0 && (
          <div className="sv-preload-detail">
            {status.loaded}/{status.total} ASSETS
          </div>
        )}
      </div>
    </div>
  );
};

export const usePreloader = () => {
  const [ready, setReady] = useState(false);
  return { ready, PreloadScreen: (props: Omit<PreloadScreenProps, 'onReady'>) => <PreloadScreen {...props} onReady={() => setReady(true)} /> , setReady };
};
