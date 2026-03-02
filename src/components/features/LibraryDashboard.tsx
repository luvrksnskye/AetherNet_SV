import { useState, useEffect, useCallback, useMemo } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { generateId } from '../../utils';

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface LibraryLink {
  id: string;
  title: string;
  url: string;
  section: string;
  tags: string[];
  pinned: boolean;
  dateAdded: string;
}

type SectionFilter = 'all' | string;
type ViewMode = 'grid' | 'list';

interface LibraryDashboardProps {
  onSound: (key: 'click' | 'hover') => void;
}

/* ------------------------------------------------------------------ */
/*  SEED DATA                                                          */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  'MATEMATICAS',
  'PLATAFORMAS',
  'CANALES EN',
  'CANALES ES',
  'AVANZADO',
  'COMUNIDAD',
  'PERSONALIZADO',
] as const;

const SEED_LINKS: Omit<LibraryLink, 'id' | 'pinned' | 'dateAdded'>[] = [
  /* PLATAFORMAS */
  { title: 'Khan Academy', url: 'https://www.khanacademy.org/', section: 'PLATAFORMAS', tags: ['gratuito', 'interactivo', 'basico'] },
  { title: 'Brilliant', url: 'https://brilliant.org/', section: 'PLATAFORMAS', tags: ['interactivo', 'premium', 'problemas'] },
  { title: 'IXL Learning', url: 'https://www.ixl.com/', section: 'PLATAFORMAS', tags: ['practica', 'K-12', 'interactivo'] },
  { title: 'HippoCampus', url: 'https://www.hippocampus.org/', section: 'PLATAFORMAS', tags: ['gratuito', 'video', 'multimedia'] },
  { title: 'Art of Problem Solving', url: 'https://artofproblemsolving.com/', section: 'PLATAFORMAS', tags: ['competencia', 'avanzado', 'comunidad'] },
  { title: 'Duolingo Math Blog', url: 'https://blog.duolingo.com/es/hub/matematicas/', section: 'PLATAFORMAS', tags: ['gratuito', 'basico', 'espanol'] },

  /* CANALES EN */
  { title: '3Blue1Brown', url: 'https://www.youtube.com/channel/UCYO_jab_esuFRV4b17AJtAw', section: 'CANALES EN', tags: ['visual', 'teoria', 'animacion'] },
  { title: 'Numberphile', url: 'https://www.youtube.com/user/numberphile', section: 'CANALES EN', tags: ['divulgacion', 'curiosidad', 'entrevistas'] },
  { title: 'Mathologer', url: 'https://www.youtube.com/channel/UC1_uAIS3r8Vu6JjXWvastJg', section: 'CANALES EN', tags: ['visual', 'pruebas', 'avanzado'] },
  { title: 'Professor Leonard', url: 'https://www.youtube.com/user/professorleonard57', section: 'CANALES EN', tags: ['calculo', 'lecturas', 'completo'] },
  { title: 'ProfRobBob', url: 'https://www.youtube.com/user/profrobbob', section: 'CANALES EN', tags: ['algebra', 'trigonometria', 'basico'] },
  { title: 'MathTV', url: 'https://www.mathtv.com/', section: 'CANALES EN', tags: ['video', 'explicaciones', 'basico'] },
  { title: 'Standupmaths', url: 'https://www.youtube.com/channel/UCSju5G2aFaWMqn-_0YBtq5A', section: 'CANALES EN', tags: ['entretenimiento', 'divulgacion'] },
  { title: 'PBS Infinite Series', url: 'https://www.youtube.com/channel/UCs4aHmggTfFrpkPcWSaBN9g', section: 'CANALES EN', tags: ['divulgacion', 'teoria'] },
  { title: 'Math Dr. Bob', url: 'https://www.youtube.com/user/MathDoctorBob', section: 'CANALES EN', tags: ['algebra', 'abstracto', 'avanzado'] },
  { title: 'UKMathsTeacher', url: 'https://www.youtube.com/user/schoolmaths', section: 'CANALES EN', tags: ['basico', 'didactico'] },

  /* CANALES ES */
  { title: 'El Traductor de Ingenieria', url: 'https://www.youtube.com/@eltraductor_ok', section: 'CANALES ES', tags: ['ingenieria', 'espanol', 'aplicado'] },
  { title: 'Carlos Hernandez', url: 'https://www.youtube.com/@CarlosHernandezYouTube', section: 'CANALES ES', tags: ['espanol', 'explicaciones'] },
  { title: 'Demian Yael Vega', url: 'https://www.youtube.com/watch?v=nG__QtFl7VY', section: 'CANALES ES', tags: ['espanol', 'basico'] },
  { title: 'MathPures', url: 'https://www.youtube.com/@MathPuresChannel', section: 'CANALES ES', tags: ['espanol', 'puro'] },
  { title: 'ProfeAlex', url: 'https://www.youtube.com/@MatematicasprofeAlex', section: 'CANALES ES', tags: ['espanol', 'didactico', 'basico'] },
  { title: 'APRENDE MATEMATICAS DESDE CERO', url: 'https://www.youtube.com/watch?v=-RDBMu7BreE', section: 'CANALES ES', tags: ['espanol', 'basico', 'fundamentos'] },
  { title: 'Matematicas para la vida real', url: 'https://www.youtube.com/watch?v=V33U1OsFVnQ', section: 'CANALES ES', tags: ['espanol', 'aplicado'] },
  { title: 'Math Sorcerer Espanol', url: 'https://www.youtube.com/watch?v=_Z5FglGwewM', section: 'CANALES ES', tags: ['espanol', 'estudio'] },
  { title: 'EL ABC DE LAS MATEMATICAS', url: 'https://www.youtube.com/watch?v=vMSrAcrH9tg', section: 'CANALES ES', tags: ['espanol', 'fundamentos'] },
  { title: 'Para que sirven las matematicas?', url: 'https://www.youtube.com/watch?v=Cwq4dRBWcr8', section: 'CANALES ES', tags: ['espanol', 'motivacion'] },

  /* AVANZADO */
  { title: 'Institute for Advanced Study', url: 'https://www.youtube.com/user/videosfromIAS', section: 'AVANZADO', tags: ['investigacion', 'conferencias'] },
  { title: 'IHES YouTube', url: 'https://www.youtube.com/channel/UC4R1IsRVKs_qlWKTm9pT82Q', section: 'AVANZADO', tags: ['investigacion', 'conferencias'] },
  { title: 'Hausdorff Institute', url: 'https://www.youtube.com/channel/UC2F-j2KMho0zVWIPFKWoXoA/videos', section: 'AVANZADO', tags: ['investigacion', 'seminarios'] },
  { title: 'Worldwide Center of Mathematics', url: 'https://www.youtube.com/channel/UCfbSz1B68ytEKX0D6AFdddQ', section: 'AVANZADO', tags: ['lecturas', 'universidad'] },
  { title: 'The Catsters - Category Theory', url: 'https://www.youtube.com/channel/UC5Y9H2KDRHZZTWZJtlH4VbA', section: 'AVANZADO', tags: ['teoria de categorias', 'abstracto'] },
  { title: 'Online Encyclopedia of Integer Sequences', url: 'https://oeis.org/', section: 'AVANZADO', tags: ['referencia', 'secuencias', 'investigacion'] },

  /* COMUNIDAD */
  { title: 'r/math', url: 'https://www.reddit.com/r/math/', section: 'COMUNIDAD', tags: ['foro', 'discusion', 'comunidad'] },
  { title: 'Math Overflow - Free Lectures', url: 'https://mathoverflow.net/questions/54430/video-lectures-of-mathematics-courses-available-online-for-free', section: 'COMUNIDAD', tags: ['lista', 'conferencias', 'gratuito'] },
  { title: 'NCTM Classroom Resources', url: 'https://www.nctm.org/classroomresources/', section: 'COMUNIDAD', tags: ['pedagogia', 'recursos'] },
  { title: 'Large List of Recommended Books', url: 'https://hbpms.blogspot.com/', section: 'COMUNIDAD', tags: ['libros', 'lista', 'referencia'] },
];

