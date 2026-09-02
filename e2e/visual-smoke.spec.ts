import { test, expect } from "@playwright/test";

test("root path shows the canvas, not the placeholder page", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".react-flow")).toBeVisible();
});
