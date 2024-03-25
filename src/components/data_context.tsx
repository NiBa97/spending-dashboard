import { createContext, useEffect, useState } from "react";
import { Category, Transaction } from "./types";
import { api } from "~/utils/api";
interface DataContextProps {
  data: Transaction[] | null;
  updateData: (newData: Transaction[] | null, refetch?: boolean) => void;
  categories: Category[] | null;
}

export const DataContext = createContext<DataContextProps>({
  data: null,
  updateData: (newData: Transaction[] | null, refetch?: boolean) => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  categories: null,
});

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<Transaction[] | null>(null);
  const { data: categories } = api.category.getAll.useQuery();
  const transactionResponse = api.transactions.getAll.useQuery();
  const categoryMappingResponse =
    api.transactionCategoryMapping.getAll.useQuery();

  const store_on_local_storage = false;

  // Load data from localStorage when component mounts
  useEffect(() => {
    if (store_on_local_storage) {
      const savedData = localStorage.getItem("data");
      if (savedData && savedData.length > 0) {
        setData(JSON.parse(savedData) as Transaction[]);
      }
    } else if (transactionResponse.data && categoryMappingResponse.data) {
      const transactions = transactionResponse.data.map((transaction) => {
        const category = categoryMappingResponse.data.find(
          (categoryMapping) => categoryMapping.hash === transaction.hash,
        );
        return new Transaction({
          DateString: transaction.date,
          Receiver: transaction.receiver,
          Usage: transaction.usage,
          Amount: transaction.amount,
          Category: category ? category.category : null,
        });
      });
      setData(transactions);
    }
  }, [
    transactionResponse.data,
    categoryMappingResponse.data,
    store_on_local_storage,
  ]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (data === null) {
      return;
    }
    if (store_on_local_storage) {
      localStorage.setItem("data", JSON.stringify(data));
    } else {
    }
  }, [data]);

  const handleUpdateData = (newData: Transaction[] | null, refetch = false) => {
    setData(newData);
    if (refetch) {
      void api.useUtils().transactions.getAll.invalidate();
    }
  };

  return (
    <DataContext.Provider
      value={{
        data: data,
        updateData: handleUpdateData,
        categories: categories ?? null,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
