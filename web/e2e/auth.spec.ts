import { expect, test } from "@playwright/test";

// The default webServer in playwright.config.ts deliberately blanks the Supabase
// env to exercise the unconfigured empty state, so these tests only run when the
// suite is pointed at a real, configured server:
//   BASE_URL=http://localhost:3000 npx playwright test e2e/auth.spec.ts
test.skip(!process.env.BASE_URL, "Auth e2e needs a configured server via BASE_URL.");

// Next renders an always-present empty route announcer with role="alert", so
// error assertions have to target the form's own message.
function formError(page: import("@playwright/test").Page) {
  return page.locator("p[role='alert']");
}

async function signIn(page: import("@playwright/test").Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/** Waits for the sign-in server action to land, so a later goto cannot race it. */
async function signInAndLand(page: import("@playwright/test").Page, username: string, password: string) {
  await signIn(page, username, password);
  await page.waitForURL(/\/dashboard\//);
}

test("anonymous visitors are sent to sign-in and returned to where they were headed", async ({ page }) => {
  await page.goto("/dashboard/student");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fstudent/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("a wrong password is rejected without revealing which field was wrong", async ({ page }) => {
  await signIn(page, "student", "definitely-not-the-password");
  await expect(formError(page)).toHaveText(/do not match an account/i);
  await expect(page).toHaveURL(/\/login/);
});

test("the student account lands on the learner dashboard", async ({ page }) => {
  await signIn(page, "student", "student");
  await expect(page).toHaveURL(/\/dashboard\/student/);
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
});

test("the lecturer account lands on the teaching dashboard", async ({ page }) => {
  await signIn(page, "lecturer", "lecturer");
  await expect(page).toHaveURL(/\/dashboard\/lecturer/);
  await expect(page.getByRole("link", { name: "Teaching" })).toBeVisible();
});

test("a student cannot reach the lecturer dashboard", async ({ page }) => {
  await signInAndLand(page, "student", "student");
  await page.goto("/dashboard/lecturer");
  await expect(page).toHaveURL(/\/dashboard\/student/);
});

test("a lecturer cannot reach the student dashboard", async ({ page }) => {
  await signInAndLand(page, "lecturer", "lecturer");
  await page.goto("/dashboard/student");
  await expect(page).toHaveURL(/\/dashboard\/lecturer/);
});

test("signing out returns the visitor to the public site", async ({ page }) => {
  await signInAndLand(page, "student", "student");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await page.goto("/dashboard/student");
  await expect(page).toHaveURL(/\/login/);
});
