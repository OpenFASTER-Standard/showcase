import { test, expect } from "@playwright/test";

test("architecture-layer nodes show a real graph's node/edge counts, not prose", async ({ page }) => {
  await page.goto("/canvas");
  const node = page.locator(".react-flow__node-architectureNode").filter({ hasText: "Spreadsheet Ontology" });

  // Real counts from the exported spreadsheet-ontology.owl structural graph
  // (not a placeholder -- the exact real node/edge count), shown while
  // zoomed out (Sigma/WebGL only mounts once zoomed in far enough to
  // avoid exceeding the browser's simultaneous WebGL-context limit).
  await expect(node.getByText("22 nodes, 28 edges")).toBeVisible();

  // The old prose description is gone.
  await expect(node.getByText("A raw, structure-agnostic cell grid", { exact: false })).toHaveCount(0);
});
