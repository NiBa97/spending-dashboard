import { useEffect, useMemo, useState } from "react";
import type { Transaction } from "../types";
import { api } from "~/utils/api";

import {
  apply_existing_mappings,
  get_next_group,
  groupAndSortTransactions,
} from "./transaction_utils";
import TransactionCategoryTable from "./new_transaction_category_table";
export function CategoryMapper({
  data,
  onNext, // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBack,
}: {
  data: Transaction[];
  onNext: (data: Transaction[]) => void;
  onBack: () => void;
}) {
  const [currentGroup, setCurrentGroup] = useState("");
  const { data: all_mappings } =
    api.transactionCategoryMapping.getAll.useQuery();

  const [grouped_transactions, setGroupedTransactions] = useState(
    groupAndSortTransactions(data, 3),
  );

  useEffect(() => {
    if (!all_mappings) {
      return;
    }
    const updatedGroupedTransactions = apply_existing_mappings(
      grouped_transactions,
      all_mappings,
    );
    setGroupedTransactions(updatedGroupedTransactions);
    setNextGroup();
  }, [all_mappings]);

  function setNextGroup() {
    if (Object.keys(grouped_transactions).length === 0) {
      return;
    }
    //Check if the current group is the last group
    let next_group = get_next_group(currentGroup, grouped_transactions);

    while (
      next_group &&
      grouped_transactions[currentGroup]!.every(
        (transaction) => transaction.Category !== undefined,
      )
    ) {
      next_group = get_next_group(currentGroup, grouped_transactions);
    }

    if (!next_group) {
      alert("all groups have been processed!!");
      console.log("goruped transactions", grouped_transactions);
      //flatten the grouped data
      let flattenedData: Transaction[] = [];
      Object.values(grouped_transactions).forEach((group) => {
        flattenedData = flattenedData.concat(group);
      });
      onNext(flattenedData);
    } else {
      setCurrentGroup(next_group);
    }
  }
  const groupNames = useMemo(
    () => Object.keys(grouped_transactions),
    [grouped_transactions],
  );
  return (
    <div className="text-white">
      <h1>Group: {currentGroup} </h1>
      <h2>
        {groupNames.indexOf(currentGroup) + 1} /{" "}
        {Object.keys(grouped_transactions).length}
      </h2>
      {grouped_transactions[currentGroup] && (
        <TransactionCategoryTable
          input_transactions={grouped_transactions[currentGroup]!}
          onNext={(data: Transaction[]) => {
            setGroupedTransactions({
              ...grouped_transactions,
              [currentGroup]: data,
            });
            setNextGroup();
          }}
        />
      )}
    </div>
  );
}
