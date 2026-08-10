import { NextRequest, NextResponse } from "next/server";

/* ─── Allowed models (whitelist to prevent abuse) ─────────────── */
const ALLOWED_MODELS = ["gpt-4o-mini", "gpt-4o"];
const MAX_TOKENS_LIMIT = 2000;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: { message: "OpenAI API key is not configured on this server." } },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid JSON body." } },
      { status: 400 }
    );
  }

  const { messages, model, max_tokens, temperature, response_format } = body;

  // Validate model
  if (!model || !ALLOWED_MODELS.includes(model as string)) {
    return NextResponse.json(
      { error: { message: `Model must be one of: ${ALLOWED_MODELS.join(", ")}` } },
      { status: 400 }
    );
  }

  // Validate max_tokens
  const tokens = Number(max_tokens) || 500;
  if (tokens > MAX_TOKENS_LIMIT) {
    return NextResponse.json(
      { error: { message: `max_tokens cannot exceed ${MAX_TOKENS_LIMIT}.` } },
      { status: 400 }
    );
  }

  // Build OpenAI request
  const openAiBody: Record<string, unknown> = {
    model,
    messages,
    max_tokens: tokens,
    temperature: temperature ?? 0.5,
  };
  if (response_format) {
    openAiBody.response_format = response_format;
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(openAiBody),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data.error ?? { message: `OpenAI error (${upstream.status})` } },
        { status: upstream.status }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: { message: `Network error: ${(e as Error).message}` } },
      { status: 502 }
    );
  }
}
