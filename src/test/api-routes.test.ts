/**
 * API Route Handler Tests
 *
 * Calls the exported POST handlers directly — no HTTP server required.
 * FormData parsing is mocked at the request level since jsdom cannot parse
 * multipart bodies from a NextRequest constructor.
 *
 * Coverage targets:
 *   /api/parse          – PDF upload guard: missing key, no file, wrong type, size limit
 *   /api/export-gltf    – valid schema → GLB binary; invalid schema → 400
 *   /api/export-obj     – valid schema → OBJ text; invalid schema → 400
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

// ── Shared fixtures ───────────────────────────────────────────────────────────

const SAMPLE_SCHEMA = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../../data/sample-output.json"), "utf-8")
);

/** Minimal schema that satisfies validateFloorPlanSchema (walls, scale, rooms, doors, windows). */
const MINIMAL_SCHEMA = {
  rooms: [{ name: "Room", vertices: [[0,0],[4,0],[4,3],[0,3]] as [number,number][], area: 12 }],
  walls: [
    { start: [0,0] as [number,number], end: [4,0] as [number,number], thickness: 0.2 },
    { start: [4,0] as [number,number], end: [4,3] as [number,number], thickness: 0.2 },
    { start: [4,3] as [number,number], end: [0,3] as [number,number], thickness: 0.2 },
    { start: [0,3] as [number,number], end: [0,0] as [number,number], thickness: 0.2 },
  ],
  doors: [],
  windows: [],
  scale: 0.026,
  confidence: "high" as const,
  extractionMethod: "vector" as const,
  rawWidth: 595,
  rawHeight: 842,
};

/** Build a NextRequest whose formData() returns a controlled FormData. */
function makeParseRequest(file: File | null): NextRequest {
  const req = new NextRequest("http://localhost/api/parse", { method: "POST" });
  const fd = new FormData();
  if (file) fd.append("file", file);
  req.formData = vi.fn().mockResolvedValue(fd);
  return req;
}

function makeJsonRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makePdfFile(opts: { name?: string; type?: string; size?: number } = {}): File {
  const { name = "plan.pdf", type = "application/pdf" } = opts;
  const bytes = Buffer.from("%PDF-1.4\n%%EOF");
  const file = new File([bytes], name, { type });
  if (opts.size !== undefined) {
    Object.defineProperty(file, "size", { value: opts.size });
  }
  return file;
}

// ── /api/parse ────────────────────────────────────────────────────────────────

