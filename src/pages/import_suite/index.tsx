import { useContext, useEffect, useState } from "react";
import UploadComponent from "../../components/import_suite/uploader";
import { ColumnMapper } from "../../components/import_suite/columnmapper";
import { ImportStatus } from "../../components/types";
import type { Transaction } from "../../components/types";
import { DataContext } from "../../components/data_context";
import { CategoryMapper } from "../../components/import_suite/new_cat_mapper";

import { useRouter } from "next/router";
export default function ImportSuite() {
  const [importState, setImportState] = useState(ImportStatus.FILEUPLOAD);

  const [imported_data, setImportedData] = useState<Record<string, string>[]>(
    [],
  );
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
      const parsed_transactions = JSON.parse(transactions) as Record<
        string,
        string
      >[];
      if (
        Array.isArray(parsed_transactions) &&
        parsed_transactions.every((item) => typeof item === "object")
      ) {
        setImportedData(parsed_transactions);
        setImportState(ImportStatus.COLUMNMAPPING);
      }
    }
  }, [transactions]);
  // get the DataContext from the app
  const { data, setData } = useContext(DataContext);

  switch (importState) {
    case ImportStatus.FILEUPLOAD:
      return (
        <UploadComponent
          onNext={(raw_data: object) => {
            void router.push(
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
      void router.push("/");
      //reset all the states
      setImportedData([]);
      setColumnisedData([]);
      setMappedData([]);
      setImportState(ImportStatus.FILEUPLOAD);
  }
}
