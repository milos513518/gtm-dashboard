import { getAllData } from "../../../lib/fetchData.js";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function GET() {
  const data = await getAllData();
  return Response.json(data);
}
