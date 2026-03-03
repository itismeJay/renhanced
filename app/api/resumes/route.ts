// app/api/resumes/route.ts
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { resume } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { CacheKeys } from "@/lib/cache/cacheKeys";
import { cacheWrapper, invalidateResumeList, invalidateDashboard } from "@/lib/cache/cacheService";

export async function POST(request: NextRequest) {
  try {
    console.log("📨 POST /api/resumes - Creating new resume");

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 },
      );
    }

    const body = await request.json();

    if (!body.template || !body.content) {
      return NextResponse.json(
        { error: "Template and content are required" },
        { status: 400 },
      );
    }

    const [newResume] = await db
      .insert(resume)
      .values({
        userId: session.user.id,
        template: body.template,
        content: body.content,
        title: body.title,
      })
      .returning();

    console.log("✅ Resume created:", newResume.id);

    // ✅ NEW: Invalidate resume list cache
    // Why? User just created a new resume so the cached list is now outdated
    await invalidateResumeList(session.user.id);

    await invalidateDashboard(session.user.id);

    return NextResponse.json(newResume, { status: 201 });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("📨 GET /api/resumes - Fetching user resumes");

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // ✅ NEW: cacheWrapper handles everything automatically
    // 1. Check Redis first
    // 2. If not found, run the db query
    // 3. Save result to Redis for next time
    // 4. Return the data
    const userResumes = await cacheWrapper(
      CacheKeys.resume.list(userId), // key:     "resume:list:user:123"
      () =>
        // fetchFn: runs only on cache miss
        db
          .select()
          .from(resume)
          .where(eq(resume.userId, userId))
          .orderBy(desc(resume.createdAt)),
      "resume.list", // strategy: 5 min TTL
    );

    return NextResponse.json(userResumes);
  } catch (error) {
    console.error("❌ Error fetching resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 },
    );
  }
}
// `invalidateDashboard` is provided by the cache service (clears recent resumes + stats)
