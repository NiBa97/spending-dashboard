import FilterPopover from "~/components/transaction_table/FilterPopover";
import {
  Box,
  Text,
  SimpleGrid,
  Input,
  Flex,
  Icon,
  InputGroup,
  InputLeftAddon,
  HStack,
} from "@chakra-ui/react";
import { Transaction } from "~/components/types";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { FaArrowsLeftRight } from "react-icons/fa6";
import { IconType } from "react-icons";

const caldendarAlt: IconType = FaCalendarAlt as IconType;
const arrowsLeftRight: IconType = FaArrowsLeftRight as IconType;
export const FilterComponent = ({
  data,
  setDataSelection,
}: {
  data: Transaction[];
  setDataSelection: React.Dispatch<React.SetStateAction<Transaction[]>>;
}) => {
  const [columnFilters, setColumnFilters] = useState<
    { id: string; value: string[] }[]
  >([]);
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
      columnFilters.find((f) => f.id === "category")?.value ?? [];
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
  return (
    <SimpleGrid
      border={"solid 1px black"}
      borderRadius={5}
      paddingY={30}
      paddingX={30}
      columns={2}
    >
      <Box marginBottom={5}>
        <Text fontWeight={"bold"}>Category filter:</Text>
        <FilterPopover
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
      </Box>

      <Box>
        <Text fontWeight={"bold"}>Date range:</Text>
        <HStack alignItems={"center"}>
          <InputGroup mr={0}>
            <InputLeftAddon>
              <Icon as={caldendarAlt} />
            </InputLeftAddon>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date!)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              customInput={
                <Input
                  color="white"
                  w={170}
                  textAlign={"center"}
                  borderLeftRadius={0}
                />
              }
            />
          </InputGroup>
          <Icon as={arrowsLeftRight} />
          <InputGroup>
            <InputLeftAddon>
              <Icon as={caldendarAlt} />
            </InputLeftAddon>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date!)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              customInput={
                <Input
                  color="white"
                  w={170}
                  textAlign={"center"}
                  borderLeftRadius={0}
                />
              }
            />
          </InputGroup>
        </HStack>
      </Box>
    </SimpleGrid>
  );
};
