export const resolveMediaUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }

  // If it's a frontend public asset like /images/ or /logo.png, let the browser resolve it relative to frontend
  if (/^\/(logo\.(png|svg)|images\/)/.test(path)) {
    return path;
  }

  const base = (
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3201'
  ).replace(/\/+$/, '');

  const cleanPath = path.startsWith('/') ? path : `/uploads/${path}`;
  return `${base}${cleanPath}`;
};
