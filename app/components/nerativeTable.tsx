import {
  Cell,
  Column,
  ColumnResizer,
  Group,
  ResizableTableContainer,
  Row,
  Table,
  TableBody,
  TableHeader,
  Selection,
  useDragAndDrop,
  isTextDropItem,
} from "react-aria-components";
import type {
  CellProps,
  ColumnProps,
  Key,
  RowProps,
} from "react-aria-components";
import { useState } from "react";
import { useSearchParams } from "@remix-run/react";
import dayJs from "dayjs";
import { IdentifiedCloudTrailLogs } from "~/routes/logs.interface";



export function NerativeTable() {
  let [items, setItems] = useState<IdentifiedCloudTrailLogs[]>([]);
  let [searchParams, _ ] = useSearchParams()

  const alertId = searchParams.get('alert')

  let { dragAndDropHooks } = useDragAndDrop({
    async onRootDrop(e) {
      let newItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async (item) => JSON.parse(await item.getText("log")))
      );
      setItems(newItems);
    },
    getItems: (keys) =>
      [...keys].map((key) => ({
        "text/plain": items.find((item) => item.id === key)?.event_name ?? "",
      })),
      async onInsert(e) {
        

      let newItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async (item) => JSON.parse(await item.getText("log")))
          .filter(item => !(item.id in items.map(i => i.id)))
      );
      
      if (e.target.dropPosition === "before") {
        const b4 = items.slice(0, e.target.key as number)
        const after = items.slice(e.target.key as number)
        setItems([...b4, ...newItems, ...after])
      } else if (e.target.dropPosition === "after") {
        const b4 = items.slice(0, e.target.key as number + 1);
        const after = items.slice(e.target.key as number + 1);
        setItems([...b4, ...newItems, ...after]);
      }
    },
  });

  return (
    <div className="relative h-full w-full   p-8  items-center justify-center grow">
      <ResizableTableContainer className="w-full h-full overflow-auto relative bg-white rounded-lg shadow text-gray-600">
        <Table
          aria-label="Nerative"
          className="border-separate border-spacing-0"
          dragAndDropHooks={dragAndDropHooks}
          disabledBehavior="selection"
        >
          <TableHeader>
            <_Column id="time">Time</_Column>
            <_Column id="event" isRowHeader>
              Event
            </_Column>
            <_Column id="source_ip">Source IP</_Column>
          </TableHeader>
          <TableBody
            className="data-[empty]:text-center data-[empty]:italic"
            renderEmptyState={() => "Select an alert to view."}
            items={items}
          >
            {(item) => (
              <_Row key={item.timestamp} id={item.id as Key}>
                <_Cell>
                  {dayJs(item.timestamp).format("MM/DD/YYYY HH:mm:ss")}
                </_Cell>
                <_Cell className="font-semibold">{item.event_name}</_Cell>
                <_Cell>{item.source_ip}</_Cell>
              </_Row>
            )}
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
              <span className={`ml-1 w-4 h-4 flex items-center justify-center`}>
                {sortDirection === "ascending" ? "▲" : "▼"}
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
