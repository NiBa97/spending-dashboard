export enum ImportStatus {
  FILEUPLOAD = "FILEUPLOAD",
  COLUMNMAPPING = "COLUMNMAPPING",
  CATEGORYMAPPING = "CATEGORYMAPPING",
  COMPLETE = "COMPLETE",
}
import { type RouterOutputs } from "~/utils/api";

export type Category = RouterOutputs["category"]["getAll"][number];

export type Transaction = RouterOutputs["transactions"]["getAll"][number];
export interface Filter {
  id: string;
  value: string[] | number[];
}
