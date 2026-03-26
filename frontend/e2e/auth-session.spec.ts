import { expect, test } from '@playwright/test';
import { setAuthenticatedSession } from './helpers/mock-auth';

function buildExpiredJwt(login: string, role: 'ADMIN' | 'ENSEIGNANT'): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: login,
      role,
      exp: Math.floor(Date.now() / 1000) - 30
    })
  ).toString('base64url');

  return `${header}.${payload}.signature`;
}

test.describe('Critical Path - Auth Session', () => {
  test('should clear session and return to login on logout route', async ({ page }) => {
    await setAuthenticatedSession(page, 'ADMIN', 'admin');

    await page.goto('/login/logout');

    await expect(page).toHaveURL(/\/login/);
    const token = await page.evaluate(() => localStorage.getItem('iusj_token'));
    expect(token).toBeNull();
  });

  test('should redirect to login when token is expired', async ({ page }) => {
    const expiredToken = buildExpiredJwt('admin', 'ADMIN');
    await page.addInitScript(([key, value]) => {
      localStorage.setItem(key, value);
    }, ['iusj_token', expiredToken]);

    await page.goto('/app/users');

    await expect(page).toHaveURL(/\/login/);
    const token = await page.evaluate(() => localStorage.getItem('iusj_token'));
    expect(token).toBeNull();
  });
});
