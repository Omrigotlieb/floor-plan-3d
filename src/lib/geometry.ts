/**
 * Geometry helpers for floor plan processing and 3D extrusion.
 */
import type { Wall } from "@/types/floor-plan";

/** Default wall height in meters (standard residential ceiling height). */
export const DEFAULT_WALL_HEIGHT = 2.8;

/** Fallback scale used when PDF width is zero or invalid. */
const FALLBACK_SCALE = 0.01;

/** Result of extruding a 2D wall segment into 3D space. */
export interface ExtrudedWall {
  height: number;
  length: number;
  thickness: number;
  start: [number, number];
  end: [number, number];
}

/**
 * Calculates the area of a polygon (in square meters) using the Shoelace formula.
 *
 * @param vertices - Array of [x, y] coordinate pairs in PDF space
 * @param scale    - Meters per coordinate unit
 * @returns Area in m², or 0 if the polygon has fewer than 3 vertices
 */
export function calculateRoomArea(
  vertices: [number, number][],
  scale: number
): number {
  if (vertices.length < 3) return 0;

  let signedArea = 0;
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    const [x1, y1] = vertices[i];
    const [x2, y2] = vertices[(i + 1) % n];
    signedArea += x1 * y2 - x2 * y1;
  }

  const rawArea = Math.abs(signedArea) / 2;
  // scale converts coordinate units → meters; area scales by scale²
  return rawArea * scale * scale;
}

/**
 * Extrudes a 2D wall segment to a 3D geometry descriptor.
 *
 * @param wall   - Wall definition with start/end coordinates and thickness
 * @param height - Wall height in meters (defaults to 2.8 m)
 */
export function extrudeWall(wall: Wall, height = DEFAULT_WALL_HEIGHT): ExtrudedWall {
  const dx = wall.end[0] - wall.start[0];
  const dy = wall.end[1] - wall.start[1];
  const length = Math.sqrt(dx * dx + dy * dy);

  return {
    height,
    length,
    thickness: wall.thickness,
    start: wall.start,
    end: wall.end,
  };
}

/**
 * Computes the meters-per-unit scale factor from PDF page dimensions
 * and the assumed real-world floor plan width.
 *
 * @param pdfWidth              - PDF page width in points
 * @param realWorldWidthMeters  - Known or assumed real-world width in meters
 * @returns Scale factor (meters / PDF unit), always positive
 */
export function calculateScale(
  pdfWidth: number,
  realWorldWidthMeters: number
): number {
  if (pdfWidth <= 0) return FALLBACK_SCALE;
  return realWorldWidthMeters / pdfWidth;
}
