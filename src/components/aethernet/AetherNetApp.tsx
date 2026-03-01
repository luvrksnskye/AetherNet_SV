import { useState, useEffect } from 'react';
import { PreloadScreen } from './PreloadScreen';
import { SplashScreen } from './SplashScreen';
import { SVCursor } from './SVCursor';
import { AppShell } from './AppShell';
import { LoginForm } from '../features/LoginForm';
import { useSVSounds } from '../../hooks/useSVSounds';
import '../../styles/aethernet.css';

const VIDEO_BG = "/videos/bg-alt.mp4";

type AppPhase = 'preload' | 'splash' | 'auth' | 'app';

export const AetherNetApp = () => {
  const [phase, setPhase] = useState<AppPhase>('preload');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { play, preload } = useSVSounds();

  useEffect(() => {
    preload('click');
    preload('hover');
    preload('scan');
  }, [preload]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setPhase('app');
    play('affirmation');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPhase('auth');
    play('click');
  };

  const onSound = (key: 'click' | 'hover') => {
    play(key, key === 'hover' ? 0.3 : 0.5);
  };

  // Preload phase
  if (phase === 'preload') {
    return <PreloadScreen onReady={() => setPhase('splash')} />;
  }

  // Splash phase
  if (phase === 'splash') {
    return <SplashScreen onComplete={() => setPhase(isAuthenticated ? 'app' : 'auth')} />;
  }

  // Authenticated app
  if (phase === 'app' && isAuthenticated) {
    return (
      <>
        <SVCursor />
        <AppShell onSound={onSound} onLogout={handleLogout} />
      </>
    );
  }

  // Auth phase
  return (
    <>
      <SVCursor />
      <div className="sv-app">
        <div className="sv-video-bg">
          <video autoPlay muted loop playsInline>
            <source src={VIDEO_BG} type="video/mp4" />
          </video>
          <div className="sv-video-overlay" />
        </div>

        <div className="sv-pattern-bg" />

        <div className="sv-grid-overlay">
          <div className="sv-grid-line sv-grid-v" style={{ left: '5%' }} />
          <div className="sv-grid-line sv-grid-v" style={{ left: '33.333%' }} />
          <div className="sv-grid-line sv-grid-v" style={{ left: '66.666%' }} />
          <div className="sv-grid-line sv-grid-v" style={{ right: '5%' }} />
          <div className="sv-grid-line sv-grid-h" style={{ top: '15%' }} />
          <div className="sv-grid-line sv-grid-h" style={{ top: '50%' }} />
          <div className="sv-grid-line sv-grid-h" style={{ bottom: '5%' }} />
        </div>

        <div className="sv-scanline" />

        <header className="sv-header">
          <div className="sv-logo-container">
            <span className="sv-logo-ghost sv-logo-ghost-1">AETHERNET</span>
            <h1 className="sv-logo">
              {'AETHERNET'.split('').map((char, i) => (
                <span key={i} className="sv-logo-char">{char}</span>
              ))}
            </h1>
            <span className="sv-logo-ghost sv-logo-ghost-2">AETHERNET</span>
          </div>
          <p className="sv-subtitle">A STARVORTEX PROGRAM</p>
        </header>

        <main className="sv-main">
          <div className="sv-form-container">
            <div className="sv-corner sv-corner-tl" />
            <div className="sv-corner sv-corner-tr" />
            <div className="sv-corner sv-corner-bl" />
            <div className="sv-corner sv-corner-br" />
            <LoginForm onLoginSuccess={handleLoginSuccess} onSound={onSound} />
          </div>
        </main>

        <footer className="sv-footer">
          <div className="sv-status-bar">
            <span className="sv-status-dot" />
            <span className="sv-status-text">SYSTEM ONLINE</span>
          </div>
          <p className="sv-footer-tagline">ONE FORCE BEHIND TOMORROW'S SYSTEMS</p>
        </footer>
      </div>
    </>
  );
};
