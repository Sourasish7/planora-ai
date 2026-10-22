import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateAutonomousPlan } from "@/lib/ai-engine";
import { EventPlanInputSchema, checkRateLimit } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    const { allowed } = checkRateLimit(`events-get-${ip}`, 100);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }

    const events = db.getAllEvents();
    return NextResponse.json({ success: true, events });
  } catch (err: unknown) {
    console.error("[API /api/events GET]", err);
    return NextResponse.json({ error: "Failed to fetch events." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    const { allowed } = checkRateLimit(`events-post-${ip}`, 30);
    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a moment." }, { status: 429 });
    }

    const body = await req.json();

    // Validate using Zod schema
    const validation = EventPlanInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const input = validation.data;

    // Use AI Engine to generate the full blueprint
    const eventBlueprint = generateAutonomousPlan(input);

    // Save into database
    const created = db.createEvent(eventBlueprint);

    return NextResponse.json({ success: true, event: created }, { status: 201 });
  } catch (err: unknown) {
    console.error("[API /api/events POST]", err);
    return NextResponse.json({ error: "Failed to generate event blueprint." }, { status: 500 });
  }
}
