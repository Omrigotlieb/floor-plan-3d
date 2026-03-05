/**
 * Export utilities: convert FloorPlanSchema to OBJ and glTF 2.0 formats.
 */
import type { FloorPlanSchema } from "@/types/floor-plan";
import { DEFAULT_WALL_HEIGHT as WALL_HEIGHT } from "@/lib/geometry";

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
 * Exports a FloorPlanSchema to a valid glTF 2.0 JSON structure.
 *
 * All walls are combined into a single mesh.  Vertex positions and indices are
 * packed into a binary buffer that is embedded as a base64 data URI so the
 * returned JSON is self-contained and loadable by any glTF 2.0 viewer.
 *
 * Geometry per wall (rectangular quad, 2 triangles):
 *   v0 = bottom-start  v1 = bottom-end  v2 = top-end  v3 = top-start
 *   triangle A: v0, v1, v2   triangle B: v0, v2, v3
 *
 * @param schema - Parsed floor plan data
 * @returns glTF 2.0 JSON object (not serialized)
 */
export function exportToGltf(schema: FloorPlanSchema): object {
  const N = schema.walls.length;
  const s = schema.scale;

  // --- Build vertex position buffer (Float32, 4 vertices × 3 floats per wall) ---
  const posFloats = new Float32Array(N * 4 * 3);

  let minX = Infinity, minY = 0, minZ = Infinity;
  let maxX = -Infinity, maxY = WALL_HEIGHT, maxZ = -Infinity;

  for (let i = 0; i < N; i++) {
    const { start, end } = schema.walls[i];
    const x1 = start[0] * s, z1 = start[1] * s;
    const x2 = end[0] * s,   z2 = end[1] * s;
    const base = i * 12; // 4 vertices × 3 components

    posFloats[base + 0]  = x1; posFloats[base + 1]  = 0;           posFloats[base + 2]  = z1;
    posFloats[base + 3]  = x2; posFloats[base + 4]  = 0;           posFloats[base + 5]  = z2;
    posFloats[base + 6]  = x2; posFloats[base + 7]  = WALL_HEIGHT; posFloats[base + 8]  = z2;
    posFloats[base + 9]  = x1; posFloats[base + 10] = WALL_HEIGHT; posFloats[base + 11] = z1;

    minX = Math.min(minX, x1, x2); maxX = Math.max(maxX, x1, x2);
    minZ = Math.min(minZ, z1, z2); maxZ = Math.max(maxZ, z1, z2);
  }

  // --- Build index buffer (Uint16, 6 indices per wall = 2 triangles) ---
  const idxShorts = new Uint16Array(N * 6);

  for (let i = 0; i < N; i++) {
    const v = i * 4; // base vertex index for this wall
    const f = i * 6; // base face index
    idxShorts[f + 0] = v;     idxShorts[f + 1] = v + 1; idxShorts[f + 2] = v + 2;
    idxShorts[f + 3] = v;     idxShorts[f + 4] = v + 2; idxShorts[f + 5] = v + 3;
  }

  // --- Combine into one buffer and encode as base64 data URI ---
  const posBuf = Buffer.from(posFloats.buffer);
  const idxBuf = Buffer.from(idxShorts.buffer);
  const combined = Buffer.concat([posBuf, idxBuf]);
  const dataUri = `data:application/octet-stream;base64,${combined.toString("base64")}`;

  const posBytes = posBuf.byteLength;
  const idxBytes = idxBuf.byteLength;

  return {
    asset: {
      version: "2.0",
      generator: "Floor Plan 3D Builder",
      copyright: "Floor Plan 3D",
    },
    scene: 0,
    scenes: [{ name: "Floor Plan", nodes: [0] }],
    nodes: [{ name: "walls", mesh: 0 }],
    meshes: [
      {
        name: "floor_plan_walls",
        primitives: [
          {
            attributes: { POSITION: 0 },
            indices: 1,
            mode: 4, // TRIANGLES
          },
        ],
      },
    ],
    accessors: [
      {
        // POSITION accessor — Float32 VEC3
        bufferView: 0,
        componentType: 5126, // FLOAT
        count: N * 4,
        type: "VEC3",
        min: [minX, minY, minZ],
        max: [maxX, maxY, maxZ],
      },
      {
        // INDEX accessor — Uint16 SCALAR
        bufferView: 1,
        componentType: 5123, // UNSIGNED_SHORT
        count: N * 6,
        type: "SCALAR",
      },
    ],
    bufferViews: [
      {
        // Vertex positions
        buffer: 0,
        byteOffset: 0,
        byteLength: posBytes,
        target: 34962, // ARRAY_BUFFER
      },
      {
        // Indices
        buffer: 0,
        byteOffset: posBytes,
        byteLength: idxBytes,
        target: 34963, // ELEMENT_ARRAY_BUFFER
      },
    ],
    buffers: [{ uri: dataUri, byteLength: combined.length }],
  };
}
