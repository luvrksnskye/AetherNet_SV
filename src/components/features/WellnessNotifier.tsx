import { useState, useEffect, useCallback, useRef } from 'react';
import { useStorage } from '../../hooks/useStorage';

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface WellnessState {
  waterCount: number;
  lastWaterTime: number;
  lastEyeRestTime: number;
  lastResetDate: string;
}

interface WellnessNotifierProps {
  onSound: (key: 'click' | 'hover') => void;
}

type NotifType = 'water' | 'eyes' | null;

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const WATER_INTERVAL = 30 * 60 * 1000;
const EYE_INTERVAL = 20 * 60 * 1000;
const CHECK_INTERVAL = 15 * 1000;

const getTodayStr = () => new Date().toISOString().split('T')[0];

const formatElapsed = (ms: number): string => {
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'AHORA';
  if (mins === 1) return '1 MIN';
  return `${mins} MIN`;
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export const WellnessNotifier: React.FC<WellnessNotifierProps> = ({ onSound }) => {
  const storage = useStorage();
  const [wellness, setWellness] = useState<WellnessState>({
    waterCount: 0,
    lastWaterTime: Date.now(),
    lastEyeRestTime: Date.now(),
    lastResetDate: getTodayStr(),
  });
  const [activeNotif, setActiveNotif] = useState<NotifType>(null);
  const [dismissedWater, setDismissedWater] = useState(false);
  const [dismissedEyes, setDismissedEyes] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [exiting, setExiting] = useState(false);
  const notifSound = useRef(false);

  /* Load persisted state */
  useEffect(() => {
    const saved = storage.get<WellnessState>('wellness:state');
    if (saved) {
      if (saved.lastResetDate !== getTodayStr()) {
        const reset: WellnessState = {
          waterCount: 0,
          lastWaterTime: Date.now(),
          lastEyeRestTime: Date.now(),
          lastResetDate: getTodayStr(),
        };
        setWellness(reset);
        storage.set('wellness:state', reset);
      } else {
        setWellness(saved);
      }
    }
  }, []);

  /* Tick every 15s to check intervals */
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  /* Determine which notification to show */
  useEffect(() => {
    const waterElapsed = now - wellness.lastWaterTime;
    const eyeElapsed = now - wellness.lastEyeRestTime;
    const waterDue = waterElapsed >= WATER_INTERVAL;
    const eyeDue = eyeElapsed >= EYE_INTERVAL;

    if (waterDue && !dismissedWater) {
      setActiveNotif('water');
    } else if (eyeDue && !dismissedEyes) {
      setActiveNotif('eyes');
    } else {
      setActiveNotif(null);
    }
  }, [now, wellness, dismissedWater, dismissedEyes]);

  /* Reset dismissed flags when the user acts (new interval starts) */
  useEffect(() => {
    const waterElapsed = now - wellness.lastWaterTime;
    const eyeElapsed = now - wellness.lastEyeRestTime;
    if (waterElapsed < WATER_INTERVAL) setDismissedWater(false);
    if (eyeElapsed < EYE_INTERVAL) setDismissedEyes(false);
  }, [now, wellness]);

  /* Play sound once when notification appears */
  useEffect(() => {
    if (activeNotif && !notifSound.current) {
      notifSound.current = true;
    } else if (!activeNotif) {
      notifSound.current = false;
    }
  }, [activeNotif]);

  const persist = useCallback(
    (next: WellnessState) => {
      setWellness(next);
      storage.set('wellness:state', next);
    },
    [storage],
  );

  const handleAction = useCallback(() => {
    onSound('click');
    setExiting(true);

    setTimeout(() => {
      if (activeNotif === 'water') {
        persist({
          ...wellness,
          waterCount: wellness.waterCount + 1,
          lastWaterTime: Date.now(),
        });
        setDismissedWater(false);
      } else if (activeNotif === 'eyes') {
        persist({
          ...wellness,
          lastEyeRestTime: Date.now(),
        });
        setDismissedEyes(false);
      }
      setActiveNotif(null);
      setExiting(false);
    }, 350);
  }, [activeNotif, wellness, persist, onSound]);

  const handleDismiss = useCallback(() => {
    onSound('click');
    setExiting(true);

    setTimeout(() => {
      if (activeNotif === 'water') setDismissedWater(true);
      if (activeNotif === 'eyes') setDismissedEyes(true);
      setActiveNotif(null);
      setExiting(false);
    }, 350);
  }, [activeNotif, onSound]);

  if (!activeNotif) return null;

  const isWater = activeNotif === 'water';
  const elapsed = isWater
    ? now - wellness.lastWaterTime
    : now - wellness.lastEyeRestTime;

  return (
    <div className={`sv-wellness-notif ${exiting ? 'sv-wellness-notif-exit' : 'sv-wellness-notif-enter'}`}>
      <div className="sv-wellness-notif-backdrop">
        <div className="sv-wellness-notif-corner" />
      </div>

      <div className="sv-wellness-notif-content">
        <div className="sv-wellness-notif-icon">
          {isWater ? '\u2666' : '\u25CE'}
        </div>

        <div className="sv-wellness-notif-body">
          <span className="sv-wellness-notif-title">
            {isWater ? 'HIDRATACION' : 'DESCANSO VISUAL'}
          </span>
          <span className="sv-wellness-notif-desc">
            {isWater
              ? `Bebe agua. Ultimo registro: ${formatElapsed(elapsed)}`
              : `Aplica la regla 20-20-20. Ultimo: ${formatElapsed(elapsed)}`}
          </span>
          {isWater && (
            <span className="sv-wellness-notif-meta">
              VASOS HOY: {wellness.waterCount}
            </span>
          )}
        </div>

        <div className="sv-wellness-notif-actions">
          <button
            className="sv-wellness-notif-btn sv-wellness-notif-btn-action"
            onClick={handleAction}
            onMouseEnter={() => onSound('hover')}
          >
            {isWater ? 'REGISTRAR' : 'LISTO'}
          </button>
          <button
            className="sv-wellness-notif-btn sv-wellness-notif-btn-dismiss"
            onClick={handleDismiss}
            onMouseEnter={() => onSound('hover')}
          >
            DESPUES
          </button>
        </div>
      </div>

      <div className="sv-wellness-notif-progress">
        <div
          className="sv-wellness-notif-progress-fill"
          style={{
            width: `${Math.min(100, (elapsed / (isWater ? WATER_INTERVAL : EYE_INTERVAL)) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
};
