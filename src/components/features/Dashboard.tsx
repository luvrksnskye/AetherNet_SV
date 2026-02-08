import { useState } from 'react';

const CONTENT_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

interface DataNode {
  id: string;
  label: string;
  category: string;
  status: 'ACTIVE' | 'STANDBY' | 'CRITICAL';
  metric: string;
  detail: string;
}

const NODES: DataNode[] = [
  { id: 'SV-001', label: 'CORE NEXUS', category: 'INFRASTRUCTURE', status: 'ACTIVE', metric: '99.7%', detail: 'Primary processing backbone. Handles all inbound/outbound signal routing across sector nodes.' },
  { id: 'SV-002', label: 'SIGNAL ARRAY', category: 'COMMUNICATIONS', status: 'ACTIVE', metric: '847 TB/s', detail: 'Long-range transmission array. Provides encrypted communication channels to all connected operatives.' },
  { id: 'SV-003', label: 'VAULT THETA', category: 'DATA STORAGE', status: 'STANDBY', metric: '2.4 PB', detail: 'Classified data repository. Contains mission logs, operative profiles, and intelligence archives.' },
  { id: 'SV-004', label: 'WARDEN GRID', category: 'SECURITY', status: 'ACTIVE', metric: 'LVL 9', detail: 'Perimeter defense matrix. Monitors all access points and enforces authentication protocols.' },
  { id: 'SV-005', label: 'PHANTOM LINK', category: 'NETWORK', status: 'CRITICAL', metric: '23ms', detail: 'Stealth relay network. Provides untraceable communication for classified operations in the field.' },
  { id: 'SV-006', label: 'ECHO CHAMBER', category: 'ANALYTICS', status: 'ACTIVE', metric: '1.2M ops', detail: 'Real-time intelligence analysis. Processes raw data feeds and generates actionable threat assessments.' },
];

interface DashboardProps {
  onSound: (key: 'click' | 'hover') => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSound, onLogout }) => {
  const [selected, setSelected] = useState<DataNode | null>(null);

  const statusClass = (s: DataNode['status']) => {
    if (s === 'ACTIVE') return 'sv-node-active';
    if (s === 'CRITICAL') return 'sv-node-critical';
    return 'sv-node-standby';
  };

  return (
    <div className="sv-dash">
      {/* Header bar */}
      <div className="sv-dash-header">
        <div className="sv-dash-header-left">
          <span className="sv-dash-logo">AETHERNET</span>
          <span className="sv-dash-sep">/</span>
          <span className="sv-dash-label">SYSTEM OVERVIEW</span>
        </div>
        <div className="sv-dash-header-right">
          <div className="sv-dash-status">
            <span className="sv-status-dot" />
            <span>ONLINE</span>
          </div>
          <button
            className="sv-dash-logout"
            onClick={() => { onSound('click'); onLogout(); }}
            onMouseEnter={() => onSound('hover')}
          >
            DISCONNECT
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="sv-dash-body">
        <div className="sv-dash-grid">
          {NODES.map((node) => (
            <button
              key={node.id}
              className={`sv-node-card ${statusClass(node.status)} ${selected?.id === node.id ? 'sv-node-selected' : ''}`}
              onClick={() => { onSound('click'); setSelected(node); }}
              onMouseEnter={() => onSound('hover')}
            >
              <div className="sv-node-top">
                <span className="sv-node-id">{node.id}</span>
                <span className={`sv-node-badge ${statusClass(node.status)}`}>{node.status}</span>
              </div>
              <div className="sv-node-name">{node.label}</div>
              <div className="sv-node-cat">{node.category}</div>
              <div className="sv-node-metric">{node.metric}</div>
              <div className="sv-node-corner sv-node-corner-tl" />
              <div className="sv-node-corner sv-node-corner-br" />
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="sv-detail-panel" key={selected.id}>
            <div className="sv-corner sv-corner-tl" />
            <div className="sv-corner sv-corner-tr" />
            <div className="sv-corner sv-corner-bl" />
            <div className="sv-corner sv-corner-br" />

            <div className="sv-detail-header">
              <div>
                <span className="sv-detail-id">{selected.id}</span>
                <span className={`sv-node-badge ${statusClass(selected.status)}`}>{selected.status}</span>
              </div>
              <button
                className="sv-detail-close"
                onClick={() => { onSound('click'); setSelected(null); }}
              >
                &#10005;
              </button>
            </div>

            <h2 className="sv-detail-title">{selected.label}</h2>
            <p className="sv-detail-cat">{selected.category}</p>
            <p className="sv-detail-desc">{selected.detail}</p>

            <div className="sv-detail-stats">
              <div className="sv-detail-stat">
                <span className="sv-detail-stat-label">PRIMARY METRIC</span>
                <span className="sv-detail-stat-value">{selected.metric}</span>
              </div>
              <div className="sv-detail-stat">
                <span className="sv-detail-stat-label">NODE ID</span>
                <span className="sv-detail-stat-value">{selected.id}</span>
              </div>
            </div>

            <div className="sv-detail-video-wrap">
              <div className="sv-detail-video-label">LIVE FEED</div>
              <video
                className="sv-detail-video"
                src={CONTENT_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sv-dash-footer">
        <span>STARVORTEX SYSTEMS</span>
        <span className="sv-dash-sep">|</span>
        <span>AETHERNET v2.0</span>
        <span className="sv-dash-sep">|</span>
        <span>SECTOR-7 CLEARANCE</span>
      </div>
    </div>
  );
};
