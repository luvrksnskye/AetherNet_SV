import { useState, useEffect } from 'react';
import { useStorage } from '../../hooks/useStorage';
import {
  TOKEN_LIMITS,
  TOKEN_META,
  AXIOM_CORE_PHASES,
  COMPUTATIONAL_PHASES,
  type TokenEntry,
  type TokenColor,
  type RoadmapProgress,
} from '../../types';
import { isToday, isThisWeek } from '../../utils';

interface OverviewDashboardProps {
  onSound: (key: 'click' | 'hover') => void;
  onNavigate: (view: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onSound,
  onNavigate,
}) => {
  const storage = useStorage();
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [progress, setProgress] = useState<Record<string, RoadmapProgress>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const savedTokens = await storage.get<TokenEntry[]>('tokens:log');
      if (savedTokens) setTokens(savedTokens);
      const savedProgress = await storage.get<Record<string, RoadmapProgress>>('roadmap:progress');
      if (savedProgress) setProgress(savedProgress);
      setLoaded(true);
    })();
  }, [storage]);

  const todayTokens = tokens.filter((t) => isToday(t.date));
  const weekTokens = tokens.filter((t) => isThisWeek(t.date));

  const axiomCompleted = AXIOM_CORE_PHASES.filter(
    (p) => progress[p.id]?.status === 'completed',
  ).length;
  const compCompleted = COMPUTATIONAL_PHASES.filter(
    (p) => progress[p.id]?.status === 'completed',
  ).length;

  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'BUENOS DIAS';
    if (hour < 18) return 'BUENAS TARDES';
    return 'BUENAS NOCHES';
  };

  if (!loaded) {
    return (
      <div className="sv-dash-loading">
        <span className="sv-loader" />
      </div>
    );
  }

  return (
    <div className="sv-overview-dash">
      <div className="sv-overview-greeting">
        <span className="sv-overview-date">{dateStr.toUpperCase()}</span>
        <h2 className="sv-overview-hello">{getGreeting()}, REGREDANGER</h2>
        <p className="sv-overview-sub">CENTRO DE COMANDO OPERATIVO</p>
      </div>

      <div className="sv-overview-grid">
        <button
          className="sv-overview-card"
          onClick={() => {
            onNavigate('tokens');
            onSound('click');
          }}
          onMouseEnter={() => onSound('hover')}
        >
          <div className="sv-node-corner sv-node-corner-tl" />
          <div className="sv-node-corner sv-node-corner-br" />
          <div className="sv-overview-card-header">
            <span className="sv-node-id">SISTEMA JIT</span>
            <span className={`sv-node-badge ${todayTokens.length >= TOKEN_LIMITS.dailyMax ? 'sv-node-active' : 'sv-node-standby'}`}>
              {todayTokens.length >= TOKEN_LIMITS.dailyMax ? 'COMPLETO' : 'ACTIVO'}
            </span>
          </div>
          <div className="sv-overview-card-body">
            <div className="sv-overview-metric">
              <span className="sv-overview-metric-value">
                {todayTokens.length}/{TOKEN_LIMITS.dailyMax}
              </span>
              <span className="sv-overview-metric-label">TOKENS HOY</span>
            </div>
            <div className="sv-overview-metric">
              <span className="sv-overview-metric-value">
                {weekTokens.length}/{TOKEN_LIMITS.weeklyMax}
              </span>
              <span className="sv-overview-metric-label">ESTA SEMANA</span>
            </div>
          </div>
          <div className="sv-overview-token-row">
            {(['red', 'blue', 'purple', 'green'] as TokenColor[]).map((c) => {
              const count = weekTokens.filter((t) => t.color === c).length;
              return (
                <div key={c} className={`sv-overview-token-pip sv-token-${c}`}>
                  <div className="sv-ceiling-dot" />
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
        </button>

        <button
          className="sv-overview-card"
          onClick={() => {
            onNavigate('roadmap');
            onSound('click');
          }}
          onMouseEnter={() => onSound('hover')}
        >
          <div className="sv-node-corner sv-node-corner-tl" />
          <div className="sv-node-corner sv-node-corner-br" />
          <div className="sv-overview-card-header">
            <span className="sv-node-id">AXIOM CORE</span>
            <span className="sv-node-badge sv-node-standby">
              {axiomCompleted}/{AXIOM_CORE_PHASES.length}
            </span>
          </div>
          <div className="sv-overview-card-body">
            <div className="sv-token-bar" style={{ width: '100%' }}>
              <div
                className="sv-token-bar-fill sv-bar-success"
                style={{
                  width: `${(axiomCompleted / AXIOM_CORE_PHASES.length) * 100}%`,
                }}
              />
            </div>
            <span className="sv-overview-metric-label" style={{ marginTop: '0.5rem' }}>
              {axiomCompleted === 0
                ? 'SIN INICIAR'
                : `FASE ${axiomCompleted} DE ${AXIOM_CORE_PHASES.length}`}
            </span>
          </div>
        </button>

        <button
          className="sv-overview-card"
          onClick={() => {
            onNavigate('roadmap');
            onSound('click');
          }}
          onMouseEnter={() => onSound('hover')}
        >
          <div className="sv-node-corner sv-node-corner-tl" />
          <div className="sv-node-corner sv-node-corner-br" />
          <div className="sv-overview-card-header">
            <span className="sv-node-id">COMPUTATIONAL BRANCH</span>
            <span className="sv-node-badge sv-node-standby">
              {compCompleted}/{COMPUTATIONAL_PHASES.length}
            </span>
          </div>
          <div className="sv-overview-card-body">
            <div className="sv-token-bar" style={{ width: '100%' }}>
              <div
                className="sv-token-bar-fill sv-bar-success"
                style={{
                  width: `${COMPUTATIONAL_PHASES.length > 0 ? (compCompleted / COMPUTATIONAL_PHASES.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="sv-overview-metric-label" style={{ marginTop: '0.5rem' }}>
              MIT 6.042J &rarr; 6.006 &rarr; 6.046J
            </span>
          </div>
        </button>

        <button
          className="sv-overview-card"
          onClick={() => {
            onNavigate('notes');
            onSound('click');
          }}
          onMouseEnter={() => onSound('hover')}
        >
          <div className="sv-node-corner sv-node-corner-tl" />
          <div className="sv-node-corner sv-node-corner-br" />
          <div className="sv-overview-card-header">
            <span className="sv-node-id">BITACORA</span>
            <span className="sv-node-badge sv-node-standby">NOTAS</span>
          </div>
          <div className="sv-overview-card-body">
            <span className="sv-overview-metric-label">
              REGISTRO OPERATIVO Y OBSERVACIONES
            </span>
          </div>
        </button>
      </div>

      {todayTokens.length > 0 && (
        <div className="sv-overview-today">
          <div className="sv-field-label">
            <span>ACTIVIDAD DE HOY</span>
          </div>
          {todayTokens.map((t) => (
            <div key={t.id} className={`sv-token-log-item sv-token-${t.color}`}>
              <div className="sv-token-log-left">
                <div className="sv-token-log-dot" />
                <div className="sv-token-log-info">
                  <span className="sv-token-log-desc">{t.description}</span>
                  <span className="sv-token-log-meta">{TOKEN_META[t.color].label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
