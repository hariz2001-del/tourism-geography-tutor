import { expect, test, type Page } from "@playwright/test";

test.skip(!process.env.BASE_URL, "Dashboard e2e needs a configured server via BASE_URL.");

async function signIn(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/dashboard\//);
}

function collectFailures(page: Page) {
  const failures: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
  page.on("pageerror", (error) => failures.push(String(error)));
  page.on("response", (response) => { if (response.status() >= 500) failures.push(`${response.status()} ${response.url()}`); });
  return failures;
}

test("every learner dashboard section renders without browser errors", async ({ page }) => {
  const failures = collectFailures(page);
  await signIn(page, "student", "student");

  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

  for (const [tab, heading] of [
    ["Results", /^Results$/],
    ["Studied", /what you have studied/i],
    ["Saved", /saved material/i],
  ] as const) {
    await page.getByRole("link", { name: tab, exact: true }).click();
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
  }

  expect(failures, failures.join("\n")).toHaveLength(0);
});

test("every teaching dashboard section renders without browser errors", async ({ page }) => {
  const failures = collectFailures(page);
  await signIn(page, "lecturer", "lecturer");

  await expect(page.getByRole("heading", { name: /good to see you/i })).toBeVisible();

  for (const [tab, heading] of [
    ["Students", /^Students$/],
    ["Question bank", /question bank/i],
    ["Approval queue", /approval queue/i],
  ] as const) {
    await page.getByRole("link", { name: tab, exact: true }).click();
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
  }

  expect(failures, failures.join("\n")).toHaveLength(0);
});

test("the lecturer's view of a student shows results but never their saved material or reading history", async ({ page }) => {
  await signIn(page, "lecturer", "lecturer");
  await page.getByRole("link", { name: "Students", exact: true }).click();
  await page.getByRole("link", { name: "Student One" }).click();

  await expect(page.getByRole("heading", { name: "Student One", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /attempt history/i })).toBeVisible();

  // The student has a bookmark and a studied topic recorded. Neither may appear
  // here — RLS gives the lecturer no policy on those tables at all.
  // innerText of <main> only, so Next's inlined RSC payload (which carries other
  // pages' copy, including the word "bookmarks") cannot produce a false pass.
  const visible = await page.locator("main").innerText();
  expect(visible).not.toMatch(/saved material/i);
  expect(visible).not.toMatch(/bookmark/i);
  expect(visible).not.toMatch(/studied/i);
  expect(visible).not.toMatch(/reading history/i);
});

test("the question bank lists the real bank and filters it", async ({ page }) => {
  await signIn(page, "lecturer", "lecturer");
  await page.goto("/dashboard/lecturer/questions");

  await expect(page.getByRole("status")).toContainText(/Showing 208 of 208 questions/);

  await page.getByLabel("Type").selectOption("subjective");
  await expect(page.getByRole("status")).toContainText(/Showing 80 of 208 questions/);

  await page.getByLabel("Chapter").selectOption("CH3");
  await expect(page.getByRole("status")).toContainText(/of 208 questions/);
});

test("the approval queue shows the unapproved drafts", async ({ page }) => {
  await signIn(page, "lecturer", "lecturer");
  await page.goto("/dashboard/lecturer/review");

  await expect(page.getByRole("status").first()).toContainText(/208[\s\S]*drafts awaiting review/);
  await expect(page.getByRole("button", { name: "Approve" }).first()).toBeVisible();
});
