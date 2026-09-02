import { test, expect } from "@playwright/test";

test("renders the 5 real pipeline-stage nodes with the full real fixture", async ({ page }) => {
  await page.goto("/canvas");
  await expect(page.locator(".react-flow__node")).toHaveCount(10); // 5 architecture + 5 stage
  await expect(page.getByText("Real XML")).toBeVisible();
  await expect(page.getByText("<Vorname>Hans</Vorname>", { exact: false })).toBeVisible();
  await expect(page.getByText("<Vorname>Peter</Vorname>", { exact: false })).toBeVisible();
});
