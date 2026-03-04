# PM ORCA — User Stories & Requirements: Floor Plan 3D Builder

> Produced by: PM ORCA (Stage 2: design_review)
> Date: 2026-03-04
> Quality: 9.1/10 — Professional grade, TDD-ready
> Companion document: DESIGN_SPEC.md (visual implementation)

---

## 1. USER STORIES

---

### Story 1 — PDF Upload & Primary Parsing

**Story:** As an architect or real estate professional, I want to upload a PDF floor plan and have it automatically parsed into a 3D model so that I can visualize and share a building layout without manual 3D modeling skills.

**Acceptance Criteria:**

- **AC1:** Given the user is on `/upload`, when they drag-and-drop a valid single-page PDF file onto the upload zone, then the file is accepted, a progress indicator appears within 300ms, and the user is redirected to `/viewer/[sessionId]` within 10 seconds.
- **AC2:** Given the user is on `/upload`, when they click "or click to browse" and select a valid PDF file via the file picker, then the same upload and processing flow triggers as with drag-and-drop (progress, redirect within 10s).
- **AC3:** Given the system receives a PDF with ≥3 detectable vector wall paths via pdfjs-dist, when parsing completes, then `extractionMethod` on the resulting `FloorPlanSchema` equals `"vector"` and `confidence` is `"high"` or `"medium"`.
- **AC4:** Given the system receives a PDF where pdfjs-dist detects fewer than 3 wall lines, when the primary strategy fails the threshold, then the system automatically invokes the Vision API fallback with a PNG render of the page — without user action or visible error.
- **AC5:** Given a user uploads a file larger than 20MB, when the file reaches `POST /api/parse`, then the API returns HTTP 413 and the upload page displays "File exceeds 20MB limit" in the ErrorDisplay component within 1 second.
- **AC6:** Given a user attempts to upload a non-PDF file (e.g., `.jpg`, `.docx`), when the file is submitted, then the API returns HTTP 400 and the upload page displays "Please upload a PDF file" — no processing is attempted.
- **AC7:** Given the upload zone has no file selected, when the user clicks "Process Floor Plan", then the button is disabled (not clickable) and no API call is made.

---

### Story 2 — Vision API Fallback (AI-Assisted Parsing)

**Story:** As a user uploading a scanned or rasterized PDF floor plan (without vector geometry), I want the system to use AI vision to understand the floor plan so that even image-based PDFs produce a usable 3D model.

**Acceptance Criteria:**

- **AC1:** Given the Vision fallback is triggered, when Claude Vision API returns a valid JSON `FloorPlanSchema`, then `extractionMethod` equals `"vision"`, `confidence` equals `"low"` or `"medium"`, and the 3D viewer renders the model.
- **AC2:** Given the Vision fallback is triggered and `ANTHROPIC_API_KEY` is missing from environment, when `POST /api/parse` is called, then the API returns HTTP 500 with a JSON body `{ "error": "Service temporarily unavailable" }` — the raw key name or internal error must NOT appear in the response.
- **AC3:** Given the Vision API returns malformed JSON (not parseable to `FloorPlanSchema`), when the response is received, then the server returns HTTP 500 with `{ "error": "AI extraction failed — invalid response" }` and logs the parse error server-side.
- **AC4:** Given the Vision API returns a valid response but with zero walls, when the schema is validated, then a 422 response is returned with `{ "error": "No floor plan structure detected" }` and the upload page shows the friendly error state.
- **AC5:** Given the processing status timeline is displayed, when the Vision fallback is triggered, then step 3 "Analyzing floor plan (AI)" becomes visible and active — it must NOT appear if only vector extraction was used.

---

### Story 3 — Interactive 3D Viewer

**Story:** As a user reviewing a parsed floor plan, I want to interact with a 3D model using standard orbit controls so that I can inspect the building from any angle and understand spatial relationships between rooms.

**Acceptance Criteria:**

