import { useState } from 'react';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onSound: (key: 'click' | 'hover') => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onSound }) => {
  const [username, setUsername] = useState('');
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onSound('click');
    setError('');
    if (!username.trim() || !passkey.trim()) { setError('CAMPOS REQUERIDOS'); return; }
    setLoading(true);
    setTimeout(() => {
      if (username.trim().toLowerCase() === 'regredanger' && passkey.length >= 4) {
        onLoginSuccess();
      } else {
        setError('ACCESO DENEGADO');
        setLoading(false);
      }
    }, 1200);
  };

  const inputClass = (value: string, hasError: boolean) => {
    let cls = 'sv-input has-icon';
    if (hasError) cls += ' error';
    else if (value.length > 0) cls += ' valid';
    return cls;
  };

  return (
    <div className="sv-form-content" key="login">
      <div className="sv-section-header">
        <h2 className="sv-section-title">ACCESO AL SISTEMA</h2>
        <p className="sv-section-subtitle">AUTENTICAR OPERATIVO EN AETHERNET</p>
      </div>
      <form onSubmit={handleLogin}>
        <div className="sv-field">
          <div className="sv-field-label">
            <span>IDENTIFICADOR</span>
            {error && <span className="sv-field-error">{error}</span>}
          </div>
          <div className="sv-input-wrap">
            <span className="sv-input-icon">&#9632;</span>
            <input className={inputClass(username, !!error)} type="text" placeholder="NOMBRE DE OPERATIVO" value={username} autoComplete="off" onChange={(e) => { setUsername(e.target.value); setError(''); }} />
            {username && !error && <span className="sv-input-status valid">&#10003;</span>}
          </div>
        </div>
        <div className="sv-field">
          <div className="sv-field-label"><span>CLAVE DE ACCESO</span></div>
          <div className="sv-input-wrap">
            <span className="sv-input-icon">&#9919;</span>
            <input className={inputClass(passkey, !!error)} type="password" placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;" value={passkey} onChange={(e) => { setPasskey(e.target.value); setError(''); }} />
            {passkey.length >= 4 && !error && <span className="sv-input-status valid">&#10003;</span>}
          </div>
        </div>
        <button className="sv-btn" disabled={loading || !username || !passkey} type="submit" onMouseEnter={() => onSound('hover')}>
          {loading ? <span className="sv-loader" /> : 'INICIAR ACCESO'}
        </button>
      </form>
      <div className="sv-terms">STARVORTEX SYSTEMS &mdash; AETHERNET v3.0 &mdash; ACCESO RESTRINGIDO</div>
    </div>
  );
};
