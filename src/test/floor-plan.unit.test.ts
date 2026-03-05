/**
 * Unit Tests — Floor Plan 3D Builder
 * TDD Red Phase: tests import modules that do not yet exist.
 * All tests MUST FAIL until the implementation is written.
 */
import { describe, it, expect } from "vitest";
import type { Wall } from "@/types/floor-plan";
import { validateFloorPlanSchema } from "@/lib/schema-validator";
import {
  calculateRoomArea,
  extrudeWall,
  calculateScale,
} from "@/lib/geometry";
import { parseVisionResponse } from "@/lib/vision-parser";

// ── Shared fixture ────────────────────────────────────────────────────────────
const baseSchema = {
  rooms: [{ name: "Living Room", vertices: [[0, 0],[4, 0],[4, 3],[0, 3]] as [number, number][] }],
  walls: [
    { start: [0, 0] as [number, number], end: [4, 0] as [number, number], thickness: 0.2 },
    { start: [4, 0] as [number, number], end: [4, 3] as [number, number], thickness: 0.2 },
    { start: [4, 3] as [number, number], end: [0, 3] as [number, number], thickness: 0.2 },
    { start: [0, 3] as [number, number], end: [0, 0] as [number, number], thickness: 0.2 },
  ],
  doors: [],
  windows: [],
  scale: 0.01,
  confidence: "high" as const,
  extractionMethod: "vector" as const,
  rawWidth: 595,
  rawHeight: 842,
};

// ── validateFloorPlanSchema ───────────────────────────────────────────────────
describe("validateFloorPlanSchema", () => {
  it("should return true for a complete valid FloorPlanSchema", () => {
    expect(validateFloorPlanSchema(baseSchema)).toBe(true);
  });

  it("should return false when the walls array is empty", () => {
    expect(validateFloorPlanSchema({ ...baseSchema, walls: [] })).toBe(false);
  });

  it("should return false when scale is zero", () => {
    expect(validateFloorPlanSchema({ ...baseSchema, scale: 0 })).toBe(false);
  });

  it("should return false when scale is negative", () => {
    expect(validateFloorPlanSchema({ ...baseSchema, scale: -0.01 })).toBe(false);
  });

  it("should return true when doors and windows arrays are empty", () => {
    expect(
      validateFloorPlanSchema({ ...baseSchema, doors: [], windows: [] })
    ).toBe(true);
  });
});

// ── calculateRoomArea ─────────────────────────────────────────────────────────
describe("calculateRoomArea", () => {
  it("should calculate the correct area for a rectangular room (4×3 = 12 m²)", () => {
    const vertices: [number, number][] = [[0, 0],[4, 0],[4, 3],[0, 3]];
    // scale=1 → raw coordinate units equal meters
    expect(calculateRoomArea(vertices, 1)).toBeCloseTo(12, 2);
  });

  it("should calculate the correct area for a right-triangle room (base=6, height=4 → 12 m²)", () => {
    const vertices: [number, number][] = [[0, 0],[6, 0],[0, 4]];
    expect(calculateRoomArea(vertices, 1)).toBeCloseTo(12, 2);
  });

  it("should return 0 for a polygon with fewer than 3 vertices", () => {
    const vertices: [number, number][] = [[0, 0],[1, 1]];
    expect(calculateRoomArea(vertices, 1)).toBe(0);
  });
});

// ── extrudeWall ───────────────────────────────────────────────────────────────
describe("extrudeWall", () => {
  it("should extrude a wall to the default height of 2.8 meters", () => {
    const wall: Wall = { start: [0, 0], end: [4, 0], thickness: 0.2 };
    const result = extrudeWall(wall);
    expect(result.height).toBe(2.8);
  });

  it("should calculate the correct wall length from start and end coordinates", () => {
    // 3-4-5 right triangle
    const wall: Wall = { start: [0, 0], end: [3, 4], thickness: 0.2 };
    const result = extrudeWall(wall);
    expect(result.length).toBeCloseTo(5, 2);
  });
});