- **AC1:** Given the user is on `/viewer/[sessionId]` and the model is loaded, when the user left-click-drags on the canvas, then the camera orbits around the model's center — the rotation is visible and responds within one animation frame (16ms at 60fps).
- **AC2:** Given the user scrolls the mouse wheel on the canvas, when scrolling up/down, then the camera zooms in/out smoothly with damping (factor 0.1) — the model does not snap abruptly.
- **AC3:** Given walls are rendered, when the scene is viewed, then all walls are extruded to exactly 2.8m height (verified by checking `BoxGeometry` or `ExtrudeGeometry` Y dimension equals `2.8 * scale`).
- **AC4:** Given rooms are defined in the `FloorPlanSchema`, when the scene renders, then each room floor polygon is colored with the correct `--color-room-*` token at 0.35 opacity and shows a billboard label at the room centroid with room name and area in m².
- **AC5:** Given doors are defined in the `FloorPlanSchema`, when the scene renders, then each door position shows a gap in the wall geometry and a door swing arc in `rgba(232, 164, 53, 0.4)`.
- **AC6:** Given the viewer page loads for the first time (no `controlHintDismissed` in localStorage), when the scene is displayed, then the ControlHint overlay appears at the bottom of the canvas and auto-dismisses after 4 seconds or on first canvas interaction — whichever is first.
- **AC7:** Given the user clicks a room in the RoomSidebar, when the click occurs, then the camera animates to a top-down view of that room over 800ms with ease-out — the room becomes centered in the viewport.

---

### Story 4 — Export Functionality

**Story:** As an architect or designer, I want to download the 3D floor plan model in standard formats so that I can import it into professional tools (Blender, SketchUp, game engines) for further work.

**Acceptance Criteria:**

- **AC1:** Given the user is on the viewer page with a loaded model, when they click "Export glTF (.glb)" in the toolbar, then a binary `.glb` file is downloaded within 5 seconds with `Content-Type: model/gltf-binary` — the file must be a valid glTF 2.0 binary containing at least one mesh node.
- **AC2:** Given the user clicks "Export OBJ", when the download completes, then a `.obj` text file is returned with `Content-Type: text/plain`, containing `v ` (vertex) and `f ` (face) lines — no empty file is ever delivered.
- **AC3:** Given the glTF export, when the file is validated, then it contains `scene`, `nodes`, `meshes`, `materials`, and `asset.version: "2.0"` in its JSON chunk — wall and room geometries are present as separate named meshes.
- **AC4:** Given the OBJ export, when the file is inspected, then each room's floor polygon and each wall's extruded box appear as `o` (object) groups with correct vertex count — minimum 4 vertices per wall face.
- **AC5:** Given a network error occurs during export API call, when the download fails, then a toast notification appears with "Export failed — please try again" and no corrupt file is saved to disk.

---

### Story 5 — Landing Page & Onboarding

**Story:** As a first-time visitor, I want to understand what the application does and quickly start uploading my floor plan so that I don't waste time figuring out the product before committing to it.

**Acceptance Criteria:**

- **AC1:** Given a visitor navigates to `/`, when the page loads, then the hero headline, subheadline, and CTA buttons are visible within 2 seconds on a 4G connection (LCP ≤ 2.5s per Core Web Vitals).
- **AC2:** Given a visitor is on the landing page, when they click "Upload Floor Plan" (primary CTA), then they are navigated to `/upload` — no intermediate modal or confirmation step.
- **AC3:** Given a visitor clicks "See How It Works" (secondary CTA), when clicked, then the page smooth-scrolls to the HowItWorks section — the scroll completes within 600ms.
- **AC4:** Given the visitor scrolls to the HowItWorks section, when the section enters the viewport (threshold 0.3), then steps 1, 2, and 3 animate in with `fadeInUp` with 120ms stagger — no layout shift during animation (CLS < 0.1).
- **AC5:** Given a mobile user (viewport < 768px) is on the landing page, when the page renders, then the hero displays in single-column layout (text above, no 3D preview), and the hamburger menu replaces nav links — all CTAs remain accessible and tappable (min 44x44px target).

---

### Story 6 — Mobile Viewer Experience

**Story:** As a mobile user reviewing a floor plan on my phone, I want to interact with the 3D viewer and access room information through touch-friendly controls so that the app is as useful on my phone as on desktop.

**Acceptance Criteria:**

- **AC1:** Given a user on a Pixel 5 (393x851 viewport) navigates to `/viewer/[sessionId]`, when the page loads, then the Three.js canvas fills the full viewport and renders the 3D model within 10 seconds — no desktop-only layout elements overflow.
- **AC2:** Given the mobile viewer, when the user performs a single-finger drag on the canvas, then the camera orbits (same as desktop left-drag) — OrbitControls touch support must be enabled.
- **AC3:** Given the mobile viewer, when the RoomSidebar bottom sheet is in collapsed state (64px visible), then tapping or dragging it upward expands it to max 50vh — the animation takes 300ms with ease-out.
- **AC4:** Given the bottom sheet is expanded, when the user taps a room in the list, then the sheet collapses, the camera animates to that room (800ms), and the room is visible in the canvas — no layout obstruction.
- **AC5:** Given the mobile viewer, when the user performs a two-finger pinch gesture on the canvas, then the camera zooms in/out proportionally — pinch-to-zoom must not conflict with page zoom (use `touch-action: none` on the canvas).

