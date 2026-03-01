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

type SoundType = "click" | "hover";

interface MusicPlayerProps {
  onSound: (type: SoundType) => void;
}

const DEFAULT_PLAYLIST = "PLbpytgpi11WrGll_ECsRn6W4Zg1zwr0U_";
const STORAGE_KEY = "music:config";

interface PlayerConfig {
  playlistId: string;
  collapsed: boolean;
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

  const toggleCollapse = async () => {
    onSound("click");
    await saveConfig({ collapsed: !config.collapsed });
  };

  const togglePlay = () => {
    onSound("click");
    togglePlayback();
    setPlaying(isPlaying());
  };

  const handlePlaylistChange = async () => {
    const id = extractYouTubePlaylistId(urlInput);
    if (!id) return;

    await saveConfig({ playlistId: id });
    loadPlaylist(id);

    setEditing(false);
    setUrlInput("");
  };

  return (
    <div className={`sv-music-player ${config.collapsed ? "collapsed" : ""}`}>
      {/* HEADER */}
      <div className="sv-music-header" onClick={toggleCollapse}>
        <div className="sv-music-header-left">
          <div
            className={`sv-music-indicator ${playing ? "active" : ""}`}
          />
          <div className="sv-music-title">
            {track ? track.title.toUpperCase() : "REPRODUCTOR"}
          </div>
        </div>

        <button
          className="sv-music-toggle"
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse();
          }}
        >
          {config.collapsed ? "▲" : "▼"}
        </button>
      </div>

      {/* BODY */}
      {!config.collapsed && (
        <div className="sv-music-body">
          <div className="sv-music-controls">
            <button
              className={`sv-music-btn ${
                playing ? "sv-btn-danger" : "sv-btn-success"
              }`}
              onClick={togglePlay}
            >
              {playing ? "STOP" : "PLAY"}
            </button>

            <button
              className="sv-music-btn"
              onClick={() => {
                onSound("click");
                setEditing(!editing);
              }}
            >
              PLAYLIST
            </button>
          </div>

          {editing && (
            <div className="sv-music-edit">
              <input
                type="text"
                placeholder="https://youtube.com/playlist?list=..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />

              <button
                className="sv-music-btn"
                onClick={handlePlaylistChange}
              >
                APPLY
              </button>
            </div>
          )}

          {track && (
            <div className="sv-music-info">
              {track.author}
            </div>
          )}
        </div>
      )}
    </div>
  );
};