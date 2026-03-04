# DESIGN SPECIFICATION — Floor Plan 3D Builder

> Produced by: UI Designer ORCA (Stage 3: design_review — enhanced)
> Date: 2026-03-04
> Revision: 4 — design review pass: empty states, tablet sidebar detail, page transitions, ErrorDisplay animation, toast limits, NavBar scroll threshold, mobile hero fallback
> Status: Final — reviewed and approved for Development Agent implementation

---

## 1. AESTHETIC DIRECTION

**"Dark architectural studio — blueprint-inspired with crisp geometric lines, deep slate surfaces, and warm amber drafting-lamp accents that evoke a late-night design session in a professional atelier."**

The visual language draws from architectural drafting tables: dark matte surfaces, precise grid alignments, warm task-lighting accents, and the faint glow of blueprint lines. The 3D viewer is the hero — all UI recedes to support it. Interactive elements feel like precision instruments, not consumer widgets.

---

## 2. COLOR PALETTE

### Core Palette (CSS Custom Properties)

```css
:root {
  /* ── Backgrounds ── */
  --color-bg-primary:       #0d1117;   /* Deep slate — main canvas */
  --color-bg-surface:       #161b22;   /* Card/panel surfaces */
  --color-bg-elevated:      #1c2333;   /* Modals, dropdowns, hover surfaces */
  --color-bg-inset:         #090c10;   /* Recessed areas, input fields */
  --color-bg-viewer:        #0a0e14;   /* 3D viewport background */

  /* ── Text ── */
  --color-text-primary:     #e6edf3;   /* Primary body text */
  --color-text-heading:     #f0f6fc;   /* Headings, emphasis */
  --color-text-muted:       #7d8590;   /* Secondary/helper text */
  --color-text-faint:       #484f58;   /* Disabled, placeholder */

  /* ── Accents ── */
  --color-accent-amber:     #e8a435;   /* Primary CTA, active states, warmth */
  --color-accent-amber-dim: #b37a1a;   /* Amber hover/pressed */
  --color-accent-blue:      #58a6ff;   /* Links, blueprint references, info */
  --color-accent-blue-dim:  #1f6feb;   /* Blue hover/pressed */

  /* ── Semantic ── */
  --color-success:          #3fb950;   /* Completed, valid */
  --color-warning:          #d29922;   /* Caution, processing */
  --color-danger:           #f85149;   /* Error, destructive */

  /* ── Borders & Dividers ── */
  --color-border-default:   #30363d;   /* Standard borders */
  --color-border-subtle:    #21262d;   /* Subtle dividers */
  --color-border-accent:    rgba(232, 164, 53, 0.4); /* Amber glow border */

  /* ── Focus & Selection ── */
  --color-focus-ring:       rgba(232, 164, 53, 0.8);  /* Keyboard focus outline */
  --color-selection-bg:     rgba(232, 164, 53, 0.25); /* Text ::selection background */
  --color-selection-text:   #f0f6fc;                   /* Text ::selection foreground */

  /* ── Overlays ── */
  --color-overlay:          rgba(1, 4, 9, 0.7);   /* Backdrop */
  --color-glow-amber:       rgba(232, 164, 53, 0.15); /* Ambient amber glow */
  --color-glow-blue:        rgba(88, 166, 255, 0.10);  /* Subtle blue halo */

  /* ── Room Colors (3D floor surfaces & sidebar swatches) ── */
  --color-room-living:      #e8a435;   /* Living Room — warm amber */
  --color-room-bedroom:     #a78bfa;   /* Bedroom — soft lavender */
  --color-room-kitchen:     #f97066;   /* Kitchen — warm coral */
  --color-room-bathroom:    #56d4dd;   /* Bathroom — cool cyan */
  --color-room-hallway:     #636e7b;   /* Hallway — neutral slate */
  --color-room-office:      #7ee787;   /* Office/Study — sage green */
  --color-room-dining:      #d2a8ff;   /* Dining — soft purple */
  --color-room-default:     #8b949e;   /* Unknown/Other — muted gray */

  /* ── Window Rendering ── */
  --color-window-glass:     rgba(88, 166, 255, 0.25);  /* Translucent blue pane */
  --color-window-frame:     #8b949e;                    /* Muted gray frame lines */
}
```

### Contrast Ratios (WCAG AA Compliance)