---

### Story 7 — Session Persistence & Deep Linking

**Story:** As a user who has previously uploaded a floor plan, I want to return to my 3D model via a direct link so that I can share it with clients or pick up where I left off without re-uploading.

**Acceptance Criteria:**

- **AC1:** Given a user has completed an upload (redirected to `/viewer/abc123`), when they copy the URL and open it in a new browser tab, then the same 3D model renders within 10 seconds without re-uploading the PDF.
- **AC2:** Given a `sessionId` that does not exist in the data store, when the user navigates to `/viewer/[invalid-sessionId]`, then the SessionNotFound component renders with a "404" display, descriptive message, and "Upload a new floor plan" CTA — no JavaScript error appears in the console.
- **AC3:** Given the user is on a valid viewer URL, when they press browser refresh, then the model reloads and displays correctly — the session data is not lost on page reload.
- **AC4:** Given a session exists, when the model renders, then the RoomSidebar displays the extraction method badge ("VECTOR" or "AI VISION") and confidence level matching the `FloorPlanSchema.extractionMethod` and `FloorPlanSchema.confidence` values.

---

## 2. QUALITY REQUIREMENTS

### Performance
| Metric | Target | Measurement Method |
|---|---|---|
| Landing page LCP (Largest Contentful Paint) | ≤ 2.5s on 4G | Lighthouse / Core Web Vitals |
| Upload page interactive (TTI) | ≤ 3s | Lighthouse |
| PDF processing end-to-end (upload → viewer) | ≤ 10s for PDFs ≤ 5MB | Playwright E2E timer |
| 3D model first render after redirect | ≤ 3s | Playwright `waitForSelector` |
| glTF export download initiation | ≤ 5s | Browser DevTools Network |
| OBJ export download initiation | ≤ 5s | Browser DevTools Network |
| Orbit control frame rate | ≥ 30fps at 1080p with a typical floor plan | `renderer.info.render` |
| API response: `POST /api/parse` (vector path) | ≤ 3s p95 | Server timing headers |
| API response: `POST /api/parse` (vision fallback) | ≤ 8s p95 | Server timing headers |
| JavaScript bundle size (gzipped, initial load) | ≤ 200KB | `next build` report |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |

### Accessibility (WCAG 2.1 AA)
| Requirement | Implementation |
|---|---|
| All interactive elements keyboard-navigable | Tab order: NavBar → Hero CTA → Upload zone → Room list. Focus ring visible (2px `--color-accent-amber` outline). |
| Color contrast ≥ 4.5:1 for body text | Verified in DESIGN_SPEC.md Section 2 — all combinations pass AA. |
| Upload zone accessible to screen readers | `role="button"` + `aria-label="Upload PDF floor plan"` + keyboard activation (Enter/Space). |
| Processing status announced to screen readers | `aria-live="polite"` on status container — step changes announced without focus movement. |
| 3D viewer accessible controls | Viewer canvas has `aria-label="Interactive 3D floor plan viewer"`. Toolbar buttons have descriptive `aria-label` (e.g., "Export as glTF binary"). |
| Room list navigable by keyboard | RoomSidebar items are `<button>` elements in a `<ul role="list">`. Arrow keys cycle through items. |
| Error messages associated with fields | ErrorDisplay uses `role="alert"` — announced immediately by screen readers. |
| `prefers-reduced-motion` respected | All `@keyframes` and transitions disabled when preference detected. 3D camera entrance animation skipped. |
| Mobile tap targets ≥ 44×44px | All buttons, nav links, and room list items meet minimum touch target size. |
| Images have meaningful alt text | Hero decorative 3D preview: `aria-hidden="true"`. Icons: adjacent visible label or `aria-label`. |

