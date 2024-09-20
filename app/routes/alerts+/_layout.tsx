import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { LOGS_API_URL } from "../consts";
import { AlertSelector } from "../../components/select";
import { AlertSummary } from "../logs.interface";
import { AlertsTable } from "../../components/table";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<AlertSummary> {
  const url = new URL(request.url);
  const alertId = url.searchParams.get("alert");

  if (alertId === null) {
    return {
      alert_name: "missing",
      cloudtrail_logs: [],
    };
  }
  try {
    return await fetch(LOGS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert_id: alertId }),
    }).then((response) => response.json());
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch data");
  }
}

export default function AlertsPage() {
  return (
    <>
      <div className="bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col justify-content h-screen w-screen text-gray-900">
        <div className="p-6">
          <AlertSelector />
        </div>
        <div className="grow w-2/3 ">
          <AlertsTable />
        </div>
      </div>
      <Outlet />
    </>
  );
}