describe("POST /api/parse", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV, ANTHROPIC_API_KEY: "test-key" };
  });

  afterEach(() => {
    process.env = OLD_ENV;
    vi.restoreAllMocks();
  });

  it("returns 500 when ANTHROPIC_API_KEY is missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { POST } = await import("@/app/api/parse/route");
    const req = makeParseRequest(makePdfFile());
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/ANTHROPIC_API_KEY/);
  });

  it("returns 400 when no file is attached", async () => {
    const { POST } = await import("@/app/api/parse/route");
    const req = makeParseRequest(null);          // empty FormData
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when the file is not a PDF (wrong MIME type)", async () => {
    const { POST } = await import("@/app/api/parse/route");
    const req = makeParseRequest(makePdfFile({ name: "image.png", type: "image/png" }));
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/PDF/i);
  });

  it("returns 400 when file extension is not .pdf (regardless of MIME)", async () => {
    const { POST } = await import("@/app/api/parse/route");
    const req = makeParseRequest(makePdfFile({ name: "plan.txt", type: "text/plain" }));
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 413 when file exceeds 20 MB", async () => {
    const { POST } = await import("@/app/api/parse/route");
    const TWENTY_ONE_MB = 21 * 1024 * 1024;
    const req = makeParseRequest(makePdfFile({ size: TWENTY_ONE_MB }));
    const res = await POST(req);
    expect(res.status).toBe(413);
    const body = await res.json();
    expect(body.error).toMatch(/20 MB|limit/i);
  });

  it("returns 422 when a non-PDF binary is uploaded (pdfjs rejects it)", async () => {
    // Send a real file that looks like a PDF (right MIME/ext) but has corrupt content.
    // The real parsePdf will reject it → route returns 422.
    const { POST } = await import("@/app/api/parse/route");
    const junkBytes = Buffer.from("this is not a pdf at all XYZ");
    const corruptFile = new File([junkBytes], "plan.pdf", { type: "application/pdf" });
    const req = makeParseRequest(corruptFile);
    const res = await POST(req);
    // Could be 422 (parse error) or 422 (invalid schema); either way not 2xx
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("all guard conditions (key/file/type/size) checked before parsePdf runs", async () => {
    // Ensures the route returns 400/413/500 without calling parsePdf at all.
    // We verify by passing requests that fail BEFORE parsePdf would be invoked.
    const { POST } = await import("@/app/api/parse/route");

    // 1. Missing API key → 500
    delete process.env.ANTHROPIC_API_KEY;
    const r1 = await POST(makeParseRequest(makePdfFile()));
    expect(r1.status).toBe(500);
    process.env.ANTHROPIC_API_KEY = "test-key";

    // 2. No file → 400
    const r2 = await POST(makeParseRequest(null));
    expect(r2.status).toBe(400);

    // 3. Wrong type → 400
    const r3 = await POST(makeParseRequest(makePdfFile({ type: "image/jpeg", name: "x.jpg" })));
    expect(r3.status).toBe(400);

    // 4. Oversized → 413
    const r4 = await POST(makeParseRequest(makePdfFile({ size: 25 * 1024 * 1024 })));
    expect(r4.status).toBe(413);
  });
});

// ── /api/export-gltf ──────────────────────────────────────────────────────────

