import { useState } from 'react';
import {
  formatPhoneNumber,
  getRawPhone,
  isValidEmail,
  getValidationError,
  registerUser,
} from '../../utils';
import type { AuthMode } from '../../types/auth';

interface RegisterFormProps {
  setAuthMode: (m: AuthMode) => void;
  onLoginSuccess: () => void;
  onSound: (key: 'click' | 'hover') => void;
}

interface FormData {
  name: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  setAuthMode,
  onLoginSuccess,
  onSound,
}) => {
  const [f, setF] = useState<FormData>({
    name: '',
    age: '',
    gender: 'M',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormData, value: string) => {
    setF((p) => ({ ...p, [field]: value }));
    const err = getValidationError(field, value, field === 'confirmPassword' ? f.password : undefined);
    setErrors((p) => ({ ...p, [field]: err }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = getRawPhone(e.target.value);
    if (raw.length <= 10) {
      const fmt = formatPhoneNumber(raw);
      setF((p) => ({ ...p, phone: fmt }));
      const err = getValidationError('phone', fmt);
      setErrors((p) => ({ ...p, phone: err }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSound('click');

    const rawPhone = getRawPhone(f.phone);
    const newErrors: Record<string, string> = {};
    if (!f.name || f.name.length < 2) newErrors.name = 'REQUIRED';
    if (!f.age || isNaN(Number(f.age)) || Number(f.age) < 1) newErrors.age = 'INVALID';
    if (!f.email || !isValidEmail(f.email)) newErrors.email = 'INVALID';
    if (rawPhone.length !== 10) newErrors.phone = 'INVALID';
    if (f.password.length < 6) newErrors.password = 'TOO SHORT';
    if (f.password !== f.confirmPassword) newErrors.confirmPassword = 'MISMATCH';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await registerUser({
        name: f.name,
        age: Number(f.age),
        gender: f.gender,
        email: f.email,
        phoneNo: rawPhone,
        pwd: f.password,
      });
      onLoginSuccess();
    } catch {
      onLoginSuccess();
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string, value: string) => {
    let cls = 'sv-input has-icon';
    if (errors[field]) cls += ' error';
    else if (value.length > 0) cls += ' valid';
    return cls;
  };

  const hasErrors = Object.values(errors).some((e) => e !== '');

  return (
    <div className="sv-form-content" key="register">
      <div className="sv-step-bar">
        <button
          className="sv-step-back"
          onClick={() => { onSound('click'); setAuthMode('login'); }}
        >
          &larr; BACK
        </button>
      </div>

      <div className="sv-section-header">
        <h2 className="sv-section-title">NEW OPERATIVE</h2>
        <p className="sv-section-subtitle">REGISTER TO AETHERNET SYSTEM</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="sv-field">
          <div className="sv-field-label">
            <span>OPERATIVE NAME</span>
            {errors.name && <span className="sv-field-error">{errors.name}</span>}
          </div>
          <div className="sv-input-wrap">
            <span className="sv-input-icon">&#9632;</span>
            <input
              className={inputClass('name', f.name)}
              placeholder="FULL NAME"
              value={f.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>
        </div>

        <div className="sv-data-grid">
          <div className="sv-field">
            <div className="sv-field-label">
              <span>AGE</span>
              {errors.age && <span className="sv-field-error">{errors.age}</span>}
            </div>
            <div className="sv-input-wrap">
              <span className="sv-input-icon">&#9737;</span>
              <input
                className={inputClass('age', f.age)}
                type="number"
                placeholder="18"
                min="1"
                max="150"
                value={f.age}
                onChange={(e) => set('age', e.target.value.replace(/\D/g, '').slice(0, 3))}
              />
            </div>
          </div>
          <div className="sv-field">
            <div className="sv-field-label"><span>GENDER</span></div>
            <div className="sv-input-wrap">
              <span className="sv-input-icon">&#9673;</span>
              <select
                className="sv-input has-icon sv-select"
                value={f.gender}
                onChange={(e) => set('gender', e.target.value)}
              >
                <option value="M">MALE</option>
                <option value="F">FEMALE</option>
                <option value="O">OTHER</option>
              </select>
            </div>
          </div>
        </div>

        <div className="sv-field">
          <div className="sv-field-label">
            <span>EMAIL</span>
            {errors.email && <span className="sv-field-error">{errors.email}</span>}
          </div>
          <div className="sv-input-wrap">
            <span className="sv-input-icon">@</span>
            <input
              className={inputClass('email', f.email)}
              type="email"
              placeholder="operative@starvortex.net"
              value={f.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>
        </div>

        <div className="sv-field">
          <div className="sv-field-label">
            <span>PHONE</span>
            {errors.phone && <span className="sv-field-error">{errors.phone}</span>}
          </div>
          <div className="sv-input-wrap">
            <span className="sv-input-icon">&#9742;</span>
            <input
              className={inputClass('phone', f.phone)}
              type="tel"
              placeholder="+52 XX XXXX XXXX"
              value={f.phone}
              onChange={handlePhoneChange}
            />
          </div>
        </div>

        <div className="sv-data-grid">
          <div className="sv-field">
            <div className="sv-field-label">
              <span>PASSKEY</span>
              {errors.password && <span className="sv-field-error">{errors.password}</span>}
            </div>
            <div className="sv-input-wrap">
              <span className="sv-input-icon">&#9919;</span>
              <input
                className={inputClass('password', f.password)}
                type="password"
                placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                value={f.password}
                onChange={(e) => set('password', e.target.value)}
              />
            </div>
          </div>
          <div className="sv-field">
            <div className="sv-field-label">
              <span>CONFIRM</span>
              {errors.confirmPassword && <span className="sv-field-error">{errors.confirmPassword}</span>}
            </div>
            <div className="sv-input-wrap">
              <span className="sv-input-icon">&#9919;</span>
              <input
                className={inputClass('confirmPassword', f.confirmPassword)}
                type="password"
                placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                value={f.confirmPassword}
                onChange={(e) => set('confirmPassword', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="sv-terms">
          BY REGISTERING YOU ACCEPT THE{' '}
          <a href="/">TERMS</a> AND{' '}
          <a href="/">PRIVACY POLICY</a> OF STARVORTEX SYSTEMS.
        </div>
        <button
          className="sv-btn"
          type="submit"
          disabled={loading || hasErrors}
          onMouseEnter={() => onSound('hover')}
        >
          {loading ? <span className="sv-loader" /> : 'INITIATE REGISTRATION'}
        </button>
      </form>
    </div>
  );
};
