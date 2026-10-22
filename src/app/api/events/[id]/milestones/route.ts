import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MilestoneSchema } from "@/lib/security";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const val = MilestoneSchema.safeParse(body);
    if (!val.success) {
      return NextResponse.json({ error: "Invalid milestone data", details: val.error }, { status: 400 });
    }

    const milestone = db.addMilestone(params.id, val.data);
    return NextResponse.json({ success: true, milestone });
  } catch (err: unknown) {
    console.error("[API milestones POST]", err);
    return NextResponse.json({ error: "Failed to add milestone" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { milestoneId, updates } = body;
    if (!milestoneId) {
      return NextResponse.json({ error: "milestoneId is required" }, { status: 400 });
    }

    const updated = db.updateMilestone(params.id, milestoneId, updates);
    return NextResponse.json({ success: true, milestone: updated });
  } catch (err: unknown) {
    console.error("[API milestones PATCH]", err);
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const milestoneId = searchParams.get("milestoneId");
    if (!milestoneId) {
      return NextResponse.json({ error: "milestoneId is required" }, { status: 400 });
    }

    db.deleteMilestone(params.id, milestoneId);
    return NextResponse.json({ success: true, message: "Milestone deleted" });
  } catch (err: unknown) {
    console.error("[API milestones DELETE]", err);
    return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 });
  }
}
