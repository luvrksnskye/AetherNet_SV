import { useState, useEffect, useCallback } from 'react';
import { useStorage } from '../../hooks/useStorage';
import type { NoteEntry } from '../../types';
import { generateId, getToday, formatDate } from '../../utils';

const STORAGE_KEY = 'notes:entries';

interface NotesPanelProps {
  onSound: (key: 'click' | 'hover') => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ onSound }) => {
  const storage = useStorage();
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await storage.get<NoteEntry[]>(STORAGE_KEY);
      if (saved) setNotes(saved);
      setLoaded(true);
    })();
  }, [storage]);

  const save = useCallback(
    async (next: NoteEntry[]) => {
      setNotes(next);
      await storage.set(STORAGE_KEY, next);
    },
    [storage],
  );

  const handleCreate = async () => {
    if (!title.trim()) return;
    onSound('click');
    const entry: NoteEntry = {
      id: generateId(),
      title: title.trim(),
      content: content.trim(),
      date: getToday(),
    };
    await save([entry, ...notes]);
    setTitle('');
    setContent('');
    setCreating(false);
  };

  const handleUpdate = async (id: string) => {
    onSound('click');
    const next = notes.map((n) =>
      n.id === id ? { ...n, title: title.trim(), content: content.trim() } : n,
    );
    await save(next);
    setEditing(null);
    setTitle('');
    setContent('');
  };

  const handleDelete = async (id: string) => {
    onSound('click');
    await save(notes.filter((n) => n.id !== id));
    if (editing === id) {
      setEditing(null);
      setTitle('');
      setContent('');
    }
  };

  const startEdit = (note: NoteEntry) => {
    onSound('click');
    setEditing(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCreating(false);
  };

  if (!loaded) {
    return (
      <div className="sv-dash-loading">
        <span className="sv-loader" />
      </div>
    );
  }

  return (
    <div className="sv-notes-dash">
      <div className="sv-section-header">
        <h2 className="sv-section-title">BITACORA</h2>
        <p className="sv-section-subtitle">NOTAS Y REGISTRO DE OPERACIONES</p>
      </div>

      {!creating && !editing && (
        <button
          className="sv-btn"
          onClick={() => {
            setCreating(true);
            onSound('click');
          }}
          onMouseEnter={() => onSound('hover')}
        >
          + NUEVA NOTA
        </button>
      )}

      {(creating || editing) && (
        <div className="sv-note-form">
          <div className="sv-field">
            <div className="sv-field-label">
              <span>TITULO</span>
            </div>
            <div className="sv-input-wrap">
              <input
                className="sv-input"
                type="text"
                placeholder="Titulo de la nota..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="sv-field">
            <div className="sv-field-label">
              <span>CONTENIDO</span>
            </div>
            <textarea
              className="sv-input sv-textarea"
              placeholder="Contenido de la nota..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          <div className="sv-burn-actions">
            <button
              className="sv-btn sv-btn-success"
              onClick={() => (editing ? handleUpdate(editing) : handleCreate())}
              disabled={!title.trim()}
              onMouseEnter={() => onSound('hover')}
            >
              {editing ? 'ACTUALIZAR' : 'GUARDAR'}
            </button>
            <button
              className="sv-btn sv-btn-danger"
              onClick={() => {
                setCreating(false);
                setEditing(null);
                setTitle('');
                setContent('');
                onSound('click');
              }}
              onMouseEnter={() => onSound('hover')}
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}

      <div className="sv-notes-list">
        {notes.length === 0 && (
          <div className="sv-token-empty">
            SIN NOTAS REGISTRADAS.
          </div>
        )}
        {notes.map((note) => (
          <div key={note.id} className="sv-note-card">
            <div className="sv-note-card-header">
              <div>
                <span className="sv-note-title">{note.title}</span>
                <span className="sv-note-date">{formatDate(note.date)}</span>
              </div>
              <div className="sv-note-actions">
                <button
                  className="sv-note-action-btn"
                  onClick={() => startEdit(note)}
                  onMouseEnter={() => onSound('hover')}
                >
                  &#9998;
                </button>
                <button
                  className="sv-note-action-btn sv-note-delete"
                  onClick={() => handleDelete(note.id)}
                  onMouseEnter={() => onSound('hover')}
                >
                  &#10005;
                </button>
              </div>
            </div>
            {note.content && (
              <p className="sv-note-content">{note.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
