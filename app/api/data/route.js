// app/api/data/route.js
// Dashboard calls this to get data — returns cached data (fast) or fetches live

import { getAllData } from "@/lib/fetchData";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  // Try to get cached data from Vercel KV first (near-instant)
  try {
    const { kv } = await import("@vercel/kv");
    const cached = await kv.get("gtm_data");
    if (cached) {
      const data = typeof cached === "string" ? JSON.parse(cached) : cached;
      return Response.json({ ...data, fromCache: true });
    }
  } catch {
    // KV not configured — fall through to live fetch
  }

  // No cache — fetch live (takes 2-4 seconds)
  const data = await getAllData();
  return Response.json({ ...data, fromCache: false });
}
