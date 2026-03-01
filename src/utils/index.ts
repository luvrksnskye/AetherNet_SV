export const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateShort = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

export const getToday = (): string => formatDateShort(new Date());

export const getWeekStart = (date?: Date): string => {
  const d = date || new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return formatDateShort(monday);
};

export const getWeekEnd = (date?: Date): string => {
  const d = date || new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  const sunday = new Date(d);
  sunday.setDate(diff);
  return formatDateShort(sunday);
};

export const isToday = (dateStr: string): boolean => dateStr === getToday();

export const isThisWeek = (dateStr: string): boolean => {
  const start = getWeekStart();
  const end = getWeekEnd();
  return dateStr >= start && dateStr <= end;
};

export const extractYouTubePlaylistId = (url: string): string | null => {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};
