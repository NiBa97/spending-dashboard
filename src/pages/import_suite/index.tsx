import { Reducer, useContext, useEffect, useReducer, useState } from "react";
import UploadComponent from "../../components/import_suite/uploader";
import { ColumnMapper } from "../../components/import_suite/columnmapper";
import { ImportStatus } from "../../components/types";
import type { Transaction } from "../../components/types";
import { DataContext } from "../../components/data_context";

import { useRouter } from "next/router";
import { set } from "lodash";
import { BreadcrumbLink } from "@chakra-ui/react";
export default function ImportSuite() {
  interface MyState {
    importState: ImportStatus;
    imported_data: Record<string, string>[];
    columnised_data: {
      date: Date;
      receiver: string;
      usage: string;
      amount: number;
    }[];
  }

  const [state, setState] = useReducer<Reducer<MyState, Partial<MyState>>>(
    (state, newState) => ({ ...state, ...newState }),
    {
      columnised_data: [],
      imported_data: [],
      importState: ImportStatus.FILEUPLOAD,
    },
  );

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
        setState({
          imported_data: transactions,
          importState: ImportStatus.COLUMNMAPPING,
        });
      }
    }
  }, [transactions]);
  // get the DataContext from the app
  const { handleCreateManyTransactions } = useContext(DataContext);

  switch (state.importState) {
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
          data={state.imported_data}
          onBack={() => console.log("back")}
          onNext={(columnised_data) => {
            handleCreateManyTransactions(columnised_data)
              .then(() => {
                // setImportedData([]);
                // setColumnisedData([]);
                // setMappedData([]);
                // setImportState(ImportStatus.FILEUPLOAD);

                //void router.push("/");
                alert("Successfully imported data!");
              })

              .catch((e) => console.error(e));
            setState({ importState: ImportStatus.FILEUPLOAD });
          }}
        />
      );
  }
}
