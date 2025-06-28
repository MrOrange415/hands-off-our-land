export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // In the browser, use relative path
    return "";
  }

  // On Vercel (production or preview)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development
  return "http://localhost:3000";
}