import { useState, useCallback, useEffect, useRef } from 'react';
import { TokenDashboard } from '../features/TokenDashboard';
import { RoadmapDashboard } from '../features/RoadmapDashboard';
import { NotesPanel } from '../features/NotesPanel';
import { OverviewDashboard } from '../features/OverviewDashboard';
import { Stopwatch } from '../features/Stopwatch';
import { FocusTable } from '../features/FocusTable';
import { DragLists } from '../features/DragLists';
import { HexGrid } from '../features/HexGrid';
import { MusicPlayer } from '../features/MusicPlayer';
import type { DashboardView } from '../../types';
import type { SFXKey } from '../../hooks/useSVSounds';

const VIDEO_BG =
  'https://dl.dropbox.com/scl/fi/qxh4lv0qcydnw9str6gju/bg-alt.mp4?rlkey=caqgw260cqamexollkco4wu3p&st=we2x7r1a&dl=0';

interface AppShellProps {
  onSound: (key: 'click' | 'hover') => void;
  onSoundFx?: (key: SFXKey, volume?: number) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: DashboardView; label: string; icon: string }[] = [
  { id: 'overview', label: 'CENTRO', icon: '\u2302' },
  { id: 'tokens', label: 'TOKENS', icon: '\u25C9' },
  { id: 'roadmap', label: 'ROADMAP', icon: '\u2261' },
  { id: 'tools', label: 'HERRAMIENTAS', icon: '\u2699' },
  { id: 'focus', label: 'ENFOQUE', icon: '\u2637' },
  { id: 'lists', label: 'LISTAS', icon: '\u2630' },
  { id: 'hexgrid', label: 'HEXAGRID', icon: '\u2B22' },
  { id: 'notes', label: 'BITACORA', icon: '\u270E' },
];

/* SFX rotation for navigation clicks */
const NAV_CLICK_SOUNDS: SFXKey[] = ['click', 'click3', 'click5'];

export const AppShell: React.FC<AppShellProps> = ({
  onSound,
  onSoundFx,
  onLogout,
}) => {
  const [view, setView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [shellReady, setShellReady] = useState(false);
  const [viewTransition, setViewTransition] = useState<'entering' | 'idle'>(
    'idle',
  );
  const navClickIdx = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setShellReady(true);
      });
    });
  }, []);

  const playFx = useCallback(
    (key: SFXKey, volume?: number) => {
      if (onSoundFx) onSoundFx(key, volume);
      else if (key === 'click' || key === 'hover') onSound(key);
    },
    [onSound, onSoundFx],
  );

  const navigate = useCallback(
    (v: DashboardView) => {
      if (v === view) return;

      /* Play a rotating click variant */
      const sfx = NAV_CLICK_SOUNDS[navClickIdx.current % NAV_CLICK_SOUNDS.length];
      navClickIdx.current++;
      playFx(sfx, 0.4);

      /* Start exit transition */
      setViewTransition('entering');

      /* Scroll body to top */
      if (bodyRef.current) {
        bodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }

      /* Swap view after a short delay to let exit anim play */
      requestAnimationFrame(() => {
        setTimeout(() => {
          setView(v);
          /* Let entering anim begin */
          requestAnimationFrame(() => {
            setTimeout(() => setViewTransition('idle'), 50);
          });
        }, 180);
      });
    },
    [view, playFx],
  );

  const renderContent = () => {
    switch (view) {
      case 'tokens':
        return <TokenDashboard onSound={onSound} />;
      case 'roadmap':
        return <RoadmapDashboard onSound={onSound} />;
      case 'notes':
        return <NotesPanel onSound={onSound} />;
      case 'tools':
        return <Stopwatch onSound={onSound} />;
      case 'focus':
        return <FocusTable onSound={onSound} />;
      case 'lists':
        return <DragLists onSound={onSound} />;
      case 'hexgrid':
        return <HexGrid onSound={onSound} onSoundFx={onSoundFx ? (k, v) => playFx(k, v) : undefined} />;
      case 'overview':
      default:
        return (
          <OverviewDashboard
            onSound={onSound}
            onNavigate={(v) => navigate(v as DashboardView)}
          />
        );
    }
  };

  return (
    <div className="sv-shell">
      <div className="sv-video-bg">
        <video autoPlay muted loop playsInline>
          <source src={VIDEO_BG} type="video/mp4" />
        </video>
        <div className="sv-video-overlay" />
      </div>

      <div className="sv-pattern-bg" />
      <div className="sv-scanline" />

      <div className="sv-shell-layout">
        <aside className={`sv-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
          <div className="sv-sidebar-header">
            <div className="sv-sidebar-brand">
              <span className="sv-dash-logo">AN</span>
              {sidebarOpen && (
                <span className="sv-sidebar-brand-text">AETHERNET</span>
              )}
            </div>
            <button
              className="sv-sidebar-toggle"
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                playFx('click2', 0.35);
              }}
              onMouseEnter={() => playFx('hover', 0.15)}
            >
              {sidebarOpen ? '\u25C0' : '\u25B6'}
            </button>
          </div>

          <nav className="sv-sidebar-nav">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item.id}
                className={`sv-sidebar-item ${view === item.id ? 'active' : ''}`}
                style={
                  { '--nav-index': i } as React.CSSProperties
                }
                onClick={() => navigate(item.id)}
                onMouseEnter={() => playFx('hover', 0.12)}
                title={item.label}
              >
                <span className="sv-sidebar-icon">{item.icon}</span>
                {sidebarOpen && (
                  <span className="sv-sidebar-label">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="sv-sidebar-footer">
            <div className="sv-sidebar-user">
              <div className="sv-sidebar-avatar">RD</div>
              {sidebarOpen && (
                <div className="sv-sidebar-user-info">
                  <span className="sv-sidebar-username">REGREDANGER</span>
                  <span className="sv-sidebar-role">OPERATIVO</span>
                </div>
              )}
            </div>
            <button
              className="sv-sidebar-logout"
              onClick={() => {
                playFx('takeout', 0.4);
                onLogout();
              }}
              onMouseEnter={() => playFx('hover', 0.15)}
            >
              {sidebarOpen ? 'DESCONECTAR' : '\u23FB'}
            </button>
          </div>
        </aside>

        <main className="sv-shell-content">
          <div className="sv-shell-topbar">
            <div className="sv-shell-topbar-left">
              <span className="sv-dash-label">
                {NAV_ITEMS.find((n) => n.id === view)?.label || 'AETHERNET'}
              </span>
            </div>
            <div className="sv-shell-topbar-right">
              <div className="sv-dash-status">
                <span className="sv-status-dot" />
                <span>SISTEMA EN LINEA</span>
              </div>
            </div>
          </div>

          <div
            ref={bodyRef}
            className={`sv-shell-body ${viewTransition === 'entering' ? 'sv-view-entering' : 'sv-view-idle'}`}
          >
            {renderContent()}
          </div>
        </main>
      </div>

      {shellReady && <MusicPlayer onSound={onSound} />}
    </div>
  );
};
