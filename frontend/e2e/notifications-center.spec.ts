import { expect, test } from '@playwright/test';
import { setAuthenticatedSession } from './helpers/mock-auth';

test.describe('Critical Path - Notifications center', () => {
  test('should load, filter, mark and delete notifications', async ({ page }) => {
    await setAuthenticatedSession(page, 'ADMIN', 'admin');

    const userId = 7;
    let notifications = [
      {
        id: 101,
        userId,
        title: 'Salle indisponible',
        message: 'La salle A2 est indisponible demain.',
        type: 'WARNING',
        read: false,
        createdAt: '2026-03-25T08:00:00.000Z'
      },
      {
        id: 102,
        userId,
        title: 'Cours deplace',
        message: 'Le cours de droit est deplace a 14h.',
        type: 'INFO',
        read: false,
        createdAt: '2026-03-24T09:15:00.000Z'
      },
      {
        id: 103,
        userId,
        title: 'Rappel planning',
        message: 'N oubliez pas de valider le planning de la semaine.',
        type: 'SUCCESS',
        read: true,
        createdAt: '2026-03-20T12:00:00.000Z'
      }
    ];

    await page.route('**/api/users/login/admin', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: userId,
          nom: 'Admin',
          prenom: 'Root',
          email: 'admin@iusj.local',
          login: 'admin',
          role: 'ADMIN',
          status: 'ACTIVE'
        })
      });
    });

    await page.route('**/api/notifications**', async route => {
      const request = route.request();
      const method = request.method();
      const url = new URL(request.url());
      const path = url.pathname;

      if (method === 'GET' && path.endsWith('/api/notifications')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(notifications)
        });
        return;
      }

      if (method === 'PUT' && path.endsWith(`/api/notifications/users/${userId}/read-all`)) {
        notifications = notifications.map(notification => ({ ...notification, read: true }));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: ''
        });
        return;
      }

      const markAsReadMatch = path.match(/\/api\/notifications\/(\d+)\/read$/);
      if (method === 'PUT' && markAsReadMatch) {
        const id = Number(markAsReadMatch[1]);
        const target = notifications.find(notification => notification.id === id);

        if (!target) {
          await route.fulfill({ status: 404, body: '' });
          return;
        }

        const updated = { ...target, read: true };
        notifications = notifications.map(notification => (notification.id === id ? updated : notification));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(updated)
        });
        return;
      }

      const deleteMatch = path.match(/\/api\/notifications\/(\d+)$/);
      if (method === 'DELETE' && deleteMatch) {
        const id = Number(deleteMatch[1]);
        notifications = notifications.filter(notification => notification.id !== id);
        await route.fulfill({ status: 204, body: '' });
        return;
      }

      await route.fulfill({ status: 404, body: '' });
    });

    await page.goto('/app/notifications');

    await expect(page.getByRole('heading', { name: 'Centre de notifications' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Toutes \(3\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Non lues \(2\)/ })).toBeVisible();

    await page.getByRole('button', { name: /Non lues \(2\)/ }).click();
    const notificationList = page.locator('.card .list-group').first();
    await expect(notificationList.getByRole('heading', { name: 'Salle indisponible' })).toBeVisible();
    await expect(notificationList.getByRole('heading', { name: 'Cours deplace' })).toBeVisible();
    await expect(notificationList.getByRole('heading', { name: 'Rappel planning' })).toHaveCount(0);

    await notificationList.getByRole('button', { name: 'Marquer lu' }).first().click();
    await expect(page.getByRole('button', { name: /Non lues \(1\)/ })).toBeVisible();

    await page.getByRole('button', { name: /Tout marquer lu/ }).click();
    await expect(page.getByRole('button', { name: /Non lues \(0\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tout marquer lu/ })).toBeDisabled();

    await page.getByRole('button', { name: /Toutes \(3\)/ }).click();
    await notificationList.getByRole('button', { name: 'Supprimer' }).first().click();

    await expect(page.getByRole('button', { name: /Toutes \(2\)/ })).toBeVisible();
    await expect(notificationList.getByRole('heading', { name: 'Salle indisponible' })).toHaveCount(0);
  });
});
