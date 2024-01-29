import React, { useState, useEffect } from "react";

export default function DummyComponent() {
  const static_columns = ["Date", "Name", "Usage", "Amount"];
  const static_categories = ["Food", "Transport", "Entertainment", "Other"];
  const [data, setData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [currentGroup, setCurrentGroup] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const rawData = JSON.parse(localStorage.getItem("mappedData"));
    setData(rawData);
    console.log(rawData);
    const groups = rawData.reduce((acc, curr) => {
      const name = curr.Name;
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(curr);
      return acc;
    }, {});

    setGroupedData(groups);
    setCurrentGroup(Object.keys(groups)[0]);
  }, []);

  const handleAssignCategory = (category, index = null) => {
    if (index === null) {
      // assign category to all transactions in the current group
      const updatedGroup = groupedData[currentGroup].map((transaction) => ({
        ...transaction,
        Category: category,
      }));
      setGroupedData((prev) => ({ ...prev, [currentGroup]: updatedGroup }));
    } else {
      // assign category to a single transaction in the current group
      const updatedGroup = [...groupedData[currentGroup]];
      updatedGroup[index].Category = category;
      setGroupedData((prev) => ({ ...prev, [currentGroup]: updatedGroup }));
    }
  };

  const [highlightUnassigned, setHighlightUnassigned] = useState(false);

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
        setCurrentGroup(groupNames[currentIndex + 1]);
        setCurrentIndex(currentIndex + 1);
      }
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
            {static_columns.map((column, index) => (
              <th key={index}>{column}</th>
            ))}
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {groupedData[currentGroup]?.map((transaction, index) => (
            <tr
              key={index}
              className={
                !transaction.Category && highlightUnassigned ? "bg-red-500" : ""
              }
            >
              {static_columns.map((column, i) => (
                <td key={i}>{transaction[column]}</td>
              ))}
              <td>
                <select
                  value={transaction.Category || ""}
                  onChange={(e) => handleAssignCategory(e.target.value, index)}
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
      <button
        className="mr-4 bg-black p-4"
        onClick={() => handleAssignCategory("Food")}
      >
        Assign 'Food' to all
      </button>
      <button className="bg-green-500 p-4" onClick={handleNextGroup}>
        Next group
      </button>
    </div>
  );
}
