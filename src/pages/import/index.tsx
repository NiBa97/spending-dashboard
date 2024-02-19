import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useContext,
} from "react";
import Papa from "papaparse";
import { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";
import { DataContext } from "../data_context";
interface Transaction {
  Date: string;
  Name: string;
  Usage: string;
  Amount: number;
}

const target_columns = ["Date", "Name", "Usage", "Amount"];

export default function Page() {
  const [columns, setColumns] = useState<Array<string>>([]);

  const [rawRata, setRawData] = useState<CSVData | undefined>(undefined);
  const { data, setData } = useContext(DataContext)!;

  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: function (results: Papa.ParseResult<any>) {
        setColumns(results.meta.fields); // get the column names
        setRawData(results.data); // get the first 5 rows
        console.log("step0");
        console.log(results.data);
        setCurrentStep(1);
      },
    });
  };

  const onSubmit = (data: Transaction[]) => {
    console.log("step2");
    console.log(data);
    setData(data);
    setCurrentStep(2);
  };

  const onFilterSubmit = (data: Transaction[]) => {
    localStorage.setItem("data", JSON.stringify(data)); // save the mapped data in local storage
    setData(data);
    setCurrentStep(3);
  };
  return (
    <div className="text-white">
      <h1 className="color-white">CSV</h1>
      {currentStep === 0 && <UploadComponent onFileUpload={handleFileUpload} />}
      {currentStep === 1 && (
        <MapColumnsComponent data={rawRata!} onSubmit={onSubmit} />
      )}
      {
        currentStep === 2 && (
          <FilterComponent data={data} onSubmit={onFilterSubmit} />
        )
        //
      }
      {currentStep === 3 && <CategoryMappingComponent data={data} />}
    </div>
  );
}
