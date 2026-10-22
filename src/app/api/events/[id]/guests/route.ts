import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { GuestSchema } from "@/lib/security";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const val = GuestSchema.safeParse(body);
    if (!val.success) {
      return NextResponse.json({ error: "Invalid guest data", details: val.error }, { status: 400 });
    }

    const guest = db.addGuest(params.id, val.data);
    return NextResponse.json({ success: true, guest });
  } catch (err: unknown) {
    console.error("[API guests POST]", err);
    return NextResponse.json({ error: "Failed to add guest" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { guestId, updates } = body;
    if (!guestId) {
      return NextResponse.json({ error: "guestId is required" }, { status: 400 });
    }

    const updated = db.updateGuest(params.id, guestId, updates);
    return NextResponse.json({ success: true, guest: updated });
  } catch (err: unknown) {
    console.error("[API guests PATCH]", err);
    return NextResponse.json({ error: "Failed to update guest" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get("guestId");
    if (!guestId) {
      return NextResponse.json({ error: "guestId is required" }, { status: 400 });
    }

    db.deleteGuest(params.id, guestId);
    return NextResponse.json({ success: true, message: "Guest deleted" });
  } catch (err: unknown) {
    console.error("[API guests DELETE]", err);
    return NextResponse.json({ error: "Failed to delete guest" }, { status: 500 });
  }
}
