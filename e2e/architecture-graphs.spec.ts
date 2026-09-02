import { test, expect } from "@playwright/test";

test("architecture-layer nodes always render the real graph, not prose or a placeholder", async ({ page }) => {
  await page.goto("/canvas");
  const node = page.locator(".react-flow__node-architectureNode").filter({ hasText: "Spreadsheet Ontology" });

  // Cytoscape.js renders to <canvas> (Canvas2D, no WebGL context limit --
  // chosen for exactly that reason, so all 8 graphs can render
  // unconditionally regardless of zoom). A canvas element proves the real
  // graph mounted; the real element counts come from a small testability
  // hook (rdf-graph-view.tsx exposes __cyNodeCount/__cyEdgeCount) since
  // canvas content itself isn't queryable via getByText/svg locators.
  await expect(node.locator("canvas").first()).toBeVisible();
  const counts = await node.evaluate((el) => {
    const container = el.querySelector<HTMLDivElement & { __cyNodeCount?: number; __cyEdgeCount?: number }>(
      ".nodrag.nowheel",
    );
    return { nodes: container?.__cyNodeCount, edges: container?.__cyEdgeCount };
  });
  expect(counts).toEqual({ nodes: 22, edges: 28 });

  // The old prose description is gone.
  await expect(node.getByText("A raw, structure-agnostic cell grid", { exact: false })).toHaveCount(0);
});
