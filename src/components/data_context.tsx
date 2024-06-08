import { createContext, useEffect, useState } from "react";
import { type Category, type Transaction } from "./types";
import { api } from "~/utils/api";
import { set } from "lodash";
interface DataContextProps {
  data: Transaction[] | null;
  handleUpdateTransaction: (
    id: string,
    updatedFields: Partial<Transaction>,
  ) => Promise<void>;
  handleCreateTransaction: (transaction: Partial<Transaction>) => Promise<void>;
  handleCreateManyTransactions: (
    transactions: {
      date: Date;
      receiver: string;
      usage: string;
      amount: number;
    }[],
  ) => Promise<void>;
  handleDeleteTransaction: (id: string) => Promise<void>;
  handleUpdateTransactionCategory: (
    id: string,
    category: Category | null,
  ) => Promise<void>;
  categories: Category[] | null;
}

const defaultDataContextProps: DataContextProps = {
  data: null,
  handleUpdateTransaction: async () => {
    throw new Error("handleUpdateTransaction not implemented");
  },
  handleCreateTransaction: async () => {
    throw new Error("handleCreateTransaction not implemented");
  },
  handleCreateManyTransactions: async () => {
    throw new Error("handleCreateManyTransactions not implemented");
  },
  handleDeleteTransaction: async () => {
    throw new Error("handleDeleteTransaction not implemented");
  },
  handleUpdateTransactionCategory: async () => {
    throw new Error("handleUpdateTransactionCategory not implemented");
  },
  categories: null,
};

export const DataContext = createContext<DataContextProps>(
  defaultDataContextProps,
);

export const TransactionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [data, setData] = useState<Transaction[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);

  const { data: transactionsData } = api.transactions.getAll.useQuery();
  const { data: categoriesData } = api.category.getAll.useQuery();

  useEffect(() => {
    if (transactionsData) {
      setData(transactionsData);
    }
  }, [transactionsData]);

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);
  const { mutate: addMutation } = api.transactions.create.useMutation();
  const { mutate: deleteMutation } = api.transactions.delete.useMutation();
  const { mutate: createManyMutation } =
    api.transactions.createMany.useMutation();

  const handleCreateTransaction = async (transaction: Partial<Transaction>) => {
    if (
      !transaction.date ||
      !transaction.amount ||
      !transaction.receiver ||
      !transaction.usage
    ) {
      throw new Error("Missing fields!");
    }
    addMutation({
      date: transaction.date,
      amount: transaction.amount,
      receiver: transaction.receiver,
      usage: transaction.usage,
      categoryId: transaction.category?.id?.toString() ?? undefined,
    });
  };

  const handleCreateManyTransactions = async (
    transactions: {
      date: Date;
      receiver: string;
      usage: string;
      amount: number;
    }[],
  ) => {
    transactions.forEach((transaction, index) => {
      if (
        transaction.date === undefined ||
        transaction.amount === undefined ||
        transaction.receiver === undefined ||
        transaction.usage === undefined
      ) {
        console.log(transaction);
        throw new Error(`Missing fields in transaction at index ${index}!`);
      }
    });
    alert("Creating many transactions");
    console.log(transactions);
    return createManyMutation(
      transactions.map((transaction) => ({
        date: transaction.date,
        amount: transaction.amount,
        receiver: transaction.receiver,
        usage: transaction.usage,
      })),
    );
  };
  const handleDeleteTransaction = async (id: string) => {
    deleteMutation(id);
  };
  const { mutate: updateMutation } = api.transactions.update.useMutation();

  const handleUpdateTransaction = async (
    id: string,
    updatedFields: Partial<Transaction>,
  ) => {
    updateMutation({ id, data: updatedFields });
  };

  const { mutateAsync: updateCategoryMutation } =
    api.transactions.updateCategory.useMutation();

  const { mutateAsync: removeCategoryMutation } =
    api.transactions.removeTransactionCategory.useMutation();
  const handleUpdateTransactionCategory = async (
    id: string,
    category: Category | null,
  ) => {
    if (category === null) {
      await removeCategoryMutation({ id });
    } else {
      await updateCategoryMutation({ id, category: category });
    }
    //setData
    setData((prevData) => {
      if (!prevData) return prevData;
      const updatedData = [...prevData];
      const index = updatedData.findIndex(
        (transaction) => transaction.id === id,
      );
      if (index === -1) return prevData;
      set(updatedData, `${index}.category`, category);
      return updatedData;
    });
  };
  return (
    <DataContext.Provider
      value={{
        data: data,
        handleUpdateTransaction: handleUpdateTransaction, // eslint-disable-line @typescript-eslint/no-empty-function
        handleCreateTransaction: handleCreateTransaction,
        handleCreateManyTransactions: handleCreateManyTransactions,
        handleDeleteTransaction: handleDeleteTransaction,
        handleUpdateTransactionCategory: handleUpdateTransactionCategory,
        categories: categories ?? null,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
