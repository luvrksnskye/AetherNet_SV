/**
 * String Formatters
 * Utility functions for formatting data display
 */

export const formatPhoneNumber = (value: string): string => {
  const digits = value.replaceAll(/\D/g, '');
  const limitedDigits = digits.slice(0, 10);
  
  if (limitedDigits.length === 0) return '';
  if (limitedDigits.length <= 2) return `+52 ${limitedDigits}`;
  if (limitedDigits.length <= 6) return `+52 ${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2)}`;
  return `+52 ${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2, 6)} ${limitedDigits.slice(6)}`;
};

export const getRawPhone = (formatted: string): string => {
  const raw = formatted.replaceAll(/\D/g, '');
  return raw.startsWith('52') ? raw.slice(2) : raw;
};
