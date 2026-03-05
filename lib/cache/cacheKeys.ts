// Cache Key Utilities — minimal for stepwise rollout
// Start by exporting only the resume list key so you can enable caching incrementally.

// helper to normalize/sanitize parts so keys don't contain spaces/colons
const esc = (v: string) => encodeURIComponent(String(v));

export const CacheKeys = {
  /**
   * Resume-related keys (minimal)
   */
  resume: {
    // User's resume list: "resume:list:user:123"
    list: (userId: string) => `resume:list:user:${esc(userId)}`,
    // Paged resume list: "resume:list:user:123:page:1:limit:12"
    listPage: (userId: string, page: number, limit: number) =>
      `resume:list:user:${esc(userId)}:page:${esc(String(page))}:limit:${esc(String(limit))}`,

    // Single resume: "resume:single:abc123"
    single: (resumeId: string) => `resume:single:${esc(resumeId)}`,

    // ✅ NEW: recently edited resumes for user: "resume:recent:user:123"
    recent: (userId: string) => `resume:recent:user:${esc(userId)}`, // ✅ NEW
  },

  user: {
    // User profile: "user:profile:123"
    profile: (userId: string) => `user:profile:${esc(userId)}`, // ✅ NEW
    // User stats: "user:stats:123"
    stats: (userId: string) => `user:stats:${esc(userId)}`, // ✅ NEW
  },
} as const;

/**
 * Helper to get all keys matching pattern
 * Example: getCachePattern(CacheKeys.resume.list("123"))
 */
export function getCachePattern(pattern: string): string {
  return pattern;
}
