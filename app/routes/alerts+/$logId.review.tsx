import { LoaderFunctionArgs } from "@remix-run/node";
import { Drawer } from "../../components/drawer";
import { Card } from "~/components/DetailsCard";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { AlertSummary } from "../logs.interface";
import { LOGS_API_URL } from "../consts";
import { Text } from "react-aria-components";
import invariant from "tiny-invariant";

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

export default function Review() {
  const params = useParams();
  const alertSummary = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  invariant(params.logId, "logId is required");
  const logId = parseInt(params.logId);
  const displayedLog = alertSummary.cloudtrail_logs[logId]

  return (
    <Drawer
      isDismissable={true}
      isKeyboardDismissDisabled={true}
      onOpenChange={() => {
        navigate(-1);
      }}
      defaultOpen
      className="justify-between"
    >
      <Drawer.Header
        title={alertSummary.alert_name}
        subTitle={displayedLog.timestamp}
      />
      <div id="drawer-body" className="grow justify-between">
        <div id="log-details" className="grid grid-cols-4 gap-4">
          <Card title="hi" value="you!" />
          <Card title="hi" value="you!" />
          <Card title="hi" value="you!" />
          <Card title="hi" value="you!" />
        </div>
        <div
          id="json-preview"
          className=" max-h-44 flex-row border border-sky-300 m-6 bg-gray-100 p-2 overflow-y-scroll"
        >
          <pre>
            <Text className="text-xs">
              {JSON.stringify(displayedLog, null, 2)}
            </Text>
          </pre>
        </div>
        <div className="flex-row">
          <Text className="text-grey-900">eh...</Text>
        </div>
        <div className="flex-row">
          <Text className="text-grey-900">eh...</Text>
        </div>
        <div className="">
          <Text className="text-grey-900">eh...</Text>
        </div>
      </div>
      <Drawer.Footer className="isnet-x-0 bottom-0">
        button here..
      </Drawer.Footer>
    </Drawer>
  );
}
