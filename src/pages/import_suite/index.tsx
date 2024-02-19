import { useContext, useState } from "react";
import UploadComponent from "./uploader";
import { ColumnMapper } from "./columnmapper";
import { ImportStatus, Transaction } from "./types";
import { DataContext } from "../data_context";
import { CategoryMapper } from "./new_cat_mapper";

export default function ImportSuite() {
  const [importState, setImportState] = useState(ImportStatus.FILEUPLOAD);

  const [imported_data, setImportedData] = useState<any>({});
  const [columnised_data, setColumnisedData] = useState<Transaction[]>([]);
  const [mapped_data, setMappedData] = useState<Transaction[]>([]);

  // get the DataContext from the app
  const { data, setData } = useContext(DataContext);

  switch (importState) {
    case ImportStatus.FILEUPLOAD:
      return (
        <UploadComponent
          onNext={(raw_data: File[]) => {
            setImportState(ImportStatus.COLUMNMAPPING);
            setImportedData(raw_data);
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
      setData([...data, ...mapped_data]);
      //setting data
      console.log("data", data);
      //reset all the states
      setImportedData([]);
      setColumnisedData([]);
      setMappedData([]);
      setImportState(ImportStatus.FILEUPLOAD);
  }
}
