// write me a small page component that displays the transactiontable

import React, { useContext } from "react";
import { DataContext } from "../../components/data_context";
import TransactionTable from "../../components/transaction_table/TransactionTable";

const TransactionTablePage = () => {
  return (
    <div>
      <TransactionTable />
    </div>
  );
};
export default TransactionTablePage;
