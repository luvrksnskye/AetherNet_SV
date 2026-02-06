import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  icon?: React.ElementType;
}

const variantStyles = {
  primary:
    'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-lg shadow-blue-500/10',
  secondary:
    'bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20',
  outline:
    'border border-gray-200 dark:border-white/20 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:bg-white/5 bg-transparent',
  danger:
    'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30',
  success:
    'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20'
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  icon: Icon,
  ...props
}) => {
  const baseStyle =
    'w-full py-2 px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};