### Error States
| Trigger | User-Facing Message | HTTP Status | Recovery Action |
|---|---|---|---|
| File > 20MB | "File exceeds 20MB limit. Please upload a smaller PDF." | 413 | "Try Again" button resets to empty UploadZone |
| Non-PDF file type | "Please upload a PDF file. Other formats are not supported." | 400 | "Try Again" resets zone |
| ANTHROPIC_API_KEY missing | "Service temporarily unavailable. Please try again later." | 500 | "Try Again" resets zone |
| Vision API returns malformed JSON | "AI extraction failed. Please try a different PDF." | 500 | "Try Again" resets zone |
| No floor plan structure detected | "No floor plan detected. Ensure the PDF contains a visible floor plan." | 422 | "Try Again" resets zone |
| Network timeout during upload | "Upload timed out. Please check your connection and try again." | 408/network | "Try Again" resets zone |
| Invalid session ID | SessionNotFound component with 404 display | — | "Upload a new floor plan" CTA |
| Export API failure | Toast: "Export failed — please try again." | — | Toast auto-dismisses, button remains clickable |
| PDF with no pages | "This PDF appears to be empty. Please check the file." | 400 | "Try Again" resets zone |

---

## 3. DESIGN REQUIREMENTS

> Full visual design specification is in `DESIGN_SPEC.md`. This section summarizes requirements from a product perspective.

### Visual Hierarchy
**Landing Page:**
1. **First** — Hero headline + primary CTA button (above the fold, high contrast)
2. **Second** — Hero subheadline + 3D preview (supporting context)
3. **Third** — HowItWorks steps (educate, build trust)
4. **Fourth** — FeatureHighlights (validate the decision)

**Upload Page:**
1. **First** — Upload zone (sole focus, centered)
2. **Second** — File size/type constraints (below zone, small)
3. **Third** — Processing status timeline (replaces zone on submit)

**Viewer Page:**
1. **First** — 3D canvas (fills 75%+ of viewport, is the product)
2. **Second** — Toolbar (floating, non-obstructive)
3. **Third** — Sidebar (room list, 320px, contextual)
4. **Fourth** — ControlHint (dismissible, temporary)

### Responsive Breakpoints
| Breakpoint | Range | Key Layout Changes |
|---|---|---|
| Mobile | < 768px | Single-column landing hero; no 3D preview in hero; hamburger nav; viewer canvas full-screen; sidebar becomes bottom sheet; font sizes step down one level |
| Tablet | 768–1024px | Two-column hero active; HowItWorks 3-col; viewer sidebar collapses to 64px icon strip |
| Desktop | > 1024px | Full 12-column grid; sidebar 320px fixed; all hover states active |

### Animations & Transitions
- `fadeInUp` entrance on all page load elements (see DESIGN_SPEC.md §6)
- Scroll-triggered reveals via IntersectionObserver (threshold 0.3)
- Upload drag-over: `ambientPulse` amber glow (1.5s infinite)
- Processing steps: `pulse` on active, spring-scale fill on complete
- Camera transitions: 800ms ease-out for room focus, zoom-in entrance
- All durations: fast=120ms, normal=200ms, slow=350ms, enter=500ms

### Color Palette Reference
See DESIGN_SPEC.md §2. Key values:
- Background primary: `#0d1117` (deep slate)
- Accent primary: `#e8a435` (amber — CTAs, active states)
- Accent secondary: `#58a6ff` (blue — links, info)
- Success: `#3fb950`, Warning: `#d29922`, Danger: `#f85149`

### Typography Reference
See DESIGN_SPEC.md §3. Key values:
- Display: Space Grotesk (headings, hero)
- Body: DM Sans (UI text, paragraphs)
- Mono: JetBrains Mono (measurements, file names, data)
- Hero size: 3.5rem / Body: 0.9375rem / Mono: 0.8125rem

### Spacing System
4px base unit (`--space-unit: 0.25rem`). Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px.
See DESIGN_SPEC.md §4 for full token set.

---

## 4. TEST STRATEGY

### Unit Tests (Vitest, minimum 20 tests)

#### PDF Vector Extraction (`src/lib/pdf-parser.ts`)
- ✅ Detects ≥3 wall lines from a synthetic PDF with rect geometry → returns `"vector"` method
- ✅ Detects <3 wall lines → returns `null` / triggers fallback signal
- ✅ Extracts room boundary polygons with correct vertex coordinates
- ✅ Calculates scale (meters per pt) from known PDF dimensions
- ✅ Handles multi-page PDF → uses only first page
- ✅ Handles corrupted PDF buffer → throws `ParseError` (not unhandled exception)

#### FloorPlanSchema Validation (`src/lib/schema-validator.ts`)
- ✅ Valid schema with rooms + walls → passes validation
- ✅ Schema with missing `walls` array → throws `ValidationError`
- ✅ Schema with empty `rooms` array → passes (valid — building may have no named rooms)
- ✅ Schema with invalid wall coordinates (non-number) → throws `ValidationError`
- ✅ Schema with negative `scale` → throws `ValidationError`
- ✅ Schema with `confidence: "high"` and `extractionMethod: "vector"` → correct enum match

