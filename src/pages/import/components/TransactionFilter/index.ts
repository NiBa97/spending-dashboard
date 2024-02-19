import { useEffect, useState } from "react";

export default function TransactionFilter({
    data,
    onSubmit,
  }:{
    data: Transaction[];
    onSubmit: (data: Transaction[]) => void;
  })
{
    const [maxAmount, setMaxAmount] = useState<number>(5);
    const [maxOccurrence, setMaxOccurrence] = useState<number>(5);
    const [filteredData, setFilteredData] = useState<Transaction[]>([]);
    useEffect(() => {
      const occurrence: { [key: string]: number } = {};
  
      data.forEach((transaction) => {
        if (Math.abs(transaction.Amount) <= maxAmount) {
          occurrence[transaction.Name] = (occurrence[transaction.Name] || 0) + 1;
        }
      });
  
      setFilteredData(
        data.filter(
          (transaction) =>
            Math.abs(transaction.Amount) <= maxAmount &&
            (occurrence[transaction.Name] || 0) <= maxOccurrence,
        ),
      );
  
      console.log(filteredData);
    }, [maxAmount, maxOccurrence, data]);
  
    const submit = () => {
      //return the data without the filtered data
  
      const returnData = data.filter(
        (transaction) => !filteredData.includes(transaction),
      );
  
      onSubmit(returnData);
    };
    return (
      <div>
        <h2>Filter</h2>
        <div>
          <label>
            Minimal Amount:
            <input
              type="number"
              className="text-black"
              value={maxAmount}
              onChange={(e) => setMaxAmount(Number(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            Maximal Occurrence:
            <input
              type="number"
              className="text-black"
              value={maxOccurrence}
              onChange={(e) => setMaxOccurrence(Number(e.target.value))}
            />
          </label>
        </div>
        <table>
          <tbody>
            <tr>
              {Object.values(target_columns).map((column, index) => (
                <td key={index}>{column}</td>
              ))}
            </tr>
  
            {filteredData.map((row, index) => (
              <tr key={index}>
                {Object.values(target_columns).map((column, i) => (
                  <td key={i}>{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={submit}>Apply Filter</button>
      </div>
    );
}