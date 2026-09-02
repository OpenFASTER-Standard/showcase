import { test, expect } from "@playwright/test";

test("renders 4 sequential flow edges between the 5 pipeline stages", async ({ page }) => {
  await page.goto("/canvas");
  const flowEdges = page.locator('[data-testid^="rf__edge-flow-"]');
  await expect(flowEdges).toHaveCount(4);
});
