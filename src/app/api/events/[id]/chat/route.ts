import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processAIChat } from "@/lib/ai-engine";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    const { allowed } = checkRateLimit(`chat-${ip}`, 40);
    if (!allowed) {
      return NextResponse.json({ error: "Too many chat messages. Please wait a moment." }, { status: 429 });
    }

    const event = db.getEventById(params.id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await req.json();
    const rawMessage = body.message;
    if (!rawMessage || typeof rawMessage !== "string" || !rawMessage.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const cleanMessage = sanitizeInput(rawMessage);
    const settings = db.getSettings();
    const apiKey = body.apiKey || settings.apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    const provider = body.provider || settings.aiProvider || "auto";

    // 1. Record user message in DB
    db.addChatMessage(params.id, {
      role: "user",
      content: cleanMessage,
    });

    // 2. Process via AI engine
    const aiResponse = await processAIChat(event, cleanMessage, apiKey, provider);

    // 3. Record assistant response in DB
    const assistantMsg = db.addChatMessage(params.id, {
      role: "assistant",
      content: aiResponse.content,
      suggestedActions: aiResponse.suggestedActions,
    });

    return NextResponse.json({
      success: true,
      message: assistantMsg,
      suggestedActions: aiResponse.suggestedActions,
    });
  } catch (err: unknown) {
    console.error("[API /api/events/[id]/chat POST]", err);
    return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 });
  }
}