// ── calculateScale ────────────────────────────────────────────────────────────
describe("calculateScale", () => {
  it("should compute meters-per-unit scale from PDF width and real-world width", () => {
    // PDF page is 595 pts wide, real floor plan is 10 m wide
    const scale = calculateScale(595, 10);
    expect(scale).toBeCloseTo(10 / 595, 5);
  });

  it("should return a positive fallback scale when PDF width is zero", () => {
    const scale = calculateScale(0, 10);
    expect(scale).toBeGreaterThan(0);
  });
});

// ── parseVisionResponse ───────────────────────────────────────────────────────
describe("parseVisionResponse", () => {
  const validVisionJson = JSON.stringify({
    rooms: [{ name: "Kitchen", vertices: [[0, 0],[2, 0],[2, 2],[0, 2]] }],
    walls: [
      { start: [0, 0], end: [2, 0], thickness: 0.2 },
      { start: [2, 0], end: [2, 2], thickness: 0.2 },
      { start: [2, 2], end: [0, 2], thickness: 0.2 },
      { start: [0, 2], end: [0, 0], thickness: 0.2 },
    ],
    doors: [],
    windows: [],
    scale: 0.01,
    confidence: "medium",
    extractionMethod: "vision",
    rawWidth: 595,
    rawHeight: 842,
  });

  it("should parse a valid JSON string from the Vision API into a FloorPlanSchema", () => {
    const result = parseVisionResponse(validVisionJson);
    expect(result.rooms[0].name).toBe("Kitchen");
    expect(result.extractionMethod).toBe("vision");
    expect(result.walls.length).toBeGreaterThanOrEqual(3);
  });

  it("should throw an error when the Vision response contains malformed JSON", () => {
    expect(() => parseVisionResponse("not valid json {{")).toThrow();
  });

  it("should throw an error when the parsed response is missing the required walls field", () => {
    const noWalls = JSON.stringify({ rooms: [], scale: 0.01 });
    expect(() => parseVisionResponse(noWalls)).toThrow();
  });

  it("should throw when the Vision response is a JSON array instead of an object", () => {
    expect(() => parseVisionResponse(JSON.stringify([]))).toThrow(
      "Vision API response must be a JSON object"
    );
  });

  it("should throw when the Vision response is missing the required rooms field", () => {
    const noRooms = JSON.stringify({
      walls: [{ start: [0, 0], end: [1, 0], thickness: 0.2 }],
      scale: 0.01,
    });
    expect(() => parseVisionResponse(noRooms)).toThrow(/rooms/);
  });
});

// ── validateFloorPlanSchema — additional edge cases ───────────────────────────
describe("validateFloorPlanSchema — edge cases", () => {
  it("should return false when walls is not an array", () => {
    expect(validateFloorPlanSchema({ walls: "bad", rooms: [], doors: [], windows: [], scale: 1 })).toBe(false);
  });

  it("should return false when scale is Infinity", () => {
    const s = { ...{ rooms: [], walls: [{ start: [0,0], end: [1,0], thickness: 0.2 }], doors: [], windows: [] }, scale: Infinity };
    expect(validateFloorPlanSchema(s)).toBe(false);
  });

  it("should return false when rooms is missing", () => {
    expect(validateFloorPlanSchema({ walls: [{ start: [0,0], end: [1,0], thickness: 0.2 }], doors: [], windows: [], scale: 0.01 })).toBe(false);
  });
});

// ── extrudeWall — additional cases ────────────────────────────────────────────
describe("extrudeWall — additional cases", () => {
  it("should respect a custom height parameter", () => {
    const wall = { start: [0, 0] as [number, number], end: [1, 0] as [number, number], thickness: 0.2 };
    const result = extrudeWall(wall, 3.5);
    expect(result.height).toBe(3.5);
  });

  it("should preserve wall thickness in the extruded result", () => {
    const wall = { start: [0, 0] as [number, number], end: [0, 5] as [number, number], thickness: 0.3 };
    const result = extrudeWall(wall);
    expect(result.thickness).toBe(0.3);
  });
});
