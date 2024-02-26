export enum ImportStatus {
  FILEUPLOAD = "FILEUPLOAD",
  COLUMNMAPPING = "COLUMNMAPPING",
  CATEGORYMAPPING = "CATEGORYMAPPING",
  COMPLETE = "COMPLETE",
}
import { RouterOutputs, api } from "~/utils/api";

export type Mapping =
  RouterOutputs["transactionCategoryMapping"]["getAll"][number];

export type Category = RouterOutputs["category"]["getAll"][number];

export interface Transaction {
  Date: string;
  Name: string;
  Usage: string;
  Amount: number;
  Category: Category | null;
}
