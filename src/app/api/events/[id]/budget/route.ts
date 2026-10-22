import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BudgetItemSchema, ExpenseSchema } from "@/lib/security";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const type = body.type; // 'allocation' or 'expense'

    if (type === "allocation") {
      const val = BudgetItemSchema.safeParse(body.data);
      if (!val.success) {
        return NextResponse.json({ error: "Invalid allocation data", details: val.error }, { status: 400 });
      }
      const item = db.addBudgetItem(params.id, val.data);
      return NextResponse.json({ success: true, item });
    } else if (type === "expense") {
      const val = ExpenseSchema.safeParse(body.data);
      if (!val.success) {
        return NextResponse.json({ error: "Invalid expense data", details: val.error }, { status: 400 });
      }
      const expense = db.addExpense(params.id, val.data);
      return NextResponse.json({ success: true, expense });
    }

    return NextResponse.json({ error: "Invalid budget entry type. Must be 'allocation' or 'expense'" }, { status: 400 });
  } catch (err: unknown) {
    console.error("[API /api/events/[id]/budget POST]", err);
    return NextResponse.json({ error: "Failed to create budget entry" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { type, itemId, updates } = body;

    if (type === "allocation") {
      const updated = db.updateBudgetItem(params.id, itemId, updates);
      return NextResponse.json({ success: true, item: updated });
    } else if (type === "expense") {
      const updated = db.updateExpense(params.id, itemId, updates);
      return NextResponse.json({ success: true, expense: updated });
    }

    return NextResponse.json({ error: "Invalid update type" }, { status: 400 });
  } catch (err: unknown) {
    console.error("[API /api/events/[id]/budget PATCH]", err);
    return NextResponse.json({ error: "Failed to update budget entry" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    if (type === "allocation") {
      db.deleteBudgetItem(params.id, itemId);
    } else if (type === "expense") {
      db.deleteExpense(params.id, itemId);
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: unknown) {
    console.error("[API /api/events/[id]/budget DELETE]", err);
    return NextResponse.json({ error: "Failed to delete budget entry" }, { status: 500 });
  }
}
