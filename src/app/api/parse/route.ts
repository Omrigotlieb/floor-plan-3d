import { NextRequest, NextResponse } from "next/server";
import { parsePdf } from "@/lib/pdf-parser";
import type { FloorPlanSchema } from "@/types/floor-plan";
import { validateFloorPlanSchema } from "@/lib/schema-validator";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid request: expected multipart/form-data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return NextResponse.json(
      { error: "File must be a PDF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File exceeds the 20 MB limit" },
      { status: 413 }
    );
  }

  const buffer = await file.arrayBuffer();

  let schema: FloorPlanSchema;
  try {
    schema = await parsePdf(buffer);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to parse PDF" },
      { status: 422 }
    );
  }

  if (!validateFloorPlanSchema(schema)) {
    return NextResponse.json(
      { error: "Could not extract a valid floor plan from this PDF" },
      { status: 422 }
    );
  }

  return NextResponse.json(schema);
}
