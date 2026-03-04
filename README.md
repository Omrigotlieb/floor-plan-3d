# 🏠 Floor Plan 3D Builder

> AI-powered floor plan 3D builder — upload a PDF floor plan and get an interactive 3D model. Built autonomously by [ORCA](https://github.com/Omrigotlieb/infinity-ai).

## Live Demo

_Coming soon — being built by ORCA pipeline_

## Features

- **Upload any PDF floor plan** — CAD exports, architectural drawings, scanned plans
- **AI extraction** — pdfjs-dist vector parsing with Claude Sonnet 4.6 Vision fallback
- **Interactive 3D viewer** — Three.js + React Three Fiber, orbit/pan/zoom controls
- **Room detection** — automatic labeling of rooms, area calculation
- **3D Export** — download as glTF (standard) or OBJ (Blender/SketchUp compatible)

## Quick Start

```bash
git clone https://github.com/Omrigotlieb/floor-plan-3d.git
cd floor-plan-3d
npm install
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 15** + TypeScript
- **Three.js** + React Three Fiber + @react-three/drei
- **pdfjs-dist** for PDF vector extraction
- **Claude Sonnet 4.6** Vision API for AI floor plan understanding
- **Vitest** + **Playwright** for comprehensive test coverage

## Built by ORCA

This application is autonomously built by [ORCA](https://github.com/Omrigotlieb/infinity-ai) — Infinity AI's Docker-based agent pipeline.

View ORCA's commits: https://github.com/Omrigotlieb/floor-plan-3d/commits/main
