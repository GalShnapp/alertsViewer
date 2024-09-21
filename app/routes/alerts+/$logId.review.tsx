import { LoaderFunctionArgs } from "@remix-run/node";
import { Drawer } from "../../components/drawer";
import { Card } from "~/components/DetailsCard";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { AlertSummary } from "../logs.interface";
import { LOGS_API_URL } from "../consts";
import { Button, Text } from "react-aria-components";
import invariant from "tiny-invariant";
import { useOutletContext } from "@remix-run/react";
import { IdentifiedCloudTrailLogsCtx } from "~/contexts/nerative.context";


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
    const alerts = await fetch(LOGS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert_id: alertId }),
    }).then((response) => response.json());

    return {
      alert_name: (alerts["alert_name"] as string) ?? "N/A",
      cloudtrail_logs: alerts["cloudtrail_logs"]?.map(
        (log: any, index: number) => {
          return {
            id: `${alertId}-${index}`,
            timestamp: log["timestamp"] ?? "N/A",
            event_name: log["event_name"] ?? "N/A",
            user_identity: log["user_identity"]
              ? {
                  type: log["user_identity"]["type"] ?? "N/A",
                  userName: log["user_identity"]["userName"] ?? "N/A",
                }
              : {
                  type: "N/A",
                  userName: "N/A",
                },
            source_ip: log["source_ip"] ?? "N/A",
            metadata: log["response_elements"]
              ? {
                  elements: {
                    instancesSet: log["response_elements"]["instancesSet"]
                      ? {
                          items:
                            log["response_elements"]["instancesSet"][
                              "items"
                            ]?.map((instance: any) => {
                              instanceId: instance["instanceId"] ?? "N/A";
                              currentState: instance["currentState"] ?? "N/A";
                            }) ?? [],
                        }
                      : undefined,
                    securityGroup:
                      log["response_elements"]["securityGroup"] ?? undefined,
                    ConsoleLogin:
                      log["response_elements"]["ConsoleLogin"] ?? undefined,
                  },
                }
              : log["request_parameters"]
              ? {
                  params: {
                    bucketName:
                      log["request_parameters"]["bucketName"] ?? undefined,
                    policy: log["request_parameters"]["policy"] ?? undefined,
                    instanceId:
                      log["request_parameters"]["instanceId"] ?? undefined,
                    iamInstanceProfile: log["request_parameters"][
                      "iamInstanceProfile"
                    ]
                      ? {
                          arn:
                            log["request_parameters"]["iamInstanceProfile"][
                              "arn"
                            ] ?? "N/A",
                        }
                      : {
                          arn: "N/A",
                        },
                  },
                }
              : undefined,
          };
        }
      ),
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch data");
  }
}

export default function Review() {
  const ctx = useOutletContext < IdentifiedCloudTrailLogsCtx>();
  console.log(ctx);
  const params = useParams();
  const alertSummary = useLoaderData<typeof loader>();

  const navigate = useNavigate();

  invariant(params.logId, "logId is required");
  const logId = parseInt(params.logId.split("-")[1]);
  const displayedLog = alertSummary.cloudtrail_logs[logId];
  console.log("displayed log:", displayedLog);

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
        subTitle={displayedLog.event_name}
      />
      <div id="drawer-body" className="grow justify-between">
        <div id="log-details" className="grid grid-rows-3 gap-2 min-h-96">
          <Card title="hi" value="you!" />
          <Card title="hi" value="you!" />
          <Card title="hi" value="you!" />
        </div>
        {ctx.items.map((item) => (
          <p>{item.id}</p>
        ))}
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
        <Button
          onPress={() => {
            if (ctx.items.map((item) => item.id).includes(displayedLog.id)) {
              return;
            }
            ctx.setItems([...ctx.items, displayedLog]);
          }}
          className="bg-blue-300 rounded-md px-2 py-1 disabled:bg-gray-300"
          isDisabled={ctx.items
            .map((item) => item.id)
            .includes(displayedLog.id)}
        >
          Add
        </Button>
      </Drawer.Footer>
    </Drawer>
  );
}
