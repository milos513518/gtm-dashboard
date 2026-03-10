import { getAllData } from "../lib/fetchData";
import Dashboard from "./Dashboard";
export const revalidate = 3600;
export default async function Page() {
  const data = await getAllData();
  return <Dashboard initialData={data} />;
}
