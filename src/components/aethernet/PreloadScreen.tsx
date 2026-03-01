import { useState, useEffect, useRef, useCallback } from "react";

interface AssetStatus {
  loaded: number;
  total: number;
  ready: boolean;
  errors: string[];
}

const VIDEO_BG =
  "https://dl.dropbox.com/scl/fi/qxh4lv0qcydnw9str6gju/bg-alt.mp4?rlkey=caqgw260cqamexollkco4wu3p&st=we2x7r1a&dl=0";

const BASE = import.meta.env.BASE_URL;

const SFX_ASSETS = [
  `${BASE}sfx/scan-zoom.wav`,
  `${BASE}sfx/click.wav`,
  `${BASE}sfx/hint-notification.wav`,
  `${BASE}sfx/affirmation-tech.wav`,
  `${BASE}sfx/UI_menu_text_rollover.mp3`,
];

const FONT_ASSETS = [
  { family: "SV-Tech", url: `${BASE}starvortex_assets/tech.ttf` },
  { family: "SV-Hexaframe", url: `${BASE}starvortex_assets/Hexaframe.woff` },
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

/* -------------------- HELPERS -------------------- */

const withTimeout = (promise: Promise<void>, ms: number) =>
  Promise.race([
    promise,
    new Promise<void>((resolve) => setTimeout(resolve, ms)),
  ]);

const preloadAudio = (url: string) =>
  withTimeout(
    new Promise<void>((resolve, reject) => {
      const audio = new Audio();
      audio.preload = "metadata"; // más ligero
      audio.onloadeddata = () => resolve();
      audio.onerror = () => reject();
      audio.src = url;
    }),
    4000
  );

const preloadImage = (url: string) =>
  withTimeout(
    new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = url;
    }),
    5000
  );

const preloadFont = (family: string, url: string) =>
  withTimeout(
    new Promise<void>((resolve) => {
      const font = new FontFace(family, `url(${url})`);
      font.load().then((loaded) => {
        document.fonts.add(loaded);
        resolve();
      }).catch(resolve);
    }),
    4000
  );

const preloadVideo = (url: string) =>
  withTimeout(
    new Promise<void>((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata"; // NO usar auto
      video.muted = true;
      video.onloadeddata = () => resolve();
      video.onerror = () => resolve();
      video.src = url;
    }),
    6000
  );

/* -------------------- COMPONENT -------------------- */

interface PreloadScreenProps {
  onReady: () => void;
  minimumDuration?: number;
}

export const PreloadScreen: React.FC<PreloadScreenProps> = ({
  onReady,
  minimumDuration = 1200,
}) => {
  const [status, setStatus] = useState<AssetStatus>({
    loaded: 0,
    total: 0,
    ready: false,
    errors: [],
  });

  const started = useRef(false);

  const runPreload = useCallback(async () => {
    const tasks: { name: string; fn: () => Promise<void> }[] = [];

    FONT_ASSETS.forEach((f) =>
      tasks.push({ name: f.family, fn: () => preloadFont(f.family, f.url) })
    );

    IMAGE_ASSETS.forEach((url) =>
      tasks.push({ name: url, fn: () => preloadImage(url) })
    );

    SFX_ASSETS.forEach((url) =>
      tasks.push({ name: url, fn: () => preloadAudio(url) })
    );

    tasks.push({ name: "video-bg", fn: () => preloadVideo(VIDEO_BG) });

    SYMBOL_ASSETS.forEach((url) =>
      tasks.push({ name: url, fn: () => preloadVideo(url) })
    );

    setStatus((s) => ({ ...s, total: tasks.length }));

    const errors: string[] = [];

    await Promise.all(
      tasks.map(async (task) => {
        try {
          await task.fn();
        } catch {
          errors.push(task.name);
        }

        setStatus((s) => ({
          ...s,
          loaded: s.loaded + 1,
          errors,
        }));
      })
    );

    setStatus((s) => ({
      ...s,
      ready: true,
      errors,
    }));
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    runPreload();
  }, [runPreload]);

  useEffect(() => {
    if (!status.ready) return;

    const timer = setTimeout(() => {
      onReady();
    }, minimumDuration);

    return () => clearTimeout(timer);
  }, [status.ready, onReady, minimumDuration]);

  const pct =
    status.total > 0
      ? Math.round((status.loaded / status.total) * 100)
      : 0;

  return (
    <div className="sv-preload">
      <div className="sv-preload-inner">
        <div className="sv-preload-logo">AETHERNET</div>
        <div className="sv-preload-subtitle">CARGANDO SISTEMA</div>

        <div className="sv-preload-bar-track">
          <div
            className="sv-preload-bar-fill"
            style={{ width: `${pct}%` }}
          />
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

/* -------------------- HOOK -------------------- */

export const usePreloader = () => {
  const [ready, setReady] = useState(false);

  const Screen = (props: Omit<PreloadScreenProps, "onReady">) => (
    <PreloadScreen {...props} onReady={() => setReady(true)} />
  );

  return { ready, PreloadScreen: Screen, setReady };
};