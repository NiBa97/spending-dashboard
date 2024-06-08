import { useContext, useRef, useState } from "react";
import { Box, Flex, HStack, IconButton } from "@chakra-ui/react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type RowData,
  type Row,
} from "@tanstack/react-table";
import { FaTrash } from "react-icons/fa";
import React from "react";
import {
  type Category,
  type Filter,
  type Transaction,
} from "~/components/types";
import CateogryCell from "~/components/transaction_table/CategoryCell";
import DeleteCell from "~/components/transaction_table/DeleteCell";
import { DataContext } from "~/components/data_context";
import { DateRangeFilterComponent } from "~/components/filters/date_range_filter";
import FilterPopover from "~/components/transaction_table/FilterPopover";
import { AmountRangeFilterComponent } from "~/components/filters/amount_range_filter";
import { TextFilterComponent } from "~/components/filters/text_filter";
import MainTable from "~/components/transaction_table/main_table";

const columnHelper = createColumnHelper<Transaction>();
const columns = [
  columnHelper.accessor("receiver", {
    header: "Receiver",
    enableGlobalFilter: true,
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("usage", {
    header: "Usage",
    enableGlobalFilter: true,
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    size: 5,
    minSize: 5,
    cell: (props) => props.getValue(),
    filterFn: (
      row: Row<{ amount: number }>,
      columnId: string,
      value: number[],
    ) => {
      console.log(value);
      const amount = Number(row.getValue("amount"));
      return amount > value[0]! && amount < value[1]!;
    },
  }),
  columnHelper.accessor("category", {
    header: "Category",
    size: 5,
    minSize: 5,
    maxSize: 5,
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
      console.log("Category filter", filterStatuses);
      if (filterStatuses.length === 0) return true;
      const category: Category | null = row.getValue("category");
      if (!category) return filterStatuses.includes("null");
      return filterStatuses.includes(category.id);
    },
  }),
  columnHelper.accessor("date", {
    header: "Date",
    size: 5,
    minSize: 5,
    maxSize: 5,
    cell: (props) =>
      props.getValue().toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    filterFn: (row: Row<{ date: Date }>, columnId: string, value: number[]) => {
      const date = new Date(row.getValue("date"));
      return date.getTime() > value[0]! && date.getTime() < value[1]!;
    },
  }),
  columnHelper.display({
    id: "Delete",
    size: 1,
    minSize: 1,
    maxSize: 12,
    enableResizing: false,
    cell: (props) => DeleteCell({ row: props.row, table: props.table }),
  }),
];
declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateCategory: (rowIndex: number, value: Category | null) => void;
    deleteRow: (rowIndex: number) => void;
  }
}
const transactionTablePage = () => {
  const { data, handleDeleteTransaction, handleUpdateTransactionCategory } =
    useContext(DataContext);

  if (!data) return <div>Loading!</div>;
  const dateRangeFilterRef = useRef<{ reset: () => void }>(null);
  const amountRangeFilterRef = useRef<{ reset: () => void }>(null);
  const textFilterRef = useRef<{ reset: () => void }>(null);
  const handleReset = () => {
    if (dateRangeFilterRef.current) {
      dateRangeFilterRef.current.reset();
    }
    if (amountRangeFilterRef.current) {
      amountRangeFilterRef.current.reset();
    }
    if (textFilterRef.current) {
      textFilterRef.current.reset();
    }
  };
  const [columnFilters, setColumnFilters] = useState<Filter[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });
  const [dataSelection, setDataSelection] = useState<Transaction[]>(data);
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
      updateCategory: (rowIndex: number, value: Category | null) => {
        if (data[rowIndex] === undefined) return;
        data[rowIndex]!.category = value;
        handleUpdateTransactionCategory(data[rowIndex]!.id, value)
          .then(() => {
            setDataSelection(
              dataSelection.map((transaction) => {
                if (transaction.id === data[rowIndex]!.id) {
                  return { ...transaction, value };
                }
                return transaction;
              }),
            );
          })
          .catch((err) => {
            console.log(err);
          });
      },
      deleteRow: (rowIndex: number) => {
        data.splice(rowIndex, 1);
        const transaction = data[rowIndex];
        if (!transaction) return;
        handleDeleteTransaction(transaction.id)
          .then(() => {
            setDataSelection(
              dataSelection.filter((entry) => entry.id !== transaction.id),
            );
          })
          .catch((err) => {
            console.log(err);
          });
      },
    },
  });

  return (
    <Box>
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        px={6}
        py={2}
      >
        <DateRangeFilterComponent
          ref={dateRangeFilterRef}
          data={data}
          filters={columnFilters}
          setFilters={setColumnFilters}
        />
        <AmountRangeFilterComponent
          ref={amountRangeFilterRef}
          data={data}
          filters={columnFilters}
          setFilters={setColumnFilters}
        />
        <IconButton
          icon={<FaTrash />}
          onClick={() => handleReset()}
          aria-label={""}
        />
      </Flex>
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        px={6}
        py={2}
      >
        <HStack>
          <TextFilterComponent
            ref={textFilterRef}
            textFilter={globalFilter}
            setTextFilter={setGlobalFilter}
            placeholder="Reciever or Usage"
          />
          <FilterPopover
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
          />
        </HStack>
      </Flex>
      <MainTable table={table}></MainTable>
    </Box>
  );
};
export default transactionTablePage;
