import { expect, test, type Page } from "@playwright/test";

// The default webServer in playwright.config.ts deliberately blanks the Supabase
// env to exercise the unconfigured empty state, so these tests only run when the
// suite is pointed at a real, configured server:
//   BASE_URL=http://localhost:3000 npx playwright test e2e/auth.spec.ts
test.skip(!process.env.BASE_URL, "Auth e2e needs a configured server via BASE_URL.");

/** Chooses a role on the opening page and waits for its dashboard, so a later goto cannot race it. */
async function enterAs(page: Page, role: "Student" | "Lecturer") {
  await page.goto("/login");
  await page.getByRole("button", { name: new RegExp(`continue as ${role}`, "i") }).click();
  await page.waitForURL(/\/dashboard\//);
}

test("anonymous visitors are sent to the role chooser and returned to where they were headed", async ({ page }) => {
  await page.goto("/dashboard/student");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fstudent/);
  await expect(page.getByRole("button", { name: /continue as student/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /continue as lecturer/i })).toBeVisible();
  // There is no password form any more.
  await expect(page.getByLabel("Password")).toHaveCount(0);
});

test("choosing Student lands on the learner dashboard", async ({ page }) => {
  await enterAs(page, "Student");
  await expect(page).toHaveURL(/\/dashboard\/student/);
  await expect(page.getByRole("button", { name: "Switch to Lecturer" })).toBeVisible();
});

test("choosing Lecturer lands on the teaching dashboard", async ({ page }) => {
  await enterAs(page, "Lecturer");
  await expect(page).toHaveURL(/\/dashboard\/lecturer/);
  await expect(page.getByRole("link", { name: "Teaching" })).toBeVisible();
});

test("the header switches between the two roles in one click", async ({ page }) => {
  await enterAs(page, "Student");
  await page.getByRole("button", { name: "Switch to Lecturer" }).click();
  await expect(page).toHaveURL(/\/dashboard\/lecturer/);
  await page.getByRole("button", { name: "Switch to Student" }).click();
  await expect(page).toHaveURL(/\/dashboard\/student/);
});

test("a student cannot reach the lecturer dashboard", async ({ page }) => {
  await enterAs(page, "Student");
  await page.goto("/dashboard/lecturer");
  await expect(page).toHaveURL(/\/dashboard\/student/);
});

test("a lecturer cannot reach the student dashboard", async ({ page }) => {
  await enterAs(page, "Lecturer");
  await page.goto("/dashboard/student");
  await expect(page).toHaveURL(/\/dashboard\/lecturer/);
});
