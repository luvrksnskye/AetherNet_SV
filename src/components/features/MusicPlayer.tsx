import { useState, useEffect, useRef, useCallback } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { extractYouTubePlaylistId } from '../../utils';

const DEFAULT_PLAYLIST = 'PLbpytgpi11WrGll_ECsRn6W4Zg1zwr0U_';
const STORAGE_KEY = 'music:config';

interface PlayerConfig { playlistId: string; collapsed: boolean; }
interface TrackInfo { title: string; channel: string; }
interface MusicPlayerProps { onSound: (key: 'click' | 'hover') => void; }

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ onSound }) => {
  const storage = useStorage();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [config, setConfig] = useState<PlayerConfig>({ playlistId: DEFAULT_PLAYLIST, collapsed: true });
  const [editing, setEditing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState<TrackInfo | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await storage.get<PlayerConfig>(STORAGE_KEY);
      if (saved) setConfig(saved);
    })();
  }, [storage]);

  const saveConfig = useCallback(async (updates: Partial<PlayerConfig>) => {
    const next = { ...config, ...updates };
    setConfig(next);
    await storage.set(STORAGE_KEY, next);
  }, [config, storage]);

  // Listen for YouTube postMessage events to get video info
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        if (typeof e.data !== 'string') return;
        const data = JSON.parse(e.data);
        if (data.event === 'infoDelivery' && data.info?.videoData) {
          const vd = data.info.videoData;
          if (vd.title) setTrack({ title: vd.title, channel: vd.author || '' });
        }
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handlePlaylistChange = () => {
    const id = extractYouTubePlaylistId(urlInput);
    if (id) {
      saveConfig({ playlistId: id });
      setEditing(false);
      setUrlInput('');
      setPlaying(false);
      setTrack(null);
      onSound('click');
    }
  };

  const toggleCollapse = () => { onSound('click'); saveConfig({ collapsed: !config.collapsed }); };

  const togglePlay = () => {
    onSound('click');
    if (playing) { setPlaying(false); setTrack(null); }
    else { setPlaying(true); }
  };

  const embedUrl = playing
    ? `https://www.youtube.com/embed/videoseries?list=${config.playlistId}&autoplay=1&loop=1&shuffle=1&modestbranding=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`
    : '';

  return (
    <div className={`sv-music-player ${config.collapsed ? 'collapsed' : ''}`}>
      <div className="sv-music-header" onClick={toggleCollapse}>
        <div className="sv-music-header-left">
          <span className={`sv-music-indicator ${playing ? 'active' : ''}`} />
          {playing && track ? (
            <div className="sv-music-now-playing">
              <span className="sv-music-track-title">{track.title}</span>
              {track.channel && <span className="sv-music-track-channel">{track.channel}</span>}
            </div>
          ) : (
            <span className="sv-music-title">{playing ? 'REPRODUCIENDO...' : 'REPRODUCTOR'}</span>
          )}
        </div>
        <button className="sv-music-toggle" onClick={(e) => { e.stopPropagation(); toggleCollapse(); }} onMouseEnter={() => onSound('hover')}>
          {config.collapsed ? '\u25B2' : '\u25BC'}
        </button>
      </div>

      {!config.collapsed && (
        <div className="sv-music-body">
          {playing && track && (
            <div className="sv-music-track-info">
              <div className="sv-music-eq">
                <span className="sv-eq-bar" /><span className="sv-eq-bar" /><span className="sv-eq-bar" /><span className="sv-eq-bar" /><span className="sv-eq-bar" />
              </div>
              <div className="sv-music-track-details">
                <span className="sv-music-track-name">{track.title}</span>
                <span className="sv-music-track-artist">{track.channel}</span>
              </div>
            </div>
          )}

          <div className="sv-music-controls">
            <button className={`sv-music-btn ${playing ? 'sv-btn-danger' : 'sv-btn-success'}`} onClick={togglePlay} onMouseEnter={() => onSound('hover')}>
              {playing ? '\u25A0 DETENER' : '\u25B6 REPRODUCIR'}
            </button>
            <button className="sv-music-btn" onClick={() => { setEditing(!editing); onSound('click'); }} onMouseEnter={() => onSound('hover')}>
              {editing ? '\u2715 CANCELAR' : '\u270E PLAYLIST'}
            </button>
          </div>

          {editing && (
            <div className="sv-music-edit">
              <div className="sv-field">
                <div className="sv-field-label"><span>URL DE PLAYLIST DE YOUTUBE</span></div>
                <div className="sv-input-wrap">
                  <input className="sv-input" type="text" placeholder="https://youtube.com/playlist?list=..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePlaylistChange()} />
                </div>
              </div>
              <button className="sv-music-btn sv-btn-success" onClick={handlePlaylistChange} disabled={!extractYouTubePlaylistId(urlInput)} onMouseEnter={() => onSound('hover')}>APLICAR</button>
            </div>
          )}

          {/* Iframe oculto - solo audio */}
          {playing && (
            <div className="sv-music-iframe-hide">
              <iframe ref={iframeRef} src={embedUrl} title="AetherNet Music" allow="autoplay; encrypted-media" allowFullScreen={false} className="sv-music-iframe" width="1" height="1" />
            </div>
          )}

          <div className="sv-music-info">
            <span>PLAYLIST: {config.playlistId.slice(0, 20)}...</span>
          </div>
        </div>
      )}
    </div>
  );
};
