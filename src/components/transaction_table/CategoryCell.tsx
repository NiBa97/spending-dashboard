import CategorySelector from "../categorySelector";
import type { Row, TableMeta, Table } from "@tanstack/react-table";
import type { Category, Transaction } from "../types";
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
