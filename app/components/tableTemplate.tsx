import {
  ColumnProps,
  RowProps,
  TableHeaderProps,
  Collection,
  useTableOptions,
  Cell,
  Column,
  ColumnResizer,
  Group,
  Row,
  TableHeader,
  Button,
  CellProps,
} from "react-aria-components";
import { GoArrowUp } from "react-icons/go";

export function MyColumn(props: ColumnProps & { children: React.ReactNode }) {
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
                className={`ml-1 w-4 h-4 flex items-center justify-center transition ${
                  sortDirection === "descending" ? "rotate-180" : ""
                }`}
              >
                {sortDirection && <GoArrowUp width={8} height={10} />}
              </span>
            )}
          </Group>
          <ColumnResizer className="w-px px-[8px] py-1 h-5 bg-clip-content bg-slate-400 cursor-col-resize rounded resizing:bg-slate-800 resizing:w-[2px] resizing:pl-[7px] focus-visible:ring-2 ring-slate-600 ring-inset" />
        </div>
      )}
    </Column>
  );
}

export function MyTableHeader<T extends object>({
  columns,
  children,
}: TableHeaderProps<T>) {
  let { allowsDragging } = useTableOptions();

  return (
    <TableHeader className="relative w-full">
      {/* Add extra columns for drag and drop and selection. */}
      {allowsDragging && <MyColumn defaultWidth={0}>{""}</MyColumn>}
      <Collection items={columns}>{children}</Collection>
    </TableHeader>
  );
}

export function MyRow<T extends object>({
  id,
  columns,
  children,
  ...otherProps
}: RowProps<T>) {
  let { allowsDragging } = useTableOptions();

  return (
    <Row
      className="even:bg-slate-100 selected:bg-slate-600 selected:text-white cursor-default group outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-600 focus-visible:-outline-offset-4 selected:focus-visible:outline-white"
      id={id}
      {...otherProps}
    >
      {allowsDragging && (
        <Cell className="text-center">
          <Button slot="drag">≡</Button>
        </Cell>
      )}
      <Collection items={columns}>{children}</Collection>
    </Row>
  );
}

export function MyCell(props: CellProps) {
  return (
    <Cell
      {...props}
      className={`px-4 py-2 truncate ${props.className} focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-600 focus-visible:-outline-offset-4 group-selected:focus-visible:outline-white`}
    />
  );
}
