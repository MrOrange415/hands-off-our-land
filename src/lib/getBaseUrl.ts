export function getBaseUrl() {
  if (typeof window !== 'undefined') return ''; // use relative paths in browser
  return 'https://hands-off-our-land.vercel.app';
}
