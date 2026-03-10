// app/page.js
import { getAllData } from "@/lib/fetchData";
import Dashboard from "./Dashboard";

// This page re-fetches data at most once per hour on the server
// The cron job at 7am pre-warms the cache so opening at 8am is instant
export const revalidate = 3600; // 1 hour

export default async function Page() {
  const data = await getAllData();
  return <Dashboard initialData={data} />;
}
