import { useState, useEffect, useCallback, useRef } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { generateId, getToday, formatDate } from '../../utils';
import type { TokenColor } from '../../types';
import type { SFXKey } from '../../hooks/useSVSounds';

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface HexNote {
  id: string;
  title: string;
  content: string;
  color: TokenColor;
  date: string;
}

const STORAGE_KEY = 'hexnotes:data';
const COLOR_MAP: Record<TokenColor, string> = {
  red: '#ff4466',
  blue: '#4488ff',
  purple: '#aa44ff',
  green: '#00ff88',
};

/* ------------------------------------------------------------------ */
/*  HONEYCOMB LAYOUT & SCI-FI ICONS                                    */
/* ------------------------------------------------------------------ */

const HONEYCOMB = [5, 6, 7, 8, 9, 8, 7, 6, 5];

const SCI_FI_ICONS = [
  '\u2726', '\u2727', '\u2729', '\u2726', '\u2605',
  '\u2727', '\u2726', '\u2729', '\u2605', '\u2726',
  '\u2727', '\u2729', '\u2726', '\u2727', '\u2605',
  '\u2729', '\u2726', '\u2727', '\u2729', '\u2726',
  '\u2605', '\u2727', '\u2726', '\u2729', '\u2727',
  '\u2726', '\u2605', '\u2727', '\u2729', '\u2726',
  '\u2727', '\u2726', '\u2729', '\u2605', '\u2727',
  '\u2726', '\u2729', '\u2727', '\u2726', '\u2605',
  '\u2729', '\u2726', '\u2727', '\u2729', '\u2726',
  '\u2605', '\u2727', '\u2726', '\u2729', '\u2727',
  '\u2726', '\u2605', '\u2727', '\u2729', '\u2726',
  '\u2727', '\u2726', '\u2729', '\u2605', '\u2727',
  '\u2726',
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  onSound: (key: 'click' | 'hover') => void;
  onSoundFx?: (key: SFXKey, volume?: number) => void;
}

