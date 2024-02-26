import { Box, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import CategorySelector from "../categorySelector";
const static_categories = ["Food", "Transport", "Entertainment", "Other"];
interface ColorIconProps {
  color: string;
  [key: string]: string | number | boolean | undefined;
}

export const ColorIcon = ({ color, ...props }: ColorIconProps) => (
  <Box w="12px" h="12px" bg={color} borderRadius="3px" {...props} />
);
interface CategoryCellProps {
  row: {
    values: {
      name: string;
      usage: string;
      amount: number;
      date: string;
    };
    index: number;
  };
  getValue: () => { name: string; color: string };
  column: { id: string };
  table: {
    options: {
      meta: { updateData: (index: number, id: string, value: string) => void };
    };
  };
}
const CateogryCell = ({ getValue, row, column, table }: CategoryCellProps) => {
  const { name, color } = getValue() || {};
  const { updateData } = table.options.meta;
  return <CategorySelector />;
};
export default CateogryCell;
