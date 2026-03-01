import { useState, useEffect, useCallback, useRef } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { generateId } from '../../utils';

interface ListItem {
  id: string;
  text: string;
}

interface SortableList {
  id: string;
  title: string;
  items: ListItem[];
}

interface DragListsConfig {
  lists: SortableList[];
}

const STORAGE_KEY = 'draglists:config';

const defaultConfig: DragListsConfig = {
  lists: [
    { id: 'list-1', title: 'PRIORIDAD ALTA', items: [
      { id: 'i1', text: 'Resolver LeetCode diario' },
      { id: 'i2', text: 'Revisar PRs pendientes' },
      { id: 'i3', text: 'Estudiar capitulo de Algebra' },
    ]},
    { id: 'list-2', title: 'PRIORIDAD MEDIA', items: [
      { id: 'i4', text: 'Documentar API endpoints' },
      { id: 'i5', text: 'Practicar vocabulario ruso' },
      { id: 'i6', text: 'Optimizar queries SQL' },
    ]},
  ],
};

interface Props { onSound: (key: 'click' | 'hover') => void; }

export const DragLists: React.FC<Props> = ({ onSound }) => {
  const storage = useStorage();
  const [config, setConfig] = useState<DragListsConfig>(defaultConfig);
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [newListTitle, setNewListTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editTitleVal, setEditTitleVal] = useState('');
  const dragSrc = useRef<{ listId: string; itemIdx: number } | null>(null);
  const dragTarget = useRef<{ listId: string; itemIdx: number } | null>(null);

  useEffect(() => {
    const saved = storage.get<DragListsConfig>(STORAGE_KEY);
    if (saved) setConfig(saved);
  }, []);

  const save = useCallback((next: DragListsConfig) => {
    setConfig(next);
    storage.set(STORAGE_KEY, next);
  }, []);

  const addItem = (listId: string) => {
    const text = newItemText[listId]?.trim();
    if (!text) return;
    onSound('click');
    const item: ListItem = { id: generateId(), text };
    const next = {
      ...config,
      lists: config.lists.map((l) => l.id === listId ? { ...l, items: [...l.items, item] } : l),
    };
    save(next);
    setNewItemText((p) => ({ ...p, [listId]: '' }));
  };

  const removeItem = (listId: string, itemId: string) => {
    onSound('click');
    const next = {
      ...config,
      lists: config.lists.map((l) => l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l),
    };
    save(next);
  };

  const addList = () => {
    if (!newListTitle.trim()) return;
    onSound('click');
    const list: SortableList = { id: generateId(), title: newListTitle.trim(), items: [] };
    save({ ...config, lists: [...config.lists, list] });
    setNewListTitle('');
  };

  const removeList = (listId: string) => {
    onSound('click');
    save({ ...config, lists: config.lists.filter((l) => l.id !== listId) });
  };

  const renameList = (listId: string) => {
    if (!editTitleVal.trim()) { setEditingTitle(null); return; }
    onSound('click');
    const next = {
      ...config,
      lists: config.lists.map((l) => l.id === listId ? { ...l, title: editTitleVal.trim() } : l),
    };
    save(next);
    setEditingTitle(null);
  };

  const onDragStart = (listId: string, idx: number) => {
    dragSrc.current = { listId, itemIdx: idx };
  };

  const onDragEnter = (listId: string, idx: number) => {
    dragTarget.current = { listId, itemIdx: idx };
  };

  const onDragEnd = () => {
    if (!dragSrc.current || !dragTarget.current) return;
    const from = dragSrc.current;
    const to = dragTarget.current;
    const lists = config.lists.map((l) => ({ ...l, items: [...l.items] }));
    const srcList = lists.find((l) => l.id === from.listId);
    const dstList = lists.find((l) => l.id === to.listId);
    if (!srcList || !dstList) return;
    const [moved] = srcList.items.splice(from.itemIdx, 1);
    dstList.items.splice(to.itemIdx, 0, moved);
    save({ ...config, lists });
    dragSrc.current = null;
    dragTarget.current = null;
    onSound('click');
  };

  return (
    <div className="sv-draglists-dash">
      <div className="sv-section-header">
        <h2 className="sv-section-title">LISTAS CONECTADAS</h2>
        <p className="sv-section-subtitle">ARRASTRA ELEMENTOS ENTRE LISTAS PARA PRIORIZAR</p>
      </div>

      <div className="sv-draglists-container">
        {config.lists.map((list) => (
          <div key={list.id} className="sv-draglist" onDragOver={(e) => e.preventDefault()} onDrop={() => {
            if (!dragTarget.current || dragTarget.current.listId !== list.id) {
              dragTarget.current = { listId: list.id, itemIdx: list.items.length };
            }
            onDragEnd();
          }}>
            <div className="sv-draglist-header">
              {editingTitle === list.id ? (
                <input className="sv-input" value={editTitleVal} onChange={(e) => setEditTitleVal(e.target.value)} onBlur={() => renameList(list.id)} onKeyDown={(e) => e.key === 'Enter' && renameList(list.id)} autoFocus />
              ) : (
                <span className="sv-draglist-title" onDoubleClick={() => { setEditingTitle(list.id); setEditTitleVal(list.title); }}>{list.title}</span>
              )}
              <div className="sv-draglist-header-actions">
                <span className="sv-draglist-count">{list.items.length}</span>
                <button className="sv-focus-node-delete" onClick={() => removeList(list.id)} onMouseEnter={() => onSound('hover')}>&times;</button>
              </div>
            </div>

            <div className="sv-draglist-items">
              {list.items.map((item, idx) => (
                <div key={item.id} className="sv-draglist-item" draggable onDragStart={() => onDragStart(list.id, idx)} onDragEnter={() => onDragEnter(list.id, idx)} onDragEnd={onDragEnd} onDragOver={(e) => e.preventDefault()}>
                  <span className="sv-draglist-grip">:::</span>
                  <span className="sv-draglist-text">{item.text}</span>
                  <button className="sv-draglist-remove" onClick={() => removeItem(list.id, item.id)} onMouseEnter={() => onSound('hover')}>&times;</button>
                </div>
              ))}
            </div>

            <div className="sv-draglist-add">
              <input className="sv-input" type="text" placeholder="NUEVO ITEM..." value={newItemText[list.id] || ''} onChange={(e) => setNewItemText((p) => ({ ...p, [list.id]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addItem(list.id)} />
              <button className="sv-btn sv-btn-success" onClick={() => addItem(list.id)} disabled={!newItemText[list.id]?.trim()} onMouseEnter={() => onSound('hover')}>+</button>
            </div>

            <svg className="sv-draglist-connector" viewBox="0 0 20 60" preserveAspectRatio="none">
              <path d="M10 0 Q10 30 10 60" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" strokeDasharray="4 4">
                <animate attributeName="stroke-dashoffset" values="0;8" dur="1s" repeatCount="indefinite" />
              </path>
            </svg>
          </div>
        ))}

        <div className="sv-draglist sv-draglist-new">
          <input className="sv-input" type="text" placeholder="NUEVA LISTA..." value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addList()} />
          <button className="sv-btn" onClick={addList} disabled={!newListTitle.trim()} onMouseEnter={() => onSound('hover')}>+ LISTA</button>
        </div>
      </div>
    </div>
  );
};
