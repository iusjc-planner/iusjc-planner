import { expect, test } from '@playwright/test';
import { setAuthenticatedSession } from './helpers/mock-auth';

test.describe('Critical Path - Main Planning', () => {
  test('should display schedule global view with entries', async ({ page }) => {
    await setAuthenticatedSession(page, 'ADMIN', 'admin');

    await page.route('**/api/schedule/stats', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ total: 1, scheduled: 1, completed: 0, cancelled: 0 })
      })
    );

    await page.route('**/api/schedule', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            courseName: 'Maths',
            teacherName: 'Prof A',
            roomName: 'A1',
            groupName: 'G1',
            startTime: '2026-03-25T08:00:00.000Z',
            endTime: '2026-03-25T10:00:00.000Z',
            status: 'SCHEDULED'
          }
        ])
      })
    );

    await page.goto('/app/schedules');

    await expect(page.getByText('Planning Global')).toBeVisible();
    await expect(page.getByText('Maths')).toBeVisible();
    await expect(page.getByText('Prof A')).toBeVisible();
  });
});
