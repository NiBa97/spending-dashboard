import {
  HStack,
  InputGroup,
  InputLeftAddon,
  Icon,
  IconButton,
  Input,
} from "@chakra-ui/react";
import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { IconType } from "react-icons";
import { FaCalendarAlt, FaTrash } from "react-icons/fa";
import { FaArrowsLeftRight } from "react-icons/fa6";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Filter, Transaction } from "../types";

interface DateRangeFilterComponentProps {
  filters: Filter[];
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  data: Transaction[];
}

const caldendarAlt: IconType = FaCalendarAlt as IconType;
const arrowsLeftRight: IconType = FaArrowsLeftRight as IconType;

export const DateRangeFilterComponent = forwardRef<
  { reset: () => void },
  DateRangeFilterComponentProps
>(({ filters, setFilters, data }, ref) => {
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

  useEffect(() => {
    if (filters.find((filter) => filter.id === "amount")) {
      setFilters((prev) => {
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
      setFilters((prev) => {
        return prev.concat({
          id: "date",
          value: [startDate.getTime(), endDate.getTime()],
        });
      });
    }
  }, [startDate, endDate]);

  useImperativeHandle(ref, () => ({
    reset() {
      setStartDate(oldestTransaction.date);
      setEndDate(newestTransaction.date);
    },
  }));

  return (
    <>
      <InputGroup mr={0} pr={0}>
        <InputLeftAddon>
          <Icon as={caldendarAlt} />
        </InputLeftAddon>
        <DatePicker
          portalId="my-popper"
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
              mr={0}
              textAlign={"center"}
              borderLeftRadius={0}
            />
          }
        />
      </InputGroup>
      <Icon as={arrowsLeftRight} />
      <InputGroup pr={0}>
        <InputLeftAddon>
          <Icon as={caldendarAlt} />
        </InputLeftAddon>
        <DatePicker
          portalId="my-popper"
          selected={endDate}
          onChange={(date) => setEndDate(date!)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          dateFormat="MMMM yyyy"
          showMonthYearPicker
          customInput={
            <Input color="white" textAlign={"center"} borderLeftRadius={0} />
          }
        />
      </InputGroup>
    </>
  );
});
