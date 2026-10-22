import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const settings = db.getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    console.error("[API /api/settings GET]", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = db.updateSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: unknown) {
    console.error("[API /api/settings PATCH]", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "reset_seed") {
      db.resetToSeed();
      return NextResponse.json({ success: true, message: "Database reset to rich seed data successfully." });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    console.error("[API /api/settings POST]", err);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
