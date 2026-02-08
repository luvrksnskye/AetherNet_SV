import { useState } from 'react';
import { formatPhoneNumber, getRawPhone, isValidEmail } from '../../utils';
import type { AuthMode } from '../../types/auth';

interface LoginFormProps {
  setAuthMode: (m: AuthMode) => void;
  onLoginSuccess: () => void;
  onSound: (key: 'click' | 'hover') => void;
}

type LoginMethod = 'phone' | 'email';

interface LoginState {
  method: LoginMethod;
  phone: string;
  email: string;
  password: string;
  errors: Record<string, string>;
  loading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ setAuthMode, onLoginSuccess, onSound }) => {
  const [s, setS] = useState<LoginState>({
    method: 'phone',
    phone: '',
    email: '',
    password: '',
    errors: {},
    loading: false,
  });

  const validate = (name: string, value: string) => {
    let err = '';
    if (name === 'phone') {
      const raw = getRawPhone(value);
      if (value && raw.length < 10) err = 'INCOMPLETE';
    }
    if (name === 'email' && value && !isValidEmail(value)) err = 'INVALID';
    if (name === 'password' && value && value.length < 6) err = 'MIN 6 CHARS';
    setS((p) => ({ ...p, errors: { ...p.errors, [name]: err } }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onSound('click');
    if (s.password.length < 6) {
      setS((p) => ({ ...p, errors: { ...p.errors, password: 'MIN 6 CHARS' } }));
      return;
    }
    setS((p) => ({ ...p, loading: true }));
    // TODO: replace with real login API
    setTimeout(() => {
      setS((p) => ({ ...p, loading: false }));
      onLoginSuccess();
    }, 1500);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = getRawPhone(e.target.value);
    if (raw.length <= 10) {
      const formatted = formatPhoneNumber(raw);
      setS((p) => ({ ...p, phone: formatted }));
      validate('phone', formatted);
    }
  };

  const disabled =
    s.loading ||
    !!s.errors.phone ||
    !!s.errors.email ||
    !!s.errors.password ||
    !s.password ||
    s.password.length < 6 ||
    (s.method === 'phone' && !s.phone) ||
    (s.method === 'email' && !s.email);

  const inputClass = (field: string, value: string) => {
    let cls = 'sv-input has-icon';
    if (s.errors[field]) cls += ' error';
    else if (value.length > 0) cls += ' valid';
    return cls;
  };

  return (
    <div className="sv-form-content" key="login">
      <div className="sv-section-header">
        <h2 className="sv-section-title">SYSTEM ACCESS</h2>
        <p className="sv-section-subtitle">AUTHENTICATE TO AETHERNET</p>
      </div>

      <div className="sv-method-toggle">
        <button
          className={`sv-method-btn ${s.method === 'phone' ? 'active' : ''}`}
          onClick={() => { setS((p) => ({ ...p, method: 'phone', errors: {} })); onSound('click'); }}
          onMouseEnter={() => onSound('hover')}
        >
          PHONE
        </button>
        <button
          className={`sv-method-btn ${s.method === 'email' ? 'active' : ''}`}
          onClick={() => { setS((p) => ({ ...p, method: 'email', errors: {} })); onSound('click'); }}
          onMouseEnter={() => onSound('hover')}
        >
          EMAIL
        </button>
      </div>

      <form onSubmit={handleLogin}>
        {s.method === 'phone' ? (
          <div className="sv-field">
            <div className="sv-field-label">
              <span>PHONE NUMBER</span>
              {s.errors.phone && <span className="sv-field-error">{s.errors.phone}</span>}
            </div>
            <div className="sv-input-wrap">
              <span className="sv-input-icon">&#9742;</span>
              <input
                className={inputClass('phone', s.phone)}
                type="tel"
                placeholder="+52 55 1234 5678"
                value={s.phone}
                onChange={handlePhoneChange}
              />
              {s.phone && !s.errors.phone && <span className="sv-input-status valid">&#10003;</span>}
              {s.errors.phone && <span className="sv-input-status error">&#10007;</span>}
            </div>
          </div>
        ) : (
          <div className="sv-field">
            <div className="sv-field-label">
              <span>EMAIL ADDRESS</span>
              {s.errors.email && <span className="sv-field-error">{s.errors.email}</span>}
            </div>
            <div className="sv-input-wrap">
              <span className="sv-input-icon">@</span>
              <input
                className={inputClass('email', s.email)}
                type="email"
                placeholder="operative@starvortex.net"
                value={s.email}
                onChange={(e) => {
                  setS((p) => ({ ...p, email: e.target.value }));
                  validate('email', e.target.value);
                }}
              />
              {s.email && !s.errors.email && <span className="sv-input-status valid">&#10003;</span>}
              {s.errors.email && <span className="sv-input-status error">&#10007;</span>}
            </div>
          </div>
        )}

        <div className="sv-field">
          <div className="sv-field-label">
            <span>PASSKEY</span>
            {s.errors.password && <span className="sv-field-error">{s.errors.password}</span>}
          </div>
          <div className="sv-input-wrap">
            <span className="sv-input-icon">&#9919;</span>
            <input
              className={inputClass('password', s.password)}
              type="password"
              placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
              value={s.password}
              onChange={(e) => {
                setS((p) => ({ ...p, password: e.target.value }));
                validate('password', e.target.value);
              }}
            />
            {s.password.length >= 6 && !s.errors.password && <span className="sv-input-status valid">&#10003;</span>}
          </div>
        </div>

        <div className="sv-forgot">
          <button type="button">FORGOT PASSKEY?</button>
        </div>

        <button className="sv-btn" disabled={disabled} type="submit" onMouseEnter={() => onSound('hover')}>
          {s.loading ? <span className="sv-loader" /> : 'INITIATE ACCESS'}
        </button>
      </form>

      <div className="sv-divider">
        <span className="sv-divider-line" />
        <span className="sv-divider-text">OR CONTINUE WITH</span>
        <span className="sv-divider-line" />
      </div>

      <div className="sv-social-row">
        <button className="sv-social-btn" onMouseEnter={() => onSound('hover')}>&#9733;</button>
        <button className="sv-social-btn" onMouseEnter={() => onSound('hover')}>&#9830;</button>
        <button className="sv-social-btn" onMouseEnter={() => onSound('hover')}>&#9824;</button>
      </div>

      <div className="sv-link">
        NO CLEARANCE?{' '}
        <button onClick={() => { setAuthMode('register'); onSound('click'); }}>
          REGISTER
        </button>
      </div>
    </div>
  );
};
