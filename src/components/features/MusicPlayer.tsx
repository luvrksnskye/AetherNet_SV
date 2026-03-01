import { useState, useEffect, useRef } from 'react';
import { useStorage } from '../../hooks/useStorage';
import {
  initYouTubePlayer,
  waitForReady,
  loadPlaylist,
  togglePlayback,
  subscribeToTrack,
  isPlaying,
  isReady,
} from '../../lib/youtubeController';
import { extractYouTubePlaylistId } from '../../utils';

type SoundType = 'click' | 'hover';
interface MusicPlayerProps { onSound: (type: SoundType) => void; }

const DEFAULT_PLAYLIST = 'PLbpytgpi11WrGll_ECsRn6W4Zg1zwr0U_';
const STORAGE_KEY = 'music:config';

interface PlayerConfig { playlistId: string; collapsed: boolean; }

export const MusicPlayer = ({ onSound }: MusicPlayerProps) => {
  const storage = useStorage();
  const initRef = useRef(false);
  const [config, setConfig] = useState<PlayerConfig>({ playlistId: DEFAULT_PLAYLIST, collapsed: true });
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState<{ title: string; author: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const saved = storage.get<PlayerConfig>(STORAGE_KEY);
    const playlist = saved?.playlistId || DEFAULT_PLAYLIST;
    setConfig({ playlistId: playlist, collapsed: saved?.collapsed ?? true });
    if (isReady()) { setReady(true); setPlaying(isPlaying()); return; }
    initYouTubePlayer(playlist).catch(() => {});
    waitForReady().then(() => { setReady(true); setPlaying(isPlaying()); });
  }, []);

  useEffect(() => { return subscribeToTrack((info) => setTrack(info)); }, []);

  const saveConfig = (updates: Partial<PlayerConfig>) => {
    const next = { ...config, ...updates };
    setConfig(next);
    storage.set(STORAGE_KEY, next);
  };

  const toggleCollapse = () => { onSound('click'); saveConfig({ collapsed: !config.collapsed }); };

  const togglePlay = () => {
    if (!ready) return;
    onSound('click');
    togglePlayback();
    setTimeout(() => setPlaying(isPlaying()), 150);
  };

  const handlePlaylistChange = () => {
    const id = extractYouTubePlaylistId(urlInput);
    if (!id) return;
    saveConfig({ playlistId: id });
    loadPlaylist(id);
    setEditing(false);
    setUrlInput('');
  };

  return (
    <div className={`sv-music-player ${config.collapsed ? 'collapsed' : ''}`}>
      <div className="sv-music-header" onClick={toggleCollapse}>
        <div className="sv-music-header-left">
          <div className={`sv-music-indicator ${playing ? 'active' : ''}`} />
          <div className="sv-music-title">{track ? track.title.toUpperCase() : 'REPRODUCTOR'}</div>
        </div>
        <button className="sv-music-toggle" onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}>
          {config.collapsed ? '\u25B2' : '\u25BC'}
        </button>
      </div>
      {!config.collapsed && (
        <div className="sv-music-body">
          <div className="sv-music-controls">
            <button className={`sv-music-btn ${playing ? 'sv-btn-danger' : 'sv-btn-success'}`} onClick={togglePlay} disabled={!ready}>
              {!ready ? 'CONECTANDO...' : playing ? 'STOP' : 'PLAY'}
            </button>
            <button className="sv-music-btn" onClick={() => { onSound('click'); setEditing(!editing); }}>PLAYLIST</button>
          </div>
          {editing && (
            <div className="sv-music-edit">
              <input type="text" placeholder="https://youtube.com/playlist?list=..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
              <button className="sv-music-btn" onClick={handlePlaylistChange}>APPLY</button>
            </div>
          )}
          {track && <div className="sv-music-info">{track.author}</div>}
        </div>
      )}
    </div>
  );
};
