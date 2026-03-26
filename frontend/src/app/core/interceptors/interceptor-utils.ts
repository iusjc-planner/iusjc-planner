const PUBLIC_ENDPOINT_PATTERNS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password'
];

export function isPublicEndpoint(url: string): boolean {
  return PUBLIC_ENDPOINT_PATTERNS.some(pattern => url.includes(pattern));
}
