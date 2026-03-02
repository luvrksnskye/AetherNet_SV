export type AuthMode = 'login';
export type TokenColor = 'red' | 'blue' | 'purple' | 'green';

export interface TokenEntry {
  id: string;
  date: string;
  color: TokenColor;
  description: string;
  duration?: number;
}

export interface TokenLimits {
  dailyMax: number;
  weeklyMax: number;
  redCeiling: number;
  blueCeiling: number;
  purpleCeiling: number;
  greenFlex: number;
}

export const TOKEN_LIMITS: TokenLimits = {
  dailyMax: 3,
  weeklyMax: 21,
  redCeiling: 4,
  blueCeiling: 6,
  purpleCeiling: 5,
  greenFlex: 6,
};

export const TOKEN_META: Record<TokenColor, { label: string; icon: string; desc: string }> = {
  red: { label: 'REFINAMIENTO', icon: '\u25CF', desc: 'LeetCode, Algo, Math, English activo, Debugging' },
  blue: { label: 'CONSTRUCCION', icon: '\u25CF', desc: 'Backend, Proyectos, Portfolio, API endpoints' },
  purple: { label: 'INVESTIGACION', icon: '\u25CF', desc: 'Frameworks, Docs, Matematicas, Ruso/Ingles' },
  green: { label: 'SANDBOX CREATIVO', icon: '\u25CF', desc: 'UI/UX, Lore, Musica, Gaming' },
};

export type RoadmapPhaseStatus = 'locked' | 'active' | 'completed';

export interface RoadmapPhase {
  id: string;
  number: number;
  title: string;
  domain: string;
  tacticalValue: string;
  topics: string[];
  branch: 'axiom-core' | 'computational';
}

export interface RoadmapProgress {
  phaseId: string;
  status: RoadmapPhaseStatus;
  completedTopics: string[];
  notes: string;
  startDate?: string;
  completedDate?: string;
}

export interface NoteEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  color?: TokenColor;
}

export interface LogEntry {
  id: string;
  date: string;
  type: 'token' | 'roadmap' | 'note' | 'system';
  message: string;
  color?: TokenColor;
}

export type DashboardView =
  | 'overview'
  | 'tokens'
  | 'roadmap'
  | 'logs'
  | 'notes'
  | 'settings'
  | 'tools'
  | 'focus'
  | 'lists'
  | 'hexgrid'
  | 'library';

export const AXIOM_CORE_PHASES: RoadmapPhase[] = [
  { id: 'ac-1', number: 1, title: 'Pre-algebra', domain: 'Base Algoritmica', tacticalValue: 'Calculos base sin titubeo. Fracciones, decimales, proporciones, porcentajes, negativos.', topics: ['Fracciones', 'Decimales', 'Proporciones', 'Porcentajes', 'Numeros negativos'], branch: 'axiom-core' },
  { id: 'ac-2', number: 2, title: 'Algebra 1', domain: 'Nucleo Logico', tacticalValue: 'Pensamiento algoritmico puro. Aislar la variable desconocida (x) es el equivalente mental de rastrear un bug.', topics: ['Ecuaciones lineales', 'Desigualdades', 'Funciones f(x)', 'Graficacion basica'], branch: 'axiom-core' },
  { id: 'ac-3', number: 3, title: 'Geometria', domain: 'Espacio y Forma', tacticalValue: 'Fundamento GameDev. Hitboxes, iluminacion, transformaciones 2D/3D.', topics: ['Angulos', 'Poligonos', 'Areas', 'Volumenes', 'Transformaciones cartesianas'], branch: 'axiom-core' },
  { id: 'ac-4', number: 4, title: 'Algebra 2', domain: 'Expansion del Motor', tacticalValue: 'Logaritmos son el latido de la complejidad algoritmica. Polinomios y racionales son la base de todo modelado.', topics: ['Polinomios', 'Funciones racionales', 'Logaritmos', 'Exponenciales', 'Numeros complejos'], branch: 'axiom-core' },
  { id: 'ac-5', number: 5, title: 'Trigonometria', domain: 'Motor Angular', tacticalValue: 'Rotaciones, ondas, audio, vision. Sin esto no hay 3D ni procesamiento de senales.', topics: ['Funciones trigonometricas', 'Identidades', 'Ley de senos/cosenos', 'Graficas', 'Aplicaciones'], branch: 'axiom-core' },
  { id: 'ac-6', number: 6, title: 'Pre-calculo', domain: 'Puente Avanzado', tacticalValue: 'Limites intuitivos, secuencias y series. La entrada formal al analisis.', topics: ['Limites', 'Secuencias', 'Series', 'Funciones avanzadas', 'Coordenadas polares'], branch: 'axiom-core' },
  { id: 'ac-7', number: 7, title: 'Calculo 1', domain: 'Motor de Cambio', tacticalValue: 'Derivadas e integrales. Optimizacion, tasas de cambio, machine learning.', topics: ['Derivadas', 'Reglas de derivacion', 'Integrales', 'Teorema fundamental', 'Aplicaciones'], branch: 'axiom-core' },
  { id: 'ac-8', number: 8, title: 'Calculo 2', domain: 'Motor Integral', tacticalValue: 'Tecnicas de integracion, series de Taylor. Aproximacion y modelado avanzado.', topics: ['Tecnicas de integracion', 'Series de Taylor', 'Ecuaciones parametricas', 'Series infinitas'], branch: 'axiom-core' },
  { id: 'ac-9', number: 9, title: 'Algebra Lineal', domain: 'Espacio Vectorial', tacticalValue: 'Graphics, ML, compresion, criptografia. Todo pasa por matrices y vectores.', topics: ['Vectores', 'Matrices', 'Transformaciones lineales', 'Eigenvalores', 'Espacios vectoriales'], branch: 'axiom-core' },
  { id: 'ac-10', number: 10, title: 'Probabilidad y Estadistica', domain: 'Motor Estocastico', tacticalValue: 'A/B testing, ML, data science. La base de toda decision basada en datos.', topics: ['Probabilidad', 'Distribuciones', 'Inferencia', 'Regresion', 'Pruebas de hipotesis'], branch: 'axiom-core' },
];

export const COMPUTATIONAL_PHASES: RoadmapPhase[] = [
  { id: 'comp-1', number: 1, title: 'MIT 6.042J', domain: 'Matematicas Discretas', tacticalValue: 'Logica, pruebas, teoria de grafos, combinatoria. La base formal de CS.', topics: ['Logica proposicional', 'Pruebas', 'Induccion', 'Teoria de grafos', 'Combinatoria', 'Probabilidad discreta'], branch: 'computational' },
  { id: 'comp-2', number: 2, title: 'MIT 6.006', domain: 'Algoritmos I', tacticalValue: 'Sorting, searching, grafos, DP. El core de las entrevistas tecnicas.', topics: ['Complejidad', 'Sorting', 'Hashing', 'Grafos BFS/DFS', 'Shortest paths', 'Dynamic programming'], branch: 'computational' },
  { id: 'comp-3', number: 3, title: 'MIT 6.046J', domain: 'Algoritmos II', tacticalValue: 'Divide and conquer, greedy, NP-completeness. Nivel avanzado de resolucion.', topics: ['Divide and conquer', 'Greedy algorithms', 'Network flow', 'NP-completeness', 'Approximation', 'Randomized algorithms'], branch: 'computational' },
];
