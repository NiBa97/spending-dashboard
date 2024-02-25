import { Box, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
const static_categories = ["Food", "Transport", "Entertainment", "Other"];
interface ColorIconProps {
  color: string;
  [key: string]: any;
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
      meta: { updateData: (index: number, id: string, value: any) => void };
    };
  };
}
const CateogryCell = ({ getValue, row, column, table }: CategoryCellProps) => {
  const { name, color } = getValue() || {};
  const { updateData } = table.options.meta;
  return (
    <Menu isLazy offset={[0, 0]} flip={false} autoSelect={false}>
      <MenuButton
        h="100%"
        w="100%"
        textAlign="left"
        p={1.5}
        bg={color || "transparent"}
        color="gray.900"
      >
        {name}
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => updateData(row.index, column.id, null)}>
          <ColorIcon color="red.400" mr={3} />
          None
        </MenuItem>
        {static_categories.map((category) => (
          <MenuItem
            onClick={() => updateData(row.index, column.id, category)}
            key={category}
          >
            <ColorIcon color="blue" mr={3} />
            {category}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
export default CateogryCell;
