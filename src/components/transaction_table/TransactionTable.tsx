import { useState } from "react";
import type { Category, Transaction } from "../types";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Icon,
  Select,
  Spacer,
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
import { FaSort } from "react-icons/fa";
import React from "react";
import type { IconType } from "react-icons";
import DeleteCell from "./DeleteCell";
import CateogryCell from "./CategoryCell";
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
    cell: (props) =>
      CateogryCell({
        table: props.table,
        row: props.row,
        category: props.getValue(),
      }),
    // filterFn: (row, columnId, filterStatuses) => {
    //   if (filterStatuses.length === 0) return true;
    //   const status = row.getValue(columnId);
    //   return filterStatuses.includes(status?.id);
    // },

    filterFn: (row, columnIds, filterValue) => {
      if (!Array.isArray(filterValue)) return true;
      if (filterValue.length === 0) return true;
      const category: Category = row.getValue("Category");
      return filterValue.includes(category.id);
    },
  }),
  columnHelper.accessor("Date", {
    header: "Date",
    cell: (props) => props.getValue(),
  }),
  columnHelper.display({
    id: "Delete",
    cell: (props) => DeleteCell({ row: props.row, table: props.table }),
  }),
];
interface Filter {
  id: string;
  value: string[];
}
const TransanctionTable = ({
  data,
  setData,
  onSave,
  hideFilter = false,
}: {
  data: Transaction[] | null;
  setData: React.Dispatch<React.SetStateAction<Transaction[] | null>>;
  onSave: () => void;
  hideFilter?: boolean;
}) => {
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
        value: object,
      ) => {
        setData((prev: Transaction[] | null) =>
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
      deleteRow: (rowIndex: number) => {
        setData((prev: Transaction[] | null) =>
          prev ? prev.filter((_, index) => index !== rowIndex) : [],
        );
      },
    },
  });

  return (
    <Box>
      {!hideFilter && (
        <Filters
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      )}
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
                    as={FaSort as IconType}
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
      <Flex justifyContent="space-between" alignItems="center">
        <Text mb={2}>
          Current rows: {table.getFilteredRowModel().rows?.length ?? 0}
        </Text>
        <ButtonGroup size="sm" isAttached variant="outline">
          <Button
            onClick={() => table.previousPage()}
            isDisabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </Button>
          <Text mb={2}>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </Text>
          <Button
            onClick={() => table.nextPage()}
            isDisabled={!table.getCanNextPage()}
          >
            {">"}
          </Button>
        </ButtonGroup>
        <Flex alignItems="center">
          <Text width="auto">Rows per page:</Text>
          <Select
            defaultValue={10}
            onChange={(e) => table.setPageSize(parseInt(e.target.value))}
            width="80px"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Select>
        </Flex>
      </Flex>
      <Flex justifyContent="center">
        <Button onClick={onSave} margin={"8px auto"} justifyContent={"center"}>
          Save
        </Button>
      </Flex>
    </Box>
  );
};
export default TransanctionTable;
