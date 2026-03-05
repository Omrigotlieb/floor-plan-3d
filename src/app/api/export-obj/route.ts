import { NextRequest, NextResponse } from "next/server";
import { exportToObj } from "@/lib/exporters";
import { validateFloorPlanSchema } from "@/lib/schema-validator";

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

  const obj = exportToObj(body);

  return new NextResponse(obj, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="floor-plan.obj"',
    },
  });
}
