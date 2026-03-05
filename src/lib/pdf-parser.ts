/**
 * PDF floor plan parser.
 *
 * Strategy:
 * 1. Primary — pdfjs-dist vector extraction: detect moveTo/lineTo operators → walls
 * 2. Fallback — Claude Vision API: if fewer than MIN_WALL_COUNT lines found, render
 *    the page to a canvas image and send it to Claude Sonnet for floor-plan analysis.
 */
import { getDocument } from "pdfjs-dist";
import Anthropic from "@anthropic-ai/sdk";
import type { FloorPlanSchema, Room, Wall } from "@/types/floor-plan";
import { parseVisionResponse } from "./vision-parser";
import { calculateScale } from "./geometry";

// pdfjs OPS constants (moveTo = 21, lineTo = 22)
const OPS_MOVE_TO = 21;
const OPS_LINE_TO = 22;

/** Minimum wall segments required before the vector path is considered usable. */
const MIN_WALL_COUNT = 3;

/** Assumed real-world floor plan width in meters when unknown. */
const DEFAULT_REAL_WORLD_WIDTH_M = 10;

/** Claude model used for Vision API fallback. */
const VISION_MODEL = "claude-sonnet-4-6";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parses a PDF buffer into a FloorPlanSchema.
 *
 * @param buffer - Raw PDF bytes as an ArrayBuffer
 * @returns Parsed floor plan schema (vector or vision extraction method)
 * @throws If the buffer is not a valid PDF
 */
export async function parsePdf(buffer: ArrayBuffer): Promise<FloorPlanSchema> {
  // Load PDF document
  let pdfDoc: Awaited<ReturnType<typeof getDocument>["promise"]>;
  try {
    const loadingTask = getDocument({ data: new Uint8Array(buffer) });
    pdfDoc = await loadingTask.promise;
  } catch (cause) {
    throw new Error(
      `Invalid PDF: could not load document — ${cause instanceof Error ? cause.message : String(cause)}`
    );
  }

  // Analyse the first page
  const page = await pdfDoc.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const rawWidth: number = viewport.width;
  const rawHeight: number = viewport.height;
  const scale = calculateScale(rawWidth, DEFAULT_REAL_WORLD_WIDTH_M);

  // Attempt vector extraction
  const operatorList = await page.getOperatorList();
  const walls = extractWallsFromOperators(
    operatorList.fnArray as number[],
    operatorList.argsArray as number[][]
  );

  if (walls.length >= MIN_WALL_COUNT) {
    return {
      rooms: buildRoomsFromWalls(walls),
      walls,
      doors: [],
      windows: [],
      scale,
      confidence: "high",
      extractionMethod: "vector",
      rawWidth,
      rawHeight,
    };
  }

  // Fallback: Claude Vision API
  return fallbackToVision(page, rawWidth, rawHeight, scale);
}

// ---------------------------------------------------------------------------
// Vector extraction helpers
// ---------------------------------------------------------------------------

/**
 * Converts pdfjs operator lists into wall segments by tracing moveTo/lineTo paths.
 */
function extractWallsFromOperators(
  fnArray: number[],
  argsArray: number[][]
): Wall[] {
  const walls: Wall[] = [];
  let currentPoint: [number, number] | null = null;

  for (let i = 0; i < fnArray.length; i++) {
    const op = fnArray[i];
    const args = argsArray[i];

    if (op === OPS_MOVE_TO) {
      currentPoint = [args[0], args[1]];
    } else if (op === OPS_LINE_TO && currentPoint !== null) {
      const endPoint: [number, number] = [args[0], args[1]];
      walls.push({ start: currentPoint, end: endPoint, thickness: 0.2 });
      currentPoint = endPoint;
    }
  }

  return walls;
}

/**
 * Derives a simple bounding-box room from the wall geometry.
 */
function buildRoomsFromWalls(walls: Wall[]): Room[] {
  if (walls.length === 0) return [];

  const xs = walls.flatMap((w) => [w.start[0], w.end[0]]);
  const ys = walls.flatMap((w) => [w.start[1], w.end[1]]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return [
    {
      name: "Room 1",
      vertices: [
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Vision API fallback
// ---------------------------------------------------------------------------

/**
 * Renders the PDF page to a canvas image and sends it to Claude Vision API
 * for floor-plan interpretation.
 */
async function fallbackToVision(
  page: Awaited<ReturnType<Awaited<ReturnType<typeof getDocument>["promise"]>["getPage"]>>,
  rawWidth: number,
  rawHeight: number,
  scale: number
): Promise<FloorPlanSchema> {
  let imageBase64: string | undefined;

  // Attempt canvas render (works in browser; may be unavailable in Node/test envs)
  try {
    if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      canvas.width = rawWidth;
      canvas.height = rawHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        await page.render({
          canvasContext: ctx,
          viewport: page.getViewport({ scale: 1 }),
        }).promise;
        const dataUrl: string = canvas.toDataURL("image/png");
        imageBase64 = dataUrl.split(",")[1];
      }
    } else {
      // Node environment: canvas rendering is not possible; skip render
    }
  } catch {
    // Canvas rendering is best-effort; continue with text-only prompt
  }

  const client = new Anthropic();

  type ContentBlock =
    | { type: "text"; text: string }
    | { type: "image"; source: { type: "base64"; media_type: "image/png"; data: string } };

  const promptText = `You are a professional floor plan analyst. Analyze the provided floor plan and return ONLY a JSON object (no markdown, no explanation) with this exact structure:
{
  "rooms": [{ "name": "string", "vertices": [[x, y], ...] }],
  "walls": [{ "start": [x, y], "end": [x, y], "thickness": 0.2 }],
  "doors": [{ "position": [x, y], "width": 0.9, "angle": 0 }],
  "windows": [{ "position": [x, y], "width": 1.2, "wallIndex": 0 }],
  "scale": ${scale},
  "confidence": "medium",
  "extractionMethod": "vision",
  "rawWidth": ${rawWidth},
  "rawHeight": ${rawHeight}
}`;

  const content: ContentBlock[] = imageBase64
    ? [
        {
          type: "image",
          source: { type: "base64", media_type: "image/png", data: imageBase64 },
        },
        { type: "text", text: promptText },
      ]
    : [{ type: "text", text: promptText }];

  const response = await client.messages.create({
    model: VISION_MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: content as Anthropic.MessageParam["content"] }],
  });

  const textBlock = response.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Vision API returned no text content");
  }

  return parseVisionResponse(textBlock.text);
}
