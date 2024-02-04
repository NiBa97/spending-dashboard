import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { RouterOutputs, api } from "~/utils/api";
import crypto from "crypto";
import { check } from "prettier";

interface Transaction {
  Date: string;
  Name: string;
  Usage: string;
  Amount: number;
  Category?: string;
}

interface CSVData {
  [key: string]: string;
}
function groupAndSortTransactions(
  transactions: Transaction[],
  minCount: number,
): { [key: string]: Transaction[] } {
  // Group the transactions by name
  const grouped = _.groupBy(transactions, "Name");

  // Filter groups by member count and sort them
  const filteredGroups: { [key: string]: Transaction[] } = {};
  const otherGroup: Transaction[] = [];

  Object.entries(grouped).forEach(([key, value]) => {
    if (value.length >= minCount) {
      filteredGroups[key] = value;
    } else {
      otherGroup.push(...value);
    }
  });

  // Sort the groups by member count
  const sortedGroups = Object.entries(filteredGroups).sort(
    (a, b) => b[1].length - a[1].length,
  );
  // Add the "Other" group
  if (otherGroup.length > 0) {
    sortedGroups["Other"] = otherGroup;
  }
  // Convert back to an object
  const result: { [key: string]: Transaction[] } = {};
  sortedGroups.forEach(([key, value]) => {
    result[key] = value;
  });

  return result;
}

const updateTransactions = (transactions: Transaction[], mutate) => {
  //iterate through the transactions
  transactions.forEach((transaction) => {
    //check if the transaction has a category
    const hash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          name: transaction.Name,
          usage: transaction.Usage,
          amount: transaction.Amount,
          date: transaction.Date,
        }),
      )
      .digest("hex");
    // wait for the mutation to complete

    mutate({
      hash: hash,
      category: transaction.Category!,
    });
  });
};

const createCategoryMappingRule = (name: string, category: string, mutate) => {
  // Hash the name
  const hash = crypto.createHash("sha256").update(name).digest("hex");
  console.log("hash", hash);
  console.log("category", category);
  // Create the mapping rule
  mutate({
    hash: hash,
    category: category,
  });
};

function check_existing_mappings(data: any, all_mappings: any) {
  //check if all mappings data is available
  if (!all_mappings) {
    console.log("no mappings data");
    return data;
  }
  //iterate through each transaction in the current group
  //check if its hash value as an assigned category, if so, set it
  data.forEach((transaction: Transaction) => {
    const hash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          name: transaction.Name,
          usage: transaction.Usage,
          amount: transaction.Amount,
          date: transaction.Date,
        }),
      )
      .digest("hex");
    const mapping = all_mappings.find((mapping) => mapping.hash === hash);

    if (mapping) {
      transaction.Category = mapping.category;
    }
  });
  return data;
}

