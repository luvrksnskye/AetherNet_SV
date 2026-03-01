import { useState, useEffect, useCallback } from 'react';
import { useStorage } from '../../hooks/useStorage';
import {
  AXIOM_CORE_PHASES,
  COMPUTATIONAL_PHASES,
  type RoadmapProgress,
} from '../../types';

const STORAGE_KEY = 'roadmap:progress';

interface RoadmapDashboardProps {
  onSound: (key: 'click' | 'hover') => void;
}

type Branch = 'axiom-core' | 'computational';

export const RoadmapDashboard: React.FC<RoadmapDashboardProps> = ({ onSound }) => {
  const storage = useStorage();
  const [progress, setProgress] = useState<Record<string, RoadmapProgress>>({});
  const [branch, setBranch] = useState<Branch>('axiom-core');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const phases = branch === 'axiom-core' ? AXIOM_CORE_PHASES : COMPUTATIONAL_PHASES;

  useEffect(() => {
    (async () => {
      const saved = await storage.get<Record<string, RoadmapProgress>>(STORAGE_KEY);
      if (saved) setProgress(saved);
      setLoaded(true);
    })();
  }, [storage]);

  const save = useCallback(
    async (next: Record<string, RoadmapProgress>) => {
      setProgress(next);
      await storage.set(STORAGE_KEY, next);
    },
    [storage],
  );

  const getStatus = (phaseId: string) =>
    progress[phaseId]?.status || 'locked';

  const getCompleted = (phaseId: string) =>
    progress[phaseId]?.completedTopics || [];

  const toggleTopic = async (phaseId: string, topic: string) => {
    onSound('click');
    const current = progress[phaseId] || {
      phaseId,
      status: 'active' as const,
      completedTopics: [],
      notes: '',
    };
    const topics = current.completedTopics.includes(topic)
      ? current.completedTopics.filter((t) => t !== topic)
      : [...current.completedTopics, topic];

    const phase = [...AXIOM_CORE_PHASES, ...COMPUTATIONAL_PHASES].find(
      (p) => p.id === phaseId,
    );
    const allDone = phase ? topics.length >= phase.topics.length : false;

    const next = {
      ...progress,
      [phaseId]: {
        ...current,
        completedTopics: topics,
        status: allDone ? ('completed' as const) : ('active' as const),
        startDate: current.startDate || new Date().toISOString().split('T')[0],
        completedDate: allDone ? new Date().toISOString().split('T')[0] : undefined,
      },
    };
    await save(next);
  };

  const updateNotes = async (phaseId: string, notes: string) => {
    const current = progress[phaseId] || {
      phaseId,
      status: 'active' as const,
      completedTopics: [],
      notes: '',
    };
    await save({
      ...progress,
      [phaseId]: { ...current, notes },
    });
  };

  const activatePhase = async (phaseId: string) => {
    onSound('click');
    const current = progress[phaseId] || {
      phaseId,
      status: 'locked' as const,
      completedTopics: [],
      notes: '',
    };
    if (current.status === 'locked') {
      await save({
        ...progress,
        [phaseId]: {
          ...current,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
        },
      });
    }
  };

  const totalPhases = phases.length;
  const completedPhases = phases.filter(
    (p) => getStatus(p.id) === 'completed',
  ).length;
  const overallProgress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

  if (!loaded) {
    return (
      <div className="sv-dash-loading">
        <span className="sv-loader" />
      </div>
    );
  }

  return (
    <div className="sv-roadmap-dash">
      <div className="sv-section-header">
        <h2 className="sv-section-title">ROADMAP OPERATIVO</h2>
        <p className="sv-section-subtitle">PROGRESO DE MODULOS DE ENTRENAMIENTO</p>
      </div>

      <div className="sv-method-toggle">
        <button
          className={`sv-method-btn ${branch === 'axiom-core' ? 'active' : ''}`}
          onClick={() => {
            setBranch('axiom-core');
            setExpanded(null);
            onSound('click');
          }}
          onMouseEnter={() => onSound('hover')}
        >
          AXIOM CORE
        </button>
        <button
          className={`sv-method-btn ${branch === 'computational' ? 'active' : ''}`}
          onClick={() => {
            setBranch('computational');
            setExpanded(null);
            onSound('click');
          }}
          onMouseEnter={() => onSound('hover')}
        >
          COMPUTATIONAL
        </button>
      </div>

      <div className="sv-roadmap-progress-bar">
        <div className="sv-field-label">
          <span>PROGRESO GENERAL</span>
          <span>
            {completedPhases}/{totalPhases} FASES
          </span>
        </div>
        <div className="sv-token-bar">
          <div
            className="sv-token-bar-fill sv-bar-success"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="sv-roadmap-phases">
        {phases.map((phase) => {
          const status = getStatus(phase.id);
          const completed = getCompleted(phase.id);
          const isExpanded = expanded === phase.id;
          const topicProgress =
            phase.topics.length > 0
              ? (completed.length / phase.topics.length) * 100
              : 0;

          return (
            <div
              key={phase.id}
              className={`sv-roadmap-phase sv-phase-${status}`}
            >
              <button
                className="sv-roadmap-phase-header"
                onClick={() => {
                  setExpanded(isExpanded ? null : phase.id);
                  onSound('click');
                }}
                onMouseEnter={() => onSound('hover')}
              >
                <div className="sv-roadmap-phase-left">
                  <span className="sv-roadmap-phase-num">
                    {String(phase.number).padStart(2, '0')}
                  </span>
                  <div className="sv-roadmap-phase-info">
                    <span className="sv-roadmap-phase-title">{phase.title}</span>
                    <span className="sv-roadmap-phase-domain">{phase.domain}</span>
                  </div>
                </div>
                <div className="sv-roadmap-phase-right">
                  <span className={`sv-node-badge sv-node-${status === 'completed' ? 'active' : status === 'active' ? 'standby' : 'critical'}`}>
                    {status === 'completed'
                      ? 'COMPLETADO'
                      : status === 'active'
                        ? 'EN CURSO'
                        : 'BLOQUEADO'}
                  </span>
                  <span className="sv-roadmap-arrow">
                    {isExpanded ? '\u25B4' : '\u25BE'}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="sv-roadmap-phase-body">
                  {status === 'locked' && (
                    <button
                      className="sv-btn"
                      onClick={() => activatePhase(phase.id)}
                      onMouseEnter={() => onSound('hover')}
                    >
                      ACTIVAR FASE
                    </button>
                  )}

                  <div className="sv-roadmap-tactical">
                    <div className="sv-field-label">
                      <span>VALOR TACTICO</span>
                    </div>
                    <p className="sv-roadmap-tactical-text">
                      {phase.tacticalValue}
                    </p>
                  </div>

                  {status !== 'locked' && (
                    <>
                      <div className="sv-roadmap-topics">
                        <div className="sv-field-label">
                          <span>MODULOS</span>
                          <span>
                            {completed.length}/{phase.topics.length}
                          </span>
                        </div>
                        <div className="sv-token-bar" style={{ marginBottom: '0.5rem' }}>
                          <div
                            className="sv-token-bar-fill sv-bar-success"
                            style={{ width: `${topicProgress}%` }}
                          />
                        </div>
                        {phase.topics.map((topic) => (
                          <button
                            key={topic}
                            className={`sv-roadmap-topic ${
                              completed.includes(topic) ? 'completed' : ''
                            }`}
                            onClick={() => toggleTopic(phase.id, topic)}
                            onMouseEnter={() => onSound('hover')}
                          >
                            <span className="sv-roadmap-check">
                              {completed.includes(topic) ? '\u2611' : '\u2610'}
                            </span>
                            <span>{topic}</span>
                          </button>
                        ))}
                      </div>

                      <div className="sv-field">
                        <div className="sv-field-label">
                          <span>NOTAS DE FASE</span>
                        </div>
                        <textarea
                          className="sv-input sv-textarea"
                          placeholder="Registrar observaciones, recursos, bloqueos..."
                          value={progress[phase.id]?.notes || ''}
                          onChange={(e) => updateNotes(phase.id, e.target.value)}
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
