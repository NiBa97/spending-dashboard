// write me a small page component that displays the transactiontable

import React, { useContext } from "react";
import { DataContext } from "~/components/data_context";
import TransanctionTable from "~/components/transaction_table/TransactionTable";

const TransactionTablePage = () => {
  // get data from context
  const { data } = useContext(DataContext);
  // Use the transaction table component
  return (
    <div>
      <h1>Transaction Table</h1>
      <TransanctionTable
        data={data}
        updateData={() => console.log("test")}
        onSave={() => console.log("test123")}
      />
    </div>
  );
};
export default TransactionTablePage;
