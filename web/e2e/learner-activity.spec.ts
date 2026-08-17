import { expect, test, type Page } from "@playwright/test";

test.skip(!process.env.BASE_URL, "Learner activity e2e needs a configured server via BASE_URL.");

async function signIn(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/dashboard\//);
}

test("opening a topic records it as studied", async ({ page }) => {
  await signIn(page, "student", "student");

  await page.goto("/chapters/CH2");
  const topicName = await page.getByRole("heading", { level: 1 }).innerText();

  await page.goto("/dashboard/student/progress");
  // The recorded topic must survive a full round trip to the database.
  await expect(page.getByRole("link", { name: topicName, exact: true })).toBeVisible();
});

test("saving material puts it in the learner's saved list and removing it takes it out", async ({ page }) => {
  await signIn(page, "student", "student");
  await page.goto("/chapters/CH1");

  const save = page.getByRole("button", { name: /^Save / }).first();
  const title = (await save.getAttribute("aria-label"))!.replace(/^Save /, "");
  await save.click();

  // Waits for the server round trip to settle, not just the click to register.
  const saved = page.getByRole("button", { name: `Remove ${title} from saved material` });
  await expect(saved).toBeVisible();
  await expect(saved).toHaveAttribute("aria-busy", "false");

  await page.goto("/dashboard/student/bookmarks");
  await expect(page.getByRole("heading", { name: title, level: 3 })).toBeVisible();

  await page.getByRole("button", { name: `Remove ${title} from saved material` }).click();
  await expect(page.getByRole("heading", { name: title, level: 3 })).not.toBeVisible();
});

test("the save control is absent for anonymous visitors", async ({ page }) => {
  await page.goto("/chapters/CH1");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Save / })).toHaveCount(0);
});

test("the save control is absent for a lecturer", async ({ page }) => {
  await signIn(page, "lecturer", "lecturer");
  await page.goto("/chapters/CH1");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Save / })).toHaveCount(0);
});

test("marking a flashcard for review saves it to the learner's saved material", async ({ page }) => {
  await signIn(page, "student", "student");
  await page.goto("/flashcards?chapter=CH3");

  await page.getByRole("button", { name: "Show answer" }).click();
  const title = await page.getByRole("heading", { level: 2 }).first().innerText();
  await page.getByRole("button", { name: "Review again" }).click();

  await page.goto("/dashboard/student/bookmarks");
  await expect(page.getByRole("heading", { name: title, level: 3 })).toBeVisible();
  await expect(page.getByText(/from flashcards/i).first()).toBeVisible();

  await page.getByRole("button", { name: `Remove ${title} from saved material` }).click();
  await expect(page.getByRole("heading", { name: title, level: 3 })).not.toBeVisible();
});
