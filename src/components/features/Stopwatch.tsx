import { useState, useRef, useCallback, useEffect } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { generateId, getToday } from '../../utils';

interface TimerLog {
  id: string;
  date: string;
  duration: number;
  mode: 'stopwatch' | 'pomodoro' | 'countdown';
  label: string;
}

const POMODORO_WORK = 45 * 60;
const POMODORO_BREAK = 10 * 60;

type TimerMode = 'stopwatch' | 'pomodoro' | 'countdown';

const formatTime = (s: number): string => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
};

interface Props { onSound: (key: 'click' | 'hover') => void; }

export const Stopwatch: React.FC<Props> = ({ onSound }) => {
  const storage = useStorage();
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [target, setTarget] = useState(POMODORO_WORK);
  const [isBreak, setIsBreak] = useState(false);
  const [label, setLabel] = useState('');
  const [logs, setLogs] = useState<TimerLog[]>([]);
  const [countdownInput, setCountdownInput] = useState('25');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = storage.get<TimerLog[]>('timer:logs');
    if (saved) setLogs(saved);
  }, []);

  const tick = useCallback(() => {
    setElapsed((prev) => {
      const next = prev + 1;
      if (mode === 'pomodoro' && next >= target) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setRunning(false);
        if (!isBreak) {
          setIsBreak(true);
          setTarget(POMODORO_BREAK);
          setElapsed(0);
        } else {
          setIsBreak(false);
          setTarget(POMODORO_WORK);
          setElapsed(0);
        }
        return next;
      }
      if (mode === 'countdown' && next >= target) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setRunning(false);
        return target;
      }
      return next;
    });
  }, [mode, target, isBreak]);

  const start = () => {
    if (running) return;
    onSound('click');
    setRunning(true);
    intervalRef.current = window.setInterval(tick, 1000);
  };

  const pause = () => {
    onSound('click');
    setRunning(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const reset = () => {
    onSound('click');
    pause();
    setElapsed(0);
    setIsBreak(false);
    if (mode === 'pomodoro') setTarget(POMODORO_WORK);
    if (mode === 'countdown') setTarget(Number(countdownInput) * 60 || 25 * 60);
  };

  const saveLog = () => {
    if (elapsed < 5) return;
    onSound('click');
    const entry: TimerLog = {
      id: generateId(),
      date: getToday(),
      duration: elapsed,
      mode,
      label: label || (isBreak ? 'DESCANSO' : mode.toUpperCase()),
    };
    const next = [entry, ...logs].slice(0, 50);
    setLogs(next);
    storage.set('timer:logs', next);
    reset();
    setLabel('');
  };

  const switchMode = (m: TimerMode) => {
    onSound('click');
    pause();
    setElapsed(0);
    setIsBreak(false);
    setMode(m);
    if (m === 'pomodoro') setTarget(POMODORO_WORK);
    if (m === 'countdown') setTarget(Number(countdownInput) * 60 || 25 * 60);
  };

  const display = mode === 'stopwatch' ? formatTime(elapsed) : formatTime(Math.max(0, target - elapsed));
  const progress = mode === 'stopwatch' ? 0 : Math.min(100, (elapsed / target) * 100);

  return (
    <div className="sv-timer-dash">
      <div className="sv-section-header">
        <h2 className="sv-section-title">CRONOMETRO</h2>
        <p className="sv-section-subtitle">CONTROL TEMPORAL DE SESIONES</p>
      </div>

      <div className="sv-method-toggle">
        {(['pomodoro', 'stopwatch', 'countdown'] as TimerMode[]).map((m) => (
          <button key={m} className={`sv-method-btn ${mode === m ? 'active' : ''}`} onClick={() => switchMode(m)} onMouseEnter={() => onSound('hover')}>
            {m === 'pomodoro' ? 'POMODORO' : m === 'stopwatch' ? 'LIBRE' : 'CUENTA REGRESIVA'}
          </button>
        ))}
      </div>

      {mode === 'countdown' && !running && elapsed === 0 && (
        <div className="sv-field" style={{ maxWidth: 200 }}>
          <div className="sv-field-label"><span>MINUTOS</span></div>
          <div className="sv-input-wrap">
            <input className="sv-input" type="number" min="1" max="180" value={countdownInput} onChange={(e) => { setCountdownInput(e.target.value); setTarget(Number(e.target.value) * 60 || 25 * 60); }} />
          </div>
        </div>
      )}

      <div className="sv-timer-display">
        {mode !== 'stopwatch' && (
          <div className="sv-timer-progress-ring">
            <svg viewBox="0 0 120 120" className="sv-timer-ring-svg">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={isBreak ? 'var(--sv-success)' : 'var(--sv-primary)'} strokeWidth="4" strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 0.3s' }} />
            </svg>
          </div>
        )}
        <div className="sv-timer-time">{display}</div>
        {mode === 'pomodoro' && (
          <div className="sv-timer-phase">{isBreak ? 'DESCANSO' : 'ENFOQUE'}</div>
        )}
      </div>

      <div className="sv-field">
        <div className="sv-input-wrap">
          <input className="sv-input" type="text" placeholder="ETIQUETA DE SESION (OPCIONAL)" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
      </div>

      <div className="sv-burn-actions">
        {!running ? (
          <button className="sv-btn sv-btn-success" onClick={start} onMouseEnter={() => onSound('hover')}>
            {elapsed > 0 ? '\u25B6 REANUDAR' : '\u25B6 INICIAR'}
          </button>
        ) : (
          <button className="sv-btn" onClick={pause} onMouseEnter={() => onSound('hover')}>
            \u275A\u275A PAUSAR
          </button>
        )}
        <button className="sv-btn" onClick={reset} onMouseEnter={() => onSound('hover')} disabled={elapsed === 0 && !running}>
          \u21BA REINICIAR
        </button>
        <button className="sv-btn sv-btn-success" onClick={saveLog} onMouseEnter={() => onSound('hover')} disabled={elapsed < 5}>
          \u2713 GUARDAR
        </button>
      </div>

      {logs.length > 0 && (
        <div className="sv-token-log">
          <div className="sv-section-header">
            <h2 className="sv-section-title" style={{ fontSize: '0.85rem' }}>SESIONES REGISTRADAS</h2>
          </div>
          <div className="sv-token-log-list">
            {logs.slice(0, 20).map((log) => (
              <div key={log.id} className="sv-token-log-item">
                <div className="sv-token-log-left">
                  <span className="sv-token-log-dot" style={{ background: log.mode === 'pomodoro' ? '#ff4466' : log.mode === 'countdown' ? '#4488ff' : '#00ff88' }} />
                  <div className="sv-token-log-info">
                    <span className="sv-token-log-desc">{log.label}</span>
                    <span className="sv-token-log-meta">{log.date} &mdash; {formatTime(log.duration)} &mdash; {log.mode.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
