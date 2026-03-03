import redis from "./redis";
import { CacheStrategy } from "./cacheStrategies";
import { CacheKeys } from "./cacheKeys";

// ─────────────────────────────────────────
// GET
// ─────────────────────────────────────────
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);

    if (!data) {
      console.log(`[Cache MISS] ${key}`);
      return null;
    }

    console.log(`[Cache HIT] ${key}`);
    return data as T;
  } catch (error) {
    console.error(`[Cache ERROR - get] ${key}`, error);
    return null; // Redis down? App still works, just hits DB
  }
}

// ─────────────────────────────────────────
// SET
// ─────────────────────────────────────────
export async function setCache<T>(key: string, data: T, ttl?: number) {
  try {
    if (ttl && ttl > 0) {
      await redis.set(key, data, { ex: ttl });
      console.log(`[Cache SET] ${key} (TTL: ${ttl}s)`);
    } else {
      await redis.set(key, data);
      console.log(`[Cache SET] ${key} — no expiry`);
    }
  } catch (error) {
    console.error(`[Cache ERROR - set] ${key}`, error);
  }
}

// ─────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────
export async function cacheDelete(key: string) {
  try {
    await redis.del(key);
    console.log(`[Cache DELETE] ${key}`);
  } catch (error) {
    console.error(`[Cache ERROR - delete] ${key}`, error);
  }
}    

// ─────────────────────────────────────────
// DELETE BY PATTERN
// ─────────────────────────────────────────
export async function cacheDeleteByPattern(pattern: string) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) {
      console.log(`[Cache DELETE] No keys found for pattern: ${pattern}`);
      return;
    }

    await redis.del(...keys);
    console.log(
      `[Cache DELETE] Deleted keys for pattern: ${pattern} — ${keys.length} keys removed`,
    );
  } catch (error) {
    console.error(`[Cache ERROR - deleteByPattern] ${pattern}`, error);
  }
}

// ─────────────────────────────────────────
// WRAPPER ⭐ — use this in your routes
// ─────────────────────────────────────────
export async function cacheWrapper<T>(
  key: string,
  fetchFn: () => Promise<T>,
  strategyKey: string,
): Promise<T> {
  const [category, subcategory] = strategyKey.split(".") as [
    keyof typeof CacheStrategy,
    string,
  ];

  const strategy = CacheStrategy[category]?.[
    subcategory as keyof (typeof CacheStrategy)[typeof category]
  ] as { ttl: number; enabled: boolean } | undefined;

  // Caching disabled for this type? Skip entirely
  if (!strategy?.enabled) {
    console.log(`[Cache DISABLED] ${key}`);
    return await fetchFn();
  }

  // Step 1: Try cache
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  // Step 2: Cache miss — fetch from DB
  console.log(`[Cache FETCH] fetching fresh data for ${key}`);
  const fresh = await fetchFn();

  // Step 3: Save to cache for next request
  await setCache(key, fresh, strategy.ttl);

  return fresh;
}

// ─────────────────────────────────────────
// INVALIDATION HELPERS
// ─────────────────────────────────────────

// Call when: resume created, deleted, renamed
export async function invalidateResumeList(userId: string): Promise<void> {
  await cacheDelete(`resume:list:user:${encodeURIComponent(userId)}`);
}

// Call when: resume content updated
export async function invalidateSingleResume(resumeId: string): Promise<void> {
  await cacheDeleteByPattern(`resume:${encodeURIComponent(resumeId)}*`);
}

// Call when: user profile updated
export async function invalidateUserProfile(userId: string): Promise<void> {
  await cacheDelete(`user:profile:${encodeURIComponent(userId)}`);
}

// Call when: any resume is created, deleted, or updated
// Clears both recent resumes and stats shown on dashboard
export async function invalidateDashboard(userId: string): Promise<void> {
  await Promise.all([
    cacheDelete(CacheKeys.resume.recent(userId)), // clears recent resumes
    cacheDelete(CacheKeys.user.stats(userId)), // clears stats numbers
  ]);
}