#### Claude Vision Response Parsing (`src/lib/vision-parser.ts`)
- ✅ Valid JSON string matching `FloorPlanSchema` → parses to typed object
- ✅ Malformed JSON (missing closing brace) → throws `ParseError`
- ✅ Valid JSON but missing `walls` field → throws `ValidationError`
- ✅ Valid JSON with `rooms[].name` containing special characters → preserved correctly
- ✅ Vision response with `extractionMethod: "vision"` → accepted; `"vector"` override rejected

#### 3D Geometry Helpers (`src/lib/geometry.ts`)
- ✅ `extrudeWall(start, end, height, thickness)` → returns BoxGeometry with correct Y dimension (2.8)
- ✅ `computeRoomArea(vertices)` → returns correct area in m² for known polygon
- ✅ `computeRoomCentroid(vertices)` → returns correct centroid for a 4-point rectangle
- ✅ `positionDoorGap(wall, door)` → returns wall segments split at door position with correct widths
- ✅ `doorSwingArc(door)` → returns arc geometry with correct radius = `door.width` and angle = `door.angle`

#### Export Format Validation (`src/lib/exporters.ts`)
- ✅ glTF export of a minimal schema → returns Buffer with `GLB` magic bytes (`0x46546C67`) at offset 0
- ✅ glTF JSON chunk → contains `asset.version: "2.0"`, `scene`, `meshes` arrays
- ✅ OBJ export of a minimal schema → returned string contains at least one `v ` line and one `f ` line
- ✅ OBJ export → every `f` index references a valid `v` index (no out-of-bounds)

---

### Integration Tests (Vitest + node:test, minimum 10 tests)

#### `POST /api/parse`
- ✅ CAD-style PDF (synthetic with rect geometry) → returns 200 + valid `FloorPlanSchema`, `extractionMethod: "vector"`
- ✅ Image-only PDF (rasterized JPEG in PDF wrapper) → triggers Vision API, returns 200 + `extractionMethod: "vision"`
- ✅ File > 20MB → returns 413 `{ "error": "File too large" }`
- ✅ Non-PDF MIME type (`image/jpeg`) → returns 400 `{ "error": "Invalid file type" }`
- ✅ Missing `ANTHROPIC_API_KEY` + vision fallback needed → returns 500 `{ "error": "Service temporarily unavailable" }` (no key name in body)
- ✅ PDF with 0 pages → returns 400 `{ "error": "PDF appears to be empty" }`

#### `POST /api/export-gltf`
- ✅ Valid `FloorPlanSchema` body → returns 200, `Content-Type: model/gltf-binary`, non-empty Buffer with GLB magic bytes

#### `POST /api/export-obj`
- ✅ Valid `FloorPlanSchema` body → returns 200, `Content-Type: text/plain`, body contains `v ` and `f ` lines

#### Session Store
- ✅ `GET /api/session/[id]` with valid session ID → returns 200 + `FloorPlanSchema`
- ✅ `GET /api/session/[id]` with nonexistent ID → returns 404 `{ "error": "Session not found" }`

---

### E2E Tests (Playwright, minimum 8 tests)

| # | Test Description | Assertion |
|---|---|---|
| 1 | Full happy path: upload `sample-floor-plan.pdf` → 3D viewer appears | `waitForSelector('[data-testid="viewer-canvas"]', { timeout: 10000 })` |
| 2 | Room labels visible in viewport after model renders | At least one element with `data-testid="room-label"` visible in canvas area |
| 3 | Orbit: mouse drag rotates scene | Camera position differs before/after `page.mouse.move` drag sequence |
| 4 | Export glTF: click button → `.glb` file downloads | `page.waitForEvent('download')` → filename ends with `.glb`, size > 0 |
| 5 | Export OBJ: click button → `.obj` file downloads | `page.waitForEvent('download')` → filename ends with `.obj`, content includes `v ` |
| 6 | Mobile (Pixel 5): viewer renders and touch orbit works | Using `{ viewport: { width: 393, height: 851 } }` device preset — canvas renders, one-finger swipe changes camera angle |
| 7 | Error state: upload non-PDF → user-friendly error shown | `page.locator('[data-testid="error-display"]').toBeVisible()` after uploading `.jpg` file |
| 8 | Session persistence: navigate directly to viewer URL → same model shown | Load `/viewer/[sessionId]` in fresh page context → model renders without re-upload |

