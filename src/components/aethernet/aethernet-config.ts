/**
 * AetherNet Configuration
 * Configuración centralizada del sistema Starvortex
 */

export const AETHERNET_CONFIG = {
  // Duración de fases del splash screen (en milisegundos)
  splash: {
    vortexAnimation: 2500,
    titleAnimation: 800,
    taglineAnimation: 600,
    fadeOut: 800,
    totalDuration: 5000, // Duración total aproximada
  },

  // Rutas de assets
  assets: {
    font: './src/starvortex_assets/tech.ttf',
    coreFrames: [
      './src/starvortex_assets/center-circle.png',
      './src/starvortex_assets/center-circle (1).png',
      './src/starvortex_assets/center-circle (2).png',
      './src/starvortex_assets/center-circle (3).png',
    ],
    videoBackground: 'https://dl.dropbox.com/scl/fi/qxh4lv0qcydnw9str6gju/bg-alt.mp4?rlkey=caqgw260cqamexollkco4wu3p&st=we2x7r1a&dl=0',
  },

  // Efectos de sonido
  sfx: {
    scan: '/src/sfx/scan-zoom.wav',
    click: '/src/sfx/click.wav',
    hint: '/src/sfx/hint-notification.wav',
    affirmation: '/src/sfx/affirmation-tech.wav',
    hover: '/src/sfx/UI_menu_text_rollover.mp3',
    textAnim: '/src/sfx/FX_text_animation_loop.mp3',
  },

  // Configuración del cursor
  cursor: {
    sizes: {
      normal: 32,
      hover: 48,
      click: 24,
    },
    dotSizes: {
      normal: 8,
      hover: 4,
      click: 12,
    },
    smoothing: 0.15, // Factor de suavizado del cursor (0-1)
  },

  // Colores del tema (como fallback si CSS no carga)
  theme: {
    primary: 'rgba(255, 255, 255, 0.9)',
    secondary: 'rgba(255, 255, 255, 0.6)',
    border: 'rgba(255, 255, 255, 0.3)',
    background: 'rgba(0, 0, 0, 0.85)',
    glass: 'rgba(0, 0, 0, 0.7)',
  },

  // Textos del sistema
  text: {
    appName: 'AETHERNET',
    subtitle: 'A STARVORTEX PROGRAM',
    tagline: "ONE FORCE BEHIND TOMORROW'S SYSTEMS",
    statusOnline: 'SYSTEM ONLINE',
    statusOffline: 'SYSTEM OFFLINE',
    accessButton: 'ACCESS',
    registerButton: 'REGISTER',
  },

  // Configuración de animaciones
  animations: {
    fadeInDuration: 800,
    slideInDuration: 500,
    glowPulseDuration: 2000,
    cornerPulseDuration: 3000,
    scanLineDuration: 8000,
  },

  // API endpoints (para futuras integraciones)
  api: {
    baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8082',
    endpoints: {
      login: '/auth/login',
      register: '/auth/personal/register',
      verify: '/auth/verify',
    },
  },

  // Configuración de validación
  validation: {
    passwordMinLength: 6,
    phoneLength: 10,
    curpLength: 18,
    zipCodeLength: 5,
  },

  // Features flags (activar/desactivar características)
  features: {
    customCursor: true,
    soundEffects: true,
    videoBackground: true,
    splashScreen: true,
    scanLineEffect: true,
    cornerAnimations: true,
  },
} as const;

// Tipos derivados de la configuración
export type AetherNetConfig = typeof AETHERNET_CONFIG;
export type SFXKey = keyof typeof AETHERNET_CONFIG.sfx;
export type AnimationKey = keyof typeof AETHERNET_CONFIG.animations;
