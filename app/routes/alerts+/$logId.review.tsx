import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Drawer } from "../../components/drawer";
import { Card } from "~/components/DetailsCard";
import {
  Form,
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import {
  AlertSummary,
  IdentifiedCloudTrailLogs,
  enumAlertType,
} from "../logs.interface";
import { LOGS_API_URL } from "../consts";
import {
  Button,
  Table,
  Text,
  TableBody,
  ResizableTableContainer,
  Key,
} from "react-aria-components";
import invariant from "tiny-invariant";
import { useOutletContext } from "@remix-run/react";
import { IdentifiedCloudTrailLogsCtx } from "~/contexts/nerative.context";
import {
  MyCell,
  MyColumn,
  MyRow,
  MyTableHeader,
} from "~/components/tableTemplate";
import dayjs from "dayjs";
import { TableButton } from "~/components/tableButton";
import { useMemo, useState } from "react";

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<Record<string, AlertSummary>[]> {
  const url = new URL(request.url);
  const alertId = url.searchParams.get("alert");

  if (alertId === null) {
    return [
      {
        missing: {
          alert_name: "missing",
          cloudtrail_logs: [],
        },
      },
    ];
  }

  try {
    const _alerts = await Promise.all(
      Object.entries(enumAlertType).map(([id, name]) => {
        return fetch(LOGS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alert_id: id }),
        })
          .then((response) => response.json())
          .then((data) => ({
            id: id,
            response: data,
          }));
      })
    );

    return _alerts.map((_alert: any) => {
      return {
        [_alert.id]: {
          alert_name: (_alert.response["alert_name"] as string) ?? "N/A",
          cloudtrail_logs: _alert.response["cloudtrail_logs"]?.map(
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
                                  currentState: instance["currentState"] ??
                                    "N/A";
                                }) ?? [],
                            }
                          : undefined,
                        securityGroup:
                          log["response_elements"]["securityGroup"] ??
                          undefined,
                        ConsoleLogin:
                          log["response_elements"]["ConsoleLogin"] ?? undefined,
                      },
                    }
                  : log["request_parameters"]
                  ? {
                      params: {
                        bucketName:
                          log["request_parameters"]["bucketName"] ?? undefined,
                        policy:
                          log["request_parameters"]["policy"] ?? undefined,
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
        },
      };
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch data");
  }
}

function logsAroundTimes(
  alerts: Record<string, AlertSummary>[],
  displayedlog: IdentifiedCloudTrailLogs
): IdentifiedCloudTrailLogs[] {
  var MS_PER_MINUTE = 60000;

  const displayedLogTime = new Date(displayedlog.timestamp);
  const timeBefore = new Date(displayedLogTime.getTime() - 10 * MS_PER_MINUTE);
  const timeAfter = new Date(displayedLogTime.getTime() + 10 * MS_PER_MINUTE);

  let logs = [];
  for (const alert of alerts) {
    for (const summary of Object.values(alert)) {
      for (const log of summary.cloudtrail_logs) {
        const logTime = new Date(log.timestamp);
        if (
          logTime >= timeBefore &&
          logTime <= timeAfter &&
          log.id !== displayedlog.id
        ) {
          logs.push(log);
        }
      }
    }
  }

  return logs;
}

function logsFromThisIP(
  alerts: Record<string, AlertSummary>[],
  displayedlog: IdentifiedCloudTrailLogs
): IdentifiedCloudTrailLogs[] {
  let logs = [];
  for (const alert of alerts) {
    for (const summary of Object.values(alert)) {
      for (const log of summary.cloudtrail_logs) {
        if (
          log.source_ip === displayedlog.source_ip &&
          log.id !== displayedlog.id
        ) {
          logs.push(log);
        }
      }
    }
  }

  return logs;
}

function logsFromThisIdentity(
  alerts: Record<string, AlertSummary>[],
  displayedlog: IdentifiedCloudTrailLogs
): IdentifiedCloudTrailLogs[] {
  let logs = [];
  for (const alert of alerts) {
    for (const summary of Object.values(alert)) {
      for (const log of summary.cloudtrail_logs) {
        if (
          log.user_identity.userName === displayedlog.user_identity.userName &&
          log.id !== displayedlog.id
        ) {
          logs.push(log);
        }
      }
    }
  }

  return logs;
}

