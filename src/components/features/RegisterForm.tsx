import { useState, useEffect } from 'react';
import {
  formatPhoneNumber,
  getRawPhone,
  calculateAge,
  getValidationError,
  fetchCurpData,
  registerPersonalAccount,
} from '../../utils';
import type { AuthMode, CurpData, RegisterFormData, ModalData } from '../../types/auth';

interface RegisterFormProps {
  setAuthMode: (m: AuthMode) => void;
  onShowConfirm: (data: ModalData) => void;
  onLoginSuccess: () => void;
  onSound: (key: 'click' | 'hover') => void;
}

interface RegisterState {
  step: number;
  loading: boolean;
  curpInput: string;
  formData: RegisterFormData;
  errors: Record<string, string>;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  setAuthMode,
  onShowConfirm,
  onLoginSuccess,
  onSound,
}) => {
  const [s, setS] = useState<RegisterState>({
    step: 1,
    loading: false,
    curpInput: '',
    formData: {
      curpData: null,
      calculatedAge: null,
      zipCode: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    errors: {},
  });

  useEffect(() => {
    window.handleModalConfirm = (data: CurpData, age: number) => {
      setS((p) => ({
        ...p,
        formData: { ...p.formData, curpData: data, calculatedAge: age },
        step: 2,
      }));
    };
    window.handleModalCancel = () => {
      setS((p) => ({ ...p, curpInput: '' }));
    };
  }, []);

  const validateField = (field: string, value: string, confirm?: string) => {
    const error = getValidationError(field, value, confirm);
    setS((p) => ({ ...p, errors: { ...p.errors, [field]: error } }));
  };

  const triggerCurp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (s.curpInput.length < 18) return;
    onSound('click');
    setS((p) => ({ ...p, loading: true }));
    const data = await fetchCurpData(s.curpInput);
    const age = calculateAge(data.birthDate);
    setS((p) => ({ ...p, loading: false }));
    onShowConfirm({ data, age });
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    onSound('click');
    if (!s.formData.zipCode || s.formData.zipCode.length !== 5) {
      setS((p) => ({ ...p, errors: { ...p.errors, zipCode: 'REQUIRED' } }));
      return;
    }
    setS((p) => ({ ...p, step: 3 }));
  };

  const handleFinal = (e: React.FormEvent) => {
    e.preventDefault();
    onSound('click');
    const rawPhone = getRawPhone(s.formData.phone);
    const phoneOk = rawPhone.length === 10;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.formData.email);
    const passOk = s.formData.password.length >= 6;
    const matchOk = s.formData.password === s.formData.confirmPassword;

    const newErrors: Record<string, string> = {};
    if (!phoneOk) newErrors.phone = 'INVALID';
    if (!emailOk) newErrors.email = 'INVALID';
    if (!passOk) newErrors.password = 'TOO SHORT';
    if (!matchOk) newErrors.confirmPassword = 'MISMATCH';
    setS((p) => ({ ...p, errors: newErrors }));

    if (!(phoneOk && emailOk && passOk && matchOk)) return;

    (async () => {
      setS((p) => ({ ...p, loading: true }));
      try {
        if (!s.formData.curpData) throw new Error('Missing identity data');
        await registerPersonalAccount({
          name: `${s.formData.curpData.name} ${s.formData.curpData.lastNameA} ${s.formData.curpData.lastNameB}`.trim(),
          age: s.formData.calculatedAge ?? 0,
          gender: s.formData.curpData.gender ?? '',
          email: s.formData.email,
          phoneNo: getRawPhone(s.formData.phone),
          zipCode: s.formData.zipCode,
          pwd: s.formData.password,
        });
        setS((p) => ({ ...p, loading: false }));
        onLoginSuccess();
      } catch {
        setS((p) => ({ ...p, loading: false }));
        onLoginSuccess();
      }
    })();
  };

  const inputClass = (field: string, value: string) => {
    let cls = 'sv-input has-icon';
    if (s.errors[field]) cls += ' error';
    else if (value.length > 0) cls += ' valid';
    return cls;
  };

  const readonlyClass = 'sv-input has-icon readonly';
  const hasErrors = Object.values(s.errors).some((e) => e !== '');

  return (
    <div className="sv-form-content" key={`register-${s.step}`}>
      <div className="sv-step-bar">
        <button
          className="sv-step-back"
          onClick={() => {
            onSound('click');
            s.step > 1 ? setS((p) => ({ ...p, step: p.step - 1 })) : setAuthMode('login');
          }}
        >
          &larr; BACK
        </button>
        <div className="sv-step-dots">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`sv-step-dot ${n <= s.step ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      <div className="sv-section-header">
        <h2 className="sv-section-title">
          {s.step === 1 ? 'IDENTITY SCAN' : s.step === 2 ? 'VERIFY DATA' : 'SET CREDENTIALS'}
        </h2>
        <p className="sv-section-subtitle">
          {s.step === 1
            ? 'ENTER YOUR CURP TO VALIDATE IDENTITY'
            : s.step === 2
              ? 'CONFIRM YOUR PERSONAL INFORMATION'
              : 'ESTABLISH YOUR SECURITY PROTOCOL'}
        </p>
      </div>

      {s.step === 1 && (
        <form onSubmit={triggerCurp}>
          <div className="sv-field">
            <div className="sv-field-label"><span>CURP IDENTIFIER</span></div>
            <div className="sv-input-wrap">
              <span className="sv-input-icon">&#9738;</span>
              <input
                className={`sv-input has-icon ${s.curpInput.length === 18 ? 'valid' : ''}`}
                placeholder="XXXX000000XXXXXX00"
                value={s.curpInput}
                maxLength={18}
                onChange={(e) => setS((p) => ({ ...p, curpInput: e.target.value.toUpperCase() }))}
              />
              {s.curpInput.length === 18 && <span className="sv-input-status valid">&#10003;</span>}
            </div>
          </div>
          <button
            className="sv-btn"
            disabled={s.loading || s.curpInput.length < 18}
            type="submit"
            onMouseEnter={() => onSound('hover')}
          >
            {s.loading ? <span className="sv-loader" /> : 'VALIDATE CURP'}
          </button>
        </form>
      )}

      {s.step === 2 && s.formData.curpData && (
        <form onSubmit={handleStep2}>
          <div className="sv-field">
            <div className="sv-field-label"><span>NAME</span></div>
            <div className="sv-input-wrap">
              <span className="sv-input-icon">&#9632;</span>
              <input className={readonlyClass} value={s.formData.curpData.name} readOnly />
            </div>
          </div>
          <div className="sv-data-grid">
            <div className="sv-field">
              <div className="sv-field-label"><span>LAST NAME A</span></div>
              <input className="sv-input readonly" value={s.formData.curpData.lastNameA} readOnly />
            </div>
            <div className="sv-field">
              <div className="sv-field-label"><span>LAST NAME B</span></div>
              <input className="sv-input readonly" value={s.formData.curpData.lastNameB} readOnly />
            </div>
          </div>
          <div className="sv-data-grid">
            <div className="sv-field">
              <div className="sv-field-label"><span>AGE</span></div>
              <input className="sv-input readonly" value={`${s.formData.calculatedAge} YRS`} readOnly />
            </div>
            <div className="sv-field">
              <div className="sv-field-label"><span>GENDER</span></div>
              <input className="sv-input readonly" value={s.formData.curpData.gender} readOnly />
            </div>
          </div>
          <div className="sv-field">
            <div className="sv-field-label">
              <span>ZIP CODE</span>
              {s.errors.zipCode && <span className="sv-field-error">{s.errors.zipCode}</span>}
            </div>
            <div className="sv-input-wrap">
              <span className="sv-input-icon">&#9673;</span>
              <input
                className={inputClass('zipCode', s.formData.zipCode)}
                placeholder="00000"
                value={s.formData.zipCode}
                maxLength={5}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                  setS((p) => ({ ...p, formData: { ...p.formData, zipCode: val } }));
                  validateField('zipCode', val);
                }}
              />
              {s.formData.zipCode.length === 5 && !s.errors.zipCode && (
                <span className="sv-input-status valid">&#10003;</span>
              )}
            </div>
          </div>
          <button className="sv-btn" type="submit" onMouseEnter={() => onSound('hover')}>
            PROCEED &rarr;
          </button>
        </form>
      )}

      {s.step === 3 && (
        <form onSubmit={handleFinal}>
          <div className="sv-field">
            <div className="sv-field-label">
              <span>PHONE</span>
              {s.errors.phone && <span className="sv-field-error">{s.errors.phone}</span>}
            </div>
            <div className="sv-input-wrap">
              <span className="sv-input-icon">&#9742;</span>
              <input
                className={inputClass('phone', s.formData.phone)}
                type="tel"
                placeholder="+52 XX XXXX XXXX"
                value={s.formData.phone}
                onChange={(e) => {
                  const raw = getRawPhone(e.target.value);
                  if (raw.length <= 10) {
                    const fmt = formatPhoneNumber(raw);
                    setS((p) => ({ ...p, formData: { ...p.formData, phone: fmt } }));
                    validateField('phone', fmt);
                  }
                }}
              />
            </div>
          </div>
          <div className="sv-field">
            <div className="sv-field-label">
              <span>EMAIL</span>
              {s.errors.email && <span className="sv-field-error">{s.errors.email}</span>}
            </div>
            <div className="sv-input-wrap">
              <span className="sv-input-icon">@</span>
              <input
                className={inputClass('email', s.formData.email)}
                type="email"
                placeholder="operative@starvortex.net"
                value={s.formData.email}
                onChange={(e) => {
                  setS((p) => ({ ...p, formData: { ...p.formData, email: e.target.value } }));
                  validateField('email', e.target.value);
                }}
              />
            </div>
          </div>
          <div className="sv-data-grid">
            <div className="sv-field">
              <div className="sv-field-label">
                <span>PASSKEY</span>
                {s.errors.password && <span className="sv-field-error">{s.errors.password}</span>}
              </div>
              <div className="sv-input-wrap">
                <span className="sv-input-icon">&#9919;</span>
                <input
                  className={inputClass('password', s.formData.password)}
                  type="password"
                  placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                  value={s.formData.password}
                  onChange={(e) => {
                    setS((p) => ({ ...p, formData: { ...p.formData, password: e.target.value } }));
                    validateField('password', e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="sv-field">
              <div className="sv-field-label">
                <span>CONFIRM</span>
                {s.errors.confirmPassword && <span className="sv-field-error">{s.errors.confirmPassword}</span>}
              </div>
              <div className="sv-input-wrap">
                <span className="sv-input-icon">&#9919;</span>
                <input
                  className={inputClass('confirmPassword', s.formData.confirmPassword)}
                  type="password"
                  placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                  value={s.formData.confirmPassword}
                  onChange={(e) => {
                    setS((p) => ({ ...p, formData: { ...p.formData, confirmPassword: e.target.value } }));
                    validateField('confirmPassword', e.target.value, s.formData.password);
                  }}
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
            disabled={s.loading || hasErrors}
            onMouseEnter={() => onSound('hover')}
          >
            {s.loading ? <span className="sv-loader" /> : 'FINALIZE REGISTRATION'}
          </button>
        </form>
      )}
    </div>
  );
};
