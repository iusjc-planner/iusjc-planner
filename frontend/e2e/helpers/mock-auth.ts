import { Page } from '@playwright/test';

export function buildJwt(role: 'ADMIN' | 'ENSEIGNANT', login: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: login,
      role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60
    })
  ).toString('base64url');

  return `${header}.${payload}.signature`;
}

export async function setAuthenticatedSession(page: Page, role: 'ADMIN' | 'ENSEIGNANT', login: string): Promise<void> {
  const token = buildJwt(role, login);
  await page.addInitScript(([key, value]) => {
    localStorage.setItem(key, value);
  }, ['iusj_token', token]);
}
