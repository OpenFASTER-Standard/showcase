import { test, expect } from "@playwright/test";

test("architecture-layer nodes always render the real graph, not prose or a placeholder", async ({ page }) => {
  await page.goto("/canvas");
  const node = page.locator(".react-flow__node-architectureNode").filter({ hasText: "Spreadsheet Ontology" });

  // Real counts from the exported spreadsheet-ontology.owl structural
  // graph, rendered as plain SVG shapes -- always on screen regardless of
  // zoom (no WebGL, so no context-limit gate to hide behind).
  await expect(node.locator("svg circle")).toHaveCount(22);
  await expect(node.getByText("Cell", { exact: true })).toBeVisible();

  // The old prose description is gone.
  await expect(node.getByText("A raw, structure-agnostic cell grid", { exact: false })).toHaveCount(0);
});
