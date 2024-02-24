import { createContext } from "react";
import type { Transaction } from "./import_suite/types";

interface DataContextProps {
  data: Transaction[] | undefined;
  setData: React.Dispatch<React.SetStateAction<Transaction[] | undefined>>;
}

export const DataContext = createContext<DataContextProps>({
  data: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setData: () => {}, // set setData to an empty function by default
});
