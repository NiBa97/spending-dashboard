import {
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import FilterPopover from "./FilterPopover";
import { CiSearch } from "react-icons/ci";
interface Filter {
  id: string;
  value: string[];
}
import { IconType } from "react-icons";

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
    </HStack>
  );
};
export default Filters;
