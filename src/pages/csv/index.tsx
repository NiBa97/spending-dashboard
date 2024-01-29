import React, { useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/router";

export default function Page() {
  const [columns, setColumns] = useState<Array<string>>([]);
  const [selectedColumns, setSelectedColumns] = useState<{
    [key: string]: string;
  }>({});
  const [data, setData] = useState<Array<any>>([]);

  const router = useRouter();
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];
    Papa.parse(file, {
      header: true,
      complete: function (results) {
        setColumns(results.meta.fields); // get the column names
        setData(results.data); // get the first 5 rows
      },
    });
  };

  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { value, name } = event.target;
    setSelectedColumns((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    const mappedData = data.map((row) => {
      const newRow: { [key: string]: any } = {};
      Object.entries(selectedColumns).forEach(([key, value]) => {
        newRow[key] = row[value];
      });
      return newRow;
    });
    localStorage.setItem("mappedData", JSON.stringify(mappedData)); // save the mapped data in local storage

    router.push(
      {
        pathname: "/csv/mapping",
        query: { data: JSON.stringify(mappedData) },
      },
      "/csv/mapping",
    );
  };

  return (
    <div className="text-white">
      <h1 className="color-white">CSV</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <div>
        {["Date", "Name", "Usage", "Amount"].map((item, index) => (
          <div key={index}>
            <label htmlFor={`dropdown-${index}`}>{item}</label>
            <select
              id={`dropdown-${index}`}
              name={item}
              onChange={handleDropdownChange}
            >
              <option value="">Select column</option>
              {columns.map((column, i) => (
                <option key={i} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {selectedColumns && (
        <table>
          <tr>
            {Object.values(selectedColumns).map((column, index) => (
              <th key={index}>{column}</th>
            ))}
          </tr>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(selectedColumns).map((column, i) => (
                <td key={i}>{row[column]}</td>
              ))}
            </tr>
          ))}
        </table>
      )}

      <button onClick={handleConfirm}>Confirm</button>
    </div>
  );
}
