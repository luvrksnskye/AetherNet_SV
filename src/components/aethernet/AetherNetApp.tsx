import { useState, useEffect } from 'react';
import { SplashScreen } from './SplashScreen';
import { SVCursor } from './SVCursor';
import { LoginForm } from '../features/LoginForm';
import { RegisterForm } from '../features/RegisterForm';
import { Dashboard } from '../features/Dashboard';
import { useSVSounds } from '../../hooks/useSVSounds';
import type { AuthMode } from '../../types/auth';
import '../../styles/aethernet.css';

const VIDEO_BG =
  'https://dl.dropbox.com/scl/fi/qxh4lv0qcydnw9str6gju/bg-alt.mp4?rlkey=caqgw260cqamexollkco4wu3p&st=we2x7r1a&dl=0';

export const AetherNetApp = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { play, preload } = useSVSounds();

  useEffect(() => {
    preload('click');
    preload('hover');
    preload('scan');
  }, [preload]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    play('affirmation');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthMode('login');
    play('click');
  };

  const handleModeSwitch = (mode: AuthMode) => {
    setAuthMode(mode);
    play('click');
  };

  const onSound = (key: 'click' | 'hover') => {
    play(key, key === 'hover' ? 0.3 : 0.5);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (isAuthenticated) {
    return (
      <div className="sv-authenticated">
        <SVCursor />
        <div className="sv-video-bg">
          <video autoPlay muted loop playsInline>
            <source src={VIDEO_BG} type="video/mp4" />
          </video>
          <div className="sv-video-overlay" />
        </div>
        <div className="sv-pattern-bg" />
        <div className="sv-scanline" />
        <Dashboard onSound={onSound} onLogout={handleLogout} />
      </div>
    );
  }

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

            <div className="sv-mode-switch">
              <button
                className={`sv-mode-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => handleModeSwitch('login')}
                onMouseEnter={() => play('hover', 0.3)}
              >
                ACCESS
              </button>
              <button
                className={`sv-mode-btn ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => handleModeSwitch('register')}
                onMouseEnter={() => play('hover', 0.3)}
              >
                REGISTER
              </button>
            </div>

            {authMode === 'login' ? (
              <LoginForm setAuthMode={setAuthMode} onLoginSuccess={handleLoginSuccess} onSound={onSound} />
            ) : (
              <RegisterForm setAuthMode={setAuthMode} onLoginSuccess={handleLoginSuccess} onSound={onSound} />
            )}
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
