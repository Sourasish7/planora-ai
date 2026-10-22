import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = db.getEventById(params.id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Return downloadable JSON
    return new NextResponse(JSON.stringify(event, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="planora-${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-plan.json"`,
      },
    });
  } catch (err: unknown) {
    console.error("[API export GET]", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
