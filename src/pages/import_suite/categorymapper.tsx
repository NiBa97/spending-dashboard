import { Transaction } from "./types";
import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import crypto from "crypto";
import type { Mapping } from "./types";
import { api } from "~/utils/api";

export function CategoryMapper({
  data,
  onNext,
  onBack,
}: {
  data: Transaction[];
  onNext: (data: Transaction[]) => void;
  onBack: () => void;
}) {
  const static_columns = ["Date", "Name", "Usage", "Amount"];
  const static_categories = ["Food", "Transport", "Entertainment", "Other"];

  const { data: all_mappings } =
    api.transactionCategoryMapping.getAll.useQuery();
  const [groupedData, setGroupedData] = useState({});
  const [currentGroup, setCurrentGroup] = useState(null);

  const groupNames = useMemo(() => Object.keys(groupedData), [groupedData]);

  return (
    <div className="text-white">
      <h1>Group: {currentGroup} </h1>
      <h2>
        {groupNames.indexOf(currentGroup!) + 1} /{" "}
        {Object.keys(groupedData).length}
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
