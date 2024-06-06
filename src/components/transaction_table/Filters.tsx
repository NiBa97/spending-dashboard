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
import { FaSearch } from "react-icons/fa";
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
  return (
    <HStack spacing={3}>
      <InputGroup maxW="12rem">
        <InputLeftElement>
          <Icon as={FaSearch as IconType} fontSize={"20px"} />
        </InputLeftElement>
        <Input
          type="text"
          variant="filled"
          placeholder="Receiver or usage"
          borderRadius={5}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          size="md"
        />
      </InputGroup>
    </HStack>
  );
};

export default Filters;
