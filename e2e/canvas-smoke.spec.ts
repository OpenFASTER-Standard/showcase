import { test, expect } from "@playwright/test";

test("canvas page renders a React Flow instance with 2 nodes", async ({ page }) => {
  await page.goto("/canvas");
  await expect(page.locator(".react-flow")).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(2);
});
