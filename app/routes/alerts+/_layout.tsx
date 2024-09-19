import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet, useMatches } from "@remix-run/react"
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


export async function loader({ request }: LoaderFunctionArgs): Promise<AlertSummary> {
    const url = new URL(request.url);
    const alertId = url.searchParams.get('alert');

    if (alertId === null) {
        return {
            alert_name: "missing",
            cloudtrail_logs: []
        }
    }
    try {
        return await fetch(LOGS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "alert_id": alertId })
        }).then(response => response.json());

    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch data");
    }
}

export default function Index() {
    const matches = useMatches();
    console.log(matches)
    return (
        <>
            <div className="h-screen w-screen gap-x-0 text-grey-900">
                <div
                    className="flex flex-row h-fit p-6"
                >
                    <AlertSelector />
                </div>
                <div
                    className="flex flex-row h-full w-full "
                >
                    <AlertsTable />
                </div>
            </div>
            <Outlet />
        </>
    );
}

