import { test, expect } from "@playwright/test";

// Repro for the reported bug: mouse-wheel scrolling over the "Real XML"
// stage node should scroll the <pre>'s own content, not fall through to
// React Flow's pane and zoom/pan the outer canvas instead.
test("wheel scrolling over the XML snippet scrolls its content, not the outer canvas", async ({ page }) => {
  await page.goto("/canvas");
  await expect(page.getByText("Real XML")).toBeVisible();

  const pre = page.locator("pre", { hasText: "BevollmaechtigtePerson" }).first();
  await expect(pre).toBeVisible();
  const box = await pre.boundingBox();
  if (!box) throw new Error("no pre box");

  const viewportBefore = await page.evaluate(() => {
    const t = document.querySelector(".react-flow__viewport") as HTMLElement;
    return t?.style.transform ?? "";
  });

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(300);

  const scrollTop = await pre.evaluate((el) => el.scrollTop);
  const viewportAfter = await page.evaluate(() => {
    const t = document.querySelector(".react-flow__viewport") as HTMLElement;
    return t?.style.transform ?? "";
  });

  expect(scrollTop).toBeGreaterThan(0);
  expect(viewportAfter).toBe(viewportBefore);
});
