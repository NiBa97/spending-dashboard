export enum ImportStatus {
  FILEUPLOAD = "FILEUPLOAD",
  COLUMNMAPPING = "COLUMNMAPPING",
  CATEGORYMAPPING = "CATEGORYMAPPING",
  COMPLETE = "COMPLETE",
}
import { createHash } from "crypto";
import { RouterOutputs, api } from "~/utils/api";

import moment from "moment";
export type Mapping =
  RouterOutputs["transactionCategoryMapping"]["getAll"][number];

export type Category = RouterOutputs["category"]["getAll"][number];

export class Transaction {
  private _Date: Date;
  private _Receiver: string;
  private _Usage: string;
  private _Amount: number;
  private _Category: Category | null;
  private _Hash: string;

  constructor({
    DateString,
    Receiver,
    Usage,
    Amount,
    Category,
  }: {
    DateString: string | Date;
    Receiver: string;
    Usage: string;
    Amount: number;
    Category: Category | null;
  }) {
    if (typeof DateString === "string") {
      this._Date = moment(DateString, [
        "YYYY-MM-DD",
        "DD/MM/YYYY",
        "DD.MM.YYYY",
      ])
        .startOf("day")
        .add(12, "hours")
        .toDate();
    } else {
      this._Date = DateString;
    }
    this._Receiver = Receiver;
    this._Usage = Usage;
    this._Amount = Amount;
    this._Category = Category;
    this._Hash = "";
    this.updateHash();
  }

  get Date() {
    return this._Date;
  }

  set Date(value: Date) {
    this._Date = value;
    this.updateHash();
  }

  get Hash() {
    return this._Hash;
  }

  get Receiver() {
    return this._Receiver;
  }

  set Receiver(value: string) {
    this._Receiver = value;
    this.updateHash();
  }

  get Usage() {
    return this._Usage;
  }

  set Usage(value: string) {
    this._Usage = value;
    this.updateHash();
  }

  get Amount() {
    return this._Amount;
  }

  set Amount(value: number) {
    this._Amount = value;
    this.updateHash();
  }

  get Category() {
    return this._Category;
  }

  set Category(value: Category | null) {
    this._Category = value;
    this.updateHash();
  }

  updateHash() {
    this._Hash = createHash("sha256")
      .update(
        JSON.stringify({
          name: this.Receiver,
          usage: this.Usage,
          amount: this.Amount,
          date: this.Date,
        }),
      )
      .digest("hex");
  }
}
