import { useState, useEffect, useCallback, useRef } from 'react';
import { useStorage } from '../../hooks/useStorage';
import type { NoteEntry } from '../../types';
import { generateId, getToday, formatDate } from '../../utils';

const STORAGE_KEY = 'notes:entries';

/* ------------------------------------------------------------------ */
/*  SOLID COLORS for nodes                                             */
/* ------------------------------------------------------------------ */

const NODE_COLORS = [
  '#ff4466', '#ff6b35', '#f7b731', '#20bf6b', '#0fb9b1',
  '#4488ff', '#6c5ce7', '#aa44ff', '#fd79a8', '#00ff88',
  '#e17055', '#00cec9', '#fdcb6e', '#74b9ff', '#a29bfe',
];

/* ------------------------------------------------------------------ */
/*  FORCE SIMULATION (no external deps)                                */
/* ------------------------------------------------------------------ */

interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
  color: string;
  title: string;
  weight: number;
}

const CX = 400;
const CY = 250;

function simulate(nodes: SimNode[]): SimNode[] {
  const next = nodes.map((n) => ({ ...n }));

  // Repulsion
  for (let i = 0; i < next.length; i++) {
    for (let j = i + 1; j < next.length; j++) {
      const a = next[i];
      const b = next[j];
      let dx = a.x - b.x;
      let dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = 800 / (dist * dist);
      dx = (dx / dist) * force;
      dy = (dy / dist) * force;
      a.vx += dx; a.vy += dy;
      b.vx -= dx; b.vy -= dy;
    }
  }

  // Center pull + damping
  for (const n of next) {
    n.vx += (CX - n.x) * 0.008;
    n.vy += (CY - n.y) * 0.008;
    n.vx *= 0.92;
    n.vy *= 0.92;
    if (n.fx !== null) { n.x = n.fx; n.vx = 0; }
    else { n.x += n.vx; }
    if (n.fy !== null) { n.y = n.fy; n.vy = 0; }
    else { n.y += n.vy; }
    n.x = Math.max(30, Math.min(770, n.x));
    n.y = Math.max(30, Math.min(470, n.y));
  }

  return next;
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

interface NotesPanelProps {
  onSound: (key: 'click' | 'hover') => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ onSound }) => {
  const storage = useStorage();
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteColor, setNoteColor] = useState('#4488ff');
  const [loaded, setLoaded] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Force graph
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const rafRef = useRef<number>(0);
  const dragging = useRef<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const saved = storage.get<NoteEntry[]>(STORAGE_KEY);
    if (saved) setNotes(saved);
    setLoaded(true);
  }, []);

  const save = useCallback((next: NoteEntry[]) => {
    setNotes(next);
    storage.set(STORAGE_KEY, next);
  }, []);

  // Build sim nodes
  useEffect(() => {
    setSimNodes((prev) =>
      notes.map((note, i) => {
        const existing = prev.find((n) => n.id === note.id);
        if (existing) return { ...existing, color: (note as any).color || '#4488ff', title: note.title };
        const angle = (i / Math.max(notes.length, 1)) * Math.PI * 2;
        const r = 80 + Math.random() * 120;
        return {
          id: note.id,
          x: CX + Math.cos(angle) * r,
          y: CY + Math.sin(angle) * r,
          vx: 0, vy: 0, fx: null, fy: null,
          color: (note as any).color || '#4488ff',
          title: note.title,
          weight: Math.min(note.content.length / 20, 8) + 2,
        };
      })
    );
  }, [notes]);

  // Tick
  useEffect(() => {
    if (simNodes.length === 0) return;
    let running = true;
    const tick = () => {
      if (!running) return;
      setSimNodes((prev) => simulate(prev));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, [simNodes.length]);

  // Drag
  const onDragStart = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = id;
  };

  const onDragMove = (e: React.MouseEvent) => {
    if (!dragging.current || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    setSimNodes((prev) =>
      prev.map((n) =>
        n.id === dragging.current
          ? { ...n, fx: svgPt.x, fy: svgPt.y, x: svgPt.x, y: svgPt.y }
          : n
      )
    );
  };

  const onDragEnd = () => {
    if (dragging.current) {
      const id = dragging.current;
      setSimNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, fx: n.x, fy: n.y } : n))
      );
    }
    dragging.current = null;
  };

  const onDblClick = (id: string) => {
    setSimNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, fx: null, fy: null } : n))
    );
  };

  // CRUD
  const handleCreate = () => {
    if (!title.trim()) return;
    onSound('click');
    const entry = {
      id: generateId(),
      title: title.trim(),
      content: content.trim(),
      date: getToday(),
      color: noteColor,
    };
    save([entry, ...notes] as any);
    resetForm();
  };

  const handleUpdate = (id: string) => {
    onSound('click');
    save(notes.map((n) =>
      n.id === id ? { ...n, title: title.trim(), content: content.trim() } : n
    ));
    resetForm();
  };

  const handleDelete = (id: string) => {
    onSound('click');
    save(notes.filter((n) => n.id !== id));
    if (editingId === id) resetForm();
    if (selectedNode === id) setSelectedNode(null);
  };

  const startEdit = (note: NoteEntry) => {
    onSound('click');
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCreating(false);
  };

  const resetForm = () => {
    setCreating(false);
    setEditingId(null);
    setTitle('');
    setContent('');
    setNoteColor('#4488ff');
  };

  const changeNodeColor = (noteId: string, color: string) => {
    onSound('click');
    save(notes.map((n) => (n.id === noteId ? { ...n, color } : n)) as any);
    setShowColorPicker(false);
  };

  const selectedNote = notes.find((n) => n.id === selectedNode);

  if (!loaded) return <div className="sv-dash-loading"><span className="sv-loader" /></div>;

  return (
    <div className="sv-notes-dash">
      <div className="sv-section-header">
        <h2 className="sv-section-title">BITACORA</h2>
        <p className="sv-section-subtitle">NOTAS Y REGISTRO DE OPERACIONES</p>
      </div>

      {/* View toggle */}
      <div className="sv-method-toggle">
        <button className={`sv-method-btn ${viewMode === 'graph' ? 'active' : ''}`} onClick={() => { setViewMode('graph'); onSound('click'); }} onMouseEnter={() => onSound('hover')}>NODOS</button>
        <button className={`sv-method-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => { setViewMode('list'); onSound('click'); }} onMouseEnter={() => onSound('hover')}>LISTA</button>
      </div>

      {/* Create button */}
      {!creating && !editingId && (
        <button className="sv-btn" onClick={() => { setCreating(true); onSound('click'); }} onMouseEnter={() => onSound('hover')}>+ NUEVA NOTA</button>
      )}

      {/* Form */}
      {(creating || editingId) && (
        <div className="sv-note-form">
          <div className="sv-field">
            <div className="sv-field-label"><span>TITULO</span></div>
            <div className="sv-input-wrap">
              <input className="sv-input" type="text" placeholder="Titulo de la nota..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>
          <div className="sv-field">
            <div className="sv-field-label"><span>CONTENIDO</span></div>
            <textarea className="sv-input sv-textarea" placeholder="Contenido..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
          </div>
          {creating && (
            <div className="sv-field">
              <div className="sv-field-label"><span>COLOR DEL NODO</span></div>
              <div className="sv-node-color-row">
                {NODE_COLORS.map((c) => (
                  <button
                    key={c}
                    className={`sv-node-color-btn ${noteColor === c ? 'sv-node-color-active' : ''}`}
                    style={{ background: c }}
                    onClick={() => { setNoteColor(c); onSound('click'); }}
                    onMouseEnter={() => onSound('hover')}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="sv-burn-actions">
            <button className="sv-btn sv-btn-success" onClick={() => (editingId ? handleUpdate(editingId) : handleCreate())} disabled={!title.trim()} onMouseEnter={() => onSound('hover')}>
              {editingId ? 'ACTUALIZAR' : 'GUARDAR'}
            </button>
            <button className="sv-btn sv-btn-danger" onClick={() => { resetForm(); onSound('click'); }} onMouseEnter={() => onSound('hover')}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* GRAPH VIEW */}
      {viewMode === 'graph' && (
        <div className="sv-graph-wrap">
          <svg
            ref={svgRef}
            className="sv-graph-svg"
            viewBox="0 0 800 500"
            onMouseMove={onDragMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
          >
            {/* Edges: arc links between sequential nodes */}
            <g id="edges">
              {simNodes.map((node, i) => {
                if (i === 0) return null;
                const prev = simNodes[i - 1];
                const dx = node.x - prev.x;
                const dy = node.y - prev.y;
                const dr = Math.sqrt(dx * dx + dy * dy);
                return (
                  <path
                    key={`e-${node.id}`}
                    d={`M${prev.x},${prev.y}A${dr},${dr} 0 0,1 ${node.x},${node.y}`}
                    className="link"
                    fill="none"
                    stroke="#666"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g id="nodes">
              {simNodes.map((node) => {
                const r = 5 + node.weight * 2;
                const isPinned = node.fx !== null;
                const isSelected = selectedNode === node.id;
                return (
                  <g key={node.id}>
                    {/* Glow for selected */}
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={r + 4}
                        fill="none"
                        stroke={node.color}
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill={isPinned ? 'orange' : node.color}
                      stroke="black"
                      strokeWidth="1.5"
                      className={isPinned ? 'pinned' : ''}
                      style={{ cursor: dragging.current === node.id ? 'grabbing' : 'grab' }}
                      onMouseDown={(e) => onDragStart(node.id, e)}
                      onDoubleClick={() => onDblClick(node.id)}
                      onClick={() => { setSelectedNode(selectedNode === node.id ? null : node.id); onSound('click'); }}
                    />
                    <text
                      x={node.x}
                      y={node.y - r - 4}
                      fill="#fff"
                      fontSize="10"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      pointerEvents="none"
                      style={{ textTransform: 'capitalize' }}
                    >
                      {node.title.length > 20 ? node.title.slice(0, 20) + '...' : node.title}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {simNodes.length === 0 && (
            <div className="sv-graph-empty">CREA NOTAS PARA VER NODOS EN EL GRAFO</div>
          )}

          {/* Selected node detail */}
          {selectedNote && (
            <div className="sv-graph-detail">
              <div className="sv-corner sv-corner-tl" />
              <div className="sv-corner sv-corner-tr" />
              <div className="sv-corner sv-corner-bl" />
              <div className="sv-corner sv-corner-br" />
              <div className="sv-hex-detail-header">
                <div>
                  <h3 className="sv-detail-title" style={{ color: (selectedNote as any).color || '#4488ff' }}>{selectedNote.title}</h3>
                  <span className="sv-detail-cat">{formatDate(selectedNote.date)}</span>
                </div>
                <button className="sv-detail-close" onClick={() => setSelectedNode(null)} onMouseEnter={() => onSound('hover')}>&times;</button>
              </div>
              <p className="sv-detail-desc">{selectedNote.content || 'SIN CONTENIDO'}</p>

              {/* Color picker inline */}
              {showColorPicker && (
                <div className="sv-node-color-picker">
                  <div className="sv-field-label"><span>COLOR DEL NODO</span></div>
                  <div className="sv-node-color-row">
                    {NODE_COLORS.map((c) => (
                      <button
                        key={c}
                        className={`sv-node-color-btn ${(selectedNote as any).color === c ? 'sv-node-color-active' : ''}`}
                        style={{ background: c }}
                        onClick={() => changeNodeColor(selectedNote.id, c)}
                        onMouseEnter={() => onSound('hover')}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="sv-burn-actions" style={{ marginTop: '0.75rem' }}>
                <button className="sv-btn" onClick={() => { setShowColorPicker(!showColorPicker); onSound('click'); }} onMouseEnter={() => onSound('hover')}>COLOR</button>
                <button className="sv-btn" onClick={() => startEdit(selectedNote)} onMouseEnter={() => onSound('hover')}>EDITAR</button>
                <button className="sv-btn sv-btn-danger" onClick={() => handleDelete(selectedNote.id)} onMouseEnter={() => onSound('hover')}>ELIMINAR</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="sv-notes-list">
          {notes.length === 0 && <div className="sv-token-empty">SIN NOTAS REGISTRADAS.</div>}
          {notes.map((note) => (
            <div key={note.id} className="sv-note-card">
              <div className="sv-note-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="sv-node-color-dot" style={{ background: (note as any).color || '#4488ff' }} />
                  <div>
                    <span className="sv-note-title">{note.title}</span>
                    <span className="sv-note-date">{formatDate(note.date)}</span>
                  </div>
                </div>
                <div className="sv-note-actions">
                  <button className="sv-note-action-btn" onClick={() => startEdit(note)} onMouseEnter={() => onSound('hover')}>&#9998;</button>
                  <button className="sv-note-action-btn sv-note-delete" onClick={() => handleDelete(note.id)} onMouseEnter={() => onSound('hover')}>&#10005;</button>
                </div>
              </div>
              {note.content && <p className="sv-note-content">{note.content}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
