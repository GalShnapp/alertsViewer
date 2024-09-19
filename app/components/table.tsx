import { Cell, Column, ColumnResizer, Group, ResizableTableContainer, Row, Table, TableBody, TableHeader, Selection } from 'react-aria-components';
import type { CellProps, ColumnProps, Key, RowProps, SortDescriptor } from 'react-aria-components';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLoaderData, useSearchParams, useLocation } from '@remix-run/react';
import { loader } from '../routes/_index';
import dayJs from 'dayjs';
import { invariant } from 'tiny-invariant'



export function AlertsTable() {
    const alertSummary = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedLogs, setSelectedLogs] = useState<Selection>(new Set());
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: 'time',
        direction: 'ascending'
    });

    let sortedItems = useMemo(() => {
        return alertSummary.cloudtrail_logs?.
            map((log, index) => {
                return {
                    id: index,
                    ...log
                }
            }).
            sort((a, b) => {
                if (sortDescriptor.column === undefined) {
                    return 0;
                }
                return 1; //TODO: Implement sorting
            });
    }, [sortDescriptor, alertSummary]);

    useEffect(() => {
        setSelectedLogs(new Set());
    }, [alertSummary.alert_name]);

    return (
        <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-violet-500 p-8 rounded-lg flex items-center justify-center ">
            <ResizableTableContainer className="w-full h-full overflow-auto relative bg-white rounded-lg shadow text-gray-600">
                <Table
                    aria-label="Stocks"
                    selectionMode="single"
                    selectionBehavior="replace"
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                    className="border-separate border-spacing-0"
                    onSelectionChange={(selection) => {
                        if (selection.size === 0) {
                            setSearchParams((prev) => {
                                prev.delete('logId');
                                return prev;
                            });
                            setSelectedLogs(new Set());
                            return;
                        }

                        selection.forEach(logId => {
                            setSearchParams((prev) => {
                                prev.set('logId', logId);
                                return prev;
                            });
                        });
                        setSelectedLogs(selection);

                    }}
                    selectedKeys={selectedLogs}
                >
                    <TableHeader>
                        <_Column id="time" allowsSorting>Time</_Column>
                        <_Column id="event" isRowHeader allowsSorting defaultWidth="3fr">
                            Event
                        </_Column>
                        <_Column id="user_type" allowsSorting>Identity type</_Column>
                        <_Column id="user_name" allowsSorting>User name</_Column>
                    </TableHeader>
                    <TableBody items={sortedItems}>
                        {(item) => (
                            <_Row
                                key={item.timestamp}
                                id={item.id as Key}
                                onAction={() => {
                                    navigate({
                                        pathname: `${item.id}/review`,
                                        search: searchParams.toString(),
                                    })
                                }}
                            >
                                <_Cell>
                                    <span className="font-mono bg-slate-100 border border-slate-200 rounded px-1 group-selected:bg-slate-700 group-selected:border-slate-800">
                                        {dayJs(item.timestamp).format('MM/DD HH:mm:ss')}
                                    </span>
                                </_Cell>
                                <_Cell className="font-semibold">{item.event_name}</_Cell>
                                <_Cell>{item.user_identity.type}</_Cell>
                                <_Cell>{item.user_identity.userName}</_Cell>
                            </_Row>
                        )
                        }
                    </TableBody>
                </Table>
            </ResizableTableContainer>
        </div>
    );
}

function _Column(props: ColumnProps & { children: React.ReactNode }) {
    return (
        <Column
            {...props}
            className="sticky top-0 p-0 border-0 border-b border-solid border-slate-300 bg-slate-200 font-bold text-left cursor-default first:rounded-tl-lg last:rounded-tr-lg whitespace-nowrap outline-none"
        >
            {({ allowsSorting, sortDirection }) => (
                <div className="flex items-center pl-4 py-1">
                    <Group
                        role="presentation"
                        tabIndex={-1}
                        className="flex flex-1 items-center overflow-hidden outline-none rounded focus-visible:ring-2 ring-slate-600"
                    >
                        <span className="flex-1 truncate">{props.children}</span>
                        {allowsSorting && (
                            <span
                                className={`ml-1 w-4 h-4 flex items-center justify-center`}
                            >
                                {sortDirection === 'ascending' ? '▲' : '▼'}
                            </span>
                        )}
                    </Group>
                    <ColumnResizer className="w-px px-[8px] py-1 h-5 bg-clip-content bg-slate-400 cursor-col-resize rounded resizing:bg-slate-800 resizing:w-[2px] resizing:pl-[7px] focus-visible:ring-2 ring-slate-600 ring-inset" />
                </div>
            )}
        </Column>
    );
}

function _Row<T extends object>(props: RowProps<T>) {
    return (
        <Row
            {...props}
            className="even:bg-slate-100 selected:bg-slate-600 selected:text-white cursor-default group outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-600 focus-visible:-outline-offset-4 selected:focus-visible:outline-white"
        />
    );
}

function _Cell(props: CellProps) {
    return (
        <Cell
            {...props}
            className={`px-4 py-2 truncate ${props.className} focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-600 focus-visible:-outline-offset-4 group-selected:focus-visible:outline-white`}
        />
    );
}