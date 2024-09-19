import { LoaderFunctionArgs } from "@remix-run/node";
import { Drawer } from "../../components/drawer";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { AlertSummary } from "../logs.interface";
import { LOGS_API_URL } from "../consts";
import { Dialog, Text } from "react-aria-components"


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

export default function Review() {
    const alertSummary = useLoaderData<typeof loader>()
    console.log(alertSummary)
    const navigate = useNavigate()

    return (
        <Drawer
            isDismissable={true}
            isKeyboardDismissDisabled={true}
            onOpenChange={() => {
                navigate(-1)
            }}
            defaultOpen
        >
            <Dialog>
                <Drawer.Header title={alertSummary.alert_name}>

                </Drawer.Header>
                <Text className="text-grey-900"></Text>
            </Dialog>
        </Drawer>
    )
}