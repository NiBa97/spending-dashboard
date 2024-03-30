import { useContext, useState } from "react";
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
  RowData,
  Row,
} from "@tanstack/react-table";
import { FaSort } from "react-icons/fa";
import React from "react";
import type { IconType } from "react-icons";
import { Category, Transaction } from "~/components/types";
import CateogryCell from "~/components/transaction_table/CategoryCell";
import DeleteCell from "~/components/transaction_table/DeleteCell";
import Filters from "~/components/transaction_table/Filters";
import { DataContext } from "~/components/data_context";
import CategorySelector from "~/components/categorySelector";
const columnHelper = createColumnHelper<Transaction>();
const columns = [
  columnHelper.accessor("receiver", {
    header: "Receiver",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("usage", {
    header: "Usage",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("category", {
    header: "Category",
    cell: (props) =>
      CateogryCell({
        table: props.table,
        row: props.row,
        category: props.getValue(),
      }),
    filterFn: (
      row: Row<{ category: Category | null }>,
      columnId: string,
      filterStatuses: string[],
    ) => {
      if (filterStatuses.length === 0) return true;
      const category: Category | null = row.getValue("category");
      if (!category) return filterStatuses.includes("null");
      return filterStatuses.includes(category.id);
    },
  }),
  columnHelper.accessor("date", {
    header: "Date",
    cell: (props) =>
      props.getValue().toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
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
declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    updateCategory: (rowIndex: number, value: Category) => void;
    deleteRow: (rowIndex: number) => void;
  }
}
const TransactionTablePage = () => {
  //use the data context to retrieve all functoins
  const {
    data,

    handleUpdateTransaction,
    handleDeleteTransaction,
    handleUpdateTransactionCategory,
  } = useContext(DataContext);
  const [columnFilters, setColumnFilters] = useState<Filter[]>([]);

  const [globalFilter, setGlobalFilter] = useState("");

  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });

  if (!data) return <div>Loading!</div>;

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      globalFilter,
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,

    autoResetPageIndex: false, //turn off auto reset of pageIndex
    columnResizeMode: "onChange",
    meta: {
      updateCategory: (rowIndex: number, value: Category) => {
        if (data[rowIndex] === undefined) return;
        data[rowIndex]!.category = value;
        try {
          handleUpdateTransactionCategory(data[rowIndex]!.id, value)
            .then(() => {
              console.log("Category updated");
            })
            .catch((e) => {
              console.error(e);
            });
        } catch (e) {
          console.error(e);
        }
      },
      deleteRow: (rowIndex: number) => {
        data.splice(rowIndex, 1);
        const transaction = data[rowIndex];
        if (!transaction) return;
        handleDeleteTransaction(transaction.id)
          .then(() => {
            console.log("Transaction deleted");
          })
          .catch((e) => {
            console.error(e);
          });
      },
    },
  });

  const updateAllFilteredCategories = async (newCategory: Category) => {
    if (!window.confirm("Are you sure you want to update all categories?")) {
      return;
    }
    // call the update function for each transaction from table meta
    for (const row of table.getFilteredRowModel().rows) {
      table.options.meta?.updateCategory(row.index, newCategory);
    }
    // const updatePromises = table.getFilteredRowModel().rows.map((row) => {
    //   const transaction = row.original;
    //   transaction.category = newCategory;
    //   return handleUpdateTransactionCategory(transaction.id, newCategory);
    // });

    // // Wait for all updates to complete
    // Promise.all(updatePromises)
    //   .then(() => {
    //     // Show a toast when all updates are completed
    //     console.log("All categories updated successfully");
    //   })
    //   .catch((e) => {
    //     console.error(e);
    //   });

    // // Get the filtered rows
    // const filteredRows = table.getFilteredRowModel().rows.filter((row) => {
    //   //
    //   console.log(row.original);
    //   table.options.meta?.updateCategory(row.index, newCategory);
    // });
    // return;
  };

  return (
    <Box>
      <CategorySelector
        selectedCategory={null}
        onChange={(category) => {
          void updateAllFilteredCategories(category);
        }}
      />
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
        Current rows: {table.getFilteredRowModel().rows?.length ?? 0}
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
export default TransactionTablePage;
