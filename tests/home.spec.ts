import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display header with correct font', async ({ page }) => {
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    
    // Check if GT Super Display font is applied to the title
    const title = header.getByRole('link', { name: 'Mathematica.AI' });
    await expect(title).toBeVisible();
    const titleFontFamily = await title.evaluate((el) => 
      window.getComputedStyle(el).fontFamily
    );
    expect(titleFontFamily).toContain('GT Super Display');
  });

  test('should have correct meta tags', async ({ page }) => {
    const title = await page.title();
    expect(title).toBe('Mathematica.AI');

    const description = await page.getAttribute(
      'meta[name="description"]',
      'content'
    );
    expect(description).toBe('Your AI-powered assistant for mathematical computations and insights');
  });

  test('should handle theme switching', async ({ page }) => {
    // Find and click theme toggle button
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeToggle).toBeVisible();

    // Get initial theme
    const initialTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );

    // Click theme toggle
    await themeToggle.click();

    // Verify theme changed
    const newTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('banner')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('banner')).toBeVisible();

    // Test desktop view
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByRole('banner')).toBeVisible();
  });
}); 