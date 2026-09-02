import { test, expect } from "@playwright/test";

test("play button animates a value through all 5 stages, then re-enables", async ({ page }) => {
  await page.goto("/canvas");
  const playButton = page.getByRole("button", { name: /watch hans's given name flow through/i });
  await expect(playButton).toBeEnabled();

  await playButton.click();
  await expect(playButton).toBeDisabled();

  // 5 stages * 1.6s each, plus margin
  await expect(playButton).toBeEnabled({ timeout: 10_000 });
});
