/**
 * Integration Tests — Floor Plan 3D Builder
 * TDD Red Phase: tests import modules that do not yet exist.
 * External dependencies (pdfjs-dist, @anthropic-ai/sdk) are mocked.
 * All tests MUST FAIL until the implementation is written.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FloorPlanSchema } from "@/types/floor-plan";

// ── Mock external dependencies (hoisted before imports) ───────────────────────
vi.mock("pdfjs-dist", () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: { workerSrc: "" },
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: vi.fn() },
  })),
}));

// Imported AFTER mocks are hoisted
import { parsePdf } from "@/lib/pdf-parser";
import { exportToObj, exportToGltf } from "@/lib/exporters";
import { getDocument } from "pdfjs-dist";
import Anthropic from "@anthropic-ai/sdk";

// ── Fixture factory ───────────────────────────────────────────────────────────
function makeSchema(): FloorPlanSchema {
  return {
    rooms: [{ name: "Bedroom", vertices: [[0, 0],[5, 0],[5, 4],[0, 4]] }],
    walls: [
      { start: [0, 0], end: [5, 0], thickness: 0.2 },
      { start: [5, 0], end: [5, 4], thickness: 0.2 },
      { start: [5, 4], end: [0, 4], thickness: 0.2 },
      { start: [0, 4], end: [0, 0], thickness: 0.2 },
    ],
    doors: [{ position: [2, 0], width: 0.9, angle: 0 }],
    windows: [{ position: [3, 0], width: 1.2, wallIndex: 0 }],
    scale: 0.01,
    confidence: "high",
    extractionMethod: "vector",
    rawWidth: 595,
    rawHeight: 842,
  };
}

// Helper: mock pdfjs getDocument to return a page with moveTo/lineTo operators
// OPS.moveTo=21, OPS.lineTo=22 — these are the constants pdfjs-dist uses
function mockVectorPdf() {
  vi.mocked(getDocument).mockReturnValue({
    promise: Promise.resolve({
      numPages: 1,
      getPage: () =>
        Promise.resolve({
          getOperatorList: () =>
            Promise.resolve({
              // Four sides of a rectangle: moveTo then three lineTo ops
              fnArray: [21, 22, 22, 22, 22],
              argsArray: [[0, 0], [100, 0], [100, 80], [0, 80], [0, 0]],
            }),
          getViewport: () => ({ width: 595, height: 842 }),
        }),
    }),
  } as any);
}

// Helper: mock pdfjs getDocument to return a page with NO drawing operators
function mockEmptyPdf() {
  vi.mocked(getDocument).mockReturnValue({
    promise: Promise.resolve({
      numPages: 1,
      getPage: () =>
        Promise.resolve({
          getOperatorList: () =>
            Promise.resolve({ fnArray: [], argsArray: [] }),
          getViewport: () => ({ width: 595, height: 842 }),
          render: () => ({ promise: Promise.resolve() }),
        }),
    }),
  } as any);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── parsePdf — vector extraction path ────────────────────────────────────────
describe("parsePdf — vector extraction", () => {
  it("should return extractionMethod=vector when sufficient wall lines are detected", async () => {
    mockVectorPdf();
    const buffer = new ArrayBuffer(1024);
    const result = await parsePdf(buffer);
    expect(result.extractionMethod).toBe("vector");
  });

  it("should produce at least 3 walls from a rectangular floor plan PDF", async () => {
    mockVectorPdf();
    const buffer = new ArrayBuffer(1024);
    const result = await parsePdf(buffer);
    expect(result.walls.length).toBeGreaterThanOrEqual(3);
  });
});

// ── parsePdf — Vision API fallback ───────────────────────────────────────────
describe("parsePdf — Vision API fallback", () => {
  it("should call Vision API and return extractionMethod=vision when fewer than 3 wall lines detected", async () => {
    mockEmptyPdf();

    // Vision API returns a valid floor plan JSON
    const visionSchema = makeSchema();
    visionSchema.extractionMethod = "vision";
    vi.mocked(Anthropic).mockImplementation(
      () =>
        ({
          messages: {
            create: vi.fn().mockResolvedValue({
              content: [
                { type: "text", text: JSON.stringify(visionSchema) },
              ],
            }),
          },
        }) as any
    );

    const buffer = new ArrayBuffer(1024);
    const result = await parsePdf(buffer);
    expect(result.extractionMethod).toBe("vision");
  });
});

// ── parsePdf — error handling ─────────────────────────────────────────────────
describe("parsePdf — error handling", () => {
  it("should throw an error containing 'invalid' or 'PDF' when pdfjs rejects the buffer", async () => {
    vi.mocked(getDocument).mockReturnValue({
      promise: Promise.reject(new Error("Invalid PDF structure")),
    } as any);

    const buffer = new ArrayBuffer(100);
    await expect(parsePdf(buffer)).rejects.toThrow(/invalid|pdf/i);
  });
});

// ── exportToObj ───────────────────────────────────────────────────────────────
describe("exportToObj", () => {
  it("should produce an OBJ string that contains vertex (v) and face (f) lines", () => {
    const obj = exportToObj(makeSchema());
    expect(typeof obj).toBe("string");
    expect(obj).toMatch(/^v /m);
    expect(obj).toMatch(/^f /m);
  });

  it("should include a comment header at the start of the OBJ output", () => {
    const obj = exportToObj(makeSchema());
    expect(obj.trimStart().startsWith("#")).toBe(true);
  });
});

// ── exportToGltf ──────────────────────────────────────────────────────────────
describe("exportToGltf", () => {
  it("should produce a glTF structure with asset.version === '2.0'", () => {
    const gltf = exportToGltf(makeSchema()) as Record<string, unknown>;
    expect(gltf).toHaveProperty("asset");
    expect((gltf.asset as Record<string, string>).version).toBe("2.0");
  });

  it("should include at least one mesh entry for the extruded walls", () => {
    const gltf = exportToGltf(makeSchema()) as Record<string, unknown>;
    expect(Array.isArray(gltf.meshes)).toBe(true);
    expect((gltf.meshes as unknown[]).length).toBeGreaterThan(0);
  });
});

// ── exportToObj — wall count ───────────────────────────────────────────────────
describe("exportToObj — wall count", () => {
  it("should emit exactly 4 vertices per wall (4 walls → 16 v lines)", () => {
    const obj = exportToObj(makeSchema());
    const vLines = obj.split("\n").filter((l) => l.startsWith("v "));
    // makeSchema has 4 walls × 4 vertices = 16
    expect(vLines.length).toBe(16);
  });
});

// ── parsePdf — scale metadata ─────────────────────────────────────────────────
describe("parsePdf — scale metadata", () => {
  it("should include rawWidth and rawHeight from the PDF viewport in the result", async () => {
    mockVectorPdf();
    const buffer = new ArrayBuffer(1024);
    const result = await parsePdf(buffer);
    expect(result.rawWidth).toBe(595);
    expect(result.rawHeight).toBe(842);
  });
});
