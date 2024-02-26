import { createContext } from "react";
import type { Transaction } from "./types";

interface DataContextProps {
  data: Transaction[] | null;
  setData: React.Dispatch<React.SetStateAction<Transaction[] | null>>;
}

export const DataContext = createContext<DataContextProps>({
  data: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setData: () => {}, // set setData to an empty function by default
});
