import { useState } from "react";
import { Transaction } from "../types";
const target_columns = ["Date", "Name", "Usage", "Amount"];

export function ColumnMapper({
  data,
  onNext,
  onBack,
}: {
  data: Record<string, string>[];
  onNext: (data: Transaction[]) => void;
  onBack: () => void;
}) {
  const [selectedColumns, setSelectedColumns] = useState<
    Record<string, string>
  >({
    Date: "Buchung",
    Receiver: "Auftraggeber/Empf�nger",
    Usage: "Verwendungszweck",
    Amount: "Betrag",
  });
  if (data === undefined) {
    alert("No file uploaded");
    onBack();
  }
  const columns = Object.keys(data);
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
          !selectedColumns.Date ||
          !selectedColumns.Receiver ||
          !selectedColumns.Usage ||
          !row[selectedColumns.Amount!]
        ) {
          return null;
        } else {
          let receiver = row[selectedColumns.Receiver];
          if (receiver === undefined || receiver === "") {
            receiver = "Unknown";
          }
          const newRow = new Transaction({
            DateString: row[selectedColumns.Date]!,
            Receiver: receiver,
            Usage: row[selectedColumns.Usage]!,
            Amount: parseFloat(
              row[selectedColumns.Amount!]!.replace(".", "").replace(",", "."),
            ),
            Category: null,
          });
          console.log("newRow", newRow);
          return newRow;
        }
      })
      .filter((item): item is Transaction => item !== null);
    onNext(mappedData);
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
}
