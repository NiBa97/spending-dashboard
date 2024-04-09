import { useContext } from "react";
import { createColumnHelper, RowData, Row } from "@tanstack/react-table";
import { Category, Transaction } from "~/components/types";
import CateogryCell from "~/components/transaction_table/CategoryCell";
import DeleteCell from "~/components/transaction_table/DeleteCell";
import { DataContext } from "~/components/data_context";
import TransactionTable from "~/components/transaction_table/TransactionTable";
const TransactionTablePage = () => {
  //use the data context to retrieve all functoins
  const {
    data,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleUpdateTransactionCategory,
  } = useContext(DataContext);
  if (!data) return <div>Loading...</div>;
  return (
    <TransactionTable
      data={data}
      handleUpdateTransactionCategory={handleUpdateTransactionCategory}
      handleDeleteTransaction={handleDeleteTransaction}
    />
  );
};
export default TransactionTablePage;
