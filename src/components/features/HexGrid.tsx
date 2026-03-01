import { useState, useEffect, useCallback, useRef } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { generateId, getToday, formatDate } from '../../utils';
import type { TokenColor } from '../../types';

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

interface Props {
  onSound: (key: 'click' | 'hover') => void;
}

export const HexGrid: React.FC<Props> = ({ onSound }) => {
  const storage = useStorage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<HexNote[]>([]);
  const [selected, setSelected] = useState<HexNote | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', color: 'blue' as TokenColor });
  const [visionUI, setVisionUI] = useState(false);

  useEffect(() => {
    const saved = storage.get<HexNote[]>(STORAGE_KEY);
    if (saved) setNotes(saved);
  }, []);

  const save = useCallback((next: HexNote[]) => {
    setNotes(next);
    storage.set(STORAGE_KEY, next);
  }, []);

  const addNote = () => {
    if (!form.title.trim()) return;
    onSound('click');
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
    onSound('click');
    save(notes.filter((n) => n.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  // Ripple effect - exact logic from reference honeycomb JS
  const ripple = useCallback((target: HTMLElement) => {
    const container = containerRef.current;
    if (!container || container.classList.contains('sv-hex-rippling')) return;

    const hexElements = Array.from(
      container.querySelectorAll<HTMLDivElement>('.sv-hex-cell')
    );
    const targetRect = target.getBoundingClientRect();

    const data = hexElements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const distance = Math.round(
          Math.sqrt(
            Math.pow(rect.x - targetRect.x, 2) +
            Math.pow(rect.y - targetRect.y, 2)
          )
        );
        return { element, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    const max = data[data.length - 1];
    if (!max) return;

    data.forEach((item) =>
      item.element.style.setProperty(
        '--ripple-factor',
        `${(item.distance * 100) / max.distance}`
      )
    );

    container.classList.add('sv-hex-rippling');

    // Clean up on animationend of the farthest element (reference pattern)
    const cleanUp = () => {
      requestAnimationFrame(() => {
        container.classList.remove('sv-hex-rippling');
        data.forEach((item) =>
          item.element.style.removeProperty('--ripple-factor')
        );
        max.element.removeEventListener('animationend', cleanUp);
      });
    };
    max.element.addEventListener('animationend', cleanUp);
  }, []);

  // Demo ripple on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const first = container.querySelector<HTMLDivElement>('.sv-hex-cell');
    if (first) {
      const t = setTimeout(() => ripple(first), 400);
      return () => clearTimeout(t);
    }
  }, [ripple]);

  const toggleTheme = () => {
    onSound('click');
    setVisionUI(!visionUI);
  };

  // Generate cells: fill at least 24 hexagons
  const totalCells = Math.max(24, notes.length + 6);
  const cells = Array.from({ length: totalCells }, (_, i) => notes[i] || null);

  // Distribute cells into columns for honeycomb layout
  // 7 columns, alternating 4/3/4/3... pattern
  const COLS = 7;
  const columns: (typeof cells)[] = Array.from({ length: COLS }, () => []);
  cells.forEach((cell, i) => {
    columns[i % COLS].push(cell);
  });

  return (
    <div className={`sv-hexgrid-dash ${visionUI ? 'sv-hex-vision-ui' : ''}`}>
      <div className="sv-section-header">
        <h2 className="sv-section-title">HEXAGRID</h2>
        <p className="sv-section-subtitle">APUNTES EN MALLA HEXAGONAL</p>
      </div>

      <div className="sv-hex-toolbar">
        <button
          className={`sv-btn ${editing ? 'sv-btn-danger' : 'sv-btn-success'}`}
          onClick={() => { setEditing(!editing); onSound('click'); }}
          onMouseEnter={() => onSound('hover')}
        >
          {editing ? '\u2715 CANCELAR' : '+ NUEVO APUNTE'}
        </button>

        {/* Vision UI toggle */}
        <div
          className={`sv-hex-switch ${visionUI ? 'checked' : ''}`}
          onClick={toggleTheme}
          onMouseEnter={() => onSound('hover')}
        >
          <span className="sv-hex-switch-label">{visionUI ? 'VISION' : 'MATRIX'}</span>
        </div>
      </div>

      {editing && (
        <div className="sv-hex-form">
          <div className="sv-field">
            <div className="sv-field-label"><span>TITULO</span></div>
            <div className="sv-input-wrap">
              <input className="sv-input" type="text" placeholder="TITULO DEL APUNTE" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
          </div>
          <div className="sv-field">
            <div className="sv-field-label"><span>CONTENIDO</span></div>
            <textarea className="sv-input sv-textarea" placeholder="CONTENIDO..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} />
          </div>
          <div className="sv-token-selector">
            {(Object.keys(COLOR_MAP) as TokenColor[]).map((c) => (
              <button key={c} className={`sv-token-select-btn sv-token-${c} ${form.color === c ? 'active' : ''}`} onClick={() => { setForm({ ...form, color: c }); onSound('click'); }} onMouseEnter={() => onSound('hover')}>{c.toUpperCase()}</button>
            ))}
          </div>
          <button className="sv-btn sv-btn-success" onClick={addNote} disabled={!form.title.trim()} onMouseEnter={() => onSound('hover')}>GUARDAR APUNTE</button>
        </div>
      )}

      {/* Honeycomb: column-based layout */}
      <div
        ref={containerRef}
        className={`sv-hex-container ${selected ? 'sv-hex-collapsed' : ''}`}
      >
        {columns.map((col, colIdx) => (
          <div
            key={colIdx}
            className="sv-hex-column"
            style={{ '--column': colIdx } as React.CSSProperties}
          >
            {col.map((note, idx) => {

              return (
                <div
                  key={note?.id || `empty-${colIdx}-${idx}`}
                  className={`sv-hex-cell ${note ? 'sv-hex-filled' : 'sv-hex-empty'} ${selected?.id === note?.id ? 'sv-hex-selected' : ''}`}
                  style={{
                    '--index': idx,
                    ...(note ? { '--hex-color': COLOR_MAP[note.color] } : {}),
                  } as React.CSSProperties}
                  onClick={(e) => {
                    ripple(e.currentTarget);
                    if (note) {
                      setSelected(selected?.id === note.id ? null : note);
                      onSound('click');
                    }
                  }}
                  onMouseEnter={() => note && onSound('hover')}
                >
                  <div className="sv-hex-shape">
                    {note ? (
                      <div className="sv-hex-content">
                        <span className="sv-hex-title">{note.title}</span>
                        <span className="sv-hex-date">{formatDate(note.date)}</span>
                      </div>
                    ) : (
                      <div className="sv-hex-content sv-hex-placeholder">
                        <span className="sv-hex-title">&middot;</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="sv-hex-detail">
          <div className="sv-corner sv-corner-tl" />
          <div className="sv-corner sv-corner-tr" />
          <div className="sv-corner sv-corner-bl" />
          <div className="sv-corner sv-corner-br" />
          <div className="sv-hex-detail-color-bar" style={{ background: COLOR_MAP[selected.color] }} />
          <div className="sv-hex-detail-header">
            <div>
              <h3 className="sv-detail-title" style={{ color: COLOR_MAP[selected.color] }}>{selected.title}</h3>
              <span className="sv-detail-cat">{formatDate(selected.date)}</span>
            </div>
            <button className="sv-detail-close" onClick={() => setSelected(null)} onMouseEnter={() => onSound('hover')}>&times;</button>
          </div>
          <p className="sv-detail-desc">{selected.content || 'SIN CONTENIDO'}</p>
          <button className="sv-btn sv-btn-danger" onClick={() => removeNote(selected.id)} onMouseEnter={() => onSound('hover')}>ELIMINAR APUNTE</button>
        </div>
      )}
    </div>
  );
};
