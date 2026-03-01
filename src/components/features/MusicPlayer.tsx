import { useState, useEffect } from "react";
import { useStorage } from "../../hooks/useStorage";
import {
  initYouTubePlayer,
  loadPlaylist,
  togglePlayback,
  subscribeToTrack,
  isPlaying,
} from "../../lib/youtubeController";
import { extractYouTubePlaylistId } from "../../utils";

const DEFAULT_PLAYLIST = "PLbpytgpi11WrGll_ECsRn6W4Zg1zwr0U_";
const STORAGE_KEY = "music:config";

interface PlayerConfig {
  playlistId: string;
  collapsed: boolean;
}

type SoundType = "click" | "hover";

interface MusicPlayerProps {
  onSound: (type: SoundType) => void;
}
export const MusicPlayer = ({ onSound }: MusicPlayerProps) => {
  const storage = useStorage();

  const [config, setConfig] = useState<PlayerConfig>({
    playlistId: DEFAULT_PLAYLIST,
    collapsed: true,
  });

  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState<{ title: string; author: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  useEffect(() => {
    (async () => {
      const saved = await storage.get<PlayerConfig>(STORAGE_KEY);
      const playlist = saved?.playlistId || DEFAULT_PLAYLIST;

      setConfig({
        playlistId: playlist,
        collapsed: saved?.collapsed ?? true,
      });

      await initYouTubePlayer(playlist);
      setPlaying(isPlaying());
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTrack((info) => {
      setTrack(info);
    });

    return unsubscribe;
  }, []);

  const saveConfig = async (updates: Partial<PlayerConfig>) => {
    const next = { ...config, ...updates };
    setConfig(next);
    await storage.set(STORAGE_KEY, next);
  };

  const handlePlaylistChange = async () => {
    const id = extractYouTubePlaylistId(urlInput);
    if (!id) return;

    await saveConfig({ playlistId: id });
    loadPlaylist(id);
    setEditing(false);
    setUrlInput("");
  };

  const togglePlay = () => {
    onSound("click");
    togglePlayback();
    setPlaying(isPlaying());
  };

  return (
    <div className={`sv-music-player ${config.collapsed ? "collapsed" : ""}`}>
      <div className="sv-music-header">
        {track ? (
          <div>
            <div>{track.title}</div>
            <div style={{ opacity: 0.6 }}>{track.author}</div>
          </div>
        ) : (
          <span>REPRODUCTOR</span>
        )}
      </div>

      <div className="sv-music-body">
        <button onClick={togglePlay}>
          {playing ? "■ DETENER" : "> REPRODUCIR"}
        </button>

        <button onClick={() => setEditing(!editing)}>
          {editing ? "CANCELAR" : "PLAYLIST"}
        </button>

        {editing && (
          <div>
            <input
              type="text"
              placeholder="https://youtube.com/playlist?list=..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <button onClick={handlePlaylistChange}>APLICAR</button>
          </div>
        )}
      </div>
    </div>
  );
};