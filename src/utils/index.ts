import type { CurpData } from '../types/auth';

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

export const calculateAge = (birthDateString: string): number => {
  const [day, month, year] = birthDateString.split('/').map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() + 1 - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) age--;
  return age;
};

export const getValidationError = (
  field: string,
  value: string,
  confirmValue?: string
): string => {
  switch (field) {
    case 'zipCode':
      return value && value.length < 5 ? 'INCOMPLETE' : '';
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

export const fetchCurpData = async (curp: string): Promise<CurpData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        curp: curp.toUpperCase(),
        name: 'OPERATIVE',
        lastNameA: 'STARVORTEX',
        lastNameB: 'SYSTEMS',
        gender: 'CLASSIFIED',
        birthDate: '15/08/1995',
        state: 'SECTOR-7',
      });
    }, 1500);
  });
};

export const registerPersonalAccount = async (data: {
  name: string;
  age: number | null;
  gender: string;
  email: string;
  phoneNo: string;
  zipCode: string;
  macAddress?: string;
  pwd: string;
}): Promise<{ success: boolean }> => {
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || 'http://localhost:8082';
  const url = `${base.replace(/\/$/, '')}/auth/personal/register`;

  const payload = {
    name: data.name,
    age: data.age ?? 0,
    gender: data.gender,
    email: data.email,
    phoneNo: data.phoneNo,
    zipCode: data.zipCode,
    macAddress: data.macAddress ?? getOrCreatePseudoMac(),
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

const getOrCreatePseudoMac = (): string => {
  try {
    const key = 'sv_device_mac';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    const mac = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(':');
    localStorage.setItem(key, mac);
    return mac;
  } catch {
    return '00:00:00:00:00:00';
  }
};
