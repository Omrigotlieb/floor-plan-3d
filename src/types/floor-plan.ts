/**
 * Canonical data model for a parsed floor plan.
 * Produced by the PDF parser and consumed by the 3D renderer and exporters.
 */
export interface FloorPlanSchema {
  rooms: Room[];
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  scale: number; // meters per coordinate unit
  confidence: "high" | "medium" | "low";
  extractionMethod: "vector" | "vision" | "hybrid";
  rawWidth: number;  // PDF page width in pts
  rawHeight: number; // PDF page height in pts
}

export interface Room {
  name: string;
  vertices: [number, number][]; // polygon in PDF coordinate space
  area?: number;               // m²
  color?: string;              // optional override for 3D display
}

export interface Wall {
  start: [number, number];
  end: [number, number];
  thickness: number; // meters, default 0.2
}

export interface Door {
  position: [number, number];
  width: number;   // meters
  angle: number;   // radians
}

export interface Window {
  position: [number, number];
  width: number;
  wallIndex: number; // which wall this belongs to
}
