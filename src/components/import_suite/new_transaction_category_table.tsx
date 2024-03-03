import { useEffect, useState } from "react";
import type { Category, Transaction } from "../types";
import TransanctionTable from "../transaction_table/TransactionTable";
import CategorySelector from "../categorySelector";
import { Box, Button } from "@chakra-ui/react";

export default function TransactionCategoryTable({
  input_transactions,
  onNext,
}: {
  input_transactions: Transaction[];
  onNext: (data: Transaction[]) => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[] | null>(
    input_transactions,
  );
  useEffect(() => {
    setTransactions(input_transactions);
  }, [input_transactions]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const setAllCategories = () => {
    const updatedTransactions = transactions?.map((transaction) => {
      return { ...transaction, Category: selectedCategory };
    });
    setTransactions(updatedTransactions!);
  };
  return (
    <div>
      <Box width="200px">
        <CategorySelector
          selectedCategory={selectedCategory}
          onChange={(category: Category) => setSelectedCategory(category)}
        />
        <Button onClick={setAllCategories}>Apply to all transactions</Button>
      </Box>
      <TransanctionTable
        data={transactions}
        setData={setTransactions}
        onSave={() => {
          onNext(transactions!);
        }}
        hideFilter={true}
      />
    </div>
  );
}
