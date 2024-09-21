import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { LOGS_API_URL } from "../consts";
import { AlertSelector } from "../../components/select";
import { AlertSummary, IdentifiedCloudTrailLogs } from "../logs.interface";
import { NerativeTable } from "~/components/nerativeTable";
import {
  Key,
  ResizableTableContainer,
  SortDescriptor,
  Table,
  TableBody,
  useDragAndDrop,
} from "react-aria-components";
import {
  MyTableHeader,
  MyColumn,
  MyRow,
  MyCell,
} from "~/components/tableTemplate";
import dayJs from "dayjs";
import { NerativeContext } from "~/contexts/nerative.context";
import { useMemo, useState } from "react";
import { s } from "framer-motion/client";

export const meta: MetaFunction = () => {
  return [
    { title: "Alerts" },
    { name: "description", content: "a fantastic alerts explorer" },
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

interface MySortDescriptor extends SortDescriptor {
  column: "time" | "event" | "source_ip" | "user_type" | "user_name";
  direction: "ascending" | "descending";
}

export default function AlertsPage() {
  const [searchParams] = useSearchParams();
  const [nerativeItems, setNerativeItems] = useState<IdentifiedCloudTrailLogs[]>([]);
  const alerts = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const handleRowAction = (log: IdentifiedCloudTrailLogs) => {
    return function () {
      navigate({
        pathname: `${log.id}/review`,
        search: searchParams.toString(),
      });
    };
  };

  const { dragAndDropHooks: alertsListDragHooks } = useDragAndDrop({
    getItems(keys) {
      return [...keys].map((key) => {
        const item = alerts.cloudtrail_logs.find((item) => item.id === key)!;
        return {
          "text/plain": `${item.timestamp} - ${item.event_name}`,
          "text/html": `<strong>${item.timestamp}</strong> - <strong>${item.event_name}</strong>`,
          log: JSON.stringify(item),
        };
      });
    },
    renderDragPreview(items) {
      return (
        <div className="drag-preview">
          <pre>{items[0]["text/plain"]}</pre>
        </div>
      );
    },
  });

  let [sortDescriptor, setSortDescriptor] = useState<MySortDescriptor>({
    column: "time",
    direction: "ascending",
  });

  let sortedItems = useMemo(() => {
    return alerts.cloudtrail_logs.sort((a, b) => {
      let cmp = 0;
      switch (sortDescriptor.column) {
        case "time":
          cmp = dayJs(a.timestamp).unix() - dayJs(b.timestamp).unix();
          break;
        case "event":
          cmp = a.event_name.localeCompare(b.event_name);
          break;
        case "source_ip":
          cmp = a.source_ip.localeCompare(b.source_ip);
          break;
        case "user_type":
          cmp = a.user_identity.type.localeCompare(b.user_identity.type);
          break;
        case "user_name":
          cmp = a.user_identity.userName.localeCompare(
            b.user_identity.userName
          );
          break;
      }

      if (sortDescriptor.direction === "descending") {
        cmp *= -1;
      }

      return cmp;
    });
  }, [sortDescriptor, alerts.cloudtrail_logs]);

  return (
    <NerativeContext.Provider
      value={{
        items: nerativeItems,
        setItems: setNerativeItems,
      }}
    >
      <div className="bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col justify-content relative h-full w-full text-gray-900">
        <div className="p-6">
          <AlertSelector />
        </div>
        <div className="grow flex flex-row">
          <div className="w-7/12">
            <div className="relative h-full w-full p-8 items-center justify-center grow">
              <ResizableTableContainer className="relative w-full h-full overflow-hidden relative bg-white rounded-lg shadow text-gray-600">
                <Table
                  aria-label="AlertsList"
                  selectionMode="single"
                  selectionBehavior="replace"
                  className="border-separate border-spacing-0"
                  dragAndDropHooks={alertsListDragHooks}
                  sortDescriptor={sortDescriptor}
                  onSortChange={(desc) => {
                    setSortDescriptor({
                      column: desc.column as MySortDescriptor["column"],
                      direction: desc.direction ?? "ascending",
                    });
                  }}
                >
                  <MyTableHeader>
                    <MyColumn
                      id="time"
                      defaultWidth={200}
                      isRowHeader
                      allowsSorting
                    >
                      Time
                    </MyColumn>
                    <MyColumn id="event" isRowHeader allowsSorting>
                      Event
                    </MyColumn>
                    <MyColumn
                      id="source_ip"
                      defaultWidth={150}
                      isRowHeader
                      allowsSorting
                    >
                      Source IP
                    </MyColumn>
                    <MyColumn
                      id="user_type"
                      defaultWidth={100}
                      isRowHeader
                      allowsSorting
                    >
                      User type
                    </MyColumn>
                    <MyColumn
                      id="user_name"
                      defaultWidth={100}
                      isRowHeader
                      allowsSorting
                    >
                      User name
                    </MyColumn>
                  </MyTableHeader>
                  <TableBody
                    className="data-[empty]:text-center data-[empty]:italic"
                    renderEmptyState={() => (
                      <div className="m-8 flex items-center justify-center h-max text-gray-400">
                        Select an alert to view.
                      </div>
                    )}
                    items={sortedItems}
                  >
                    {(item) => (
                      <MyRow
                        onAction={handleRowAction(item)}
                        key={item.id}
                        id={item.id as Key}
                      >
                        <MyCell>
                          {dayJs(item.timestamp).format("MM/DD/YYYY HH:mm:ss")}
                        </MyCell>
                        <MyCell>{item.event_name}</MyCell>
                        <MyCell>{item.source_ip}</MyCell>
                        <MyCell>{item.user_identity.type}</MyCell>
                        <MyCell>{item.user_identity.userName}</MyCell>
                      </MyRow>
                    )}
                  </TableBody>
                </Table>
              </ResizableTableContainer>
            </div>
          </div>
          <div className="w-5/12">
            <NerativeTable />
          </div>
        </div>
      </div>
      <Outlet
        context={{
          items: nerativeItems,
          setItems: setNerativeItems,
        }}
      />
    </NerativeContext.Provider>
  );
}
