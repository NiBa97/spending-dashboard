import React, { useState, useCallback, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";
interface Transaction {
  Date: string;
  Name: string;
  Usage: string;
  Amount: number;
}

interface CSVData {
  [key: string]: string;
}

const CategoryMappingComponent = ({ data }: { data: Transaction[] }) => {
  const static_columns = ["Date", "Name", "Usage", "Amount"];
  const static_categories = ["Food", "Transport", "Entertainment", "Other"];

  const [groupedData, setGroupedData] = useState({});
  const [currentGroup, setCurrentGroup] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Group data by name
    const groups = data.reduce((acc, curr) => {
      console.log(curr);
      if (!curr) {
        return acc;
      }
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
  const columns = useMemo(
    () => [
      {
        Header: "Date",
        accessor: "Date", // accessor is the "key" in the data
      },
      {
        Header: "Name",
        accessor: "Name",
      },
      {
        Header: "Usage",
        accessor: "Usage",
      },
      {
        Header: "Amount",
        accessor: "Amount",
      },
      {
        Header: "Category",
        accessor: "Category",
      },
    ],
    [],
  );

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
};

const UploadComponent = ({
  onFileUpload,
}: {
  onFileUpload: (file: File) => void;
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Do something with the files
      onFileUpload(acceptedFiles[0]!);
    },
    [onFileUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`border-4 border-dashed ${
        isDragActive ? "border-blue-500" : "border-gray-500"
      } flex cursor-pointer items-center justify-center p-4`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
    </div>
  );
};

const target_columns = ["Date", "Name", "Usage", "Amount"];

const MapColumnsComponent = ({
  data,
  onSubmit,
}: {
  data: CSVData[];
  onSubmit: (data: Transaction[]) => void;
}) => {
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

const FilterComponent = ({
  data,
  onSubmit,
}: {
  data: Transaction[];
  onSubmit: (data: Transaction[]) => void;
}) => {
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
};

export default function Page() {
  const [columns, setColumns] = useState<Array<string>>([]);

  const [data, setData] = useState<CSVData[] | undefined>(undefined);
  const [parsedData, setParsedData] = useState<Array<any>>([]);

  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: function (results: Papa.ParseResult<any>) {
        setColumns(results.meta.fields); // get the column names
        setData(results.data); // get the first 5 rows
        console.log("step0");
        console.log(results.data);
        setCurrentStep(1);
      },
    });
  };

  const onSubmit = (data: Transaction[]) => {
    console.log("step2");
    console.log(data);
    setParsedData(data);
    setCurrentStep(2);
  };

  const onFilterSubmit = (data: Transaction[]) => {
    localStorage.setItem("data", JSON.stringify(data)); // save the mapped data in local storage
    setParsedData(data);
    setCurrentStep(3);
  };
  return (
    <div className="text-white">
      <h1 className="color-white">CSV</h1>
      {currentStep === 0 && <UploadComponent onFileUpload={handleFileUpload} />}
      {currentStep === 1 && (
        <MapColumnsComponent data={data!} onSubmit={onSubmit} />
      )}
      {
        currentStep === 2 && (
          <FilterComponent data={parsedData} onSubmit={onFilterSubmit} />
        )
        //
      }
      {currentStep === 3 && <CategoryMappingComponent data={parsedData} />}
    </div>
  );
}
