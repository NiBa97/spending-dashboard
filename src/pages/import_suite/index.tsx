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

  const [transactions, setTransactions] = useState<
    Record<string, string>[] | null
  >(null);
  //Check if the filepath is set as query param
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const localData = localStorage.getItem("raw_data");
      if (localData === null) {
        return;
      }
      setTransactions(JSON.parse(localData) as Record<string, string>[]);
    }
  }, []);

  useEffect(() => {
    if (transactions !== null) {
      if (
        Array.isArray(transactions) &&
        transactions.every((item) => typeof item === "object")
      ) {
        setImportedData(transactions);
        setImportState(ImportStatus.COLUMNMAPPING);
      }
    }
  }, [transactions]);
  // get the DataContext from the app
  const { data, updateData: setData } = useContext(DataContext);

  switch (importState) {
    case ImportStatus.FILEUPLOAD:
      return (
        <UploadComponent
          onNext={(raw_data: Record<string, string>[]) => {
            if (router.pathname === "/import_suite") {
              setTransactions(raw_data);
            } else {
              localStorage.setItem("raw_data", JSON.stringify(raw_data));
              void router.push(
                {
                  pathname: "/import_suite",
                },
                "/import_suite",
              );
            }
          }}
        />
      );
    case ImportStatus.COLUMNMAPPING:
      //reset the local storage
      localStorage.removeItem("raw_data");
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
            setMappedData(mapped_data);
            setImportState(ImportStatus.COMPLETE);
          }}
        />
      );
    case ImportStatus.COMPLETE:
      //append the new data to the existing data
      if (data === null) {
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