export default function Review() {
  const [state, setState] = useState(true);
  const [searchParams] = useSearchParams();
  const ctx = useOutletContext<IdentifiedCloudTrailLogsCtx>();
  const params = useParams();
  const alertSummary = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  invariant(params.logId, "logId is required");
  const [alertId, _logId] = params.logId.split("-");
  const logId = parseInt(_logId, 10);

  const displayedAlert = alertSummary.find((sum) => sum[alertId] !== undefined);
  invariant(displayedAlert, "alert not found");
  const displayedLog = displayedAlert[alertId].cloudtrail_logs[logId];
  invariant(displayedLog, "log not found");

  const logsAroundTime = useMemo(
    () => logsAroundTimes(alertSummary, displayedLog),
    [state, displayedLog, alertSummary, ctx.items]
  );

  const logsFromIP = useMemo(
    () => logsFromThisIP(alertSummary, displayedLog),
    [state, displayedLog, alertSummary, ctx.items]
  );

  const logsFromIdentity = useMemo(
    () => logsFromThisIdentity(alertSummary, displayedLog),
    [state, displayedLog, alertSummary, ctx.items]
  );

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
        title={displayedAlert[alertId].alert_name}
        subTitle={displayedLog.event_name}
      />
      <div id="drawer-body" className="grow justify-between">
        <span id="raw-event-wrapper">
          <Text className="flex mx-6 mt-4 my-1 text-gray-500">Raw event</Text>
          <div
            id="json-preview"
            className=" max-h-44 flex-row mt-2 border border-sky-300 mx-6 bg-gray-100 p-2 overflow-y-scroll"
          >
            <pre>
              <Text className="text-xs">
                {JSON.stringify(
                  (() => {
                    const { id: _, ...rest } = displayedLog;
                    return rest;
                  })(),
                  null,
                  2
                )}
              </Text>
            </pre>
          </div>
        </span>
        <div id="similar">
          <Card title="Around this time">
            <ResizableTableContainer className="overflow-hidden relative w-auto mx-6 my-2 bg-white rounded-lg shadow text-gray-600">
              <Table>
                <MyTableHeader>
                  <MyColumn id="time">Time</MyColumn>
                  <MyColumn id="event" isRowHeader>
                    Event
                  </MyColumn>
                  <MyColumn id="action">{""}</MyColumn>
                </MyTableHeader>
                <TableBody
                  className="data-[empty]:text-center data-[empty]:italic"
                  renderEmptyState={() => (
                    <div className="flex items-center justify-center text-gray-400">
                      No logs found.
                    </div>
                  )}
                  items={logsAroundTime}
                  key={state.toString()}
                >
                  {(item) => (
                    <MyRow key={item.timestamp} id={item.id as Key}>
                      <MyCell>
                        {dayjs(item.timestamp).format("HH:mm:ss")}
                      </MyCell>
                      <MyCell className="font-semibold">
                        {item.event_name}
                      </MyCell>
                      <MyCell>
                        <div className="flex gap-2 flex-row-reverse">
                          <TableButton
                            buttonText="→"
                            toolTipText="Explore this log"
                            onPress={() => {
                              navigate(
                                {
                                  pathname: `../../${item.id}/review`,
                                  search: searchParams.toString(),
                                },
                                {
                                  relative: "path",
                                  replace: true,
                                }
                              );
                            }}
                          />
                          <TableButton
                            key={`${state}`}
                            buttonText="+"
                            toolTipText="Add this log to nerative"
                            isDisabled={ctx.items
                              .map((item) => item.id)
                              .includes(item.id)}
                            onPress={() => {
                              console.log("adding item", item);
                              setState(!state);
                              ctx.setItems([...ctx.items, item]);
                            }}
                          />
                        </div>
                      </MyCell>
                    </MyRow>
                  )}
                </TableBody>
              </Table>
            </ResizableTableContainer>
          </Card>
          <Card title={`With source IP ${displayedLog.source_ip}`}>
            <ResizableTableContainer className="overflow-hidden relative w-auto mx-6 my-2 bg-white rounded-lg shadow text-gray-600">
              <Table>
                <MyTableHeader>
                  <MyColumn id="time">Time</MyColumn>
                  <MyColumn id="event" isRowHeader>
                    Event
                  </MyColumn>
                  <MyColumn id="action">{""}</MyColumn>
                </MyTableHeader>
                <TableBody
                  className="data-[empty]:text-center data-[empty]:italic"
                  renderEmptyState={() => (
                    <div className="flex items-center justify-center text-gray-400">
                      No logs found.
                    </div>
                  )}
                  items={logsFromIP}
                  key={state.toString()}
                >
                  {(item) => (
                    <MyRow key={item.timestamp} id={item.id as Key}>
                      <MyCell>
                        {dayjs(item.timestamp).format("HH:mm:ss")}
                      </MyCell>
                      <MyCell className="font-semibold">
                        {item.event_name}
                      </MyCell>
                      <MyCell>
                        <div className="flex gap-2 flex-row-reverse">
                          <TableButton
                            buttonText="→"
                            toolTipText="Explore this log"
                            onPress={() => {
                              navigate(
                                {
                                  pathname: `../../${item.id}/review`,
                                  search: searchParams.toString(),
                                },
                                {
                                  relative: "path",
                                  replace: true,
                                }
                              );
                            }}
                          />
                          <TableButton
                            key={`${state}`}
                            buttonText="+"
                            toolTipText="Add this log to nerative"
                            isDisabled={ctx.items
                              .map((item) => item.id)
                              .includes(item.id)}
                            onPress={() => {
                              setState(!state);
                              ctx.setItems([...ctx.items, item]);
                            }}
                          />
                        </div>
                      </MyCell>
                    </MyRow>
                  )}
                </TableBody>
              </Table>
            </ResizableTableContainer>
          </Card>
          <Card
            title={`From ${displayedLog.user_identity.type}: ${displayedLog.user_identity.userName}`}
          >
            <ResizableTableContainer className="overflow-hidden relative w-auto mx-6 my-2 bg-white rounded-lg shadow text-gray-600">
              <Table>
                <MyTableHeader>
                  <MyColumn id="time">Time</MyColumn>
                  <MyColumn id="event" isRowHeader>
                    Event
                  </MyColumn>
                  <MyColumn id="action">{""}</MyColumn>
                </MyTableHeader>
                <TableBody
                  className="data-[empty]:text-center data-[empty]:italic"
                  renderEmptyState={() => (
                    <div className="flex items-center justify-center text-gray-400">
                      No logs found.
                    </div>
                  )}
                  items={logsFromIdentity}
                  key={state.toString()}
                >
                  {(item) => (
                    <MyRow key={item.timestamp} id={item.id as Key}>
                      <MyCell>
                        {dayjs(item.timestamp).format("HH:mm:ss")}
                      </MyCell>
                      <MyCell className="font-semibold">
                        {item.event_name}
                      </MyCell>
                      <MyCell>
                        <div className="flex gap-2 flex-row-reverse">
                          <TableButton
                            buttonText="→"
                            toolTipText="Explore this log"
                            onPress={() => {
                              navigate(
                                {
                                  pathname: `../../${item.id}/review`,
                                  search: searchParams.toString(),
                                },
                                {
                                  relative: "path",
                                  replace: true,
                                }
                              );
                            }}
                          />
                          <TableButton
                            key={`${state}`}
                            buttonText="+"
                            toolTipText="Add this log to nerative"
                            isDisabled={ctx.items
                              .map((item) => item.id)
                              .includes(item.id)}
                            onPress={() => {
                              setState(!state);
                              ctx.setItems([...ctx.items, item]);
                            }}
                          />
                        </div>
                      </MyCell>
                    </MyRow>
                  )}
                </TableBody>
              </Table>
            </ResizableTableContainer>
          </Card>
        </div>
      </div>

      <Drawer.Footer className="isnet-x-0 bottom-0">
        <div className="flex flex-row-reverse px-4">
          <Button
            onPress={() => {
              if (ctx.items.map((item) => item.id).includes(displayedLog.id)) {
                return;
              }
              ctx.setItems([...ctx.items, displayedLog]);
              navigate(-1);
            }}
            className="bg-blue-300 rounded-md min-w-16 px-2 py-1 disabled:bg-gray-300"
            isDisabled={ctx.items
              .map((item) => item.id)
              .includes(displayedLog.id)}
          >
            + Add to Nerative
          </Button>
        </div>
      </Drawer.Footer>
    </Drawer>
  );
}
