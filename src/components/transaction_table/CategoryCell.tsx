import { CategorySelector } from "../categorySelector";
import { type Row, type TableMeta, type Table } from "@tanstack/react-table";
import { type Category, type Transaction } from "../types";
interface CustomTableMeta extends TableMeta<Category> {
  updateCategory: (rowIndex: number, value: object | null) => void;
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
  const { updateCategory } = table.options.meta as CustomTableMeta;
  // load categories from the datacontext

  return (
    <CategorySelector
      selectedCategory={category}
      onChange={(category: Category | null) =>
        updateCategory(row.index, category)
      }
    />
  );
};
export default CateogryCell;
