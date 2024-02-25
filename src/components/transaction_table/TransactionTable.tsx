import {
  JSXElementConstructor,
  PromiseLikeOfReactNode,
  ReactElement,
  ReactNode,
  ReactPortal,
  useContext,
  useState,
} from "react";
import type { Transaction } from "../import_suite/types";
import {
  Box,
  Button,
  ButtonGroup,
  Icon,
  Select,
  Table,
  Td,
  Text,
  Th,
  Tr,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Filters from "./Filters";
import { DataContext } from "../data_context";
import { FaSort } from "react-icons/fa";
import React from "react";
const columnHelper = createColumnHelper<Transaction>();
const columns = [
  columnHelper.accessor("Name", {
    header: "Name",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("Usage", {
    header: "Usage",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("Amount", {
    header: "Amount",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("Category", {
    header: "Category",
    cell: (props) => props.getValue(),
    // filterFn: (row, columnId, filterStatuses) => {
    //   if (filterStatuses.length === 0) return true;
    //   const status = row.getValue(columnId);
    //   return filterStatuses.includes(status?.id);
    // },

    filterFn: (row, columnIds, filterValue) => {
      if (filterValue.length === 0) return true;
      return filterValue.includes(row.getValue("Category"));
    },
  }),
  columnHelper.accessor("Date", {
    header: "Date",
    cell: (props) => props.getValue(),
  }),
];
interface Filter {
  id: string;
  value: string[] | string;
}
const TransanctionTable = () => {
  const { data, setData } = useContext(DataContext);
  const [columnFilters, setColumnFilters] = useState<Filter[]>([]);

  const [globalFilter, setGlobalFilter] = useState("");
  if (!data) return <div>Loading!</div>;

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    columnResizeMode: "onChange",
    meta: {
      updateData: (
        rowIndex: number,
        columnId: keyof Transaction,
        value: any,
      ) => {
        alert("updateData not implemented");
        setData((prev: Transaction[] | undefined) =>
          prev
            ? prev.map((row: Transaction, index: number) =>
                index === rowIndex
                  ? {
                      ...row,
                      [columnId]: value,
                    }
                  : row,
              )
            : [],
        );
      },
    },
  });

  return (
    <Box>
      <Filters
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      <Table className="w-full">
        {table.getHeaderGroups().map((headerGroup) => (
          <Tr className="tr" key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Th
                className="th"
                w={header.getSize()}
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
                {header.column.getCanSort() && (
                  <Icon
                    as={FaSort}
                    mx={3}
                    fontSize={14}
                    onClick={header.column.getToggleSortingHandler()}
                  />
                )}
                {{
                  asc: " 🔼",
                  desc: " 🔽",
                }[header.column.getIsSorted() as string] ?? null}
                <Box
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                  className={`resizer ${
                    header.column.getIsResizing() ? "isResizing" : ""
                  }`}
                />
              </Th>
            ))}
          </Tr>
        ))}
        {table.getRowModel().rows.map((row) => (
          <Tr className="tr" key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Td className="td" w={cell.column.getSize()} key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Td>
            ))}
          </Tr>
        ))}
      </Table>
      <br />
      <Text mb={2}>
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </Text>
      <ButtonGroup size="sm" isAttached variant="outline">
        <Button
          onClick={() => table.previousPage()}
          isDisabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </Button>
        <Button
          onClick={() => table.nextPage()}
          isDisabled={!table.getCanNextPage()}
        >
          {">"}
        </Button>
      </ButtonGroup>
      <Text mb={2}>
        Current rows: {table.getFilteredRowModel().rows.length}
      </Text>
      <Text mb={2}>
        Rows per page:
        <Select
          defaultValue={10}
          onChange={(e) => table.setPageSize(parseInt(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </Select>
      </Text>
    </Box>
  );
};
export default TransanctionTable;