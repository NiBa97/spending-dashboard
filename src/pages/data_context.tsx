import { createContext, useState } from "react";
import { Transaction } from "./import_suite/types";

interface DataContextProps {
  data: Transaction[] | undefined;
  setData: React.Dispatch<React.SetStateAction<Transaction[] | undefined>>;
}

export const DataContext = createContext<DataContextProps>({
  undefined,
} as any);
