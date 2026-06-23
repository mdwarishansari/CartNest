import { test, expect } from '@playwright/test';

test.describe('Seller and admin entry points', () => {
  test('seller registration page is reachable', async ({ page }) => {
    await page.goto('/seller/register');
    await expect(page.getByRole('heading', { name: /seller registration/i })).toBeVisible();
  });

  test('admin route requires authentication', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('verifier route requires authentication', async ({ page }) => {
    await page.goto('/verifier');
    await expect(page).toHaveURL(/auth\/login/);
  });
});
