import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  Icon,
  Select,
  Table,
  Td,
  Text,
  Th,
  Tr,
} from "@chakra-ui/react";

import { Table as TanstackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { FaSort } from "react-icons/fa";
import React from "react";
import type { IconType } from "react-icons";
import { Category, Transaction } from "~/components/types";
import CategorySelector from "~/components/categorySelector";
const MainTable = ({ table }: { table: TanstackTable<Transaction> }) => {
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

  const deleteAll = async () => {
    if (
      !window.confirm(
        `Do you really want to delete all ${
          table.getFilteredRowModel().rows.length
        } transactions?`,
      )
    ) {
      return;
    }
    for (const row of table.getFilteredRowModel().rows) {
      table.options.meta?.deleteRow(row.index);
    }
  };
  return (
    <Box>
      <Table width={"100%"}>
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
          <Tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Td w={cell.column.getSize()} key={cell.id}>
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
      <HStack alignItems={"center"} justifyContent={"center"} mt={3}>
        <CategorySelector
          placeholder="Update categories in selection"
          selectedCategory={null}
          onChange={(category) => {
            void updateAllFilteredCategories(category);
          }}
        />
        <Button onClick={() => deleteAll()}>Delete all</Button>
      </HStack>
    </Box>
  );
};
export default MainTable;
