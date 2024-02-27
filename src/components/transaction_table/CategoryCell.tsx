import { Box, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import CategorySelector from "../categorySelector";
import { Row, TableMeta, Table } from "@tanstack/react-table";
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
  getValue,
}: {
  row: Row<Transaction>;
  table: Table<Transaction>;
  getValue: () => Category;
}) => {
  const { updateData } = table.options.meta as CustomTableMeta;
  // load categories from the datacontext

  return (
    <CategorySelector
      selectedCategory={getValue()}
      onChange={(category: Category) =>
        updateData(row.index, "Category", category)
      }
    />
  );
};
export default CateogryCell;
