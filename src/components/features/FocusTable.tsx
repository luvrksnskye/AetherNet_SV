import { useState, useEffect, useCallback, useRef } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { generateId, getToday } from '../../utils';

interface FocusNode {
  id: string;
  text: string;
  status: 'pending' | 'active' | 'done';
  color: string;
}

interface FocusBoard {
  id: string;
  title: string;
  date: string;
  columns: { id: string; title: string; nodes: FocusNode[] }[];
}

const COLORS = ['#ff4466', '#4488ff', '#aa44ff', '#00ff88'];
const STATUS_LABELS: Record<string, string> = { pending: 'PENDIENTE', active: 'ACTIVO', done: 'COMPLETADO' };
const STORAGE_KEY = 'focus:boards';

interface Props { onSound: (key: 'click' | 'hover') => void; }

export const FocusTable: React.FC<Props> = ({ onSound }) => {
  const storage = useStorage();
  const [boards, setBoards] = useState<FocusBoard[]>([]);
  const [activeBoard, setActiveBoard] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newNodeText, setNewNodeText] = useState('');
  const [newNodeCol, setNewNodeCol] = useState('');
  const [newColTitle, setNewColTitle] = useState('');
  const dragItem = useRef<{ colId: string; nodeIdx: number } | null>(null);
  const dragOverItem = useRef<{ colId: string; nodeIdx: number } | null>(null);

  useEffect(() => {
    const saved = storage.get<FocusBoard[]>(STORAGE_KEY);
    if (saved?.length) { setBoards(saved); setActiveBoard(saved[0].id); }
  }, []);

  const save = useCallback((next: FocusBoard[]) => {
    setBoards(next);
    storage.set(STORAGE_KEY, next);
  }, []);

  const board = boards.find((b) => b.id === activeBoard) || null;

  const createBoard = () => {
    if (!newTitle.trim()) return;
    onSound('click');
    const b: FocusBoard = {
      id: generateId(),
      title: newTitle.trim(),
      date: getToday(),
      columns: [
        { id: generateId(), title: 'POR HACER', nodes: [] },
        { id: generateId(), title: 'EN PROGRESO', nodes: [] },
        { id: generateId(), title: 'TERMINADO', nodes: [] },
      ],
    };
    const next = [b, ...boards];
    save(next);
    setActiveBoard(b.id);
    setNewTitle('');
  };

  const addColumn = () => {
    if (!board || !newColTitle.trim()) return;
    onSound('click');
    const col = { id: generateId(), title: newColTitle.trim(), nodes: [] };
    const next = boards.map((b) => b.id === board.id ? { ...b, columns: [...b.columns, col] } : b);
    save(next);
    setNewColTitle('');
  };

  const addNode = (colId: string) => {
    if (!board || !newNodeText.trim()) return;
    onSound('click');
    const node: FocusNode = { id: generateId(), text: newNodeText.trim(), status: 'pending', color: COLORS[Math.floor(Math.random() * COLORS.length)] };
    const next = boards.map((b) => b.id === board.id ? {
      ...b,
      columns: b.columns.map((c) => c.id === colId ? { ...c, nodes: [...c.nodes, node] } : c),
    } : b);
    save(next);
    setNewNodeText('');
    setNewNodeCol('');
  };

  const cycleStatus = (colId: string, nodeId: string) => {
    if (!board) return;
    onSound('click');
    const order: FocusNode['status'][] = ['pending', 'active', 'done'];
    const next = boards.map((b) => b.id === board.id ? {
      ...b,
      columns: b.columns.map((c) => c.id === colId ? {
        ...c,
        nodes: c.nodes.map((n) => n.id === nodeId ? { ...n, status: order[(order.indexOf(n.status) + 1) % 3] } : n),
      } : c),
    } : b);
    save(next);
  };

  const removeNode = (colId: string, nodeId: string) => {
    if (!board) return;
    onSound('click');
    const next = boards.map((b) => b.id === board.id ? {
      ...b,
      columns: b.columns.map((c) => c.id === colId ? { ...c, nodes: c.nodes.filter((n) => n.id !== nodeId) } : c),
    } : b);
    save(next);
  };

  const removeBoard = (boardId: string) => {
    onSound('click');
    const next = boards.filter((b) => b.id !== boardId);
    save(next);
    if (activeBoard === boardId) setActiveBoard(next[0]?.id || null);
  };

  const handleDragStart = (colId: string, nodeIdx: number) => {
    dragItem.current = { colId, nodeIdx };
  };

  const handleDragEnter = (colId: string, nodeIdx: number) => {
    dragOverItem.current = { colId, nodeIdx };
  };

  const handleDragEnd = () => {
    if (!board || !dragItem.current || !dragOverItem.current) return;
    const from = dragItem.current;
    const to = dragOverItem.current;
    const cols = board.columns.map((c) => ({ ...c, nodes: [...c.nodes] }));
    const fromCol = cols.find((c) => c.id === from.colId);
    const toCol = cols.find((c) => c.id === to.colId);
    if (!fromCol || !toCol) return;
    const [moved] = fromCol.nodes.splice(from.nodeIdx, 1);
    toCol.nodes.splice(to.nodeIdx, 0, moved);
    const next = boards.map((b) => b.id === board.id ? { ...b, columns: cols } : b);
    save(next);
    dragItem.current = null;
    dragOverItem.current = null;
    onSound('click');
  };

  return (
    <div className="sv-focus-dash">
      <div className="sv-section-header">
        <h2 className="sv-section-title">TABLAS DE ENFOQUE</h2>
        <p className="sv-section-subtitle">ORGANIZA TAREAS EN NODOS VISUALES</p>
      </div>

      <div className="sv-focus-tabs">
        {boards.map((b) => (
          <button key={b.id} className={`sv-focus-tab ${activeBoard === b.id ? 'active' : ''}`} onClick={() => { setActiveBoard(b.id); onSound('click'); }} onMouseEnter={() => onSound('hover')}>
            {b.title}
            <span className="sv-focus-tab-close" onClick={(e) => { e.stopPropagation(); removeBoard(b.id); }}>&times;</span>
          </button>
        ))}
        <div className="sv-focus-new-board">
          <input className="sv-input" type="text" placeholder="NUEVA TABLA..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createBoard()} />
          <button className="sv-btn sv-btn-success" onClick={createBoard} disabled={!newTitle.trim()} onMouseEnter={() => onSound('hover')}>+</button>
        </div>
      </div>

      {board && (
        <div className="sv-focus-board">
          {board.columns.map((col) => (
            <div key={col.id} className="sv-focus-column" onDragOver={(e) => e.preventDefault()} onDrop={() => { if (!dragOverItem.current || dragOverItem.current.colId !== col.id) { dragOverItem.current = { colId: col.id, nodeIdx: col.nodes.length }; } handleDragEnd(); }}>
              <div className="sv-focus-col-header">
                <span className="sv-focus-col-title">{col.title}</span>
                <span className="sv-focus-col-count">{col.nodes.length}</span>
              </div>
              <div className="sv-focus-col-nodes">
                {col.nodes.map((node, idx) => (
                  <div key={node.id} className={`sv-focus-node sv-focus-node-${node.status}`} draggable onDragStart={() => handleDragStart(col.id, idx)} onDragEnter={() => handleDragEnter(col.id, idx)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}>
                    <div className="sv-focus-node-indicator" style={{ background: node.color }} />
                    <div className="sv-focus-node-body">
                      <span className="sv-focus-node-text">{node.text}</span>
                      <div className="sv-focus-node-actions">
                        <button className="sv-focus-node-status" onClick={() => cycleStatus(col.id, node.id)} onMouseEnter={() => onSound('hover')}>{STATUS_LABELS[node.status]}</button>
                        <button className="sv-focus-node-delete" onClick={() => removeNode(col.id, node.id)} onMouseEnter={() => onSound('hover')}>&times;</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="sv-focus-col-add">
                {newNodeCol === col.id ? (
                  <div className="sv-focus-add-form">
                    <input className="sv-input" type="text" placeholder="NUEVO NODO..." value={newNodeText} onChange={(e) => setNewNodeText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNode(col.id)} autoFocus />
                    <div className="sv-focus-add-btns">
                      <button className="sv-btn sv-btn-success" onClick={() => addNode(col.id)} disabled={!newNodeText.trim()}>AGREGAR</button>
                      <button className="sv-btn" onClick={() => { setNewNodeCol(''); setNewNodeText(''); }}>CANCELAR</button>
                    </div>
                  </div>
                ) : (
                  <button className="sv-focus-add-btn" onClick={() => { setNewNodeCol(col.id); onSound('click'); }} onMouseEnter={() => onSound('hover')}>+ NODO</button>
                )}
              </div>
            </div>
          ))}
          <div className="sv-focus-column sv-focus-add-col">
            <input className="sv-input" type="text" placeholder="NUEVA COLUMNA..." value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addColumn()} />
            <button className="sv-btn" onClick={addColumn} disabled={!newColTitle.trim()} onMouseEnter={() => onSound('hover')}>+ COLUMNA</button>
          </div>
        </div>
      )}

      {!board && boards.length === 0 && (
        <div className="sv-focus-empty">
          <p className="sv-section-subtitle">CREA TU PRIMERA TABLA DE ENFOQUE PARA ORGANIZAR TAREAS</p>
        </div>
      )}
    </div>
  );
};
