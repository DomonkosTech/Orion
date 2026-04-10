import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Check if some text like "Orion" exists or the title is correct
  // Based on index.html: <title>Vite + React</title>
  await expect(page).toHaveTitle(/Orion/);
});

test('check navigation', async ({ page }) => {
  await page.goto('/');
  // This is a placeholder, adjust based on actual app content
  // await expect(page.getByRole('heading', { name: 'Orion' })).toBeVisible();
});
