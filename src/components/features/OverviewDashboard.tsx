import { useState, useEffect, useCallback } from 'react';
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

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface WellnessState {
  waterCount: number;
  lastWaterTime: number;
  lastEyeRestTime: number;
  lastResetDate: string;
}

interface OverviewDashboardProps {
  onSound: (key: 'click' | 'hover') => void;
  onNavigate: (view: string) => void;
}

/* ------------------------------------------------------------------ */
/*  TIPS                                                               */
/* ------------------------------------------------------------------ */

const APP_TIPS: string[] = [
  'Usa el SISTEMA JIT para registrar cada sesion de estudio con tokens de color segun la categoria.',
  'El HEXAGRID te permite organizar apuntes en una malla hexagonal. Haz clic en un hexagono para ver su contenido.',
  'Las TABLAS DE ENFOQUE funcionan como un kanban: arrastra nodos entre columnas para organizar tareas.',
  'El CRONOMETRO tiene modo Pomodoro de 45 minutos, alineado con la duracion de un token JIT.',
  'Personaliza el color de tus apuntes en HEXAGRID usando el selector de triadas y gradientes.',
  'Las LISTAS CONECTADAS permiten arrastrar items entre listas para priorizar tu trabajo.',
  'El ROADMAP te ayuda a seguir tu progreso en los modulos de entrenamiento. Activa fases y marca topicos.',
  'La BITACORA es tu diario operativo. Registra observaciones, ideas y bloqueos.',
  'Recuerda tomar agua cada 30 minutos y descansar los ojos cada 20 minutos siguiendo la regla 20-20-20.',
  'Puedes colapsar la barra lateral haciendo clic en la flecha para tener mas espacio de trabajo.',
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

const getTodayStr = () => new Date().toISOString().split('T')[0];

const formatMinutes = (ms: number): string => {
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'AHORA';
  if (mins === 1) return 'HACE 1 MIN';
  return `HACE ${mins} MIN`;
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onSound,
  onNavigate,
}) => {
  const storage = useStorage();
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [progress, setProgress] = useState<Record<string, RoadmapProgress>>({});
  const [loaded, setLoaded] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [now, setNow] = useState(Date.now());

  // Wellness tracking
  const [wellness, setWellness] = useState<WellnessState>({
    waterCount: 0,
    lastWaterTime: Date.now(),
    lastEyeRestTime: Date.now(),
    lastResetDate: getTodayStr(),
  });

  // Timer for live updates
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Load data
  useEffect(() => {
    const savedTokens = storage.get<TokenEntry[]>('tokens:log');
    if (savedTokens) setTokens(savedTokens);
    const savedProgress = storage.get<Record<string, RoadmapProgress>>('roadmap:progress');
    if (savedProgress) setProgress(savedProgress);

    const savedWellness = storage.get<WellnessState>('wellness:state');
    if (savedWellness) {
      if (savedWellness.lastResetDate !== getTodayStr()) {
        const reset: WellnessState = {
          waterCount: 0,
          lastWaterTime: Date.now(),
          lastEyeRestTime: Date.now(),
          lastResetDate: getTodayStr(),
        };
        setWellness(reset);
        storage.set('wellness:state', reset);
      } else {
        setWellness(savedWellness);
      }
    }

    setLoaded(true);
  }, []);

  // Random tip on mount
  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * APP_TIPS.length));
  }, []);

  const nextTip = useCallback(() => {
    onSound('click');
    setTipIndex((prev) => (prev + 1) % APP_TIPS.length);
  }, [onSound]);

  // Wellness actions
  const drinkWater = useCallback(() => {
    onSound('click');
    const next: WellnessState = {
      ...wellness,
      waterCount: wellness.waterCount + 1,
      lastWaterTime: Date.now(),
    };
    setWellness(next);
    storage.set('wellness:state', next);
  }, [wellness, onSound, storage]);

  const restEyes = useCallback(() => {
    onSound('click');
    const next: WellnessState = {
      ...wellness,
      lastEyeRestTime: Date.now(),
    };
    setWellness(next);
    storage.set('wellness:state', next);
  }, [wellness, onSound, storage]);

  // Computed values
  const todayTokens = tokens.filter((t) => isToday(t.date));
  const weekTokens = tokens.filter((t) => isThisWeek(t.date));

  const axiomCompleted = AXIOM_CORE_PHASES.filter(
    (p) => progress[p.id]?.status === 'completed'
  ).length;
  const compCompleted = COMPUTATIONAL_PHASES.filter(
    (p) => progress[p.id]?.status === 'completed'
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

  // Wellness alerts
  const waterElapsed = now - wellness.lastWaterTime;
  const eyeElapsed = now - wellness.lastEyeRestTime;
  const waterAlert = waterElapsed > 30 * 60 * 1000;
  const eyeAlert = eyeElapsed > 20 * 60 * 1000;

  // Token stats
  const tokensByColor = (['red', 'blue', 'purple', 'green'] as TokenColor[]).map((c) => ({
    color: c,
    today: todayTokens.filter((t) => t.color === c).length,
    week: weekTokens.filter((t) => t.color === c).length,
    label: TOKEN_META[c].label,
  }));

  // Streak calculation
  const calculateStreak = (): number => {
    if (tokens.length === 0) return 0;
    const dates = [...new Set(tokens.map((t) => t.date))].sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      const diff = Math.floor(
        (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff <= streak + 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  if (!loaded) {
    return (
      <div className="sv-dash-loading">
        <span className="sv-loader" />
      </div>
    );
  }

  return (
    <div className="sv-overview-dash">
      {/* Greeting */}
      <div className="sv-overview-greeting">
        <span className="sv-overview-date">{dateStr.toUpperCase()}</span>
        <h2 className="sv-overview-hello">
          {getGreeting()}, REGREDANGER
        </h2>
        <p className="sv-overview-sub">CENTRO DE COMANDO OPERATIVO</p>
      </div>

      {/* Wellness Widgets Row */}
      <div className="sv-wellness-row">
        {/* Water tracker */}
        <div className={`sv-wellness-card ${waterAlert ? 'sv-wellness-alert' : ''}`}>
          <div className="sv-wellness-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0C19 10 12 2 12 2z" />
            </svg>
          </div>
          <div className="sv-wellness-info">
            <span className="sv-wellness-label">HIDRATACION</span>
            <span className="sv-wellness-value">{wellness.waterCount} VASOS</span>
            <span className={`sv-wellness-timer ${waterAlert ? 'sv-wellness-timer-alert' : ''}`}>
              {formatMinutes(waterElapsed)}
            </span>
          </div>
          <button
            className={`sv-wellness-action ${waterAlert ? 'sv-wellness-action-pulse' : ''}`}
            onClick={drinkWater}
            onMouseEnter={() => onSound('hover')}
          >
            + AGUA
          </button>
        </div>

        {/* Eye rest */}
        <div className={`sv-wellness-card ${eyeAlert ? 'sv-wellness-alert' : ''}`}>
          <div className="sv-wellness-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="sv-wellness-info">
            <span className="sv-wellness-label">DESCANSO VISUAL</span>
            <span className="sv-wellness-value">REGLA 20-20-20</span>
            <span className={`sv-wellness-timer ${eyeAlert ? 'sv-wellness-timer-alert' : ''}`}>
              {formatMinutes(eyeElapsed)}
            </span>
          </div>
          <button
            className={`sv-wellness-action ${eyeAlert ? 'sv-wellness-action-pulse' : ''}`}
            onClick={restEyes}
            onMouseEnter={() => onSound('hover')}
          >
            DESCANSO
          </button>
        </div>

        {/* Streak */}
        <div className="sv-wellness-card sv-wellness-streak">
          <div className="sv-wellness-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="sv-wellness-info">
            <span className="sv-wellness-label">RACHA</span>
            <span className="sv-wellness-value sv-wellness-streak-val">
              {streak} {streak === 1 ? 'DIA' : 'DIAS'}
            </span>
            <span className="sv-wellness-timer">CONSECUTIVOS</span>
          </div>
        </div>
      </div>

      {/* Main cards grid */}
      <div className="sv-overview-grid">
        {/* Token system card */}
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
            <span
              className={`sv-node-badge ${
                todayTokens.length >= TOKEN_LIMITS.dailyMax
                  ? 'sv-node-active'
                  : 'sv-node-standby'
              }`}
            >
              {todayTokens.length >= TOKEN_LIMITS.dailyMax
                ? 'COMPLETO'
                : 'ACTIVO'}
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
            {tokensByColor.map(({ color, week }) => (
              <div key={color} className={`sv-overview-token-pip sv-token-${color}`}>
                <div className="sv-ceiling-dot" />
                <span>{week}</span>
              </div>
            ))}
          </div>
        </button>

        {/* Axiom Core */}
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
                  width: `${
                    (axiomCompleted / AXIOM_CORE_PHASES.length) * 100
                  }%`,
                }}
              />
            </div>
            <span
              className="sv-overview-metric-label"
              style={{ marginTop: '0.5rem' }}
            >
              {axiomCompleted === 0
                ? 'SIN INICIAR'
                : `FASE ${axiomCompleted} DE ${AXIOM_CORE_PHASES.length}`}
            </span>
          </div>
        </button>

        {/* Computational */}
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
                  width: `${
                    COMPUTATIONAL_PHASES.length > 0
                      ? (compCompleted / COMPUTATIONAL_PHASES.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <span
              className="sv-overview-metric-label"
              style={{ marginTop: '0.5rem' }}
            >
              MIT 6.042J &rarr; 6.006 &rarr; 6.046J
            </span>
          </div>
        </button>

        {/* Bitacora */}
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

      {/* Token distribution analytics */}
      <div className="sv-analytics-section">
        <div className="sv-field-label">
          <span>DISTRIBUCION SEMANAL</span>
        </div>
        <div className="sv-analytics-bars">
          {tokensByColor.map(({ color, week, label }) => {
            const ceiling =
              color === 'red'
                ? TOKEN_LIMITS.redCeiling
                : color === 'blue'
                  ? TOKEN_LIMITS.blueCeiling
                  : color === 'purple'
                    ? TOKEN_LIMITS.purpleCeiling
                    : TOKEN_LIMITS.greenFlex;
            const pct = ceiling > 0 ? (week / ceiling) * 100 : 0;
            return (
              <div key={color} className="sv-analytics-bar-item">
                <div className="sv-analytics-bar-label">
                  <span className={`sv-analytics-dot sv-token-${color}`} />
                  <span>{label}</span>
                  <span className="sv-analytics-count">
                    {week}/{ceiling}
                  </span>
                </div>
                <div className="sv-token-bar">
                  <div
                    className={`sv-token-bar-fill sv-bar-${color}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tip card */}
      <div className="sv-tip-card">
        <div className="sv-tip-header">
          <span className="sv-tip-label">CONSEJO DEL SISTEMA</span>
          <button
            className="sv-tip-next"
            onClick={nextTip}
            onMouseEnter={() => onSound('hover')}
          >
            SIGUIENTE &rarr;
          </button>
        </div>
        <p className="sv-tip-text">{APP_TIPS[tipIndex]}</p>
      </div>

      {/* Today's activity */}
      {todayTokens.length > 0 && (
        <div className="sv-overview-today">
          <div className="sv-field-label">
            <span>ACTIVIDAD DE HOY</span>
          </div>
          {todayTokens.map((t) => (
            <div
              key={t.id}
              className={`sv-token-log-item sv-token-${t.color}`}
            >
              <div className="sv-token-log-left">
                <div className="sv-token-log-dot" />
                <div className="sv-token-log-info">
                  <span className="sv-token-log-desc">{t.description}</span>
                  <span className="sv-token-log-meta">
                    {TOKEN_META[t.color].label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
