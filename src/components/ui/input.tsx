import React from 'react';
import { Check, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ElementType;
  error?: string;
  isValid?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  icon: Icon,
  readOnly,
  error,
  maxLength,
  isValid
}) => {
  const hasValue = value && String(value).length > 0;

  const isErrorState = error || (!readOnly && hasValue && isValid === false);
  const isSuccessState = !readOnly && hasValue && (isValid ?? true) && !error;

  let statusColorClass = 'text-black dark:text-white group-focus-within:text-blue-600';
  if (isErrorState) statusColorClass = 'text-red-500';

  let borderClass =
    'bg-white dark:bg-black/30 border-2 border-gray-200 dark:border-white/5 focus:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-black/40 text-gray-900 dark:text-white';

  if (isErrorState) {
    borderClass =
      'bg-white dark:bg-black/30 border-2 border-red-500/50 focus:border-red-500 bg-red-50/20 text-gray-900 dark:text-white';
  } else if (readOnly) {
    borderClass =
      'cursor-default focus:ring-0 border-2 border-gray-200! dark:border-white/5! bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-medium';
  }

  return (
    <div className="w-full space-y-0.5 group relative">
      <div className="flex justify-between items-baseline px-1">
        {label && (
          <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        {error && (
          <span className="text-red-600 dark:text-red-400 text-[9px] font-bold flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-300">
            {error}
          </span>
        )}
      </div>

      <div className={`relative flex items-center transition-all duration-300 ${readOnly ? 'opacity-90' : ''}`}>
        {Icon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${statusColorClass}`}>
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
        <input
          type={type}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`
            w-full text-sm h-9 rounded-lg px-4 
            ${Icon ? 'pl-9' : ''} 
            focus:outline-none focus:ring-2 focus:ring-blue-500/10 
            disabled:cursor-not-allowed disabled:opacity-60
            transition-all duration-300 placeholder:text-gray-400
            ${borderClass}
          `}
        />
        {/* INDICADORES VISUALES */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          {isErrorState ? (
            <X
              size={16}
              className="text-red-600 dark:text-red-500 animate-in zoom-in duration-300"
              strokeWidth={3}
            />
          ) : isSuccessState ? (
            <Check
              size={16}
              className="text-green-600 dark:text-green-500 animate-in zoom-in duration-300"
              strokeWidth={3}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
