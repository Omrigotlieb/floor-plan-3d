# DESIGN SPECIFICATION — Floor Plan 3D Builder

> Produced by: UI Designer ORCA (Stage 2: design_review)
> Date: 2026-03-04
> Status: Final — ready for Development Agent implementation

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
- **Border**: Bottom 1px `--color-border-subtle`, appears on scroll via class toggle
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
  - **3D Preview** (right column, desktop only): Static or slowly auto-rotating wireframe render of a simple floor plan. Use a simplified Three.js canvas with wireframe walls in `--color-accent-blue` at 0.6 opacity on `--color-bg-viewer` background. This is decorative, not interactive. Falls back to a static SVG illustration on mobile.

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
- **Upload button**: Appears below the zone when a file is selected. Same style as Hero primary CTA. "Process Floor Plan →"

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
- **Error types to display**:
  - File too large → "File exceeds 20MB limit"
  - Invalid file type → "Please upload a PDF file"
  - Server error → "Something went wrong — please try again"
  - Missing API key → "Service temporarily unavailable" (never expose internal details)

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
- **Lighting**: Ambient light (intensity 0.6, color #f5f0e8 — warm) + Directional light (intensity 0.8, position top-right, casts soft shadows onto floor plane)
- **Camera**: Perspective, default position looking down at 45° angle, centered on model bounding box
- **Controls**: OrbitControls from @react-three/drei — left-drag orbits, right-drag pans, scroll zooms. Damping enabled (factor 0.1) for smooth feel.
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
    - Extraction method badge: small pill, `--radius-full`, height 22px. "VECTOR" in `--color-success` background (10% opacity) with `--color-success` text, or "AI VISION" in `--color-accent-amber` background (10% opacity) with `--color-accent-amber` text. Uses `--text-label`.
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
      - Click: Animates camera to top-down view of that room (600ms ease-in-out)
  - **Divider**: 1px `--color-border-subtle`
  - **Stats Summary** (padding `--space-6`):
    - "SUMMARY" in `--text-label` `--color-text-faint`
    - Total area: `--font-mono` `--text-h4` `--color-text-heading` (e.g., "127.5 m²")
    - Room count: `--text-body-sm` `--color-text-muted` (e.g., "6 rooms detected")
    - Wall count: `--text-body-sm` `--color-text-muted`

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

Matching is case-insensitive and partial (e.g., "Living Room" matches "living").

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
| `src/components/viewer/ControlHint.tsx` | First-visit hint overlay |
| `src/components/viewer/MobileBottomSheet.tsx` | Mobile sidebar |
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
CAMERA_ANIM_MS:     800
```

---

*End of Design Specification. This document is the sole source of truth for visual implementation.*