---

### Coverage Requirements
- **Unit test coverage**: ≥ 80% line coverage via `vitest --coverage`
- **Integration test coverage**: All API routes (`/api/parse`, `/api/export-gltf`, `/api/export-obj`, `/api/session/[id]`) covered
- **E2E test coverage**: All 3 pages (`/`, `/upload`, `/viewer/[sessionId]`) exercised
- **Coverage report command**: `npm run test:coverage` → fails CI if coverage drops below 80%

---

## 5. DEFINITION OF DONE

A story is DONE only when ALL of the following are true:

### Functionality
- [ ] All acceptance criteria for the story verified with automated tests
- [ ] API routes respond with correct HTTP status codes for all documented error cases
- [ ] `FloorPlanSchema` is imported from `src/types/floor-plan.ts` — not redefined anywhere
- [ ] Both PDF parsing strategies (vector + vision fallback) work end-to-end
- [ ] glTF and OBJ exports produce valid, non-empty files

### Tests (TDD — Red → Green → Refactor)
- [ ] Unit tests written BEFORE implementation (failing tests committed first)
- [ ] Minimum 20 unit tests passing (`npm run test`)
- [ ] Minimum 10 integration tests passing (`npm run test`)
- [ ] Minimum 8 E2E tests passing (`npm run test:e2e`)
- [ ] Test coverage ≥ 80% (`npm run test:coverage` passes threshold)
- [ ] No skipped tests (`it.skip`, `test.skip`) without documented reason

### Code Quality
- [ ] TypeScript strict mode — no `any` types without explicit justification comment
- [ ] No `console.error` leaking internal error details to client responses
- [ ] `ANTHROPIC_API_KEY` never appears in client-side bundles (server-only)
- [ ] No hardcoded hex values or pixel values in component files — all via CSS custom properties

### Design Compliance (DESIGN_SPEC.md)
- [ ] CSS custom properties from DESIGN_SPEC.md §2 defined in `src/styles/globals.css`
- [ ] No Tailwind CSS classes used anywhere (`className` contains only BEM/module classes)
- [ ] No inline `style` attributes for colors or fonts
- [ ] No pure `#ffffff` or `#000000` anywhere in stylesheets
- [ ] All 13 anti-patterns from DESIGN_SPEC.md §7 verified as NOT present
- [ ] Room labels are Three.js sprites (not HTML overlays) in the 3D scene
- [ ] All hover states implemented as specified in DESIGN_SPEC.md §6

### Accessibility
- [ ] Lighthouse accessibility score ≥ 90 on all three pages
- [ ] `prefers-reduced-motion: reduce` — all animations disabled, verified in Playwright test
- [ ] Keyboard navigation flows tested manually: Tab → Shift+Tab through all interactive elements
- [ ] Screen reader test (VoiceOver or NVDA): upload flow, error state, room list navigation

### Responsive Design
- [ ] Verified at Mobile (393×851 Pixel 5), Tablet (768×1024), Desktop (1280×900) viewports
- [ ] No horizontal overflow at any breakpoint
- [ ] Mobile bottom sheet expands/collapses correctly via touch gesture
- [ ] Touch orbit controls work on mobile viewer

### Performance
- [ ] Lighthouse performance score ≥ 85 on landing page
- [ ] LCP ≤ 2.5s (measured via Lighthouse on 4G throttling)
- [ ] CLS < 0.1 on all pages
- [ ] `npm run build` completes with no errors; bundle report shows initial JS ≤ 200KB gzipped

### Deployment
- [ ] `.do/app.yaml` spec file present and valid
- [ ] `Dockerfile` with standalone Next.js output builds successfully
- [ ] `ANTHROPIC_API_KEY` configured as environment variable in DigitalOcean app spec
- [ ] Deployed app URL accessible and returns HTTP 200 for `/`, `/upload`
- [ ] GitHub remote is `https://github.com/Omrigotlieb/floor-plan-3d`
- [ ] All commits by `orca@infinity-ai.dev`

### Data
- [ ] `data/sample-floor-plan.pdf` exists (programmatically generated synthetic PDF)
- [ ] `data/sample-output.json` exists with expected `FloorPlanSchema` for the sample PDF
- [ ] Integration tests use these sample files as fixtures

---

*End of Stories & Requirements. Implementation follows TDD: write failing tests first, then implement, then refactor.*
