import { useState } from 'react';
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

const VIDEO_BG = "/videos/bg-alt.mp4";

interface AppShellProps {
  onSound: (key: 'click' | 'hover') => void;
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

export const AppShell: React.FC<AppShellProps> = ({ onSound, onLogout }) => {
  const [view, setView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = (v: DashboardView) => {
    setView(v);
    onSound('click');
  };

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
        return <HexGrid onSound={onSound} />;
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
<video
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
  className="sv-video-element"
>
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
              onClick={() => { setSidebarOpen(!sidebarOpen); onSound('click'); }}
              onMouseEnter={() => onSound('hover')}
            >
              {sidebarOpen ? '\u25C0' : '\u25B6'}
            </button>
          </div>

          <nav className="sv-sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`sv-sidebar-item ${view === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
                onMouseEnter={() => onSound('hover')}
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
              onClick={() => { onSound('click'); onLogout(); }}
              onMouseEnter={() => onSound('hover')}
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

          <div className="sv-shell-body">{renderContent()}</div>
        </main>
      </div>

      <MusicPlayer onSound={onSound} />
    </div>
  );
};
