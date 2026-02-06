export type AuthMode = 'login' | 'register';
export type LoginMethod = 'phone' | 'email';

export interface CurpData {
  curp: string;
  name: string;
  lastNameA: string;
  lastNameB: string;
  gender: string;
  birthDate: string;
  state: string;
}

export interface RegisterFormData {
  curpData: CurpData | null;
  calculatedAge: number | null;
  zipCode: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ModalData {
  data: CurpData;
  age: number;
}

declare global {
  interface Window {
    handleModalConfirm?: (data: CurpData, age: number) => void;
    handleModalCancel?: () => void;
  }
}
