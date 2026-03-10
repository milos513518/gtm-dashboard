// app/api/cron/refresh/route.js
// Vercel calls this every day at 7am SF (15:00 UTC)
// It fetches all data and stores it so the dashboard loads instantly

import { getAllData } from "@/lib/fetchData";

// Simple in-memory cache for serverless (Vercel Edge Config or KV would persist longer)
// For persistence across deployments, use Vercel KV (free tier available)
export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request) {
  // Verify this is called by Vercel cron (not random people)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getAllData();
    
    // Store in Vercel KV if available, otherwise just return
    // To enable KV: vercel kv create gtm-cache
    try {
      const { kv } = await import("@vercel/kv");
      await kv.set("gtm_data", JSON.stringify(data), { ex: 86400 }); // 24h TTL
      console.log("✅ GTM data cached in Vercel KV at", data.refreshedAt);
    } catch {
      console.log("KV not configured, data fetched but not cached");
    }

    return Response.json({ 
      success: true, 
      refreshedAt: data.refreshedAt,
      summary: {
        ac_campaigns: data.ac?.campaigns?.length || 0,
        apollo_sequences: data.apollo?.sequences?.length || 0,
        sheet_contacts: data.sheet?.total || 0,
      }
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
