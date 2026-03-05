/**
 * Parses Claude Vision API responses into FloorPlanSchema objects.
 */
import type { FloorPlanSchema } from "@/types/floor-plan";

/**
 * Parses a JSON string returned by the Claude Vision API into a FloorPlanSchema.
 *
 * @param jsonString - Raw text content from the Vision API response
 * @returns A validated FloorPlanSchema
 * @throws If the string is not valid JSON or is missing required fields
 */
export function parseVisionResponse(jsonString: string): FloorPlanSchema {
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonString);
  } catch (cause) {
    throw new Error(
      `Vision API response is not valid JSON: ${cause instanceof Error ? cause.message : String(cause)}`
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Vision API response must be a JSON object");
  }

  const obj = parsed as Record<string, unknown>;

  if (!Array.isArray(obj.walls)) {
    throw new Error(
      "Vision API response is missing required field: 'walls' (must be an array)"
    );
  }

  if (!Array.isArray(obj.rooms)) {
    throw new Error(
      "Vision API response is missing required field: 'rooms' (must be an array)"
    );
  }

  return parsed as FloorPlanSchema;
}
