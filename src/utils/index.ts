export const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const limited = digits.slice(0, 10);
  if (limited.length === 0) return '';
  if (limited.length <= 2) return `+52 ${limited}`;
  if (limited.length <= 6) return `+52 ${limited.slice(0, 2)} ${limited.slice(2)}`;
  return `+52 ${limited.slice(0, 2)} ${limited.slice(2, 6)} ${limited.slice(6)}`;
};

export const getRawPhone = (formatted: string): string => {
  const raw = formatted.replace(/\D/g, '');
  return raw.startsWith('52') ? raw.slice(2) : raw;
};

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getValidationError = (
  field: string,
  value: string,
  confirmValue?: string
): string => {
  switch (field) {
    case 'name':
      return value.length > 0 && value.length < 2 ? 'TOO SHORT' : '';
    case 'age': {
      const n = Number(value);
      return value && (isNaN(n) || n < 1 || n > 150) ? 'INVALID' : '';
    }
    case 'phone': {
      const raw = getRawPhone(value);
      return value && raw.length < 10 ? 'INCOMPLETE' : '';
    }
    case 'email':
      return value && !isValidEmail(value) ? 'INVALID' : '';
    case 'password':
      return value && value.length < 6 ? 'MIN 6 CHARS' : '';
    case 'confirmPassword':
      return value && value !== confirmValue ? 'MISMATCH' : '';
    default:
      return '';
  }
};

/**
 * POST /users to register a new user.
 * ipAddress is resolved server-side or defaults to 127.0.0.1.
 */
export const registerUser = async (data: {
  name: string;
  age: number;
  gender: string;
  email: string;
  phoneNo: string;
  pwd: string;
}): Promise<{ success: boolean }> => {
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || 'http://localhost:8080';
  const url = `${base.replace(/\/$/, '')}/users`;

  const payload = {
    name: data.name,
    age: data.age,
    gender: data.gender,
    email: data.email,
    phoneNo: data.phoneNo,
    ipAddress: '127.0.0.1',
    pwd: data.pwd,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (res.ok) return { success: true };
  const text = await res.text().catch(() => '');
  throw new Error(`Registration failed: ${res.status} ${text}`);
};