export default function CategoryMappingComponent() {
  const static_columns = ["Date", "Name", "Usage", "Amount"];
  const static_categories = ["Food", "Transport", "Entertainment", "Other"];
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: all_mappings } =
    api.transactionCategoryMapping.getAll.useQuery();
  const [groupedData, setGroupedData] = useState({});
  const [currentGroup, setCurrentGroup] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastClickedRow, setLastClickedRow] = useState(null);

  const [selectedRows, setSelectedRows] = useState([]);
  const groupNames = useMemo(() => Object.keys(groupedData), [groupedData]);

  const [createMappingRule, setCreateMappingRule] = useState(false);

  const [highlightUnassigned, setHighlightUnassigned] = useState(false);

  const { mutate, _mutatePost, mutateLoad } =
    api.transactionCategoryMapping.upsert.useMutation();

  const test = api.categoryMappingRule.upsert.useMutation();
  useEffect(() => {
    // Perform localStorage action
    let transactions_from_local_storage = JSON.parse(
      localStorage.getItem("data")!,
    );

    // Check existing mappings and apply them
    transactions_from_local_storage = check_existing_mappings(
      transactions_from_local_storage,
      all_mappings,
    );

    // Group and sort transactions
    const data = groupAndSortTransactions(transactions_from_local_storage, 3);

    // Set grouped data
    setGroupedData(data);

    // Set current group to the first one
    const groupNames = Object.keys(data);
    setCurrentGroup(groupNames[0]);
  }, [all_mappings]);

  const handleSingleAssignCategory = (category, index = null) => {
    console.log("category", category);
    if (index === null) {
      setGroupedData((prev) => ({ ...prev, [currentGroup]: updatedGroup }));
    } else {
      // assign category to a single transaction in the current group
      const updatedGroup = [...groupedData[currentGroup]];
      updatedGroup[index].Category = category;
      setGroupedData((prev) => ({ ...prev, [currentGroup]: updatedGroup }));
    }
  };

  const handleMultipleAssignCategory = (category: string) => {
    let updatedGroup = [];
    //check if currentGroup is empty
    console.log("currentGroup", currentGroup);

    //check if there are any selected rows
    if (selectedRows.length === 0) {
      //if no rows are selected, assign category to all transactions in the current group
      updatedGroup = groupedData[currentGroup].map((transaction) => {
        return { ...transaction, Category: category };
      });
      if (createMappingRule) {
        createCategoryMappingRule(currentGroup, category, test.mutate);
      }
    } else {
      //if rows are selected, assign category to all selected transactions
      updatedGroup = groupedData[currentGroup].map((transaction) => {
        if (selectedRows.includes(transaction)) {
          return { ...transaction, Category: category };
        }
        return transaction;
      });
    }
    setGroupedData((prev) => ({ ...prev, [currentGroup]: updatedGroup }));
  };

  const handleNextGroup = () => {
    const groupNames = Object.keys(groupedData);
    const currentIndex = groupNames.indexOf(currentGroup);
    const currentGroupData = groupedData[currentGroup];
    // Check if there are any unassigned transactions in the current group
    const unassignedTransactions = currentGroupData.filter(
      (transaction) => !transaction.Category,
    );

    if (unassignedTransactions.length > 0) {
      // If there are unassigned transactions, set highlightUnassigned to true
      setHighlightUnassigned(true);
    } else {
      // If there are no unassigned transactions, move to the next group
      setHighlightUnassigned(false);
      if (currentIndex < groupNames.length - 1) {
        updateTransactions(currentGroupData, mutate);

        setCurrentGroup(groupNames[currentIndex + 1]);
        setCurrentIndex(currentIndex + 1);
      } else {
        console.log("all groups have been processed");
      }
    }
  };

  // Function to handle checkbox change
  const handleCheckboxChange = (event, index) => {
    if (event.nativeEvent.shiftKey && lastClickedRow !== null) {
      const start = Math.min(lastClickedRow, index);
      const end = Math.max(lastClickedRow, index);
      const newSelectedRows = [...selectedRows];
      for (let i = start; i <= end; i++) {
        newSelectedRows[i] = groupedData[currentGroup][i];
      }
      setSelectedRows(newSelectedRows);
    } else {
      if (!selectedRows.includes(groupedData[currentGroup][index])) {
        setSelectedRows((prev) => [...prev, groupedData[currentGroup][index]]);
      } else {
        setSelectedRows((prev) =>
          prev.filter((t) => t !== groupedData[currentGroup][index]),
        );
      }
      setLastClickedRow(index);
    }
  };

  return (
    <div className="text-white">
      <h1>Group: {currentGroup}</h1>
      <h2>
        {currentIndex + 1} /{Object.keys(groupedData).length - 1}
      </h2>
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
          {groupedData[currentGroup]?.map((transaction, index) => (
            <tr
              key={index}
              className={
                (!transaction.Category && highlightUnassigned
                  ? "bg-red-500"
                  : "") +
                (selectedRows.includes(groupedData[currentGroup][index])
                  ? "bg-green-500"
                  : "")
              }
              onClick={(event) => handleCheckboxChange(event, index)}
            >
              <td>
                <input
                  type="checkbox"
                  onChange={(event) => handleCheckboxChange(event, index)}
                  checked={selectedRows.includes(
                    groupedData[currentGroup][index],
                  )}
                />
              </td>
              {static_columns.map((column, i) => (
                <td key={i}>{transaction[column]}</td>
              ))}
              <td>
                <select
                  value={transaction.Category || ""}
                  onChange={(e) =>
                    handleSingleAssignCategory(e.target.value, index)
                  }
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
      <input
        type="checkbox"
        checked={createMappingRule}
        onChange={(e) => setCreateMappingRule(e.target.checked)}
        placeholder="Create mapping rule"
      />
      <label htmlFor="create_mapping_rule">Create mapping rule</label>
      <button
        className="mr-4 bg-black p-4"
        onClick={() => handleMultipleAssignCategory(selectedCategory)}
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
