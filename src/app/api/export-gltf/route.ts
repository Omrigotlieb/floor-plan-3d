import { NextRequest, NextResponse } from "next/server";
import { exportToGltf } from "@/lib/exporters";
import { validateFloorPlanSchema } from "@/lib/schema-validator";

/** Packages a glTF JSON object into a binary GLB buffer (glTF 2.0 spec §4). */
function buildGlbBuffer(gltfJson: object): Buffer {
  const jsonStr = JSON.stringify(gltfJson);
  // Pad to 4-byte alignment with spaces (required by spec)
  const padLen = (4 - (jsonStr.length % 4)) % 4;
  const padded = jsonStr + " ".repeat(padLen);
  const jsonChunk = Buffer.from(padded, "utf8");

  const HEADER = 12;
  const CHUNK_HEADER = 8;
  const totalLength = HEADER + CHUNK_HEADER + jsonChunk.length;

  const glb = Buffer.alloc(totalLength);
  let off = 0;

  // GLB header
  glb.writeUInt32LE(0x46546c67, off); off += 4; // magic "glTF"
  glb.writeUInt32LE(2, off);          off += 4; // version 2
  glb.writeUInt32LE(totalLength, off); off += 4; // total length

  // JSON chunk
  glb.writeUInt32LE(jsonChunk.length, off); off += 4; // chunk length
  glb.writeUInt32LE(0x4e4f534a, off);       off += 4; // chunk type "JSON"
  jsonChunk.copy(glb, off);

  return glb;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!validateFloorPlanSchema(body)) {
    return NextResponse.json(
      { error: "Invalid FloorPlanSchema" },
      { status: 400 }
    );
  }

  const gltfJson = exportToGltf(body);
  const glb = buildGlbBuffer(gltfJson);

  return new NextResponse(new Uint8Array(glb), {
    status: 200,
    headers: {
      "Content-Type": "model/gltf-binary",
      "Content-Disposition": 'attachment; filename="floor-plan.glb"',
      "Content-Length": String(glb.length),
    },
  });
}
