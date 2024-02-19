import { useState } from "react";

export default function ColumnMapper({
    data,
    onSubmit,
  }: {
    data: CSVData;
    onSubmit: (data: Transaction[]) => void;
  }) {
    const [selectedColumns, setSelectedColumns] = useState<{
      [key: string]: string;
    }>({
      Date: "Buchung",
      Name: "Auftraggeber/Empf�nger",
      Usage: "Verwendungszweck",
      Amount: "Betrag",
    });
    const columns = Object.keys(data[0]!);
    const handleDropdownChange = (
      event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
      const { value, name } = event.target;
      setSelectedColumns((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = () => {
        const mappedData: Transaction[] = data
          .map((row) => {
            if (
              !selectedColumns["Date"] ||
              !selectedColumns["Name"] ||
              !selectedColumns["Usage"] ||
              !row[selectedColumns["Amount"]!]
            ) {
              return null;
            } else {
              console.log(row);
              const newRow: Transaction = {
                Date: row[selectedColumns["Date"]!]!,
                Name: row[selectedColumns["Name"]!]!,
                Usage: row[selectedColumns["Usage"]!]!,
                Amount: parseFloat(
                  row[selectedColumns["Amount"]!]!.replace(".", "").replace(
                    ",",
                    ".",
                  ),
                ),
              };
              return newRow;
            }
          })
          .filter((item): item is Transaction => item !== null);
        onSubmit(mappedData);
      };
      return (
        <div>
          {target_columns.map((item, index) => (
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
          {selectedColumns && (
            <table>
              <tr>
                {Object.values(selectedColumns).map((column, index) => (
                  <th key={index}>{column}</th>
                ))}
              </tr>
              {data.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  {Object.values(selectedColumns).map((column, i) => (
                    <td key={i}>{row[column]}</td>
                  ))}
                </tr>
              ))}
            </table>
          )}
    
          <button onClick={handleSubmit}>Submit</button>
        </div>
      );
    };