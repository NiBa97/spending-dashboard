import { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
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
import { Category, Filter, Transaction } from "~/components/types";
import CateogryCell from "~/components/transaction_table/CategoryCell";
import DeleteCell from "~/components/transaction_table/DeleteCell";
import Filters from "~/components/transaction_table/Filters";
import { DataContext } from "~/components/data_context";
import CategorySelector from "~/components/categorySelector";
import { DateRangeFilterComponent } from "~/components/date_range_filter";
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
  interface TableMeta<TData extends RowData> {
    updateCategory: (rowIndex: number, value: Category | null) => void;
    deleteRow: (rowIndex: number) => void;
  }
}
const TransactionTablePage = () => {
  const { data, handleDeleteTransaction, handleUpdateTransactionCategory } =
    useContext(DataContext);

  if (!data) return <div>Loading!</div>;
  const oldestTransaction = data.reduce((acc, transaction) => {
    if (!acc || transaction.date < acc.date) {
      return transaction;
    }
    return acc;
  });

  const newestTransaction = data.reduce((acc, transaction) => {
    if (!acc || transaction.date > acc.date) {
      return transaction;
    }
    return acc;
  });

  const [startDate, setStartDate] = useState<Date>(oldestTransaction.date);
  const [endDate, setEndDate] = useState<Date>(newestTransaction.date);
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

  const updateAllFilteredCategories = async (newCategory: Category | null) => {
    if (
      !window.confirm(
        `Are you sure you want to update the category of ${
          table.getFilteredRowModel().rows.length
        } transactions?`,
      )
    ) {
      return;
    }
    for (const row of table.getFilteredRowModel().rows) {
      table.options.meta?.updateCategory(row.index, newCategory);
    }
  };
  const setAmountFilter = (value: number[]) => {
    if (!value[0]) value[0] = minAmount;
    if (!value[1]) value[1] = maxAmount;
    const amountFilter = columnFilters.find((filter) => filter.id === "amount");
    if (amountFilter) {
      setColumnFilters((prev) => {
        return prev.map((f) =>
          f.id === "amount"
            ? {
                ...f,
                value: value,
              }
            : f,
        );
      });
    } else {
      setColumnFilters((prev) => {
        return prev.concat({
          id: "amount",
          value: value,
        });
      });
    }
  };
  const maxAmount = data.reduce((acc, transaction) => {
    if (!acc || transaction.amount > acc.amount) {
      return transaction;
    }
    return acc;
  }).amount;
  console.log(maxAmount);
  const minAmount = data.reduce((acc, transaction) => {
    if (!acc || transaction.amount < acc.amount) {
      return transaction;
    }
    return acc;
  }).amount;

  const handleGreaterThanChange = (
    valueString: string,
    valueNumber: number,
  ) => {
    const currentFilter = columnFilters.find(
      (filter) => filter.id === "amount",
    );
    const currentValues = currentFilter
      ? currentFilter.value
      : [undefined, maxAmount];
    setAmountFilter([
      valueNumber,
      currentValues[1] as number,
      currentValues[2] as number,
    ]);
  };

  const handleLessThanChange = (valueString: string, valueNumber: number) => {
    const currentFilter = columnFilters.find(
      (filter) => filter.id === "amount",
    );
    const currentValues = currentFilter
      ? currentFilter.value
      : [minAmount, undefined];
    setAmountFilter([currentValues[0] as number, valueNumber]);
  };

  useEffect(() => {
    const amountFilter = columnFilters.find((filter) => filter.id === "date");
    if (amountFilter) {
      setColumnFilters((prev) => {
        return prev.map((f) =>
          f.id === "date"
            ? {
                ...f,
                value: [startDate.getTime(), endDate.getTime()],
              }
            : f,
        );
      });
    } else {
      setColumnFilters((prev) => {
        return prev.concat({
          id: "date",
          value: [startDate.getTime(), endDate.getTime()],
        });
      });
    }
  }, [startDate, endDate]);
  return (
    <Box>
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        px={6}
        py={2}
      >
        <DateRangeFilterComponent
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
        <FormControl>
          <Flex align="center" alignItems={"center"}>
            <FormLabel>Amount greater than: </FormLabel>
            <NumberInput
              onChange={(valueString, valueNumber) =>
                handleGreaterThanChange(valueString, valueNumber)
              }
              isRequired={true}
              defaultValue={minAmount}
              min={minAmount}
            >
              <NumberInputField w={100} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Flex>
        </FormControl>

        <FormControl>
          <Flex align="center" alignItems={"center"}>
            <FormLabel>Amount less than:</FormLabel>
            <NumberInput
              onChange={(valueString, valueNumber) =>
                handleLessThanChange(valueString, valueNumber)
              }
              defaultValue={maxAmount}
              max={maxAmount}
            >
              <NumberInputField w={100} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Flex>
        </FormControl>
        <Filters
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />

        <CategorySelector
          placeholder="Update categories in selection"
          selectedCategory={null}
          onChange={(category) => {
            void updateAllFilteredCategories(category);
          }}
        />
      </Flex>
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
      <Flex
        width={"100%"}
        justifyContent={"space-between"}
        px={6}
        alignItems={"center"}
      >
        <Text>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
          <br />
          Current rows: {table.getFilteredRowModel().rows?.length ?? 0}
        </Text>
        <ButtonGroup size="sm" isAttached variant="outline">
          <Button
            onClick={() => table.previousPage()}
            isDisabled={!table.getCanPreviousPage()}
          >
            {"<"} Previous
          </Button>
          <Button
            onClick={() => table.nextPage()}
            isDisabled={!table.getCanNextPage()}
          >
            Next {">"}
          </Button>
        </ButtonGroup>

        <HStack spacing={2} mb={2}>
          <Box>Rows per page:</Box>
          <Select
            w={20}
            defaultValue={10}
            onChange={(e) => table.setPageSize(parseInt(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Select>
        </HStack>
      </Flex>
    </Box>
  );
};
export default TransactionTablePage;
