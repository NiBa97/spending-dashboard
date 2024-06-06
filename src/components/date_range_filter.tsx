import {
  HStack,
  InputGroup,
  InputLeftAddon,
  Icon,
  IconButton,
  Input,
} from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons";
import { FaCalendarAlt, FaTrash } from "react-icons/fa";
import { FaArrowsLeftRight } from "react-icons/fa6";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
interface DateRangeFilterComponentProps {
  startDate: Date;
  setStartDate: React.Dispatch<React.SetStateAction<Date>>;
  endDate: Date;
  setEndDate: React.Dispatch<React.SetStateAction<Date>>;
}
const caldendarAlt: IconType = FaCalendarAlt as IconType;
const arrowsLeftRight: IconType = FaArrowsLeftRight as IconType;
export const DateRangeFilterComponent: React.FC<
  DateRangeFilterComponentProps
> = ({ startDate, setStartDate, endDate, setEndDate }) => {
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
};
