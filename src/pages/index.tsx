import { useContext, useEffect, useState } from "react";
import { Filter, Transaction } from "~/components/types";
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
} from "@chakra-ui/react";
import { DataContext } from "~/components/data_context";

import { NegativeTransactionsPerInterval } from "~/components/negative_transactions_with_interval";
import { FaChevronDown, FaFilter, FaUpload, FaTrash } from "react-icons/fa";
import FilterPopover from "~/components/transaction_table/FilterPopover";

import {} from "react-icons/fa";
import { IconType } from "react-icons";
import { DateRangeFilterComponent } from "~/components/date_range_filter";

export default function Home() {
  const { data } = useContext(DataContext);
  if (!data) {
    return <>Test1</>;
  }
  const [interval, setInterval] = useState("week");
  const [showFilter, setShowFilter] = useState(false);
  const [dataSelection, setDataSelection] = useState<Transaction[]>(data);

  return (
    <>
      {/* {dataSelection.length > 0 && (
        <SystemStatus
          date={dataSelection.reduce(
            (min, t) => (t.date < min ? t.date : min),
            dataSelection[0]!.date,
          )}
        />
      )} */}
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        <Menu>
          <Heading>
            Transactions per{" "}
            <MenuButton
              as={Button}
              textTransform={"capitalize"}
              rightIcon={<FaChevronDown />}
            >
              {interval}
            </MenuButton>
          </Heading>
          <MenuList>
            <MenuItem onClick={() => setInterval("day")}>Day</MenuItem>
            <MenuItem onClick={() => setInterval("week")}>Week</MenuItem>
            <MenuItem onClick={() => setInterval("month")}>Month</MenuItem>
          </MenuList>
        </Menu>
        <Button
          leftIcon={<FaFilter />}
          onClick={() => setShowFilter(!showFilter)}
        >
          Filter
        </Button>
      </Flex>
      {showFilter && (
        <Box mx={-4} mt={2} px={4} bg={"gray.300"}>
          <FilterComponent setDataSelection={setDataSelection} data={data} />
        </Box>
      )}
      {/* <SimpleGrid columns={4} gap={4} textAlign={"center"}>
        <TotalTransactions transactions={dataSelection} />
        <TotalDiff transactions={dataSelection} />
        <TotalSpendings transactions={dataSelection} />
        <TotalEarnings transactions={dataSelection} />
      </SimpleGrid> */}
      <NegativeTransactionsPerInterval
        transactions={dataSelection}
        interval={interval}
      />
    </>
  );
}

export const FilterComponent = ({
  setDataSelection,
  data,
}: {
  setDataSelection: React.Dispatch<React.SetStateAction<Transaction[]>>;
  data: Transaction[];
}) => {
  const [columnFilters, setColumnFilters] = useState<Filter[]>([]);
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
  const refreshDataSelection = () => {
    const filterStatuses =
      (columnFilters.find((f) => f.id === "category")?.value as string[]) ?? [];
    const result = data.filter((transaction) => {
      const date = new Date(transaction.date);
      const date_fit =
        date.getTime() >= startDate.getTime() &&
        date.getTime() <= endDate.getTime();
      const category = transaction.category?.id ?? "null";
      const category_fit =
        filterStatuses.length === 0 || filterStatuses.includes(category);
      return date_fit && category_fit;
    });
    setDataSelection(result);
  };
  useEffect(() => {
    refreshDataSelection();
  }, [startDate, endDate, columnFilters]);
  const resetFilters = () => {
    setStartDate(
      oldestTransaction ? new Date(oldestTransaction.date) : new Date(),
    );
    setEndDate(
      newestTransaction ? new Date(newestTransaction.date) : new Date(),
    );
    setColumnFilters([]);
  };
  return (
    <SimpleGrid columns={2} py={2}>
      <Box>
        {/* <Text fontWeight={"bold"}>Category filter:</Text> */}
        <FilterPopover
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
      </Box>

      <Box>
        <HStack alignItems={"center"}>
          <DateRangeFilterComponent
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
          <IconButton
            icon={<FaTrash />}
            onClick={() => resetFilters()}
            aria-label={""}
          />
        </HStack>
      </Box>
    </SimpleGrid>
  );
};
