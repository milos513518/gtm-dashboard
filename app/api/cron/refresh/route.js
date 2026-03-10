import { getAllData } from "../../../../lib/fetchData";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await getAllData();
  return Response.json({ success: true, refreshedAt: data.refreshedAt });
}
