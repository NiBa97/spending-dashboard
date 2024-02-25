import {
  Button,
  Icon,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverTrigger,
  VStack,
  Text,
  Flex,
} from "@chakra-ui/react";
import { CiFilter } from "react-icons/ci";
import { IconType } from "react-icons";

import { ColorIcon } from "./CategoryCell";
const static_categories = ["Food", "Transport", "Entertainment", "Other"];

interface CategoryItemProps {
  category: string;
  setColumnFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  isActive: boolean;
}

const CategoryItem = ({
  category,
  setColumnFilters,
  isActive,
}: CategoryItemProps) => (
  <Flex
    align="center"
    cursor="pointer"
    borderRadius={5}
    fontWeight="bold"
    p={1.5}
    bg={isActive ? "gray.800" : "transparent"}
    _hover={{
      bg: "gray.800",
    }}
    onClick={() => {
      setColumnFilters((prev) => {
        const category_filters = prev.find((filter) => filter.id === "Category")
          ?.value;
        if (!category_filters) {
          return prev.concat({
            id: "Category",
            value: [category],
          });
        }

        return prev.map((f) =>
          f.id === "Category"
            ? {
                ...f,
                value: isActive
                  ? category_filters.filter((c) => c !== category)
                  : category_filters.concat(category),
              }
            : f,
        );

        // If none of the above conditions are met, we return the previous state
        return prev;
      });
    }}
  >
    <ColorIcon color="blue" mr={3} />
    {category}
  </Flex>
);

interface Filter {
  id: string;
  value: string[];
}

interface FilterPopoverProps {
  columnFilters: Filter[];
  setColumnFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
}
const FilterPopover = ({
  columnFilters,
  setColumnFilters,
}: FilterPopoverProps) => {
  const filterStatuses =
    columnFilters.find((f) => f.id === "Category")?.value ?? [];

  console.log("filterStatuses", filterStatuses);
  return (
    <Popover isLazy>
      <PopoverTrigger>
        <Button
          size="sm"
          color={filterStatuses.length > 0 ? "blue.300" : ""}
          leftIcon={<Icon as={CiFilter as IconType} fontSize={18} />}
        >
          Filter {filterStatuses.length > 0 ? `(${filterStatuses.length})` : ""}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <Text fontSize="md" fontWeight="bold" mb={4}>
            Filter By:
          </Text>
          <Text fontWeight="bold" color="gray.400" mb={1}>
            Status
          </Text>
          <VStack align="flex-start" spacing={1}>
            {static_categories.map((category) => (
              <CategoryItem
                category={category}
                isActive={filterStatuses.includes(category)}
                setColumnFilters={setColumnFilters}
                key={category}
              />
            ))}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
export default FilterPopover;
