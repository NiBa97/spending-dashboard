import { Box, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import CategorySelector from "../categorySelector";
import { Row, TableMeta, Table, Getter } from "@tanstack/react-table";
import { Category, Transaction } from "../types";
interface CustomTableMeta extends TableMeta<Category> {
  updateData: (
    rowIndex: number,
    columnId: keyof Transaction,
    value: object,
  ) => void;
}
const CateogryCell = ({
  row,
  table,
  category,
}: {
  row: Row<Transaction>;
  table: Table<Transaction>;
  category: Category | null;
}) => {
  const { updateData } = table.options.meta as CustomTableMeta;
  // load categories from the datacontext

  return (
    <CategorySelector
      selectedCategory={category}
      onChange={(category: Category) =>
        updateData(row.index, "Category", category)
      }
    />
  );
};
export default CateogryCell;
