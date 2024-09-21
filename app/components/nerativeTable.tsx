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
  useDragAndDrop,
  isTextDropItem,
  DropIndicator,
} from "react-aria-components";
import type {
  CellProps,
  ColumnProps,
  Key,
  RowProps,
} from "react-aria-components";
import { useState } from "react";
import dayJs from "dayjs";
import { IdentifiedCloudTrailLogs } from "~/routes/logs.interface";
import { NerativeContext } from "~/contexts/nerative.context";
import { useContext } from "react";

//TODO: add remove button and
export function NerativeTable() {
  let { items: items, setItems: setItems } = useContext(NerativeContext);


  let { dragAndDropHooks } = useDragAndDrop({
    async onRootDrop(e) {
      let newItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async (item) => JSON.parse(await item.getText("log")))
      );

      if (items.map((item) => item.id).includes(newItems[0].id)) {
        return;
      }
      setItems(newItems);
    },
    getItems(keys) {
      return [...keys].map((key) => ({
        "text/plain": items.find((item) => item.id === key)?.event_name ?? "",
      }));
    },
    async onInsert(e) {
      let newItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async (item) => JSON.parse(await item.getText("log")))
      );

      if (items.map((item) => item.id).includes(newItems[0].id)) {
        return;
      }

      let b4: IdentifiedCloudTrailLogs[] = [];
      let after: IdentifiedCloudTrailLogs[] = [];
      const targetIndex = items.findIndex((item) => item.id === e.target.key);
      if (
        e.target.dropPosition === "before" ||
        e.target.dropPosition === "on"
      ) {
        b4 = items.slice(0, targetIndex);
        after = items.slice(targetIndex);
      } else if (e.target.dropPosition === "after") {
        b4 = items.slice(0, targetIndex + 1);
        after = items.slice(targetIndex + 1);
      }
      setItems([...b4, ...newItems, ...after]);
    },
    onReorder(e) {
      const targetIndex = items.findIndex((item) => item.id === e.target.key);
      const movedItems = items.filter((item) => e.keys.has(item.id));
      const stationedItems = items.filter((item) => !e.keys.has(item.id));

      let b4: IdentifiedCloudTrailLogs[] = [];
      let after: IdentifiedCloudTrailLogs[] = [];
      if (e.target.dropPosition === "before") {
        b4 = stationedItems.slice(0, targetIndex);
        after = stationedItems.slice(targetIndex);
      } else if (e.target.dropPosition === "after") {
        b4 = stationedItems.slice(0, targetIndex + 1);
        after = stationedItems.slice(targetIndex + 1);
      }
      setItems([...b4, ...movedItems, ...after]);
    },
    renderDropIndicator(target) {
      return (
        <DropIndicator
          target={target}
          className={({ isDropTarget }) =>
            isDropTarget ? "outline outline-1 outline-pink-500" : ""
          }
        />
      );
    },
    renderDragPreview(items) {
      return (
        <div className="drag-preview">
          <pre>{items[0]["text/plain"]}</pre>
        </div>
      );
    },
  });

  return (
    <div className="relative h-full w-full p-8 items-center justify-center grow">
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
            renderEmptyState={() => (
              <div className="m-8 flex items-center justify-center h-max text-gray-400">
                Drag or add alerts here to tell a story.
              </div>
            )}
            items={items}
          >
            {(item) => (
              <_Row key={item.timestamp} id={item.id as Key} onAction={
                () => {
                  setItems(items.filter((i) => i.id !== item.id));
                }
              }>
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
