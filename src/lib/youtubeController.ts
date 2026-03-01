let player: YT.Player | null = null;
let ready = false;
let currentPlaylist: string | null = null;
let readyResolve: (() => void) | null = null;
const readyPromise = new Promise<void>((resolve) => { readyResolve = resolve; });

let subscribers: ((info: { title: string; author: string }) => void)[] = [];

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

const notify = (info: { title: string; author: string }) => {
  subscribers.forEach((fn) => fn(info));
};

export const subscribeToTrack = (
  fn: (info: { title: string; author: string }) => void
) => {
  subscribers.push(fn);
  return () => { subscribers = subscribers.filter((f) => f !== fn); };
};

const loadAPI = () =>
  new Promise<void>((resolve) => {
    if (window.YT && window.YT.Player) { resolve(); return; }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve();
  });

export const initYouTubePlayer = async (playlistId: string) => {
  await loadAPI();
  if (player) return;

  player = new window.YT.Player('yt-global-player', {
    height: '0',
    width: '0',
    playerVars: {
      listType: 'playlist',
      list: playlistId,
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
      loop: 1,
    },
    events: {
      onReady: (e: YT.PlayerEvent) => {
        ready = true;
        e.target.setVolume(25);
        if (readyResolve) readyResolve();
      },
      onStateChange: () => {
        if (!player) return;
        const data = player.getVideoData();
        if (data?.title) notify({ title: data.title, author: data.author });
      },
    },
  });

  currentPlaylist = playlistId;
};

/** Resolves when the YT player fires its onReady callback */
export const waitForReady = () => readyPromise;

export const isReady = () => ready;

export const loadPlaylist = (playlistId: string) => {
  if (!player || !ready) return;
  if (playlistId === currentPlaylist) return;
  player.loadPlaylist({ list: playlistId });
  currentPlaylist = playlistId;
};

export const togglePlayback = () => {
  if (!player || !ready) return;
  const state = player.getPlayerState();
  if (state === window.YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
};

export const isPlaying = () => {
  if (!player || !ready) return false;
  return player.getPlayerState() === window.YT.PlayerState.PLAYING;
};
