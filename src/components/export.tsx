import { useContext } from "react";
import { DataContext } from "./data_context";
import { type Transaction, type Category } from "./types";
const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
const convertTransactionArrayToCSV = (
  data: Transaction[],
  columns: (keyof Transaction)[],
) => {
  const csvRows = [
    columns.join(";"),
    ...data.map((row: Transaction) =>
      columns
        .map((column: keyof Transaction) =>
          column == "category" ? row[column]?.id : row[column],
        )
        .join(";"),
    ),
  ];

  return csvRows.join("\n");
};

const convertCategoryArrayToCSV = (
  data: Category[],
  columns: (keyof Category)[],
) => {
  const csvRows = [
    columns.join(";"),
    ...data.map((row: Category) =>
      columns.map((column: keyof Category) => row[column]).join(";"),
    ),
  ];

  return csvRows.join("\n");
};

export const ExportTransactions = () => {
  const { data: transactions } = useContext(DataContext);

  if (!transactions) return <div>No transaction to export...</div>;

  const handleExport = () => {
    const columns = [
      "date",
      "amount",
      "usage",
      "category",
      "receiver",
    ] as (keyof Transaction)[];
    const csv = convertTransactionArrayToCSV(transactions, columns);
    downloadCSV(csv, "transactions.csv");
  };

  return <button onClick={handleExport}>Export Transactions</button>;
};
export const ExportCategories = () => {
  const { categories } = useContext(DataContext);

  if (!categories) return <div>No categories to export...</div>;

  const handleExport = () => {
    const columns = ["name", "color", "id"] as (keyof Category)[];
    const csv = convertCategoryArrayToCSV(categories, columns);
    downloadCSV(csv, "categories.csv");
  };

  return <button onClick={handleExport}>Export Categories</button>;
};