export const HexGrid: React.FC<Props> = ({ onSound, onSoundFx }) => {
  const storage = useStorage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<HexNote[]>([]);
  const [selected, setSelected] = useState<HexNote | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    color: 'blue' as TokenColor,
  });
  const [visionUI, setVisionUI] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = storage.get<HexNote[]>(STORAGE_KEY);
    if (saved) setNotes(saved);
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const save = useCallback((next: HexNote[]) => {
    setNotes(next);
    storage.set(STORAGE_KEY, next);
  }, []);

  const playFx = useCallback(
    (key: SFXKey, volume?: number) => {
      if (onSoundFx) onSoundFx(key, volume);
      else if (key === 'click' || key === 'hover') onSound(key);
    },
    [onSound, onSoundFx],
  );

  const addNote = () => {
    if (!form.title.trim()) return;
    playFx('affirmation', 0.4);
    const note: HexNote = {
      id: generateId(),
      title: form.title.trim(),
      content: form.content.trim(),
      color: form.color,
      date: getToday(),
    };
    save([note, ...notes]);
    setForm({ title: '', content: '', color: 'blue' });
    setEditing(false);
  };

  const removeNote = (id: string) => {
    playFx('takeout', 0.4);
    save(notes.filter((n) => n.id !== id));
    if (selected?.id === id) {
      closePanel();
    }
  };

  /* ---------------------------------------------------------------- */
  /*  RIPPLE                                                           */
  /* ---------------------------------------------------------------- */

  const ripple = useCallback(
    (target: HTMLElement) => {
      const container = containerRef.current;
      if (!container || container.classList.contains('sv-hex-rippling')) return;

      const hexElements = Array.from(
        container.querySelectorAll<HTMLDivElement>('.sv-hex-cell'),
      );
      const targetRect = target.getBoundingClientRect();

      const data = hexElements
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const distance = Math.round(
            Math.sqrt(
              Math.pow(rect.x - targetRect.x, 2) +
                Math.pow(rect.y - targetRect.y, 2),
            ),
          );
          return { element, distance };
        })
        .sort((a, b) => a.distance - b.distance);

      const max = data[data.length - 1];
      if (!max) return;

      data.forEach((item) =>
        item.element.style.setProperty(
          '--ripple-factor',
          `${(item.distance * 100) / max.distance}`,
        ),
      );

      container.classList.add('sv-hex-rippling');
      playFx('nock', 0.3);

      const cleanUp = () => {
        requestAnimationFrame(() => {
          container.classList.remove('sv-hex-rippling');
          data.forEach((item) =>
            item.element.style.removeProperty('--ripple-factor'),
          );
          max.element.removeEventListener('animationend', cleanUp);
        });
      };
      max.element.addEventListener('animationend', cleanUp);
    },
    [playFx],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const first = container.querySelector<HTMLDivElement>('.sv-hex-cell');
    if (first) {
      const t = setTimeout(() => ripple(first), 600);
      return () => clearTimeout(t);
    }
  }, [ripple]);

  /* ---------------------------------------------------------------- */
  /*  PANEL MANAGEMENT                                                 */
  /* ---------------------------------------------------------------- */

  const openPanel = useCallback(
    (note: HexNote) => {
      if (selected?.id === note.id) {
        closePanel();
        return;
      }
      setSelected(note);
      setPanelVisible(true);
      playFx('scan', 0.3);
    },
    [selected, playFx],
  );

  const closePanel = useCallback(() => {
    setPanelVisible(false);
    playFx('click2', 0.3);
    setTimeout(() => setSelected(null), 320);
  }, [playFx]);

  const toggleTheme = () => {
    playFx('hint', 0.35);
    setVisionUI(!visionUI);
  };

  /* ---------------------------------------------------------------- */
  /*  BUILD HONEYCOMB COLUMNS                                          */
  /* ---------------------------------------------------------------- */

  let globalIdx = 0;
  const columns = HONEYCOMB.map((count, colIdx) => {
    const cells: (HexNote | null)[] = [];
    for (let i = 0; i < count; i++) {
      const noteIdx = globalIdx;
      cells.push(noteIdx < notes.length ? notes[noteIdx] : null);
      globalIdx++;
    }
    return { colIdx, cells };
  });

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div
      className={`sv-hexgrid-dash ${visionUI ? 'sv-hex-vision-ui' : ''} ${mounted ? 'sv-hex-mounted' : ''}`}
    >
      <div className="sv-section-header sv-anim-stagger-1">
        <h2 className="sv-section-title">HEXAGRID</h2>
        <p className="sv-section-subtitle">MALLA HEXAGONAL OPERATIVA</p>
      </div>

      <div className="sv-hex-toolbar sv-anim-stagger-2">
        <button
          className={`sv-btn ${editing ? 'sv-btn-danger' : 'sv-btn-success'}`}
          onClick={() => {
            setEditing(!editing);
            playFx(editing ? 'click2' : 'click3', 0.4);
          }}
          onMouseEnter={() => playFx('hover', 0.2)}
        >
          {editing ? '\u2715 CANCELAR' : '+ NUEVO APUNTE'}
        </button>

        <div
          className={`sv-hex-switch ${visionUI ? 'checked' : ''}`}
          onClick={toggleTheme}
          onMouseEnter={() => playFx('hover', 0.2)}
        >
          <span className="sv-hex-switch-label">
            {visionUI ? 'VISION' : 'MATRIX'}
          </span>
        </div>
      </div>

      {/* Form with slide animation */}
      <div className={`sv-hex-form-wrapper ${editing ? 'sv-hex-form-open' : ''}`}>
        <div className="sv-hex-form">
          <div className="sv-field">
            <div className="sv-field-label">
              <span>TITULO</span>
            </div>
            <div className="sv-input-wrap">
              <input
                className="sv-input"
                type="text"
                placeholder="TITULO DEL APUNTE"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
          </div>
          <div className="sv-field">
            <div className="sv-field-label">
              <span>CONTENIDO</span>
            </div>
            <textarea
              className="sv-input sv-textarea"
              placeholder="CONTENIDO..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={3}
            />
          </div>
          <div className="sv-token-selector">
            {(Object.keys(COLOR_MAP) as TokenColor[]).map((c) => (
              <button
                key={c}
                className={`sv-token-select-btn sv-token-${c} ${form.color === c ? 'active' : ''}`}
                onClick={() => {
                  setForm({ ...form, color: c });
                  playFx('click4', 0.35);
                }}
                onMouseEnter={() => playFx('hover', 0.15)}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            className="sv-btn sv-btn-success"
            onClick={addNote}
            disabled={!form.title.trim()}
            onMouseEnter={() => playFx('hover', 0.2)}
          >
            GUARDAR APUNTE
          </button>
        </div>
      </div>

      {/* MAIN AREA: HexGrid + Overlay Panel */}
      <div className="sv-hex-main-area sv-anim-stagger-3">
        <div
          ref={containerRef}
          className={`sv-hex-container ${selected ? 'sv-hex-has-selection' : ''}`}
        >
          {columns.map(({ colIdx, cells }) => (
            <div
              key={colIdx}
              className="sv-hex-column"
              style={{ '--column': colIdx } as React.CSSProperties}
            >
              {cells.map((note, idx) => {
                const cellGlobalIdx =
                  HONEYCOMB.slice(0, colIdx).reduce((a, b) => a + b, 0) + idx;
                const icon = SCI_FI_ICONS[cellGlobalIdx % SCI_FI_ICONS.length];

                return (
                  <div
                    key={note?.id || `empty-${colIdx}-${idx}`}
                    className={`sv-hex-cell ${note ? 'sv-hex-filled' : 'sv-hex-empty'} ${selected?.id === note?.id ? 'sv-hex-selected' : ''}`}
                    style={
                      {
                        '--index': idx,
                        '--cell-delay': `${cellGlobalIdx * 20}ms`,
                        ...(note ? { '--hex-color': COLOR_MAP[note.color] } : {}),
                      } as React.CSSProperties
                    }
                    onClick={(e) => {
                      ripple(e.currentTarget);
                      if (note) {
                        openPanel(note);
                      }
                    }}
                    onMouseEnter={() => {
                      if (note) playFx('hover', 0.15);
                    }}
                  >
                    <div className="sv-hex-shape">
                      {note ? (
                        <div className="sv-hex-content">
                          <span className="sv-hex-title">{note.title}</span>
                          <span className="sv-hex-date">
                            {formatDate(note.date)}
                          </span>
                        </div>
                      ) : (
                        <div className="sv-hex-content sv-hex-placeholder">
                          <span className="sv-hex-icon">{icon}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Overlay Detail Panel */}
        {selected && (
          <div
            className={`sv-hex-overlay ${panelVisible ? 'sv-hex-overlay-visible' : 'sv-hex-overlay-hidden'}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) closePanel();
            }}
          >
            <div className="sv-hex-detail-panel">
              <div className="sv-corner sv-corner-tl" />
              <div className="sv-corner sv-corner-tr" />
              <div className="sv-corner sv-corner-bl" />
              <div className="sv-corner sv-corner-br" />
              <div
                className="sv-hex-detail-color-bar"
                style={{ background: COLOR_MAP[selected.color] }}
              />
              <div className="sv-hex-detail-header">
                <div>
                  <h3
                    className="sv-detail-title"
                    style={{ color: COLOR_MAP[selected.color] }}
                  >
                    {selected.title}
                  </h3>
                  <span className="sv-detail-cat">
                    {formatDate(selected.date)}
                  </span>
                </div>
                <button
                  className="sv-detail-close"
                  onClick={closePanel}
                  onMouseEnter={() => playFx('hover', 0.15)}
                >
                  &times;
                </button>
              </div>
              <p className="sv-detail-desc">
                {selected.content || 'SIN CONTENIDO'}
              </p>
              <button
                className="sv-btn sv-btn-danger"
                onClick={() => removeNote(selected.id)}
                onMouseEnter={() => playFx('hover', 0.2)}
              >
                ELIMINAR APUNTE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