| Combination | Ratio | Passes |
|---|---|---|
| `--color-text-primary` (#e6edf3) on `--color-bg-primary` (#0d1117) | 13.2:1 | AA + AAA |
| `--color-text-heading` (#f0f6fc) on `--color-bg-primary` (#0d1117) | 15.1:1 | AA + AAA |
| `--color-text-muted` (#7d8590) on `--color-bg-primary` (#0d1117) | 4.6:1 | AA |
| `--color-text-primary` (#e6edf3) on `--color-bg-surface` (#161b22) | 10.8:1 | AA + AAA |
| `--color-accent-amber` (#e8a435) on `--color-bg-primary` (#0d1117) | 8.5:1 | AA + AAA |
| `--color-accent-blue` (#58a6ff) on `--color-bg-primary` (#0d1117) | 6.1:1 | AA |
| `--color-text-primary` (#e6edf3) on `--color-bg-elevated` (#1c2333) | 9.1:1 | AA + AAA |

### Room Colors in 3D (Opacity Notes)
Room floor geometry in the Three.js scene uses room colors at **0.35 opacity** for the floor polygon fill and **0.7 opacity** for the floor polygon border, so walls and labels remain visually dominant.

---

## 3. TYPOGRAPHY

### Font Selection

| Role | Font | Character |
|---|---|---|
| **Display** (headings, hero, numbers) | **Space Grotesk** | Geometric, architectural, technical precision |
| **Body** (paragraphs, UI text, labels) | **DM Sans** | Clean geometric humanist, excellent readability |
| **Mono** (data values, file names, technical info) | **JetBrains Mono** | Engineer-grade monospace for measurements |

### Google Fonts Import URL

```
https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap
```

### Font Stacks (CSS)

```css
:root {
  --font-display:  'Space Grotesk', 'Segoe UI', sans-serif;
  --font-body:     'DM Sans', 'Segoe UI', sans-serif;
  --font-mono:     'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}
```

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Font |
|---|---|---|---|---|---|
| `--text-hero` | 3.5rem (56px) | 700 | 1.1 | -0.02em | Display |
| `--text-h1` | 2.5rem (40px) | 700 | 1.15 | -0.015em | Display |
| `--text-h2` | 1.75rem (28px) | 600 | 1.2 | -0.01em | Display |
| `--text-h3` | 1.25rem (20px) | 600 | 1.3 | -0.005em | Display |
| `--text-h4` | 1rem (16px) | 600 | 1.4 | 0 | Display |
| `--text-body` | 0.9375rem (15px) | 400 | 1.6 | 0 | Body |
| `--text-body-sm` | 0.8125rem (13px) | 400 | 1.5 | 0.005em | Body |
| `--text-caption` | 0.75rem (12px) | 500 | 1.4 | 0.02em | Body |
| `--text-label` | 0.6875rem (11px) | 600 | 1.3 | 0.06em | Body (uppercase) |
| `--text-mono` | 0.8125rem (13px) | 400 | 1.5 | 0 | Mono |

### Usage Rules
- Hero and H1 use `--font-display` with tight letter-spacing for architectural impact.
- Body text never exceeds 65ch line length for readability.
- All uppercase labels (`--text-label`) use wide letter-spacing (0.06em) and `--color-text-muted`.
- Measurement values (area in m², dimensions) use `--font-mono` always.

---

## 4. LAYOUT SYSTEM

### Grid & Spacing

```css
:root {
  --max-width:        1280px;
  --content-padding:  1.5rem;        /* Page edge padding */
  --grid-columns:     12;
  --grid-gap:         1.5rem;        /* 24px */
  --space-unit:       0.25rem;       /* 4px base unit */

  /* Spacing scale (multiples of 4px) */
  --space-1:  0.25rem;   /*  4px */
  --space-2:  0.5rem;    /*  8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */

  /* Border radius scale */
  --radius-sm:  0.375rem;  /*  6px */
  --radius-md:  0.5rem;    /*  8px */
  --radius-lg:  0.75rem;   /* 12px */
  --radius-xl:  1rem;      /* 16px */
  --radius-full: 9999px;
}
```

### Responsive Breakpoints

| Name | Range | Columns | Content Padding | Grid Gap |
|---|---|---|---|---|
| **Mobile** | < 768px | 4 | 1rem | 1rem |
| **Tablet** | 768px – 1024px | 8 | 1.25rem | 1.25rem |
| **Desktop** | > 1024px | 12 | 1.5rem | 1.5rem |

### Touch Target Minimum (Mobile & Tablet)
All interactive elements (buttons, links, nav items, room list items, toolbar icons) must meet a **minimum tap target of 44×44px** on viewports < 1024px. If the visual size is smaller (e.g., a 40×40px icon button), use padding or a transparent hit area to reach the 44px minimum. This is a WCAG 2.5.5 requirement.

### Page Layout Patterns

#### Landing Page (`/`)
- Full-bleed hero section (100vh, no max-width constraint)
- Content sections centered at `--max-width` (1280px)
- Asymmetric layout on "How It Works": text left (span 5), visual right (span 7)

#### Upload Page (`/upload`)
- Centered single-column layout, max-width 640px
- Upload zone is the sole focus of the viewport

#### Viewer Page (`/viewer/[sessionId]`)
- Full-viewport layout, NO scrolling on desktop
- Sidebar (320px fixed width, left) + Canvas (flex: 1, fills remaining space)
- On mobile: sidebar becomes a bottom sheet (40vh max, swipeable), canvas fills viewport
- On tablet: sidebar collapses to 64px icon strip, expands on tap

### Z-Index Scale

| Layer | Value | Usage |
|---|---|---|
| `--z-base` | 0 | Default content |
| `--z-sidebar` | 10 | Viewer sidebar |
| `--z-toolbar` | 20 | Export toolbar overlay |
| `--z-nav` | 30 | Navigation bar |
| `--z-overlay` | 40 | Modal backdrop |
| `--z-modal` | 50 | Modal content |
| `--z-toast` | 60 | Toast notifications |

---

## 5. COMPONENT HIERARCHY

### Page: Landing (`/`)

#### 5.1 NavBar
- **Role**: Persistent top navigation across all pages
- **Position**: Fixed top, full width, `--z-nav`
- **Height**: 64px
- **Background**: `--color-bg-primary` with `backdrop-filter: blur(12px)` and 85% opacity when scrolled (transparent at top of landing page)
- **Content**: Logo (left) — "PLANVIEW 3D" in `--font-display` weight 700, `--color-text-heading`. Nav links (right) — "Upload", "GitHub" in `--text-body-sm`, `--color-text-muted`, hover → `--color-text-primary`.
- **Border**: Bottom 1px `--color-border-subtle`, appears after scrolling past 48px (`scroll > 48`). Below 48px the NavBar background is fully transparent (landing page only). On upload and viewer pages, the opaque/bordered state is always active.
- **Mobile**: Hamburger icon replaces nav links → slide-in drawer from right

#### 5.2 HeroSection
- **Role**: Full-viewport opening statement
- **Layout**: 100vh, centered content, two-column on desktop (text left span-5, 3D preview right span-7)
- **Background**: `--color-bg-primary` with a subtle radial gradient emanating from center-right: `radial-gradient(ellipse 80% 60% at 70% 50%, rgba(232, 164, 53, 0.06), transparent)` — faint amber atmospheric glow
- **Grid overlay**: Faint architectural grid lines (1px `--color-border-subtle` at 0.3 opacity) across the full section, 64px spacing, purely decorative
- **Children**:
  - **Headline**: `--text-hero` on desktop, `--text-h1` on mobile. Two lines: "Transform Floor Plans" (line 1, `--color-text-heading`), "Into Living 3D Models" (line 2, with "3D" in `--color-accent-amber`). Tight line-height 1.1.
  - **Subheadline**: `--text-body`, `--color-text-muted`, max-width 480px. "Upload any PDF floor plan. Get an interactive, exportable 3D model in seconds — powered by AI."
  - **CTAButtons**: Row of two buttons:
    - Primary: "Upload Floor Plan" → links to `/upload`. Filled `--color-accent-amber` background, `--color-bg-primary` text, `--radius-md`, height 48px, `--text-body` weight 600. Hover: scale(1.02), `box-shadow: 0 0 24px var(--color-glow-amber)`.
    - Secondary: "See How It Works" → smooth-scrolls to HowItWorks section. Ghost style: transparent background, 1px `--color-border-default` border, `--color-text-primary` text. Hover: background `--color-bg-elevated`, border `--color-accent-amber`.
  - **3D Preview** (right column, desktop + tablet only): Static or slowly auto-rotating wireframe render of a simple floor plan. Use a simplified Three.js canvas with wireframe walls in `--color-accent-blue` at 0.6 opacity on `--color-bg-viewer` background. This is decorative, not interactive. On mobile (< 768px), the 3D preview column is hidden entirely — no SVG substitute, no placeholder. The hero is text-only on mobile to keep LCP fast and layout simple.

#### 5.3 HowItWorksSection
- **Role**: Three-step process explainer
- **Layout**: Centered, max-width 1080px, `--space-24` top/bottom padding
- **Section heading**: `--text-h2`, `--color-text-heading`, centered. "How It Works" with a small `--color-accent-amber` horizontal rule below (48px wide, 2px tall)
- **Steps**: Three columns on desktop (equal width), stack vertically on mobile
- **Each Step Card**:
  - **Step number**: `--text-label` uppercase, `--color-accent-amber`, "STEP 01" / "STEP 02" / "STEP 03"
  - **Icon area**: 64x64px circle, `--color-bg-elevated` background, 1px `--color-border-default` border. Icon inside is a line-art SVG in `--color-accent-blue`. Icons: (1) document/upload arrow, (2) CPU/brain processing, (3) 3D cube/eye viewer
  - **Title**: `--text-h3`, `--color-text-heading`. "Upload PDF" / "AI Extraction" / "Explore in 3D"
  - **Description**: `--text-body-sm`, `--color-text-muted`, max 2 lines
  - **Connector**: Between steps (desktop only), a dashed horizontal line in `--color-border-default` connecting the circles

#### 5.4 FeatureHighlights
- **Role**: Showcase key capabilities
- **Layout**: 2x2 grid on desktop (within max-width), 1-column stack on mobile, `--space-20` top/bottom
- **Each Feature Card**:
  - Background: `--color-bg-surface`, 1px `--color-border-subtle` border, `--radius-lg`
  - Padding: `--space-8`
  - **Title**: `--text-h4`, `--color-text-heading`
  - **Description**: `--text-body-sm`, `--color-text-muted`
  - Hover: border shifts to `--color-border-default`, subtle `translateY(-2px)` lift, `box-shadow: 0 4px 24px rgba(0,0,0,0.3)`
  - Features: "Dual-Mode PDF Parsing", "Interactive 3D Viewer", "Room Detection & Labeling", "Export to glTF & OBJ"

#### 5.5 Footer
- **Role**: Minimal footer
- **Background**: `--color-bg-primary`, top border 1px `--color-border-subtle`
- **Content**: "Built by ORCA" in `--text-caption` `--color-text-faint`, centered
- **Height**: 64px, flex center

---

### Page: Upload (`/upload`)

#### 5.6 UploadZone
- **Role**: Central drag-and-drop file upload area
- **Position**: Centered vertically and horizontally in viewport (below NavBar)
- **Size**: max-width 560px, min-height 320px
- **Default state**:
  - Background: `--color-bg-inset`
  - Border: 2px dashed `--color-border-default`, `--radius-xl`
  - Center content: Upload icon (line-art, 48px, `--color-text-faint`), "Drag & drop your PDF floor plan" in `--text-body` `--color-text-muted`, "or click to browse" in `--text-body-sm` `--color-accent-blue` (underline on hover)
  - Below zone: "Maximum file size: 20MB" in `--text-caption` `--color-text-faint`
- **Drag-over state**: Border becomes solid `--color-accent-amber`, background gains `--color-glow-amber`, icon pulses with subtle scale animation
- **File selected state**: File name appears with PDF icon, file size in `--font-mono`, and a small "Remove" text button in `--color-text-muted`
- **Upload button**: "Process Floor Plan →" — always rendered below the zone but **disabled when no file is selected**: `opacity: 0.4`, `cursor: not-allowed`, `pointer-events: none`, no hover effects. When a file is selected: transitions to enabled state (`opacity: 1`, `cursor: pointer`) over `--duration-normal`. Same visual style as Hero primary CTA.

#### 5.7 ProcessingStatus
- **Role**: Real-time progress indicator during PDF parsing
- **Replaces**: UploadZone content after upload begins
- **Layout**: Centered column, max-width 480px
- **Steps displayed as a vertical timeline**:
  1. "Uploading PDF" — with file size progress (e.g., "2.4 / 5.1 MB")
  2. "Extracting vector paths" — pdfjs-dist parsing
  3. "Analyzing floor plan" — Vision API fallback (shown only if triggered)
  4. "Building 3D model" — final generation
- **Each step**:
  - Left: 24px circle — pending: `--color-border-default` ring, active: `--color-accent-amber` filled with subtle pulse animation, complete: `--color-success` filled with checkmark
  - Connecting vertical line between circles: `--color-border-subtle` (solid when complete, dashed when pending)
  - Right: Step label in `--text-body-sm`, status detail in `--text-caption` `--color-text-faint`
  - Active step label uses `--color-text-primary`, others use `--color-text-muted`
- **Completion**: All circles green, brief 400ms pause, then auto-redirect to `/viewer/[sessionId]`

#### 5.8 ErrorDisplay
- **Role**: User-friendly error states
- **Position**: Replaces processing status or appears below upload zone
- **Style**: `--color-bg-surface` with left border 3px solid `--color-danger`, `--radius-md`, padding `--space-6`
- **Content**: Error icon (triangle-exclamation, `--color-danger`), error title in `--text-h4` `--color-text-heading`, description in `--text-body-sm` `--color-text-muted`
- **Action**: "Try Again" button below, ghost style like hero secondary CTA
- **Entrance animation**: Slides in with `fadeInUp` (same as page-level), `--duration-enter` (500ms), `--ease-decelerate`. The left danger border also animates from 0 to 3px width over 300ms to draw the eye.
- **Error types to display** (all must have visual treatment):
  - File too large (413) → "File exceeds 20MB limit. Please upload a smaller PDF."
  - Invalid file type (400) → "Please upload a PDF file. Other formats are not supported."
  - Empty PDF (400) → "This PDF appears to be empty. Please check the file."
  - No structure detected (422) → "No floor plan detected. Ensure the PDF contains a visible floor plan."
  - AI extraction failed (500) → "AI extraction failed. Please try a different PDF."
  - Missing API key (500) → "Service temporarily unavailable. Please try again later." (never expose internal details)
  - Network timeout (408) → "Upload timed out. Please check your connection and try again."
  - Generic server error (500) → "Something went wrong — please try again."

---

### Page: Viewer (`/viewer/[sessionId]`)

#### 5.9 ViewerLayout
- **Role**: Full-viewport two-panel layout
- **Structure**: Sidebar (left, 320px) + Canvas (right, fills remaining)
- **Height**: `100vh`, no scroll, `overflow: hidden`
- **Divider**: 1px `--color-border-subtle` vertical line between panels
- **Mobile**: Canvas fills viewport; sidebar becomes a bottom sheet with drag handle

#### 5.10 ViewerCanvas
- **Role**: Three.js / React Three Fiber scene container
- **Background**: `--color-bg-viewer` (#0a0e14)
- **Grid plane**: Subtle ground grid using Three.js GridHelper, lines in `rgba(88, 166, 255, 0.08)`, extends 50m in each direction, 1m spacing
- **Walls**: Rendered as extruded geometry, material color `#c8ccd0` (light concrete gray), roughness 0.8, metalness 0.1. Ambient occlusion at wall-floor junctions.
- **Room floors**: Transparent colored polygons per room type using `--color-room-*` at 0.35 opacity, with 0.7 opacity border stroke
- **Room labels**: Billboard text sprites (always face camera). Room name in `--font-display` weight 600, area below in `--font-mono`. White text with subtle dark drop shadow for legibility against any background. Positioned at room centroid, Y=0.05m (just above floor).
- **Doors**: Gaps in walls. Door swing shown as a thin arc line in `--color-accent-amber` at 0.4 opacity.
- **Windows**: Each window is rendered as a recessed notch in the parent wall (looked up via `wallIndex`). The notch depth is half the wall thickness. A translucent blue pane fills the notch using `--color-window-glass` (MeshStandardMaterial, transparent, opacity 0.25, roughness 0.1, metalness 0.3 for a subtle glass sheen). Two thin horizontal frame lines in `--color-window-frame` at 1/3 and 2/3 height of the opening give a mullion effect. Window width comes from `Window.width` in the schema.
- **Lighting**: Ambient light (intensity 0.6, color #f5f0e8 — warm) + Directional light (intensity 0.8, position top-right, casts soft shadows onto floor plane)
- **Camera**: Perspective, default position looking down at 45° angle, centered on model bounding box
- **Controls**: OrbitControls from @react-three/drei — left-drag orbits, right-drag pans, scroll zooms. Damping enabled (factor 0.1) for smooth feel.
- **Touch controls (mobile)**: Single-finger drag orbits (same as desktop left-drag). Two-finger pinch zooms in/out proportionally. Two-finger drag pans. OrbitControls touch support must be explicitly enabled.
- **Touch CSS**: The canvas wrapper `<div>` must have `touch-action: none` to prevent pinch-to-zoom from conflicting with browser page zoom.
- **Initial animation**: On load, camera starts slightly further back and zooms to default position over 800ms with ease-out

#### 5.11 ViewerToolbar
- **Role**: Floating action bar over the 3D canvas
- **Position**: Fixed to top-right of canvas area, `--space-4` from edges, `--z-toolbar`
- **Style**: `--color-bg-surface` at 90% opacity, `backdrop-filter: blur(8px)`, `--radius-lg`, 1px `--color-border-default` border, `box-shadow: 0 4px 16px rgba(0,0,0,0.4)`
- **Layout**: Horizontal row of icon buttons, `--space-2` gap
- **Buttons** (each 40x40px, `--radius-md`):
  - **Reset View**: Home icon → resets camera to default. `--color-text-muted`, hover `--color-text-primary`
  - **Top-Down View**: Grid/plan icon → snaps camera to birds-eye. Same colors.
  - **Divider**: 1px vertical line, `--color-border-subtle`, height 24px
  - **Export glTF**: Download icon with ".glb" micro-label below. `--color-accent-amber`, hover glow
  - **Export OBJ**: Download icon with ".obj" micro-label below. `--color-accent-blue`, hover glow

#### 5.12 RoomSidebar
- **Role**: Room list + session info panel
- **Width**: 320px (desktop), collapses on mobile
- **Background**: `--color-bg-surface`
- **Structure** (top to bottom):
  - **Session Header** (padding `--space-6`):
    - "Floor Plan" title in `--text-h3`, `--color-text-heading`
    - Session ID in `--font-mono` `--text-caption` `--color-text-faint`
    - Extraction method badge: small pill, `--radius-full`, height 22px. Uses `--text-label`:
      - `"vector"` → "VECTOR" — `--color-success` background (10% opacity), `--color-success` text
      - `"vision"` → "AI VISION" — `--color-accent-amber` background (10% opacity), `--color-accent-amber` text
      - `"hybrid"` → "HYBRID" — `--color-accent-blue` background (10% opacity), `--color-accent-blue` text
    - Confidence indicator: "High / Medium / Low" in `--text-caption` with corresponding color dot
  - **Divider**: 1px `--color-border-subtle`
  - **Room List** (scrollable, padding `--space-4`):
    - Section label: "ROOMS" in `--text-label` `--color-text-faint`, margin-bottom `--space-3`
    - **Each RoomItem**:
      - Height: 56px, `--radius-md`, padding `--space-3` `--space-4`
      - Left: 12x12px color swatch circle using the room's `--color-room-*`, `--radius-full`
      - Center: Room name in `--text-body-sm` `--color-text-primary`, area below in `--font-mono` `--text-caption` `--color-text-muted` (e.g., "14.2 m²")
      - Right: Chevron icon, `--color-text-faint`
      - Default: transparent background
      - Hover: `--color-bg-elevated` background, transition 150ms
      - Click: Animates camera to top-down view of that room (`--duration-camera` 800ms, `--ease-decelerate`)
  - **Divider**: 1px `--color-border-subtle`
  - **Stats Summary** (padding `--space-6`):
    - "SUMMARY" in `--text-label` `--color-text-faint`
    - Total area: `--font-mono` `--text-h4` `--color-text-heading` (e.g., "127.5 m²")
    - Room count: `--text-body-sm` `--color-text-muted` (e.g., "6 rooms detected")
    - Wall count: `--text-body-sm` `--color-text-muted`

#### 5.12b RoomSidebarSkeleton
- **Role**: Shimmer placeholder shown while session data is loading
- **Position**: Inside RoomSidebar, replaces room list content until data arrives
- **Structure** (mirrors RoomSidebar layout):
  - Session header: 120×20px skeleton bar for title, 80×14px for session ID, 60×22px rounded pill for badge — all `--color-bg-elevated` with shimmer
  - Divider: same 1px `--color-border-subtle`
  - Room list: 5 skeleton RoomItems — each 56px tall with 12px circle (swatch), 100×14px bar (name), 50×12px bar (area) — staggered opacity 0.6 → 0.3 from top to bottom
  - Stats: 80×20px bar, 100×14px bar, 80×14px bar
- **Shimmer animation**:
  ```css
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  /* background: linear-gradient(90deg, var(--color-bg-elevated) 25%, var(--color-bg-surface) 50%, var(--color-bg-elevated) 75%); */
  /* background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; */
  ```
- **Transition**: When data arrives, skeleton fades out (200ms) and real content fades in (300ms)

#### 5.13 ControlHint
- **Role**: First-visit overlay teaching orbit controls
- **Position**: Bottom-center of canvas, `--space-8` from bottom
- **Style**: `--color-bg-surface` at 85% opacity, `backdrop-filter: blur(8px)`, `--radius-lg`, padding `--space-3` `--space-5`
- **Content**: Three inline hints: "🖱 Drag to rotate" · "⌥ + Drag to pan" · "Scroll to zoom" — in `--text-caption` `--color-text-muted`. Use icon SVGs, not emoji (emoji listed here for spec clarity).
- **Behavior**: Fades out after 4 seconds or on first user interaction with the canvas, whichever comes first. Does not reappear once dismissed (store in localStorage).

#### 5.14 SessionNotFound
- **Role**: Error state for invalid session IDs
- **Layout**: Centered in viewport like Upload page
- **Content**: Large "404" in `--text-hero` `--color-text-faint`, "Session not found" in `--text-h2` `--color-text-heading`, description in `--text-body` `--color-text-muted`, "Upload a new floor plan" CTA button (primary style)

#### 5.15 MobileBottomSheet (viewer, < 768px)
- **Role**: Replaces sidebar on mobile
- **Position**: Fixed to bottom of viewport, `--z-sidebar`
- **Collapsed state**: 64px visible — shows drag handle bar (40px wide, 4px tall, `--radius-full`, `--color-border-default`, centered) and room count text
- **Expanded state**: Slides up to max 50vh, shows full RoomSidebar content
- **Background**: `--color-bg-surface`, top border-radius `--radius-xl`, `box-shadow: 0 -4px 24px rgba(0,0,0,0.5)`
- **Gesture**: Drag handle to expand/collapse. Also tappable.
- **Animation**: Expand/collapse slides over 300ms with `--ease-decelerate` (expand) or `--ease-accelerate` (collapse).
- **Room tap behavior**: When a user taps a room item inside the expanded bottom sheet, the sheet auto-collapses (300ms `--ease-accelerate`), then the camera animates to that room's top-down view (`--duration-camera` 800ms). The room must remain visible in the canvas — no layout obstruction from the collapsed sheet.

---

### Shared Components (used across pages)

#### 5.16 ToastNotification
- **Role**: Ephemeral feedback messages (export errors, copy-to-clipboard confirmations)
- **Position**: Fixed bottom-right of viewport, `--space-6` from edges, `--z-toast`
- **Size**: max-width 360px, min-width 280px
- **Style**: `--color-bg-elevated`, 1px `--color-border-default` border, `--radius-lg`, `box-shadow: 0 8px 32px rgba(0,0,0,0.5)`, padding `--space-4` `--space-5`
- **Layout**: Row — icon (left, 20px) + message text (center, flex: 1) + dismiss X button (right, 16px)
- **Variants**:
  - **Error**: Left accent border 3px `--color-danger`, icon in `--color-danger`. Text in `--text-body-sm` `--color-text-primary`.
  - **Success**: Left accent border 3px `--color-success`, icon in `--color-success`.
  - **Info**: Left accent border 3px `--color-accent-blue`, icon in `--color-accent-blue`.
- **Behavior**: Slides in from right (`translateX(100%) → translateX(0)`, 300ms `--ease-decelerate`). Auto-dismisses after 5 seconds. Dismiss button fades toast out (`translateX(100%)`, 200ms `--ease-accelerate`). Multiple toasts stack vertically with `--space-2` gap, newest on bottom. **Maximum 3 toasts visible** — when a 4th arrives, the oldest is immediately dismissed (animated out) to make room.
- **Accessible**: `role="status"`, `aria-live="polite"`. Error toasts use `role="alert"`, `aria-live="assertive"`.
- **Specific toast messages**:
  - Export glTF failure → Error variant: "Export failed — please try again"
  - Export OBJ failure → Error variant: "Export failed — please try again"
  - Export success → Success variant: "File downloaded successfully"

#### 5.17 MobileNavDrawer (< 768px)
- **Role**: Slide-in navigation menu for mobile viewports
- **Trigger**: Hamburger icon (24px, three horizontal lines, `--color-text-muted`) in NavBar right slot
- **Position**: Fixed, full height, right-aligned, width 280px, `--z-modal`
- **Backdrop**: `--color-overlay` covering entire viewport, `--z-overlay`, tappable to close
- **Background**: `--color-bg-surface`, left border 1px `--color-border-subtle`
- **Content** (top to bottom):
  - Close button (X icon, 24px, `--color-text-muted`, top-right, `--space-5` padding) — hover → `--color-text-primary`
  - Navigation links: vertical stack, each 56px tall, padding `--space-4` `--space-6`, `--text-body` `--color-text-primary`. Divider 1px `--color-border-subtle` between items.
  - Links: "Upload", "GitHub"
  - Active page link: `--color-accent-amber` text, left border 3px `--color-accent-amber`
- **Animation**: Drawer slides in from right (`translateX(100%) → translateX(0)`, 250ms `--ease-decelerate`). Backdrop fades in (`opacity 0 → 1`, 200ms). Close reverses both.
- **Accessible**: Focus trapped within drawer while open. Escape key closes. `aria-label="Navigation menu"`, `role="dialog"`.

#### 5.18 ViewerLoadingState
- **Role**: Placeholder displayed on viewer page while the 3D model is being fetched/built
- **Position**: Fills the ViewerCanvas area (replaces canvas content until model is ready)
- **Layout**: Centered column within the canvas region
- **Content**:
  - Animated spinner: 48px ring, 3px stroke, `--color-accent-amber` partial arc rotating 360deg over 1s (linear, infinite). Remaining arc in `--color-border-subtle`.
  - "Building your 3D model..." in `--text-body` `--color-text-muted`, `--space-4` below spinner
  - Session ID in `--font-mono` `--text-caption` `--color-text-faint`, `--space-2` below
- **Background**: `--color-bg-viewer` (same as canvas, seamless transition)
- **Transition**: When model is ready, loading state fades out (`opacity 1 → 0`, 300ms `--ease-accelerate`), canvas content fades in (`opacity 0 → 1`, 500ms `--ease-decelerate`)
- **Error fallback**: If model fails to load after 15s, display inline error (same style as ErrorDisplay but within the canvas area, not the upload page)

---

## 5b. EMPTY & EDGE STATES

### Zero-Room Viewer State
If the parsed `FloorPlanSchema` has walls but an empty `rooms[]` array (valid — a building shell without named rooms):
- **3D canvas**: Renders walls and grid normally. No room floor polygons or room labels.
- **RoomSidebar**: The "ROOMS" section label still appears. Below it, display an empty state message: "No rooms detected" in `--text-body-sm` `--color-text-faint`, centered in the room list area. The chevron and color swatch are absent.
- **Stats summary**: Shows "0 rooms detected", total area "—", wall count still populated.
- **Export**: Still functional — walls are exportable even without room metadata.

### Single-Wall / Minimal Geometry
If only 3 walls are detected (the minimum threshold):
- Render normally. The 3D scene may look sparse but this is acceptable.
- The confidence badge will likely show "low" or "medium" — this is correct behavior.

### Very Large Floor Plan (100+ walls)
- No special visual treatment. OrbitControls and camera should handle it.
- Performance note for dev agent: consider `THREE.BufferGeometry` merging for wall meshes if > 50 walls to maintain 30fps target.

### Session Loading Failure (Network)
If `/api/session/[id]` returns a network error (not 404):
- Show `ViewerLoadingState` for up to 15 seconds, then transition to an inline error within the canvas area: "Failed to load session — please check your connection and try again" with a "Retry" button (primary style). This is distinct from `SessionNotFound` (which is a 404).

---

## 6. ANIMATION & MOTION

### Timing Tokens

```css
:root {
  --ease-default:    cubic-bezier(0.4, 0, 0.2, 1);   /* Material ease */
  --ease-decelerate: cubic-bezier(0, 0, 0.2, 1);      /* Enter screen */
  --ease-accelerate: cubic-bezier(0.4, 0, 1, 1);      /* Exit screen */
  --ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1); /* Overshoot bounce */

  --duration-fast:   120ms;
  --duration-normal: 200ms;
  --duration-slow:   350ms;
  --duration-enter:  500ms;
  --duration-camera: 800ms;   /* 3D camera transitions */
}
```

### Entrance Animations

#### Page-level (used on all pages)
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Apply: animation: fadeInUp var(--duration-enter) var(--ease-decelerate) forwards; */
/* Stagger children with animation-delay increments of 80ms */
```

#### Hero Section
- Headline: `fadeInUp`, delay 0ms
- Subheadline: `fadeInUp`, delay 80ms
- CTA buttons: `fadeInUp`, delay 160ms
- 3D preview (right column): `fadeInUp` with additional `scale(0.95)` → `scale(1)`, delay 240ms

#### How It Works Steps
- Triggered by IntersectionObserver at `threshold: 0.3`
- Each step card: `fadeInUp` with 120ms stagger between cards
- Connector lines draw in from left-to-right using `stroke-dashoffset` animation over 600ms

#### Upload Zone
- Appears with `fadeInUp` on page load

### Hover & Interaction States

| Element | Default | Hover | Active/Pressed | Transition |
|---|---|---|---|---|
| Primary CTA button | Normal | `scale(1.02)`, amber glow shadow | `scale(0.98)` | `--duration-normal` `--ease-default` |
| Secondary CTA button | Transparent bg | `--color-bg-elevated` bg, amber border | `scale(0.98)` | `--duration-normal` `--ease-default` |
| Feature card | No shadow | `translateY(-2px)`, shadow, border lighten | — | `--duration-slow` `--ease-default` |
| Room list item | Transparent bg | `--color-bg-elevated` bg | Slight inset | `--duration-fast` `--ease-default` |
| Nav link | `--color-text-muted` | `--color-text-primary` | — | `--duration-fast` |
| Export toolbar button | Default color | Brighten + subtle glow | `scale(0.95)` | `--duration-fast` |

### Upload Zone Drag-Over
```css
@keyframes ambientPulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--color-glow-amber); }
  50%      { box-shadow: 0 0 24px 4px var(--color-glow-amber); }
}
/* Apply during drag-over: animation: ambientPulse 1.5s ease-in-out infinite; */
```

### Processing Status
- Active step circle: `pulse` animation (scale 1 → 1.15 → 1, opacity 1 → 0.7 → 1, 1.2s infinite)
- Completed step: circle fills with `--color-success` via `scale(0) → scale(1)` with `--ease-spring`, 300ms
- Connecting line fills top-to-bottom per step, 400ms `--ease-default`

### 3D Scene Transitions
- Camera to room (sidebar click): GSAP-style lerp or Three.js Tween over `--duration-camera` (800ms) with `--ease-decelerate`
- Initial camera entrance: Zoom from 1.3x distance to 1.0x over 800ms `--ease-decelerate`
- Control hint fade-out: `opacity 1 → 0` over 500ms `--ease-accelerate`

### Scroll-Triggered Reveals (Landing Page Only)
- IntersectionObserver with `threshold: 0.2` for section headings, `0.3` for cards
- Each observed element starts with `opacity: 0; transform: translateY(24px)` and transitions to `opacity: 1; transform: translateY(0)` when intersecting
- Use a single CSS class `.reveal-visible` toggled by the observer

### Page Transitions (Route Changes)
- **Landing → Upload** (`/` → `/upload`): Content fades out (`opacity 1 → 0`, 150ms `--ease-accelerate`), new page fades in (`opacity 0 → 1`, 300ms `--ease-decelerate`). Use Next.js `loading.tsx` patterns or a simple CSS transition class on the `<main>` wrapper.
- **Upload → Viewer** (`/upload` → `/viewer/[sessionId]`): The ProcessingStatus completes, pauses 400ms, then the page redirects. The viewer page enters with its own `fadeInUp` animation — no shared element transition needed.
- **Any → Any (direct navigation)**: Standard browser navigation with `fadeInUp` entrance on the new page. No complex shared-element or morph transitions — keep it simple and fast.
- **Back navigation**: Same fade entrance, no special back-swipe animation.

### Focus States (Keyboard Accessibility)
- **All interactive elements** (buttons, links, inputs, room list items): on `:focus-visible`, apply `outline: 2px solid var(--color-focus-ring)`, `outline-offset: 2px`. Remove default browser outline.
- **Primary CTA button**: focus ring uses `--color-focus-ring` with additional `box-shadow: 0 0 0 4px var(--color-glow-amber)` for extra emphasis.
- **3D canvas container**: on focus, show a subtle 1px `--color-accent-amber` border around the canvas (not an outline, to avoid clipping issues with the toolbar overlay).
- **Skip-to-content link**: Hidden offscreen until focused — `position: absolute`, `top: -100%`. On focus: `top: var(--space-2)`, `left: var(--space-2)`, `--color-bg-elevated` background, `--color-text-primary` text, `--radius-md`, padding `--space-2` `--space-4`, `--z-toast`. Text: "Skip to main content".
- **Tab order by page**:
  - Landing: Skip link → NavBar logo → Nav links → Hero primary CTA → Hero secondary CTA → (scroll) How It Works → Features → Footer
  - Upload: Skip link → NavBar → Upload zone (acts as button) → Process button (when visible)
  - Viewer: Skip link → NavBar → Room sidebar items → Export buttons in toolbar

### Scrollbar Styling (Dark Theme)
```css
/* WebKit scrollbars (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--color-bg-inset);
}
::-webkit-scrollbar-thumb {
  background: var(--color-border-default);
  border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-faint);
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-default) var(--color-bg-inset);
}
```
Apply to: RoomSidebar room list (scrollable overflow), MobileBottomSheet content area. Page-level scrollbar visible only on landing page.

### Text Selection
```css
::selection {
  background: var(--color-selection-bg);
  color: var(--color-selection-text);
}
```
Applies globally. Amber-tinted selection reinforces the warm accent palette.

### Motion Preferences
- Respect `prefers-reduced-motion: reduce` — disable all `@keyframes` animations, set all transition durations to 0ms, disable 3D camera entrance animation. Keep essential state transitions (color, opacity) instant.

---

## 7. ANTI-PATTERNS — What the Development Agent Must NOT Do

1. **Do not use flat solid-color backgrounds for surfaces** — every panel (`--color-bg-surface`, `--color-bg-elevated`) needs at minimum a 1px `--color-border-subtle` border to create depth separation. The app must feel layered.

2. **Do not use default browser form styling** — the file input must be completely hidden behind the custom UploadZone component. No native `<input type="file">` appearance should ever be visible.

3. **Do not use Tailwind CSS** — all styling must use the CSS custom property system defined in this spec. No `className="bg-gray-900 text-white"`. Use CSS Modules or a global stylesheet referencing `var(--color-*)` tokens.

4. **Do not render room labels as flat HTML overlays on top of the canvas** — room labels must be Three.js text sprites (billboard) within the 3D scene so they move with orbit/pan and have proper depth relationship with the geometry.

5. **Do not use pure white (#ffffff) or pure black (#000000) anywhere** — the palette is designed around deep slates and warm off-whites. Pure values create jarring contrast.

6. **Do not center the landing page hero symmetrically** — the hero must use the asymmetric two-column layout (text left, 3D preview right) on desktop. Single-column centered is only for mobile.

7. **Do not skip hover states on any interactive element** — every button, link, card, and list item must have a defined hover state per Section 6 specifications.

8. **Do not hardcode pixel values for spacing** — use `var(--space-*)` tokens. The only exceptions are fixed heights (NavBar 64px, sidebar 320px) which are declared as layout constants, not spacing.

9. **Do not make the 3D viewer scrollable** — the viewer page must be `100vh` with `overflow: hidden`. Scrolling is reserved for the room list inside the sidebar only.

10. **Do not use inline styles for colors or fonts** — all theming must flow through CSS custom properties so future light-theme support is a single variable swap.

11. **Do not use emoji or icon fonts (FontAwesome)** — use inline SVG icons only, sized explicitly, colored via `currentColor` so they inherit text color tokens.

12. **Do not forget `prefers-reduced-motion`** — all animation keyframes and transitions must degrade gracefully. This is an accessibility requirement, not optional.

13. **Do not use opacity:0 + pointer-events:none as a hide pattern** — use proper conditional rendering or `display:none` / `visibility:hidden` to remove elements from the accessibility tree when hidden.

---

## APPENDIX A — Room Type Color Map (for 3D rendering)

| Room Type Keyword | CSS Variable | Hex | Three.js Material |
|---|---|---|---|
| living, lounge | `--color-room-living` | #e8a435 | MeshStandardMaterial, opacity 0.35 |
| bedroom, master | `--color-room-bedroom` | #a78bfa | MeshStandardMaterial, opacity 0.35 |
| kitchen | `--color-room-kitchen` | #f97066 | MeshStandardMaterial, opacity 0.35 |
| bathroom, wc, toilet | `--color-room-bathroom` | #56d4dd | MeshStandardMaterial, opacity 0.35 |
| hallway, corridor, entry | `--color-room-hallway` | #636e7b | MeshStandardMaterial, opacity 0.35 |
| office, study | `--color-room-office` | #7ee787 | MeshStandardMaterial, opacity 0.35 |
| dining | `--color-room-dining` | #d2a8ff | MeshStandardMaterial, opacity 0.35 |
| (default/unknown) | `--color-room-default` | #8b949e | MeshStandardMaterial, opacity 0.35 |

| (windows) | `--color-window-glass` | rgba(88,166,255,0.25) | MeshStandardMaterial, transparent, opacity 0.25, roughness 0.1, metalness 0.3 |

Matching for room types is case-insensitive and partial (e.g., "Living Room" matches "living").

---

## APPENDIX B — File Naming for the Development Agent

| File | Purpose |
|---|---|
| `src/styles/globals.css` | All CSS custom properties from this spec, reset, base typography |
| `src/styles/variables.css` | Extracted design tokens (imported by globals.css) |
| `src/components/layout/NavBar.tsx` | Navigation bar |
| `src/components/layout/Footer.tsx` | Footer |
| `src/components/landing/HeroSection.tsx` | Hero section |
| `src/components/landing/HowItWorks.tsx` | Process steps |
| `src/components/landing/FeatureHighlights.tsx` | Feature cards |
| `src/components/upload/UploadZone.tsx` | Drag-and-drop upload |
| `src/components/upload/ProcessingStatus.tsx` | Progress timeline |
| `src/components/upload/ErrorDisplay.tsx` | Error states |
| `src/components/viewer/ViewerLayout.tsx` | Two-panel layout |
| `src/components/viewer/ViewerCanvas.tsx` | Three.js scene |
| `src/components/viewer/ViewerToolbar.tsx` | Export + view controls |
| `src/components/viewer/RoomSidebar.tsx` | Room list panel |
| `src/components/viewer/RoomSidebarSkeleton.tsx` | Sidebar shimmer loading state |
| `src/components/viewer/ControlHint.tsx` | First-visit hint overlay |
| `src/components/viewer/MobileBottomSheet.tsx` | Mobile sidebar |
| `src/components/viewer/ViewerLoadingState.tsx` | Model loading spinner/placeholder |
| `src/components/shared/ToastNotification.tsx` | Toast notification system |
| `src/components/layout/MobileNavDrawer.tsx` | Mobile navigation drawer |
| `src/app/page.tsx` | Landing page (`/`) |
| `src/app/upload/page.tsx` | Upload page |
| `src/app/viewer/[sessionId]/page.tsx` | Viewer page |
| `src/app/layout.tsx` | Root layout (font imports, globals.css) |

---

## APPENDIX C — 3D Scene Configuration Constants

```
WALL_HEIGHT:        2.8     (meters)
WALL_COLOR:         #c8ccd0 (light concrete gray)
WALL_ROUGHNESS:     0.8
WALL_METALNESS:     0.1
FLOOR_OPACITY:      0.35
FLOOR_BORDER_OPACITY: 0.7
GRID_COLOR:         rgba(88, 166, 255, 0.08)
GRID_SIZE:          100     (meters, 50 in each direction)
GRID_DIVISIONS:     100     (1m spacing)
AMBIENT_LIGHT:      { intensity: 0.6, color: #f5f0e8 }
DIR_LIGHT:          { intensity: 0.8, position: [10, 15, 8], castShadow: true }
CAMERA_FOV:         50
CAMERA_NEAR:        0.1
CAMERA_FAR:         500
ORBIT_DAMPING:      0.1
LABEL_Y_OFFSET:     0.05   (meters above floor)
DOOR_ARC_COLOR:     rgba(232, 164, 53, 0.4)
WINDOW_SILL_H:      0.9     (meters from floor)
WINDOW_HEAD_H:      2.1     (meters from floor)
WINDOW_GLASS_OPACITY: 0.25
WINDOW_GLASS_ROUGHNESS: 0.1
WINDOW_GLASS_METALNESS: 0.3
CAMERA_ANIM_MS:     800
```

---

## APPENDIX D — Icon Specification

All icons are inline SVGs. No icon fonts, no emoji, no image files.

### Style Rules
| Property | Value |
|---|---|
| Stroke width | 1.5px (default), 2px for small icons (< 16px) |
| Stroke linecap | `round` |
| Stroke linejoin | `round` |
| Fill | `none` (outline style only) |
| Color | `currentColor` (inherits from parent text color token) |
| Viewbox | `0 0 24 24` (standard) or `0 0 16 16` (small) |

### Icon Inventory

| Name | Usage | Description (for SVG creation) |
|---|---|---|
| `upload` | UploadZone, HowItWorks step 1 | Arrow pointing up from a horizontal tray |
| `processing` | HowItWorks step 2 | CPU chip with circuit lines |
| `cube-3d` | HowItWorks step 3 | Isometric cube in wireframe |
| `download` | Export buttons | Arrow pointing down into a tray |
| `home` | ViewerToolbar reset view | Simple house outline |
| `grid-plan` | ViewerToolbar top-down view | 2x2 grid squares |
| `chevron-right` | RoomSidebar room items | Right-pointing angle bracket |
| `alert-triangle` | ErrorDisplay | Triangle with exclamation mark |
| `check` | ProcessingStatus completed step | Simple checkmark |
| `x-close` | Toast dismiss, MobileNavDrawer close | X mark (two diagonal lines) |
| `menu` | NavBar hamburger (mobile) | Three horizontal lines |
| `mouse-drag` | ControlHint rotate | Mouse with motion arrows |
| `option-drag` | ControlHint pan | Option key symbol + drag arrow |
| `scroll` | ControlHint zoom | Mouse with up/down arrows |
| `pdf-file` | UploadZone file selected | Document with "PDF" text |
| `external-link` | NavBar GitHub link | Arrow exiting a square |

### Size Scale
- **16px**: Inline with text (chevrons, small indicators)
- **20px**: Toolbar buttons, toast icons, nav icons
- **24px**: NavBar hamburger, drawer close, upload zone action icons
- **48px**: Upload zone hero icon, HowItWorks step icons (inside 64px circle)

---

## APPENDIX E — Data-testid Attribute Map (for E2E Tests)

The development agent MUST add these `data-testid` attributes to enable Playwright E2E tests:

| Attribute | Component | Element |
|---|---|---|
| `nav-bar` | NavBar | Root `<nav>` element |
| `nav-hamburger` | NavBar | Mobile hamburger button |
| `nav-drawer` | MobileNavDrawer | Drawer container |
| `hero-section` | HeroSection | Root `<section>` element |
| `hero-cta-upload` | HeroSection | Primary CTA "Upload Floor Plan" button |
| `hero-cta-howit` | HeroSection | Secondary CTA "See How It Works" button |
| `how-it-works` | HowItWorksSection | Root `<section>` element |
| `feature-card` | FeatureHighlights | Each feature card `<div>` |
| `upload-zone` | UploadZone | Drop zone container `<div>` |
| `upload-file-input` | UploadZone | Hidden `<input type="file">` |
| `upload-submit` | UploadZone | "Process Floor Plan" button |
| `upload-remove` | UploadZone | "Remove" file button |
| `processing-status` | ProcessingStatus | Root container |
| `processing-step` | ProcessingStatus | Each step item (add index via `data-step="0"`) |
| `error-display` | ErrorDisplay | Root container |
| `error-retry` | ErrorDisplay | "Try Again" button |
| `viewer-layout` | ViewerLayout | Root container |
| `viewer-canvas` | ViewerCanvas | Three.js `<Canvas>` wrapper `<div>` |
| `viewer-loading` | ViewerLoadingState | Loading spinner container |
| `viewer-toolbar` | ViewerToolbar | Toolbar container |
| `btn-reset-view` | ViewerToolbar | Reset view button |
| `btn-top-down` | ViewerToolbar | Top-down view button |
| `btn-export-gltf` | ViewerToolbar | Export glTF button |
| `btn-export-obj` | ViewerToolbar | Export OBJ button |
| `room-sidebar` | RoomSidebar | Root container |
| `room-item` | RoomSidebar | Each room list item (add `data-room-name` attribute) |
| `room-label` | ViewerCanvas | Room label sprite wrapper (rendered as Three.js group with `userData.testId`) |
| `stats-summary` | RoomSidebar | Stats section container |
| `extraction-badge` | RoomSidebar | "VECTOR", "AI VISION", or "HYBRID" pill |
| `sidebar-skeleton` | RoomSidebarSkeleton | Shimmer skeleton container |
| `control-hint` | ControlHint | Hint overlay container |
| `bottom-sheet` | MobileBottomSheet | Root container |
| `bottom-sheet-handle` | MobileBottomSheet | Drag handle bar |
| `toast` | ToastNotification | Each toast container |
| `session-not-found` | SessionNotFound | Root container |

---

## APPENDIX F — CSS Module Naming Conventions

All component styling uses CSS Modules (`.module.css` files co-located with each component). No global utility classes, no Tailwind, no styled-components.

### File Structure
```
src/components/viewer/ViewerToolbar.tsx
src/components/viewer/ViewerToolbar.module.css
```

### Class Naming
- Use **camelCase** for CSS Module class names (required by default CSS Module exports):
  - `.wrapper`, `.roomItem`, `.activeStep`, `.exportButton`
- BEM-like naming for variants:
  - `.badge`, `.badgeVector`, `.badgeVision`, `.badgeHybrid`
  - `.button`, `.buttonPrimary`, `.buttonSecondary`, `.buttonDisabled`
- State classes:
  - `.isActive`, `.isDragging`, `.isExpanded`, `.isCollapsed`

### Token Usage Rules
```css
/* CORRECT — use tokens for all visual properties */
.wrapper {
  background: var(--color-bg-surface);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  transition: background var(--duration-normal) var(--ease-default);
}

/* WRONG — never hardcode these values */
.wrapper {
  background: #161b22;
  padding: 24px;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  transition: background 200ms ease;
}
```

### Import Pattern
```tsx
import styles from './ViewerToolbar.module.css';

export function ViewerToolbar() {
  return <div className={styles.wrapper}>...</div>;
}
```

### Conditional Classes
Use template literals or a small helper — no dependency on `classnames` or `clsx` libraries:
```tsx
<div className={`${styles.badge} ${isVector ? styles.badgeVector : styles.badgeVision}`}>
```

---

## APPENDIX G — Page Metadata & Open Graph

Each page must set appropriate `<title>`, `<meta description>`, and Open Graph tags via Next.js `metadata` export in each `page.tsx`.

### Landing Page (`/`)
```
title: "PlanView 3D — Transform Floor Plans Into Interactive 3D Models"
description: "Upload any PDF floor plan and get an interactive, exportable 3D model in seconds. Powered by AI."
og:title: "PlanView 3D — Floor Plan to 3D in Seconds"
og:description: "Upload a PDF floor plan → get an interactive 3D model. Export to glTF or OBJ."
og:image: "/og-image.png"  (1200×630, dark bg with amber text + wireframe 3D preview)
og:type: "website"
```

### Upload Page (`/upload`)
```
title: "Upload Floor Plan — PlanView 3D"
description: "Drag and drop your PDF floor plan to generate an interactive 3D model."
```

### Viewer Page (`/viewer/[sessionId]`)
```
title: "3D Viewer — PlanView 3D"
description: "Interactive 3D floor plan viewer. Rotate, pan, zoom, and export your model."
```

### Global (in `layout.tsx`)
```
themeColor: "#0d1117"
viewport: "width=device-width, initial-scale=1, viewport-fit=cover"
favicon: "/favicon.svg" (simple isometric cube icon in --color-accent-amber on transparent)
```

---

## APPENDIX H — 3D Window Rendering Constants

```
WINDOW_NOTCH_DEPTH:     0.5   (fraction of wall thickness — half recessed)
WINDOW_GLASS_COLOR:     rgba(88, 166, 255, 0.25)
WINDOW_GLASS_ROUGHNESS: 0.1
WINDOW_GLASS_METALNESS: 0.3
WINDOW_GLASS_OPACITY:   0.25
WINDOW_FRAME_COLOR:     #8b949e
WINDOW_FRAME_THICKNESS: 0.02  (meters — thin mullion lines)
WINDOW_MULLION_POSITIONS: [0.333, 0.667]  (fraction of opening height)
WINDOW_SILL_HEIGHT:     0.9   (meters from floor — standard sill)
WINDOW_HEAD_HEIGHT:     2.1   (meters from floor — standard head)
```

Windows are looked up from `FloorPlanSchema.windows` where each window has a `wallIndex` pointing to the parent wall. The window center position along the wall is determined by `Window.position` projected onto the wall line segment. If `wallIndex` references an invalid wall, the window is silently skipped (no crash).

---

## APPENDIX I — Responsive Component Behavior Matrix

This table summarizes how each component adapts across breakpoints. The development agent must verify all behaviors.

| Component | Mobile (< 768px) | Tablet (768–1024px) | Desktop (> 1024px) |
|---|---|---|---|
| NavBar | Logo + hamburger only | Logo + inline links | Logo + inline links |
| HeroSection | Single-column, no 3D preview, `--text-h1` heading | Two-column, 3D preview visible, `--text-hero` heading | Two-column, 3D preview visible, `--text-hero` heading |
| HowItWorks | Single-column stack, no connector lines | 3-column, connector lines visible | 3-column, connector lines visible |
| FeatureHighlights | Single-column stack | 2×2 grid | 2×2 grid |
| UploadZone | Full-width (1rem padding), min-height 280px | Centered, max-width 560px | Centered, max-width 560px |
| ViewerCanvas | 100vw × 100vh (behind bottom sheet) | 100vw × 100vh (minus 64px icon strip) | Fills space right of 320px sidebar |
| RoomSidebar | Bottom sheet (collapsed 64px, expanded 50vh) | 64px icon strip (see Tablet Sidebar Strip below), tap to expand to 280px overlay | 320px fixed sidebar |
| ViewerToolbar | 3 buttons (reset, glTF, OBJ), no top-down | Full 4-button layout | Full 4-button layout |
| MobileBottomSheet | Visible, drag-to-expand | Hidden (tablet uses icon strip) | Hidden |
| MobileNavDrawer | Slide-in from right, 280px wide | Hidden | Hidden |
| ControlHint | 2-line layout (rotate + zoom only, pan omitted) | Single-line, all 3 hints | Single-line, all 3 hints |
| Footer | Centered, `--space-4` padding | Centered, `--space-6` padding | Centered, `--space-6` padding |

---

## APPENDIX J — Tablet Sidebar Strip (768–1024px)

On tablet viewports, the RoomSidebar collapses to a 64px-wide vertical icon strip fixed to the left edge of the viewer.

### Collapsed Strip Layout (top to bottom)
1. **Extraction badge icon** (top, `--space-4` from top): A small colored dot (8px circle) representing extraction method — green (`--color-success`) for vector, amber (`--color-accent-amber`) for vision, blue (`--color-accent-blue`) for hybrid. Tap shows a tooltip with the full badge label.
2. **Room count** (below badge, centered): Number of rooms in `--font-mono` `--text-caption` `--color-text-muted` (e.g., "6")
3. **Divider**: 1px horizontal line, `--color-border-subtle`, `--space-4` vertical margin
4. **Room color dots** (vertical stack, `--space-3` gap): One 12px circle per room using the room's `--color-room-*` token. Tapping a dot expands the sidebar AND focuses the camera on that room. Max 8 dots visible — if more rooms exist, show a `+N` label below in `--text-caption` `--color-text-faint`.
5. **Expand chevron** (bottom, `--space-4` from bottom): Right-pointing chevron icon (16px, `--color-text-faint`), hover → `--color-text-muted`. Tap expands the sidebar.

### Expanded State (Overlay)
- Width: 280px, overlays the canvas (does NOT push the canvas)
- Background: `--color-bg-surface`, right border 1px `--color-border-subtle`
- `box-shadow: 4px 0 24px rgba(0,0,0,0.4)` for depth
- Shows full RoomSidebar content identical to desktop
- Close by tapping the overlay backdrop (semi-transparent `--color-overlay`) or the collapse chevron (left-pointing) at the top-right of the expanded panel
- Animation: Slides in from left (`translateX(-280px) → translateX(0)`, 250ms `--ease-decelerate`). Backdrop fades in simultaneously.
- On room tap: sidebar auto-collapses (200ms `--ease-accelerate`), camera animates to room

---

*End of Design Specification. This document is the sole source of truth for visual implementation.*
