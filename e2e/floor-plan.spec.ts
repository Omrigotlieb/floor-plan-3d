import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Absolute path to the sample PDF used in upload tests. */
const SAMPLE_PDF = path.resolve(__dirname, "../data/sample-floor-plan.pdf");

/** Seed sessionStorage with a known schema before navigating to the viewer. */
async function seedViewer(page: import("@playwright/test").Page, sessionId: string) {
  const schema = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../data/sample-output.json"), "utf8")
  );
  await page.goto("/");
  await page.evaluate(
    ({ id, data }) => sessionStorage.setItem(`floor-plan-${id}`, JSON.stringify(data)),
    { id: sessionId, data: schema }
  );
}

// ---------------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------------
test("landing page: upload CTA links to /upload", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: /upload floor plan/i });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/upload/);
});

// ---------------------------------------------------------------------------
// Upload page — error state
// ---------------------------------------------------------------------------
test("upload page: uploading a non-PDF shows a user-friendly error", async ({ page }) => {
  await page.goto("/upload");
  // Create an in-memory text file
  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByRole("button", { name: /drop zone/i }).click(),
  ]);
  await fileChooser.setFiles({
    name: "not-a-pdf.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("hello"),
  });
  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(/pdf/i);
});

// ---------------------------------------------------------------------------
// Viewer page — session seed tests
// ---------------------------------------------------------------------------
const SESSION_ID = "test-session-abc123";

test("viewer page: room labels are visible after render", async ({ page }) => {
  await seedViewer(page, SESSION_ID);
  await page.goto(`/viewer/${SESSION_ID}`);
  // The room list in the sidebar must contain the room name from sample-output.json
  await expect(page.getByText(/bedroom|living|room/i).first()).toBeVisible({ timeout: 10_000 });
});

test("viewer page: export glTF button is present and labelled", async ({ page }) => {
  await seedViewer(page, SESSION_ID);
  await page.goto(`/viewer/${SESSION_ID}`);
  const btn = page.getByRole("button", { name: /download gltf/i });
  await expect(btn).toBeVisible();
});

test("viewer page: export OBJ button is present and labelled", async ({ page }) => {
  await seedViewer(page, SESSION_ID);
  await page.goto(`/viewer/${SESSION_ID}`);
  const btn = page.getByRole("button", { name: /download obj/i });
  await expect(btn).toBeVisible();
});

test("viewer page: error state shown when session not in storage", async ({ page }) => {
  await page.goto("/viewer/nonexistent-session-xyz");
  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible({ timeout: 5_000 });
  await expect(alert).toContainText(/session not found|upload a new/i);
});

test("viewer page: back-to-home link navigates to /", async ({ page }) => {
  await seedViewer(page, SESSION_ID);
  await page.goto(`/viewer/${SESSION_ID}`);
  await page.getByRole("link", { name: /back to home/i }).click();
  await expect(page).toHaveURL("/");
});

// ---------------------------------------------------------------------------
// Mobile viewport (Pixel 5) — viewer renders
// ---------------------------------------------------------------------------
test("mobile: viewer page renders room list on Pixel 5 viewport", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 851 }); // Pixel 5
  await seedViewer(page, SESSION_ID);
  await page.goto(`/viewer/${SESSION_ID}`);
  await expect(page.getByText(/bedroom|living|room/i).first()).toBeVisible({ timeout: 10_000 });
});

// ---------------------------------------------------------------------------
// Full flow: upload → viewer (skipped without running server + real API key)
// ---------------------------------------------------------------------------
test("full flow: upload sample PDF navigates to viewer within 10s", async ({ page }) => {
  // Skip if sample PDF not present (CI without test data generation)
  if (!fs.existsSync(SAMPLE_PDF)) {
    test.skip(true, "sample-floor-plan.pdf not found — run scripts/generate-sample-pdf.js first");
    return;
  }

  await page.goto("/upload");
  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByRole("button", { name: /drop zone/i }).click(),
  ]);
  await fileChooser.setFiles(SAMPLE_PDF);

  // Should navigate to /viewer/... within 10 s
  await expect(page).toHaveURL(/\/viewer\//, { timeout: 10_000 });
});
