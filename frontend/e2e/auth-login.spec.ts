import { expect, test } from '@playwright/test';

test.describe('Critical Path - Login', () => {
  test('should login and redirect admin to dashboard', async ({ page }) => {
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64');
    const token = [
      encode({ alg: 'HS256', typ: 'JWT' }),
      encode({ sub: 'admin', role: 'ADMIN', exp: Math.floor(Date.now() / 1000) + 3600 }),
      'signature'
    ].join('.');

    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token })
      });
    });

    await page.goto('/login');
    await page.getByPlaceholder("Nom d'utilisateur").fill('admin');
    await page.getByPlaceholder('Mot de passe').fill('admin123');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/app\/dashboard/);
  });
});
