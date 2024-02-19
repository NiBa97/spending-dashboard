import { createContext, useState } from "react";
import { Transaction } from "./import_suite/types";

interface DataContextProps {
  data: Transaction[];
  setData: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export const DataContext = createContext<DataContextProps>({
  undefined,
} as any);
