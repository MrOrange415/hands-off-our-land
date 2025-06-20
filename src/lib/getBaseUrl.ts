export function getBaseUrl() {
  if (typeof window !== 'undefined') return ''; // use relative paths in browser
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // Vercel runtime
  return 'http://localhost:3000'; // local fallback
}
