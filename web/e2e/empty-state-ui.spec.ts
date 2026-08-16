import { expect, test } from "@playwright/test";

test("home exposes the Chapter 1 entry point without browser errors", async ({ page }) => {
  const failures: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
  page.on("pageerror", (error) => failures.push(String(error)));
  page.on("response", (response) => { if (response.status() >= 500) failures.push(`${response.status()} ${response.url()}`); });

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Start Chapter 1" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /build your tourism geography knowledge/i })).toBeVisible();
  expect(failures, failures.join("\n")).toHaveLength(0);
});

test("unconfigured Course Brain is an error boundary, not a no-content claim", async ({ page }) => {
  await page.goto("/chapters/CH1");
  await expect(page.locator("main[role='alert']")).toContainText("Chapter materials could not be loaded");
  await expect(page.getByText(/no approved course brain records/i)).not.toBeVisible();
});
