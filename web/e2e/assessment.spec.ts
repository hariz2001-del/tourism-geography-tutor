import { expect, test, type Page } from "@playwright/test";

test.skip(!process.env.BASE_URL, "Assessment e2e needs a configured server via BASE_URL.");

// Marking a full paper calls the LLM grader once per written answer, so this
// comfortably outlives the default 30s test timeout.
test.setTimeout(180_000);

async function signIn(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/dashboard\//);
}

/** Answers every question on the paper, then submits. */
async function completeAssessment(page: Page) {
  for (const group of await page.locator("fieldset").all()) {
    const radios = group.getByRole("radio");
    if (await radios.count()) {
      await radios.first().check();
      continue;
    }
    await group.getByRole("textbox").fill("Tourism geography describes where people travel and why.");
  }
  await page.getByRole("button", { name: /submit assessment/i }).click();
}

test("a learner's assessment is marked, scored, and kept in their results", async ({ page }) => {
  await signIn(page, "student", "student");

  await page.goto("/practice/course");
  await expect(page.getByRole("heading", { name: /full course exam/i })).toBeVisible();
  await completeAssessment(page);

  await expect(page.getByRole("heading", { name: /full course exam results/i })).toBeVisible({ timeout: 60_000 });
  const score = await page.locator("main p.text-xl").first().innerText();
  expect(score).toMatch(/^\d+ \/ \d+ marks$/);
  await expect(page.getByText(/saved to your results/i)).toBeVisible();

  await page.getByRole("link", { name: /review this attempt/i }).click();
  await expect(page.getByRole("heading", { name: /full course exam/i })).toBeVisible();
  // The stored attempt must show the same score the marking returned.
  await expect(page.locator("main p.text-xl").first()).toContainText(score.replace(" marks", ""));

  await page.goto("/dashboard/student/results");
  await expect(page.getByRole("heading", { name: /full course exam/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /retake/i }).first()).toBeVisible();
});

test("an anonymous visitor is marked but asked to sign in rather than told it was saved", async ({ page }) => {
  await page.goto("/practice/topic?topic=" + encodeURIComponent(process.env.TOPIC_ID ?? ""));
  // Falls back to the course exam when no topic id is supplied.
  if (await page.getByRole("heading", { name: /topic quiz/i }).count() === 0) {
    await page.goto("/practice/course");
  }
  await completeAssessment(page);

  await expect(page.getByText(/sign in/i).first()).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(/saved to your results/i)).toHaveCount(0);
});
