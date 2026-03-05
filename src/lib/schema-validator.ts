/**
 * Validates a FloorPlanSchema object.
 * Returns true if the schema is structurally valid, false otherwise.
 */
import type { FloorPlanSchema } from "@/types/floor-plan";

/**
 * Checks whether an unknown value conforms to the FloorPlanSchema contract.
 *
 * Rules:
 * - `walls` must be a non-empty array
 * - `scale` must be a positive number
 * - `rooms`, `doors`, and `windows` must be arrays
 */
export function validateFloorPlanSchema(schema: unknown): schema is FloorPlanSchema {
  if (!schema || typeof schema !== "object") return false;

  const s = schema as Record<string, unknown>;

  // walls: required, non-empty array
  if (!Array.isArray(s.walls) || s.walls.length === 0) return false;

  // scale: must be a positive finite number
  if (typeof s.scale !== "number" || s.scale <= 0 || !isFinite(s.scale)) return false;

  // rooms, doors, windows: must be arrays
  if (!Array.isArray(s.rooms)) return false;
  if (!Array.isArray(s.doors)) return false;
  if (!Array.isArray(s.windows)) return false;

  return true;
}
