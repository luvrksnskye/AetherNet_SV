import React from 'react';
import { Smartphone, Mail, Lock, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import type { RegisterFormData } from '@/types/auth';

export interface RegisterStep3Props {
  formData: RegisterFormData;
  errors: Record<string, string>;
  loading: boolean;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RegisterStep3: React.FC<RegisterStep3Props> = ({
  formData,
  errors,
  loading,
  onPhoneChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit
}) => {
  const hasErrors = Object.values(errors).some((e) => e !== '');

  return (
    <form onSubmit={onSubmit} className="space-y-2 animate-in fade-in slide-in-from-right-4">
      <Input
        label="NÃºmero Celular"
        type="tel"
        icon={Smartphone}
        placeholder="+52 XX XXXX XXXX"
        value={formData.telefono}
        onChange={onPhoneChange}
        error={errors.telefono}
        isValid={!errors.telefono && formData.telefono.length > 0}
      />
      <Input
        label="Correo ElectrÃ³nico"
        type="email"
        icon={Mail}
        placeholder="tu@correo.com"
        value={formData.correo}
        onChange={onEmailChange}
        error={errors.correo}
        isValid={!errors.correo && formData.correo.length > 0}
      />

      <div className="grid grid-cols-2 gap-2">
        <Input
          label="ContraseÃ±a"
          type="password"
          placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
          icon={Lock}
          value={formData.contrasena}
          onChange={onPasswordChange}
          error={errors.contrasena}
          isValid={!errors.contrasena && formData.contrasena.length >= 6}
        />
        <Input
          label="Confirmar"
          type="password"
          placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
          value={formData.confirmarContrasena}
          onChange={onConfirmPasswordChange}
          error={errors.confirmarContrasena}
          isValid={!errors.confirmarContrasena && formData.confirmarContrasena.length >= 6}
        />
      </div>

      <div className="text-[9px] text-gray-500 dark:text-gray-400 px-1 text-center mt-2">
        Al registrarte aceptas los{' '}
        <a href="/" className="underline decoration-blue-500/50 hover:text-blue-500">
          TÃ©rminos
        </a>{' '}
        y la{' '}
        <a href="/" className="underline decoration-blue-500/50 hover:text-blue-500">
          PolÃ­tica de Privacidad
        </a>{' '}
        de Publi Connect.
      </div>
      <div className="mt-2">
        <Button variant="primary" type="submit" disabled={loading || hasErrors}>
          {loading ? <Loader2 className="animate-spin" /> : 'Finalizar Registro'}
        </Button>
      </div>
    </form>
  );
};
