import { Row, Table, TableMeta } from "@tanstack/react-table";
import { FaTrashAlt } from "react-icons/fa";
import { Transaction } from "../types";
import { Button } from "@chakra-ui/react";
interface CustomTableMeta extends TableMeta<Transaction> {
  deleteRow: (rowIndex: number) => void;
}

const DeleteCell = ({
  row,
  table,
}: {
  row: Row<Transaction>;
  table: Table<Transaction>;
}) => {
  const { deleteRow } = table.options.meta as CustomTableMeta;
  return (
    <Button onClick={() => deleteRow(row.index)}>
      <FaTrashAlt />
    </Button>
  );
};
export default DeleteCell;
