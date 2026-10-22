import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { VendorSchema } from "@/lib/security";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const val = VendorSchema.safeParse(body);
    if (!val.success) {
      return NextResponse.json({ error: "Invalid vendor data", details: val.error }, { status: 400 });
    }

    const vendor = db.addVendor(params.id, val.data);
    return NextResponse.json({ success: true, vendor });
  } catch (err: unknown) {
    console.error("[API vendors POST]", err);
    return NextResponse.json({ error: "Failed to add vendor" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { vendorId, updates } = body;
    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    const updated = db.updateVendor(params.id, vendorId, updates);
    return NextResponse.json({ success: true, vendor: updated });
  } catch (err: unknown) {
    console.error("[API vendors PATCH]", err);
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    db.deleteVendor(params.id, vendorId);
    return NextResponse.json({ success: true, message: "Vendor deleted" });
  } catch (err: unknown) {
    console.error("[API vendors DELETE]", err);
    return NextResponse.json({ error: "Failed to delete vendor" }, { status: 500 });
  }
}