const STORAGE_KEY = 'library:links';

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export const LibraryDashboard: React.FC<LibraryDashboardProps> = ({ onSound }) => {
  const storage = useStorage();
  const [links, setLinks] = useState<LibraryLink[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [addingNew, setAddingNew] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '', section: 'PERSONALIZADO', tags: '' });

  /* Load or seed */
  useEffect(() => {
    const saved = storage.get<LibraryLink[]>(STORAGE_KEY);
    if (saved && saved.length > 0) {
      setLinks(saved);
    } else {
      const seeded: LibraryLink[] = SEED_LINKS.map((s) => ({
        ...s,
        id: generateId(),
        pinned: false,
        dateAdded: new Date().toISOString().split('T')[0],
      }));
      setLinks(seeded);
      storage.set(STORAGE_KEY, seeded);
    }
    setLoaded(true);
  }, []);

  const save = useCallback(
    (next: LibraryLink[]) => {
      setLinks(next);
      storage.set(STORAGE_KEY, next);
    },
    [storage],
  );

  /* Computed */
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    links.forEach((l) => l.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [links]);

  const filteredLinks = useMemo(() => {
    let result = links;

    if (sectionFilter !== 'all') {
      result = result.filter((l) => l.section === sectionFilter);
    }

    if (tagFilter) {
      result = result.filter((l) => l.tags.includes(tagFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.tags.some((t) => t.includes(q)) ||
          l.section.toLowerCase().includes(q),
      );
    }

    return [...result].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [links, sectionFilter, tagFilter, searchQuery]);

  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    links.forEach((l) => {
      counts[l.section] = (counts[l.section] || 0) + 1;
    });
    return counts;
  }, [links]);

  /* Actions */
  const togglePin = useCallback(
    (id: string) => {
      onSound('click');
      save(links.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l)));
    },
    [links, save, onSound],
  );

  const removeLink = useCallback(
    (id: string) => {
      onSound('click');
      save(links.filter((l) => l.id !== id));
    },
    [links, save, onSound],
  );

  const addLink = useCallback(() => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    onSound('click');
    const entry: LibraryLink = {
      id: generateId(),
      title: newLink.title.trim(),
      url: newLink.url.trim(),
      section: newLink.section,
      tags: newLink.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      pinned: false,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    save([entry, ...links]);
    setNewLink({ title: '', url: '', section: 'PERSONALIZADO', tags: '' });
    setAddingNew(false);
  }, [newLink, links, save, onSound]);

  /* Helpers */
  const getDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getSectionIcon = (section: string): string => {
    switch (section) {
      case 'MATEMATICAS': return '\u03C0';
      case 'PLATAFORMAS': return '\u2338';
      case 'CANALES EN': return '\u25B6';
      case 'CANALES ES': return '\u25B6';
      case 'AVANZADO': return '\u2234';
      case 'COMUNIDAD': return '\u2318';
      case 'PERSONALIZADO': return '\u2605';
      default: return '\u25CF';
    }
  };

  if (!loaded) {
    return (
      <div className="sv-dash-loading">
        <span className="sv-loader" />
      </div>
    );
  }

  return (
    <div className="sv-library-dash">
      {/* Header */}
      <div className="sv-section-header sv-anim-stagger-1">
        <h2 className="sv-section-title">BIBLIOTECA</h2>
        <p className="sv-section-subtitle">
          RECURSOS Y MEDIA DE CONTENIDO &mdash; {links.length} ENLACES
        </p>
      </div>

      {/* Toolbar */}
      <div className="sv-library-toolbar sv-anim-stagger-2">
        <div className="sv-library-search">
          <span className="sv-library-search-icon">{'\u2315'}</span>
          <input
            className="sv-input sv-library-search-input"
            type="text"
            placeholder="BUSCAR RECURSO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="sv-library-search-clear"
              onClick={() => { setSearchQuery(''); onSound('click'); }}
            >
              {'\u2715'}
            </button>
          )}
        </div>

        <div className="sv-library-toolbar-right">
          <div className="sv-library-view-toggle">
            <button
              className={`sv-library-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => { setViewMode('grid'); onSound('click'); }}
              onMouseEnter={() => onSound('hover')}
            >
              {'\u2588\u2588'}
            </button>
            <button
              className={`sv-library-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => { setViewMode('list'); onSound('click'); }}
              onMouseEnter={() => onSound('hover')}
            >
              {'\u2261'}
            </button>
          </div>

          <button
            className={`sv-btn ${addingNew ? 'sv-btn-danger' : 'sv-btn-success'}`}
            onClick={() => { setAddingNew(!addingNew); onSound('click'); }}
            onMouseEnter={() => onSound('hover')}
          >
            {addingNew ? '\u2715 CANCELAR' : '+ AGREGAR'}
          </button>
        </div>
      </div>

      {/* Add form */}
      {addingNew && (
        <div className="sv-library-add-form sv-anim-stagger-1">
          <div className="sv-library-form-backdrop">
            <div className="sv-library-form-corner" />
          </div>
          <div className="sv-library-form-content">
            <div className="sv-field">
              <div className="sv-field-label"><span>TITULO</span></div>
              <input
                className="sv-input"
                type="text"
                placeholder="NOMBRE DEL RECURSO"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              />
            </div>
            <div className="sv-field">
              <div className="sv-field-label"><span>URL</span></div>
              <input
                className="sv-input"
                type="url"
                placeholder="https://..."
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              />
            </div>
            <div className="sv-library-form-row">
              <div className="sv-field" style={{ flex: 1 }}>
                <div className="sv-field-label"><span>SECCION</span></div>
                <select
                  className="sv-input sv-library-select"
                  value={newLink.section}
                  onChange={(e) => setNewLink({ ...newLink, section: e.target.value })}
                >
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="sv-field" style={{ flex: 1 }}>
                <div className="sv-field-label"><span>ETIQUETAS (COMAS)</span></div>
                <input
                  className="sv-input"
                  type="text"
                  placeholder="tag1, tag2, tag3"
                  value={newLink.tags}
                  onChange={(e) => setNewLink({ ...newLink, tags: e.target.value })}
                />
              </div>
            </div>
            <button
              className="sv-btn sv-btn-success"
              onClick={addLink}
              disabled={!newLink.title.trim() || !newLink.url.trim()}
              onMouseEnter={() => onSound('hover')}
            >
              GUARDAR ENLACE
            </button>
          </div>
        </div>
      )}

      {/* Section filter tabs */}
      <div className="sv-library-sections sv-anim-stagger-3">
        <button
          className={`sv-library-section-tab ${sectionFilter === 'all' ? 'active' : ''}`}
          onClick={() => { setSectionFilter('all'); setTagFilter(null); onSound('click'); }}
          onMouseEnter={() => onSound('hover')}
        >
          TODOS ({links.length})
        </button>
        {SECTIONS.map((s) => (
          <button
            key={s}
            className={`sv-library-section-tab ${sectionFilter === s ? 'active' : ''}`}
            onClick={() => { setSectionFilter(s); setTagFilter(null); onSound('click'); }}
            onMouseEnter={() => onSound('hover')}
          >
            <span className="sv-library-section-icon">{getSectionIcon(s)}</span>
            {s} ({sectionCounts[s] || 0})
          </button>
        ))}
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="sv-library-tags sv-anim-stagger-3">
          {tagFilter && (
            <button
              className="sv-library-tag active"
              onClick={() => { setTagFilter(null); onSound('click'); }}
              onMouseEnter={() => onSound('hover')}
            >
              {'\u2715'} {tagFilter}
            </button>
          )}
          {allTags
            .filter((t) => t !== tagFilter)
            .slice(0, 20)
            .map((tag) => (
              <button
                key={tag}
                className="sv-library-tag"
                onClick={() => { setTagFilter(tag); onSound('click'); }}
                onMouseEnter={() => onSound('hover')}
              >
                {tag}
              </button>
            ))}
        </div>
      )}

      {/* Results */}
      <div className="sv-library-results-info">
        <span>{filteredLinks.length} RESULTADO{filteredLinks.length !== 1 ? 'S' : ''}</span>
      </div>

      {/* Link cards */}
      <div className={`sv-library-grid ${viewMode === 'list' ? 'sv-library-list-view' : ''} sv-anim-stagger-4`}>
        {filteredLinks.map((link) => (
          <div
            key={link.id}
            className={`sv-library-card ${link.pinned ? 'sv-library-card-pinned' : ''}`}
          >
            <div className="sv-library-card-backdrop">
              <div className="sv-library-card-corner" />
            </div>

            <div className="sv-library-card-content">
              <div className="sv-library-card-header">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sv-library-card-title"
                  onMouseEnter={() => onSound('hover')}
                >
                  {link.title}
                </a>
                <div className="sv-library-card-actions">
                  <button
                    className={`sv-library-card-btn ${link.pinned ? 'sv-library-pinned' : ''}`}
                    onClick={() => togglePin(link.id)}
                    onMouseEnter={() => onSound('hover')}
                    title={link.pinned ? 'Desfijar' : 'Fijar'}
                  >
                    {link.pinned ? '\u2605' : '\u2606'}
                  </button>
                  <button
                    className="sv-library-card-btn sv-library-delete"
                    onClick={() => removeLink(link.id)}
                    onMouseEnter={() => onSound('hover')}
                    title="Eliminar"
                  >
                    {'\u2715'}
                  </button>
                </div>
              </div>

              <span className="sv-library-card-domain">{getDomain(link.url)}</span>

              <div className="sv-library-card-meta">
                <span className="sv-library-card-section">
                  {getSectionIcon(link.section)} {link.section}
                </span>
              </div>

              {link.tags.length > 0 && (
                <div className="sv-library-card-tags">
                  {link.tags.map((tag) => (
                    <span
                      key={tag}
                      className="sv-library-card-tag"
                      onClick={() => { setTagFilter(tag); onSound('click'); }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredLinks.length === 0 && (
        <div className="sv-library-empty">
          <span>NO SE ENCONTRARON RECURSOS</span>
          <span className="sv-library-empty-sub">INTENTA CON OTRO FILTRO O AGREGA UNO NUEVO</span>
        </div>
      )}
    </div>
  );
};
