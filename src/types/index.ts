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

export type DashboardView = 'overview' | 'tokens' | 'roadmap' | 'logs' | 'notes' | 'settings' | 'tools' | 'focus' | 'lists' | 'hexgrid';

export const AXIOM_CORE_PHASES: RoadmapPhase[] = [
  { id: 'ac-1', number: 1, title: 'Pre-algebra', domain: 'Base Algoritmica', tacticalValue: 'Calculos base sin titubeo. Fracciones, decimales, proporciones, porcentajes, negativos.', topics: ['Fracciones', 'Decimales', 'Proporciones', 'Porcentajes', 'Numeros negativos'], branch: 'axiom-core' },
  { id: 'ac-2', number: 2, title: 'Algebra 1', domain: 'Nucleo Logico', tacticalValue: 'Pensamiento algoritmico puro. Aislar la variable desconocida (x) es el equivalente mental de rastrear un bug.', topics: ['Ecuaciones lineales', 'Desigualdades', 'Funciones f(x)', 'Graficacion basica'], branch: 'axiom-core' },
  { id: 'ac-3', number: 3, title: 'Geometria', domain: 'Espacio y Forma', tacticalValue: 'Fundamento GameDev. Hitboxes, iluminacion, transformaciones 2D/3D.', topics: ['Angulos', 'Poligonos', 'Areas', 'Volumenes', 'Transformaciones cartesianas'], branch: 'axiom-core' },
  { id: 'ac-4', number: 4, title: 'Algebra 2', domain: 'Expansion del Motor', tacticalValue: 'Logaritmos son el latido de la complejidad algoritmica. O(log N) depende de esta base.', topics: ['Ecuaciones cuadraticas', 'Polinomios complejos', 'Logaritmos', 'Numeros imaginarios'], branch: 'axiom-core' },
  { id: 'ac-5', number: 5, title: 'Trigonometria', domain: 'Puente Grafico', tacticalValue: 'Evolucion de la logica espacial. Trayectorias, fisica, rotaciones de camara, movimiento direccional.', topics: ['Senos', 'Cosenos', 'Tangentes', 'Circulo unitario', 'Vectores'], branch: 'axiom-core' },
  { id: 'ac-6', number: 6, title: 'Probabilidad y Estadistica', domain: 'Mente Analitica', tacticalValue: 'Escudo tactico para Ciberseguridad. Prediccion de patrones, analisis de datos masivos, prerrequisito para DP.', topics: ['Permutaciones', 'Combinaciones', 'Distribuciones', 'Probabilidad condicional'], branch: 'axiom-core' },
  { id: 'ac-7', number: 7, title: 'Precalculo y Algebra Lineal', domain: 'FAANG Apex', tacticalValue: 'Matrices dictan procesamiento de imagenes, renderizado 3D, criptografia. Tier elite de CS.', topics: ['Matrices', 'Espacio vectorial', 'Limites', 'Transformaciones matriciales'], branch: 'axiom-core' },
  { id: 'ac-8', number: 8, title: 'Calculo 1 y 2', domain: 'Motor Continuo', tacticalValue: 'Lenguaje de la Fisica. Motor de fisica en Godot, gravedad realista, Gradient Descent en ML.', topics: ['Limites y continuidad', 'Derivadas', 'Integrales', 'Series infinitas', 'Ecuaciones parametricas'], branch: 'axiom-core' },
  { id: 'ac-9', number: 9, title: 'Calculo Multivariable', domain: 'Realidad 3D', tacticalValue: 'Fisica traducida a 3D. Renderizado avanzado, dinamica de fluidos, campos electromagneticos.', topics: ['Vectores en 3D', 'Derivadas parciales', 'Integrales multiples', 'Campos vectoriales'], branch: 'axiom-core' },
  { id: 'ac-10', number: 10, title: 'Ecuaciones Diferenciales', domain: 'Leyes de la Naturaleza', tacticalValue: 'Nucleo de ingenieria pura. Modelado de sistemas dinamicos, circuitos, suspension mecanica.', topics: ['Ecuaciones de primer orden', 'Segundo orden', 'Transformadas de Laplace', 'Modelado matematico'], branch: 'axiom-core' },
  { id: 'ac-11', number: 11, title: 'Algebra Lineal Avanzada', domain: 'Computacion Definitiva', tacticalValue: 'Tier elite. Eigenvalores, procesamiento de imagenes, criptografia avanzada, base de Quantum Computing e IA.', topics: ['Matrices y espacios vectoriales', 'Eigenvalores y eigenvectores', 'Transformaciones matriciales'], branch: 'axiom-core' },
];

export const COMPUTATIONAL_PHASES: RoadmapPhase[] = [
  { id: 'cb-1', number: 1, title: 'MIT 6.042J', domain: 'Fundamento', tacticalValue: 'Puente entre matematicas abstractas y pensamiento algoritmico. Probar por que un algoritmo funciona antes de escribir codigo.', topics: ['Pruebas', 'Estructuras discretas', 'Teoria de grafos', 'Probabilidad'], branch: 'computational' },
  { id: 'cb-2', number: 2, title: 'MIT 6.006', domain: 'Motor Central', tacticalValue: 'Arsenal primario para LeetCode. Estructuras de datos y patrones logicos para optimizar complejidad O(N).', topics: ['Sorting', 'Arboles', 'Hashing', 'DP introductorio'], branch: 'computational' },
  { id: 'cb-3', number: 3, title: 'MIT 6.046J', domain: 'FAANG Apex', tacticalValue: 'Diseno de sistemas a nivel elite. Techo teorico para arquitecturas distribuidas masivas.', topics: ['DP avanzado', 'Algoritmos greedy', 'Network flow', 'NP-hardness'], branch: 'computational' },
];
