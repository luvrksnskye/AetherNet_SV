import React from 'react';

export interface SocialButtonProps {
  icon: React.ElementType;
  onClick?: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    type="button"
    className="flex-1 flex items-center justify-center p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-200 group bg-white dark:bg-black/20 backdrop-blur-sm shadow-sm"
  >
    <Icon size={18} className="text-black dark:text-white group-hover:scale-110 transition-transform" />
  </button>
);
