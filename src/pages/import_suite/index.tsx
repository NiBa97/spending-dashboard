import { useContext, useEffect, useState } from "react";
import UploadComponent from "./uploader";
import { ColumnMapper } from "./columnmapper";
import { ImportStatus, Transaction } from "./types";
import { DataContext } from "../data_context";
import { CategoryMapper } from "./new_cat_mapper";

import { useRouter } from "next/router";
export default function ImportSuite() {
  const [importState, setImportState] = useState(ImportStatus.FILEUPLOAD);

  const [imported_data, setImportedData] = useState<any>({});
  const [columnised_data, setColumnisedData] = useState<Transaction[]>([]);
  const [mapped_data, setMappedData] = useState<Transaction[]>([]);

  //Check if the filepath is set as query param
  const router = useRouter();
  const { transactions } = router.query;
  useEffect(() => {
    if (transactions) {
      console.log("transactions", transactions);
      if (typeof transactions !== "string") {
        return;
      }
      setImportedData(JSON.parse(transactions));
      setImportState(ImportStatus.COLUMNMAPPING);
    }
  }, [transactions]);
  // get the DataContext from the app
  const { data, setData } = useContext(DataContext);

  switch (importState) {
    case ImportStatus.FILEUPLOAD:
      return (
        <UploadComponent
          onNext={(raw_data: File[]) => {
            router.push(
              {
                pathname: "/import_suite",
                query: { transactions: JSON.stringify(raw_data) },
              },
              "/import_suite",
            );
          }}
        />
      );
    case ImportStatus.COLUMNMAPPING:
      return (
        <ColumnMapper
          data={imported_data}
          onBack={() => setImportState(ImportStatus.FILEUPLOAD)}
          onNext={(columnised_data) => {
            setImportState(ImportStatus.CATEGORYMAPPING);
            setColumnisedData(columnised_data);
          }}
        />
      );
    case ImportStatus.CATEGORYMAPPING:
      return (
        <CategoryMapper
          data={columnised_data}
          onBack={() => setImportState(ImportStatus.COLUMNMAPPING)}
          onNext={(mapped_data) => {
            console.log("received data from component", mapped_data);

            setMappedData(mapped_data);
            setImportState(ImportStatus.COMPLETE);
          }}
        />
      );
    case ImportStatus.COMPLETE:
      //append the new data to the existing data
      if (data === undefined) {
        setData(mapped_data);
      } else {
        setData([...data, ...mapped_data]);
      }
      //setting data
      router.push("/");
      //reset all the states
      setImportedData([]);
      setColumnisedData([]);
      setMappedData([]);
      setImportState(ImportStatus.FILEUPLOAD);
  }
}
