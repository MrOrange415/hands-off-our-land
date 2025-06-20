export function getBaseUrl() {
  if (typeof window !== 'undefined') return ''; // use relative paths in browser
  if (process.env.NEXT_PUBLIC_BASE_URL) return `https://${process.env.NEXT_PUBLIC_BASE_URL}`; // Vercel runtime
  return 'http://localhost:3000'; // local fallback
}
