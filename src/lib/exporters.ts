/**
 * Export utilities: convert FloorPlanSchema to OBJ and glTF 2.0 formats.
 */
import type { FloorPlanSchema } from "@/types/floor-plan";

/** Extruded wall height in meters. */
const WALL_HEIGHT = 2.8;

// ---------------------------------------------------------------------------
// OBJ exporter
// ---------------------------------------------------------------------------

/**
 * Exports a FloorPlanSchema to Wavefront OBJ format.
 *
 * Each wall is exported as a rectangular quad (two triangular faces):
 * - Four vertices per wall (bottom-start, bottom-end, top-start, top-end)
 * - Two `f` lines (triangles) per wall
 *
 * @param schema - Parsed floor plan data
 * @returns OBJ-formatted string starting with a comment header
 */
export function exportToObj(schema: FloorPlanSchema): string {
  const lines: string[] = [
    "# Floor Plan 3D — OBJ Export",
    `# Walls: ${schema.walls.length}  Scale: ${schema.scale} m/unit`,
    `# rawWidth: ${schema.rawWidth}  rawHeight: ${schema.rawHeight}`,
    "",
  ];

  const faces: string[] = [];
  let vertexOffset = 1; // OBJ vertex indices are 1-based

  for (let i = 0; i < schema.walls.length; i++) {
    const { start, end } = schema.walls[i];
    const s = schema.scale;

    const x1 = start[0] * s;
    const z1 = start[1] * s;
    const x2 = end[0] * s;
    const z2 = end[1] * s;

    // Bottom vertices (y = 0)
    lines.push(`v ${x1.toFixed(4)} 0.0000 ${z1.toFixed(4)}`);
    lines.push(`v ${x2.toFixed(4)} 0.0000 ${z2.toFixed(4)}`);
    // Top vertices (y = WALL_HEIGHT)
    lines.push(`v ${x1.toFixed(4)} ${WALL_HEIGHT.toFixed(4)} ${z1.toFixed(4)}`);
    lines.push(`v ${x2.toFixed(4)} ${WALL_HEIGHT.toFixed(4)} ${z2.toFixed(4)}`);

    const v1 = vertexOffset;
    const v2 = vertexOffset + 1;
    const v3 = vertexOffset + 2;
    const v4 = vertexOffset + 3;

    // Two triangles forming the wall quad
    faces.push(`f ${v1} ${v2} ${v4}`);
    faces.push(`f ${v1} ${v4} ${v3}`);

    vertexOffset += 4;
  }

  // Append all face lines after vertices
  lines.push("", "# Faces");
  lines.push(...faces);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// glTF 2.0 exporter
// ---------------------------------------------------------------------------

/**
 * Exports a FloorPlanSchema to a glTF 2.0 JSON structure.
 *
 * Returns a plain JavaScript object conforming to the glTF 2.0 specification.
 * Each wall becomes a separate mesh entry.
 *
 * @param schema - Parsed floor plan data
 * @returns glTF 2.0 JSON object (not serialized)
 */
export function exportToGltf(schema: FloorPlanSchema): object {
  const meshes: object[] = schema.walls.map((wall, i) => {
    const { start, end } = wall;
    const s = schema.scale;

    const x1 = start[0] * s;
    const z1 = start[1] * s;
    const x2 = end[0] * s;
    const z2 = end[1] * s;

    // Eight vertices: bottom quad + top quad (as flat array for buffer description)
    const positions = [
      x1, 0, z1,
      x2, 0, z2,
      x2, WALL_HEIGHT, z2,
      x1, WALL_HEIGHT, z1,
    ];

    return {
      name: `wall_${i}`,
      extras: { positions, wallIndex: i },
      primitives: [
        {
          attributes: { POSITION: i },
          indices: i,
          mode: 4, // TRIANGLES
        },
      ],
    };
  });

  const nodes = schema.walls.map((_, i) => ({
    name: `wall_node_${i}`,
    mesh: i,
  }));

  return {
    asset: {
      version: "2.0",
      generator: "Floor Plan 3D Builder",
      copyright: "Floor Plan 3D",
    },
    scene: 0,
    scenes: [
      {
        name: "Floor Plan",
        nodes: schema.walls.map((_, i) => i),
      },
    ],
    nodes,
    meshes,
    accessors: [],
    bufferViews: [],
    buffers: [],
  };
}
