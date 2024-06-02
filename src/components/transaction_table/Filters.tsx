import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
import FilterPopover from "./FilterPopover";
import { CiSearch } from "react-icons/ci";
import { IconType } from "react-icons";
import { Filter } from "../types";

interface FilterProps {
  columnFilters: Filter[];
  setColumnFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
}
const Filters = ({
  columnFilters,
  setColumnFilters,
  globalFilter,
  setGlobalFilter,
}: FilterProps) => {
  const setAmountFilter = (value: string) => {
    //check if volumnFilters contains the ID amount
    const amountFilter = columnFilters.find((filter) => filter.id === "amount");
    if (amountFilter) {
      //if so, update the value
      setColumnFilters((prev) => {
        return prev.map((f) =>
          f.id === "amount"
            ? {
                ...f,
                value: [value],
              }
            : f,
        );
      });
    } else {
      setColumnFilters((prev) => {
        return prev.concat({
          id: "amount",
          value: [value],
        });
      });
    }
  };
  return (
    <HStack spacing={3}>
      <InputGroup size="sm" maxW="12rem">
        <InputLeftElement pointerEvents="none">
          <Icon as={CiSearch as IconType} />
        </InputLeftElement>
        <Input
          type="text"
          variant="filled"
          placeholder="Receiver or usage"
          borderRadius={5}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </InputGroup>

      <FilterPopover
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />

      <FormControl>
        <Flex align="center" alignItems={"center"}>
          <FormLabel>Amount greater than: </FormLabel>
          <NumberInput
            onChange={(valueString, valueNumber) =>
              setAmountFilter(valueNumber.toString())
            }
          >
            <NumberInputField w={100} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Flex>
      </FormControl>
    </HStack>
  );
};
export default Filters;
