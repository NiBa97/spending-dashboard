import { useSession } from "next-auth/react";
import Link from "next/link";
import { useContext, useState } from "react";
import { Transaction, type Category } from "~/components/types";
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  SimpleGrid,
} from "@chakra-ui/react";
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
import { MdOutlineFileUpload, MdOutlineFilterAlt } from "react-icons/md";

import TransactionTable from "~/components/transaction_table/TransactionTable";
import { IconType } from "react-icons";
import { FaFilter, FaUpload } from "react-icons/fa";

const UploadIcon: IconType = FaUpload as IconType;
const FilterIcon: IconType = FaFilter as IconType;

export default function Home() {
  const ctx = useSession();
  const { data, handleDeleteTransaction, handleUpdateTransactionCategory } =
    useContext(DataContext);

  const [showFilter, setShowFilter] = useState(false);
  const [dataSelection, setDataSelection] = useState<Transaction[]>([]);
  if (!data) {
    return <>Loading</>;
  }

  return (
    <>
      {dataSelection.length > 0 && (
        <SystemStatus
          date={dataSelection.reduce(
            (min, t) => (t.date < min ? t.date : min),
            dataSelection[0]!.date,
          )}
        />
      )}
      <Flex justifyContent={"space-between"}>
        <Box className="text-3xl font-extrabold tracking-tight text-white">
          Welcome {ctx.data?.user?.name}!
        </Box>
        <HStack gap={4}>
          <Link className="" href="/import_suite">
            <Button leftIcon={<UploadIcon />} aria-label={""} size={"md"}>
              Upload
            </Button>
          </Link>
          <Button
            leftIcon={<FilterIcon />}
            aria-label={""}
            size={"md"}
            onClick={() => setShowFilter(!showFilter)}
          >
            Filter
          </Button>
        </HStack>
      </Flex>
      {showFilter && (
        <Box mx={-4} px={4} bg={"gray.300"}>
          <FilterComponent data={data} setDataSelection={setDataSelection} />
        </Box>
      )}
      <SimpleGrid columns={4} gap={4} textAlign={"center"}>
        <TotalTransactions transactions={dataSelection} />
        <TotalDiff transactions={dataSelection} />
        <TotalSpendings transactions={dataSelection} />
        <TotalEarnings transactions={dataSelection} />
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
