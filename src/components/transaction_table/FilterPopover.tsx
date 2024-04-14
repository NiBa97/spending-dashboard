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

import ColorIcon from "./CategoryCell";
import { Category, Filter } from "../types";
import { useContext } from "react";
import { DataContext } from "../data_context";
import { CategoryDisplay } from "../categorySelector";
const static_categories = ["Food", "Transport", "Entertainment", "Other"];

interface CategoryItemProps {
  category: Category;
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
    border={isActive ? "2px solid" : "2px solid transparent"}
    bg={"transparent"}
    _hover={{
      border: "2px solid",
    }}
    onClick={() => {
      setColumnFilters((prev) => {
        if (prev.length == 0) {
          console.log("return early");
          return [
            {
              id: "category",
              value: [category.id],
            },
          ];
        }
        const category_filters = prev.find((filter) => filter.id === "category")
          ?.value;
        if (!category_filters) {
          return prev.concat({
            id: "category",
            value: [category.id],
          });
        }

        return prev.map((f) =>
          f.id === "category"
            ? {
                ...f,
                value: isActive
                  ? category_filters.filter((c) => c !== category.id)
                  : category_filters.concat(category.id),
              }
            : f,
        );
      });
    }}
  >
    <CategoryDisplay category={category} />
  </Flex>
);

interface FilterPopoverProps {
  columnFilters: Filter[];
  setColumnFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
}
const FilterPopover = ({
  columnFilters,
  setColumnFilters,
}: FilterPopoverProps) => {
  const filterStatuses =
    columnFilters.find((f) => f.id === "category")?.value ?? [];

  const { categories } = useContext(DataContext);
  return (
    <Popover isLazy>
      <PopoverTrigger>
        <Button
          size="sm"
          leftIcon={<Icon as={CiFilter as IconType} fontSize={18} />}
        >
          Category Filter{" "}
          {filterStatuses.length > 0 ? `(${filterStatuses.length})` : ""}
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
            <CategoryItem
              category={{ id: "null", name: "Uncategorized", color: "black" }}
              isActive={filterStatuses.includes("null")}
              setColumnFilters={setColumnFilters}
              key={"null"}
            />
            {categories?.map((category) => (
              <CategoryItem
                category={category}
                isActive={filterStatuses.includes(category.id)}
                setColumnFilters={setColumnFilters}
                key={category.id}
              />
            ))}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
export default FilterPopover;