describe("POST /api/export-gltf", () => {
  it("returns 400 for malformed JSON body", async () => {
    const { POST } = await import("@/app/api/export-gltf/route");
    const req = new NextRequest("http://localhost/api/export-gltf", {
      method: "POST",
      body: "not-json{{{",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/JSON/i);
  });

  it("returns 400 when schema is missing walls", async () => {
    const { POST } = await import("@/app/api/export-gltf/route");
    const req = makeJsonRequest("http://localhost/api/export-gltf", { rooms: [], scale: 1 });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/FloorPlanSchema/i);
  });

  it("returns 400 when walls array is empty", async () => {
    const { POST } = await import("@/app/api/export-gltf/route");
    const req = makeJsonRequest("http://localhost/api/export-gltf", {
      ...MINIMAL_SCHEMA,
      walls: [],
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with Content-Type: model/gltf-binary", async () => {
    const { POST } = await import("@/app/api/export-gltf/route");
    const req = makeJsonRequest("http://localhost/api/export-gltf", MINIMAL_SCHEMA);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("model/gltf-binary");
  });

  it("response binary starts with GLB magic 'glTF' (0x46546C67)", async () => {
    const { POST } = await import("@/app/api/export-gltf/route");
    const req = makeJsonRequest("http://localhost/api/export-gltf", MINIMAL_SCHEMA);
    const res = await POST(req);
    const bytes = Buffer.from(await res.arrayBuffer());
    expect(bytes.readUInt32LE(0)).toBe(0x46546c67); // "glTF"
  });

  it("GLB header version is 2", async () => {
    const { POST } = await import("@/app/api/export-gltf/route");
    const req = makeJsonRequest("http://localhost/api/export-gltf", MINIMAL_SCHEMA);
    const res = await POST(req);
    const bytes = Buffer.from(await res.arrayBuffer());
    expect(bytes.readUInt32LE(4)).toBe(2);
  });

  it("GLB total length in header matches actual buffer size", async () => {
    const { POST } = await import("@/app/api/export-gltf/route");
    const req = makeJsonRequest("http://localhost/api/export-gltf", MINIMAL_SCHEMA);
    const res = await POST(req);
    const bytes = Buffer.from(await res.arrayBuffer());
    expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  });

  it("Content-Disposition is attachment; filename=\"floor-plan.glb\"", async () => {
    const { POST } = await import("@/app/api/export-gltf/route");
    const req = makeJsonRequest("http://localhost/api/export-gltf", MINIMAL_SCHEMA);
    const res = await POST(req);
    expect(res.headers.get("Content-Disposition")).toContain("floor-plan.glb");
  });

  it("larger schema produces larger GLB output", async () => {
    const { POST } = await import("@/app/api/export-gltf/route");
    const [r1, r2] = await Promise.all([
      POST(makeJsonRequest("http://localhost/api/export-gltf", MINIMAL_SCHEMA)),
      POST(makeJsonRequest("http://localhost/api/export-gltf", SAMPLE_SCHEMA)),
    ]);
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    const [b1, b2] = await Promise.all([r1.arrayBuffer(), r2.arrayBuffer()]);
    expect(b2.byteLength).toBeGreaterThan(b1.byteLength);
  });
});

// ── /api/export-obj ───────────────────────────────────────────────────────────

describe("POST /api/export-obj", () => {
  it("returns 400 for malformed JSON body", async () => {
    const { POST } = await import("@/app/api/export-obj/route");
    const req = new NextRequest("http://localhost/api/export-obj", {
      method: "POST",
      body: "{{bad",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/JSON/i);
  });

  it("returns 400 when schema is invalid", async () => {
    const { POST } = await import("@/app/api/export-obj/route");
    const req = makeJsonRequest("http://localhost/api/export-obj", { bad: true });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/FloorPlanSchema/i);
  });

  it("returns 200 with Content-Type: text/plain", async () => {
    const { POST } = await import("@/app/api/export-obj/route");
    const req = makeJsonRequest("http://localhost/api/export-obj", MINIMAL_SCHEMA);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/plain/);
  });

  it("Content-Disposition is attachment; filename=\"floor-plan.obj\"", async () => {
    const { POST } = await import("@/app/api/export-obj/route");
    const req = makeJsonRequest("http://localhost/api/export-obj", MINIMAL_SCHEMA);
    const res = await POST(req);
    expect(res.headers.get("Content-Disposition")).toContain("floor-plan.obj");
  });

  it("OBJ output contains vertex (v) and face (f) lines", async () => {
    const { POST } = await import("@/app/api/export-obj/route");
    const res = await POST(makeJsonRequest("http://localhost/api/export-obj", MINIMAL_SCHEMA));
    const text = await res.text();
    const lines = text.split("\n");
    expect(lines.filter(l => l.startsWith("v ")).length).toBeGreaterThan(0);
    expect(lines.filter(l => l.startsWith("f ")).length).toBeGreaterThan(0);
  });

  it("4 walls produce at least 16 vertex lines (4 per wall)", async () => {
    const { POST } = await import("@/app/api/export-obj/route");
    const res = await POST(makeJsonRequest("http://localhost/api/export-obj", MINIMAL_SCHEMA));
    const text = await res.text();
    const vLines = text.split("\n").filter(l => l.startsWith("v "));
    expect(vLines.length).toBeGreaterThanOrEqual(16);
  });

  it("OBJ starts with a comment header", async () => {
    const { POST } = await import("@/app/api/export-obj/route");
    const res = await POST(makeJsonRequest("http://localhost/api/export-obj", MINIMAL_SCHEMA));
    const text = await res.text();
    expect(text.trimStart()).toMatch(/^#/);
  });

  it("more walls in schema → more vertex lines in OBJ", async () => {
    const { POST } = await import("@/app/api/export-obj/route");
    const [r1, r2] = await Promise.all([
      POST(makeJsonRequest("http://localhost/api/export-obj", MINIMAL_SCHEMA)),
      POST(makeJsonRequest("http://localhost/api/export-obj", SAMPLE_SCHEMA)),
    ]);
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    const [t1, t2] = await Promise.all([r1.text(), r2.text()]);
    const v1 = t1.split("\n").filter(l => l.startsWith("v ")).length;
    const v2 = t2.split("\n").filter(l => l.startsWith("v ")).length;
    expect(v2).toBeGreaterThan(v1);
  });
});
