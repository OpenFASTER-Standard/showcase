import { test, expect } from "@playwright/test";

test("renders the 5 real architecture nodes with links to the exact file each one visualizes", async ({ page }) => {
  await page.goto("/canvas");
  await expect(page.locator(".react-flow__node-architectureNode")).toHaveCount(5);
  const link = page.locator(
    'a[href="https://github.com/OpenFASTER-Standard/realizations/blob/main/modules/kafe.ttl"]',
  );
  await expect(link).toBeVisible();
  await expect(link).toHaveText("Realizations");
});
