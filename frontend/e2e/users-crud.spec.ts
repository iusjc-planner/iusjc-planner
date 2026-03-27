import { expect, test } from '@playwright/test';
import { setAuthenticatedSession } from './helpers/mock-auth';

test.describe('Critical Path - User CRUD', () => {
  test('should list users and trigger delete flow', async ({ page }) => {
    await setAuthenticatedSession(page, 'ADMIN', 'admin');
    let deleteCalled = false;

    await page.route('**/api/users**', async route => {
      if (route.request().method() === 'DELETE') {
        deleteCalled = true;
        await route.fulfill({ status: 204, body: '' });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            nom: 'Doe',
            prenom: 'John',
            email: 'john.doe@iusj.local',
            login: 'jdoe',
            role: 'ADMIN',
            status: 'ACTIVE'
          }
        ])
      });
    });

    await page.route('**/api/schools**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));

    await page.goto('/app/users');

    await expect(page.getByText('john.doe@iusj.local')).toBeVisible();

    page.once('dialog', dialog => dialog.accept());
    await page.getByTitle('Supprimer').first().click();
    await expect.poll(() => deleteCalled).toBeTruthy();
  });
});
