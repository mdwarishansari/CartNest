import { test, expect } from '@playwright/test';

test.describe('Public storefront', () => {
  test('loads homepage and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/CartNest/i);
    await expect(page.getByAltText('CartNest').first()).toBeVisible();
  });

  test('navigates to search and contact pages', async ({ page }) => {
    await page.goto('/search');
    await expect(page).toHaveURL(/search/);

    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: /contact us/i })).toBeVisible();
  });

  test('shows login and signup pages', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

    await page.goto('/auth/signup');
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });
});

test.describe('Protected customer routes', () => {
  test('redirects unauthenticated users from cart to login', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveURL(/auth\/login/);
  });
});
