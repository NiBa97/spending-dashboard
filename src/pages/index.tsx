import { useSession } from "next-auth/react";
import Link from "next/link";
import { useContext, useState } from "react";
import { Transaction, type Category } from "~/components/types";
import { Box, Flex, SimpleGrid } from "@chakra-ui/react";
import SystemStatus from "~/components/system_status";
import { DataContext } from "~/components/data_context";
import {
  TotalTransactions,
  TotalSpendings,
  TotalEarnings,
  TotalDiff,
} from "~/components/kpis";
import { FilterComponent } from "~/components/filter_compent";
import { NegativeTransactionsPerInterval } from "~/components/negative_transactions_with_interval";
import TransactionTable from "~/components/transaction_table/TransactionTable";
export default function Home() {
  const ctx = useSession();
  const { data, handleDeleteTransaction, handleUpdateTransactionCategory } =
    useContext(DataContext);

  const [dataSelection, setDataSelection] = useState<Transaction[]>([]);
  if (!data) {
    return <>Loading</>;
  }

  return (
    <>
      <Flex justifyContent={"space-between"}>
        <Box className="text-3xl font-extrabold tracking-tight text-white">
          Welcome {ctx.data?.user?.name}!
        </Box>
        <Box>
          <SystemStatus date={new Date()} />
        </Box>
        <Link className="button" href="/import_suite">
          Import transactions
        </Link>
      </Flex>
      <FilterComponent data={data} setDataSelection={setDataSelection} />
      <SimpleGrid columns={4} gap={4}>
        <TotalTransactions transactions={dataSelection} />
        <TotalSpendings transactions={dataSelection} />
        <TotalEarnings transactions={dataSelection} />
        <TotalDiff transactions={dataSelection} />
      </SimpleGrid>
      <NegativeTransactionsPerInterval transactions={dataSelection} />
      <TransactionTable
        data={dataSelection}
        handleDeleteTransaction={async (id) => {
          await handleDeleteTransaction(id);
          setDataSelection(
            dataSelection.filter((transaction) => transaction.id !== id),
          );
        }}
        handleUpdateTransactionCategory={async (id, category) => {
          await handleUpdateTransactionCategory(id, category);
          setDataSelection(
            dataSelection.map((transaction) => {
              if (transaction.id === id) {
                return { ...transaction, category };
              }
              return transaction;
            }),
          );
        }}
      />
    </>
  );
}
