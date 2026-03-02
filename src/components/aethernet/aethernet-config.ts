/**
 * AetherNet Configuration
 * Configuracion centralizada del sistema Starvortex
 */

export const AETHERNET_CONFIG = {
  splash: {
    vortexAnimation: 2500,
    titleAnimation: 800,
    taglineAnimation: 600,
    fadeOut: 800,
    totalDuration: 5000,
  },

  assets: {
    font: './src/starvortex_assets/tech.ttf',
    coreFrames: [
      './src/starvortex_assets/center-circle.png',
      './src/starvortex_assets/center-circle (1).png',
      './src/starvortex_assets/center-circle (2).png',
      './src/starvortex_assets/center-circle (3).png',
    ],
    videoBackground:
      'https://dl.dropbox.com/scl/fi/qxh4lv0qcydnw9str6gju/bg-alt.mp4?rlkey=caqgw260cqamexollkco4wu3p&st=we2x7r1a&dl=0',
  },

  sfx: {
    click: 'sfx/click.wav',
    click2: 'sfx/Click_2.wav',
    click3: 'sfx/Click3.wav',
    click4: 'sfx/Click4.wav',
    click5: 'sfx/Click5.wav',
    click6: 'sfx/Click6.wav',
    hover: 'sfx/UI_menu_text_rollover.mp3',
    scan: 'sfx/scan-zoom.wav',
    hint: 'sfx/hint-notification.wav',
    affirmation: 'sfx/affirmation-tech.wav',
    nock: 'sfx/nock.wav',
    scrollwheel: 'sfx/scrollwheel.wav',
    takeout: 'sfx/takeout-click.wav',
    textAnim: 'sfx/FX_text_animation_loop.mp3',
  },

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
    smoothing: 0.15,
  },

  theme: {
    primary: 'rgba(255, 255, 255, 0.9)',
    secondary: 'rgba(255, 255, 255, 0.6)',
    border: 'rgba(255, 255, 255, 0.3)',
    background: 'rgba(0, 0, 0, 0.85)',
    glass: 'rgba(0, 0, 0, 0.7)',
  },

  text: {
    appName: 'AETHERNET',
    subtitle: 'A STARVORTEX PROGRAM',
    tagline: "ONE FORCE BEHIND TOMORROW'S SYSTEMS",
    statusOnline: 'SYSTEM ONLINE',
    statusOffline: 'SYSTEM OFFLINE',
    accessButton: 'ACCESS',
    registerButton: 'REGISTER',
  },

  animations: {
    fadeInDuration: 800,
    slideInDuration: 500,
    glowPulseDuration: 2000,
    cornerPulseDuration: 3000,
    scanLineDuration: 8000,
  },

  api: {
    baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8082',
    endpoints: {
      login: '/auth/login',
      register: '/auth/personal/register',
      verify: '/auth/verify',
    },
  },

  validation: {
    passwordMinLength: 6,
    phoneLength: 10,
    curpLength: 18,
    zipCodeLength: 5,
  },

  features: {
    customCursor: true,
    soundEffects: true,
    videoBackground: true,
    splashScreen: true,
    scanLineEffect: true,
    cornerAnimations: true,
  },
} as const;

export type AetherNetConfig = typeof AETHERNET_CONFIG;
export type SFXKey = keyof typeof AETHERNET_CONFIG.sfx;
export type AnimationKey = keyof typeof AETHERNET_CONFIG.animations;
