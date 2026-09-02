import { test, expect } from "@playwright/test";

// Repro for the reported bug: zoom the outer React Flow canvas, then
// wheel-zoom inside a Cytoscape graph -- the in-graph zoom should center on
// the cursor's actual current position, not a stale one cached from before
// the outer canvas was zoomed.
test("in-graph wheel-zoom centers on the cursor after the outer canvas has been zoomed", async ({ page }) => {
  await page.goto("/canvas");
  const node = page.locator(".react-flow__node-architectureNode").filter({ hasText: "Spreadsheet Ontology" });
  await expect(node.locator("canvas").first()).toBeVisible();

  // Zoom the OUTER React Flow canvas first (mouse wheel over empty canvas
  // space, not over a graph), simulating "zooming into the main canvas".
  const canvasBox = await page.locator(".react-flow__pane").boundingBox();
  if (!canvasBox) throw new Error("no react flow pane");
  await page.mouse.move(canvasBox.x + 50, canvasBox.y + 50);
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, -100);
  }
  await page.waitForTimeout(300);

  const graphContainer = node.locator(".nodrag.nowheel").first();
  const box = await graphContainer.boundingBox();
  if (!box) throw new Error("no graph container box");

  // Pick a cursor point that is NOT the container's center, so a
  // center-anchored (wrong) zoom is distinguishable from a cursor-anchored
  // (correct) zoom.
  const cursorX = box.x + box.width * 0.25;
  const cursorY = box.y + box.height * 0.25;

  const readWorldPoint = (el: Element, [cx, cy]: number[]) => {
    const cy_ = (el as Element & { __cy?: import("cytoscape").Core }).__cy;
    if (!cy_) throw new Error("no cy instance registered");
    const rect = el.getBoundingClientRect();
    const pan = cy_.pan();
    const zoom = cy_.zoom();
    return {
      x: (cx - rect.left - pan.x) / zoom,
      y: (cy - rect.top - pan.y) / zoom,
    };
  };

  const worldBefore = await graphContainer.evaluate(readWorldPoint, [cursorX, cursorY]);

  await page.mouse.move(cursorX, cursorY);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(300);

  const worldAfter = await graphContainer.evaluate(readWorldPoint, [cursorX, cursorY]);

  // A correctly cursor-centered zoom leaves the world point under the
  // cursor unchanged. Allow a small tolerance for float/discretization.
  expect(Math.abs(worldAfter.x - worldBefore.x)).toBeLessThan(5);
  expect(Math.abs(worldAfter.y - worldBefore.y)).toBeLessThan(5);
});
