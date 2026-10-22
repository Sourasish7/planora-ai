import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RunOfShowItemSchema } from "@/lib/security";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const val = RunOfShowItemSchema.safeParse(body);
    if (!val.success) {
      return NextResponse.json({ error: "Invalid run-of-show data", details: val.error }, { status: 400 });
    }

    const item = db.addRunOfShowItem(params.id, val.data);
    return NextResponse.json({ success: true, item });
  } catch (err: unknown) {
    console.error("[API run-of-show POST]", err);
    return NextResponse.json({ error: "Failed to add run-of-show item" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { itemId, updates } = body;
    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const updated = db.updateRunOfShowItem(params.id, itemId, updates);
    return NextResponse.json({ success: true, item: updated });
  } catch (err: unknown) {
    console.error("[API run-of-show PATCH]", err);
    return NextResponse.json({ error: "Failed to update run-of-show item" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    db.deleteRunOfShowItem(params.id, itemId);
    return NextResponse.json({ success: true, message: "Run of show item deleted" });
  } catch (err: unknown) {
    console.error("[API run-of-show DELETE]", err);
    return NextResponse.json({ error: "Failed to delete run-of-show item" }, { status: 500 });
  }
}
