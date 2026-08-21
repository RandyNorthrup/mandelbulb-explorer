import { expect, test } from '@playwright/test'

test('viewport canvas is present', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#viewport')).toBeVisible()
})

test('HUD shows live explorer values when WebGL2 works', async ({ page }) => {
  await page.goto('/')
  const overlay = page.locator('#error')
  const values = page.locator('#hud-values')
  const isOverlayVisible = await overlay.isVisible()
  if (isOverlayVisible) {
    await expect(overlay).toContainText('WebGL2')
    return
  }
  await expect(values).toContainText('power')
  await expect(values).toContainText('ember')
})

test('R resets after a keyboard orbit', async ({ page }) => {
  await page.goto('/')
  if (await page.locator('#error').isVisible()) {
    test.skip(true, 'WebGL2 is not available in this browser.')
  }
  await page.locator('#viewport').focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('r')
  await expect(page.locator('#hud-values')).toContainText('dist 3.10')
})
