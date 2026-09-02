import { test, expect } from "@playwright/test";

test("Excel node switches sheets and shows every real row", async ({ page }) => {
  await page.goto("/canvas");
  const excelNode = page.locator(".react-flow__node").filter({ hasText: "Excel" });

  await expect(excelNode.getByRole("button", { name: "Erstattungsantraege" })).toBeVisible();
  await expect(excelNode.getByRole("button", { name: "Personen" })).toBeVisible();

  // Default tab: Erstattungsantraege, both real rows.
  await expect(excelNode.getByText("A1", { exact: true })).toBeVisible();
  await expect(excelNode.getByText("A2", { exact: true })).toBeVisible();

  await excelNode.getByRole("button", { name: "Personen" }).click();

  // All 4 real Personen rows, not just Hans.
  await expect(excelNode.getByText("Hans", { exact: true })).toBeVisible();
  await expect(excelNode.getByText("Peter", { exact: true })).toBeVisible();
  await expect(excelNode.getByText("Erika", { exact: true })).toBeVisible();
  await expect(excelNode.getByText("Anna", { exact: true })).toBeVisible();
});
