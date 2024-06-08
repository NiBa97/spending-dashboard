import {
  HStack,
  InputGroup,
  InputLeftAddon,
  Icon,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputStepper,
} from "@chakra-ui/react";
import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { IconType } from "react-icons";
import { FaCalendarAlt, FaMoneyBill, FaTrash } from "react-icons/fa";
import { FaArrowsLeftRight } from "react-icons/fa6";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Filter, Transaction } from "../types";

interface AmountRangeFilterComponentProps {
  filters: Filter[];
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  data: Transaction[];
}

const arrowsLeftRight: IconType = FaArrowsLeftRight as IconType;

export const AmountRangeFilterComponent = forwardRef<
  { reset: () => void },
  AmountRangeFilterComponentProps
>(({ filters, setFilters, data }, ref) => {
  const maxAmount = data.reduce((acc, transaction) => {
    if (!acc || transaction.amount > acc.amount) {
      return transaction;
    }
    return acc;
  }).amount;
  const minAmount = data.reduce((acc, transaction) => {
    if (!acc || transaction.amount < acc.amount) {
      return transaction;
    }
    return acc;
  }).amount;

  const [inputMaxAmount, setInputMaxAmount] = useState(maxAmount);
  const [inputMinAmount, setInputMinAmount] = useState(minAmount);

  useImperativeHandle(ref, () => ({
    reset() {
      setInputMaxAmount(maxAmount);
      setInputMinAmount(minAmount);
    },
  }));

  useEffect(() => {
    if (filters.find((filter) => filter.id === "amount")) {
      setFilters((prev) => {
        return prev.map((f) =>
          f.id === "amount"
            ? {
                ...f,
                value: [inputMinAmount, inputMaxAmount],
              }
            : f,
        );
      });
    } else {
      setFilters((prev) => {
        return prev.concat({
          id: "amount",
          value: [inputMinAmount, inputMaxAmount],
        });
      });
    }
  }, [inputMinAmount, inputMaxAmount]);
  return (
    <HStack>
      <InputGroup maxW="12rem">
        <InputLeftAddon>
          <Icon as={FaMoneyBill as IconType} fontSize={"20px"} />
        </InputLeftAddon>
        <NumberInput
          onChange={(valueString, valueNumber) =>
            setInputMinAmount(
              Number.isNaN(valueNumber) ? minAmount : valueNumber,
            )
          }
          isRequired={true}
          value={inputMinAmount}
          min={minAmount}
        >
          <NumberInputField w={100} borderLeftRadius={0} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </InputGroup>

      <Icon as={arrowsLeftRight} />
      <InputGroup>
        <InputLeftAddon>
          <Icon as={FaMoneyBill as IconType} fontSize={"20px"} />
        </InputLeftAddon>
        <NumberInput
          onChange={(valueString, valueNumber) =>
            setInputMaxAmount(
              Number.isNaN(valueNumber) ? maxAmount : valueNumber,
            )
          }
          value={inputMaxAmount}
          max={maxAmount}
          size="md"
        >
          <NumberInputField w={100} borderLeftRadius={0} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </InputGroup>
    </HStack>
  );
});
