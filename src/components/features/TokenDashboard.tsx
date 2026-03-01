import { useState, useEffect, useCallback } from 'react';
import { useStorage } from '../../hooks/useStorage';
import {
  TOKEN_LIMITS,
  TOKEN_META,
  type TokenColor,
  type TokenEntry,
} from '../../types';
import { generateId, getToday, isToday, isThisWeek, formatDate } from '../../utils';

const STORAGE_KEY = 'tokens:log';

interface TokenDashboardProps {
  onSound: (key: 'click' | 'hover') => void;
}

export const TokenDashboard: React.FC<TokenDashboardProps> = ({ onSound }) => {
  const storage = useStorage();
  const [entries, setEntries] = useState<TokenEntry[]>([]);
  const [burning, setBurning] = useState(false);
  const [selectedColor, setSelectedColor] = useState<TokenColor | null>(null);
  const [description, setDescription] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.get<TokenEntry[]>(STORAGE_KEY);
    if (saved) setEntries(saved);
    setLoaded(true);
  }, []);

  const save = useCallback((next: TokenEntry[]) => {
    setEntries(next);
    storage.set(STORAGE_KEY, next);
  }, []);

  const todayCount = entries.filter((e) => isToday(e.date)).length;
  const weekEntries = entries.filter((e) => isThisWeek(e.date));
  const weekCount = weekEntries.length;

  const weekByColor = (color: TokenColor) =>
    weekEntries.filter((e) => e.color === color).length;

  const canBurn = (color: TokenColor): boolean => {
    if (todayCount >= TOKEN_LIMITS.dailyMax) return false;
    if (weekCount >= TOKEN_LIMITS.weeklyMax) return false;
    const colorCount = weekByColor(color);
    const ceiling =
      color === 'red'
        ? TOKEN_LIMITS.redCeiling
        : color === 'blue'
          ? TOKEN_LIMITS.blueCeiling
          : color === 'purple'
            ? TOKEN_LIMITS.purpleCeiling
            : TOKEN_LIMITS.greenFlex;
    return colorCount < ceiling;
  };

  const handleBurn = () => {
    if (!selectedColor || !description.trim()) return;
    onSound('click');

    const entry: TokenEntry = {
      id: generateId(),
      date: getToday(),
      color: selectedColor,
      description: description.trim(),
    };

    save([entry, ...entries]);
    setSelectedColor(null);
    setDescription('');
    setBurning(false);
  };

  const handleDelete = (id: string) => {
    onSound('click');
    save(entries.filter((e) => e.id !== id));
  };

  const colorClass = (color: TokenColor) => `sv-token-${color}`;

  if (!loaded) {
    return (
      <div className="sv-dash-loading">
        <span className="sv-loader" />
      </div>
    );
  }

  return (
    <div className="sv-token-dash">
      <div className="sv-section-header">
        <h2 className="sv-section-title">SISTEMA JIT</h2>
        <p className="sv-section-subtitle">
          PROTOCOLO DE GESTION DE TOKENS COGNITIVOS
        </p>
      </div>

      <div className="sv-token-stats">
        <div className="sv-token-stat-card">
          <span className="sv-token-stat-label">HOY</span>
          <span className="sv-token-stat-value">
            {todayCount} / {TOKEN_LIMITS.dailyMax}
          </span>
          <div className="sv-token-bar">
            <div
              className="sv-token-bar-fill"
              style={{ width: `${(todayCount / TOKEN_LIMITS.dailyMax) * 100}%` }}
            />
          </div>
        </div>
        <div className="sv-token-stat-card">
          <span className="sv-token-stat-label">SEMANA</span>
          <span className="sv-token-stat-value">
            {weekCount} / {TOKEN_LIMITS.weeklyMax}
          </span>
          <div className="sv-token-bar">
            <div
              className="sv-token-bar-fill"
              style={{ width: `${(weekCount / TOKEN_LIMITS.weeklyMax) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="sv-token-ceilings">
        {(['red', 'blue', 'purple', 'green'] as TokenColor[]).map((color) => {
          const used = weekByColor(color);
          const ceiling =
            color === 'red'
              ? TOKEN_LIMITS.redCeiling
              : color === 'blue'
                ? TOKEN_LIMITS.blueCeiling
                : color === 'purple'
                  ? TOKEN_LIMITS.purpleCeiling
                  : TOKEN_LIMITS.greenFlex;
          return (
            <div key={color} className={`sv-ceiling-item ${colorClass(color)}`}>
              <div className="sv-ceiling-dot" />
              <span className="sv-ceiling-label">{TOKEN_META[color].label}</span>
              <span className="sv-ceiling-count">
                {used}/{ceiling}
              </span>
            </div>
          );
        })}
      </div>

      {!burning ? (
        <button
          className="sv-btn"
          onClick={() => {
            setBurning(true);
            onSound('click');
          }}
          onMouseEnter={() => onSound('hover')}
          disabled={todayCount >= TOKEN_LIMITS.dailyMax}
        >
          {todayCount >= TOKEN_LIMITS.dailyMax
            ? 'LIMITE DIARIO ALCANZADO'
            : 'QUEMAR TOKEN'}
        </button>
      ) : (
        <div className="sv-burn-form">
          <div className="sv-field-label">
            <span>SELECCIONAR TIPO DE TOKEN</span>
          </div>
          <div className="sv-token-selector">
            {(['red', 'blue', 'purple', 'green'] as TokenColor[]).map((color) => {
              const available = canBurn(color);
              return (
                <button
                  key={color}
                  className={`sv-token-select-btn ${colorClass(color)} ${
                    selectedColor === color ? 'active' : ''
                  } ${!available ? 'disabled' : ''}`}
                  onClick={() => {
                    if (available) {
                      setSelectedColor(color);
                      onSound('click');
                    }
                  }}
                  onMouseEnter={() => onSound('hover')}
                  disabled={!available}
                >
                  <div className="sv-token-select-dot" />
                  <span>{TOKEN_META[color].label}</span>
                </button>
              );
            })}
          </div>

          {selectedColor && (
            <>
              <div className="sv-token-desc-hint">
                {TOKEN_META[selectedColor].desc}
              </div>
              <div className="sv-field">
                <div className="sv-field-label">
                  <span>DESCRIPCION DE LA SESION</span>
                </div>
                <div className="sv-input-wrap">
                  <input
                    className="sv-input"
                    type="text"
                    placeholder="Ej: LeetCode Medium - Two Sum II"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBurn()}
                  />
                </div>
              </div>
            </>
          )}

          <div className="sv-burn-actions">
            <button
              className="sv-btn sv-btn-success"
              onClick={handleBurn}
              disabled={!selectedColor || !description.trim()}
              onMouseEnter={() => onSound('hover')}
            >
              CONFIRMAR QUEMA
            </button>
            <button
              className="sv-btn sv-btn-danger"
              onClick={() => {
                setBurning(false);
                setSelectedColor(null);
                setDescription('');
                onSound('click');
              }}
              onMouseEnter={() => onSound('hover')}
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}

      <div className="sv-token-log">
        <div className="sv-field-label">
          <span>REGISTRO DE EJECUCION</span>
          <span>{entries.length} ENTRADAS</span>
        </div>
        <div className="sv-token-log-list">
          {entries.length === 0 && (
            <div className="sv-token-empty">
              SIN REGISTROS. QUEMA TU PRIMER TOKEN.
            </div>
          )}
          {entries.slice(0, 50).map((entry) => (
            <div key={entry.id} className={`sv-token-log-item ${colorClass(entry.color)}`}>
              <div className="sv-token-log-left">
                <div className="sv-token-log-dot" />
                <div className="sv-token-log-info">
                  <span className="sv-token-log-desc">{entry.description}</span>
                  <span className="sv-token-log-meta">
                    {formatDate(entry.date)} &mdash; {TOKEN_META[entry.color].label}
                  </span>
                </div>
              </div>
              <button
                className="sv-token-log-delete"
                onClick={() => handleDelete(entry.id)}
                onMouseEnter={() => onSound('hover')}
              >
                &#10005;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
