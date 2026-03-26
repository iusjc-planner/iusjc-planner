import { expect, test } from '@playwright/test';
import { setAuthenticatedSession } from './helpers/mock-auth';

test.describe('Critical Path - Role Navigation', () => {
  test('should keep teacher out of admin pages', async ({ page }) => {
    await setAuthenticatedSession(page, 'ENSEIGNANT', 'teacher');

    await page.goto('/app/users');

    await expect(page).toHaveURL(/\/forbidden|\/app\/dashboard-teacher/);
  });

  test('should allow admin to access users page', async ({ page }) => {
    await setAuthenticatedSession(page, 'ADMIN', 'admin');

    await page.route('**/api/users', route => route.fulfill({ status: 200, body: '[]', contentType: 'application/json' }));
    await page.route('**/api/schools**', route => route.fulfill({ status: 200, body: '[]', contentType: 'application/json' }));

    await page.goto('/app/users');

    await expect(page).toHaveURL(/\/app\/users/);
    await expect(page.getByText('Gestion des Utilisateurs')).toBeVisible();
  });
});
