import { useContext, useEffect, useState } from "react";
import UploadComponent from "../../components/import_suite/uploader";
import { ColumnMapper } from "../../components/import_suite/columnmapper";
import { ImportStatus } from "../../components/types";
import type { Transaction } from "../../components/types";
import { DataContext } from "../../components/data_context";

import { useRouter } from "next/router";
export default function ImportSuite() {
  const [importState, setImportState] = useState(ImportStatus.FILEUPLOAD);

  const [imported_data, setImportedData] = useState<Record<string, string>[]>(
    [],
  );
  const [columnised_data, setColumnisedData] = useState<
    {
      date: Date;
      receiver: string;
      usage: string;
      amount: number;
    }[]
  >([]);
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
  const { handleCreateManyTransactions } = useContext(DataContext);

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
          onBack={() => setImportState(ImportStatus.COMPLETE)}
          onNext={(columnised_data) => {
            setImportState(ImportStatus.COMPLETE);
            setColumnisedData(columnised_data);
          }}
        />
      );
    case ImportStatus.COMPLETE:
      handleCreateManyTransactions(columnised_data)
        .then(() => {
          void router.push("/");

          setImportedData([]);
          setColumnisedData([]);
          setMappedData([]);
          setImportState(ImportStatus.FILEUPLOAD);
        })
        .catch((e) => console.error(e));
  }
}
