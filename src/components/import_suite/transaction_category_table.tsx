import { useState } from "react";
import { Transaction } from "../types";

const static_columns = ["Date", "Name", "Usage", "Amount"];

const static_categories = ["Food", "Transport", "Entertainment", "Other"];
export default function TransactionCategoryTable({
  input_transactions,
  onNext,
}: {
  input_transactions: Transaction[];
  onNext: (data: Transaction[]) => void;
}) {
  //Create a new state for the transactions to allow rerendering
  const [transactions, setTransactions] = useState(input_transactions);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [lastClickedRow, setLastClickedRow] = useState<number | undefined>(
    undefined,
  );
  const [highlightUnassigned, setHighlightUnassigned] = useState(false);

  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);

  const handleAssignCategory = (
    category: string,
    index: number | undefined,
  ) => {
    const updatedTransactions = transactions.map((transaction, i) => {
      if (selectedRows.length != 0 && selectedRows.includes(transaction)) {
        return { ...transaction, Category: category };
      } else if (i === index) {
        return { ...transaction, Category: category };
      } else {
        return transaction;
      }
    });
    setTransactions(updatedTransactions);
  };

  const handleCheckboxChange = (event: React.MouseEvent, index: number) => {
    if (event.nativeEvent.shiftKey && lastClickedRow !== undefined) {
      const start = Math.min(lastClickedRow, index);
      const end = Math.max(lastClickedRow, index);
      const newSelectedRows = [...selectedRows];
      for (let i = start; i <= end; i++) {
        newSelectedRows[i] = transactions[i]!;
      }
      setSelectedRows(newSelectedRows);
    } else {
      if (!selectedRows.includes(transactions[index]!)) {
        setSelectedRows((prev) => [...prev, transactions[index]!]);
      } else {
        unCheckRow(index);
      }
      setLastClickedRow(index);
    }
  };

  const unCheckRow = (index: number) => {
    if (selectedRows.includes(transactions[index]!)) {
      setSelectedRows((prev) => prev.filter((t) => t !== transactions[index]));
    }
  };

  const handleNextGroup = () => {
    // Check if there are any unassigned transactions in the current group
    const unassignedTransactions = transactions.filter(
      (transaction) => !transaction.Category,
    );
    unassignedTransactions.length > 0
      ? setHighlightUnassigned(true)
      : (setHighlightUnassigned(false), onNext(transactions));
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th></th>
            {static_columns.map((column, index) => (
              <th key={index}>{column}</th>
            ))}
            <th>Category</th>
          </tr>
        </thead>
        <tbody className="select-none">
          {transactions.map((transaction, index) => (
            <tr
              key={index}
              className={
                (!transaction.Category && highlightUnassigned
                  ? "bg-red-500"
                  : "") +
                (selectedRows.includes(transaction) ? "bg-green-500" : "")
              }
              onClick={(event) => handleCheckboxChange(event, index)}
            >
              <td>
                <input
                  type="checkbox"
                  onChange={(event) => unCheckRow(index)}
                  checked={selectedRows.includes(transaction)}
                />
              </td>

              <td>
                <select
                  value={transaction.Category ?? ""}
                  onChange={(e) => handleAssignCategory(e.target.value, index)}
                  className="text-black"
                >
                  <option value="">Select category</option>
                  {static_categories.map((category, i) => (
                    <option key={i} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="bg-red-500 p-4" onClick={() => setSelectedRows([])}>
        Clear selection
      </button>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="text-black"
      >
        <option value="">Select category</option>
        {static_categories.map((category, i) => (
          <option key={i} value={category}>
            {category}
          </option>
        ))}
      </select>

      <button
        className="mr-4 bg-black p-4"
        onClick={() => handleAssignCategory(selectedCategory, undefined)}
      >
        Assign '{selectedCategory}' to{" "}
        {selectedRows && selectedRows.length > 0
          ? selectedRows.length + " rows"
          : "all"}
      </button>
      <button className="bg-green-500 p-4" onClick={handleNextGroup}>
        Next group
      </button>
    </div>
  );
}
