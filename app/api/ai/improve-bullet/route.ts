import { NextResponse, NextRequest } from "next/server";
import { generateSingleBullet } from "@/lib/ai/bulletPointGenerator";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  // Auth check first — before touching the body or calling any paid service
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { input, context } = body;

    // Validate input exists
    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Input text is required!" },
        { status: 400 },
      );
    }

    // Validate input is not too short
    if (input.trim().length < 3) {
      return NextResponse.json(
        { error: "Please write at least 3 characters before improving" },
        { status: 400 },
      );
    }

    // Validate input is not too long
    if (input.length > 1000) {
      return NextResponse.json(
        { error: "Input too long. Please keep under 1000 characters." },
        { status: 400 },
      );
    }

    const improved = await generateSingleBullet(input.trim(), context);

    return NextResponse.json({
      success: true,
      bullet: improved,
    });
  } catch (error: unknown) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to improve bullet point",
      },
      { status: 500 },
    );
  }
}
