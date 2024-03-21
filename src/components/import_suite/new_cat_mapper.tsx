import { useEffect, useMemo, useState } from "react";
import type { Transaction } from "../types";
import { api } from "~/utils/api";

import {
  apply_existing_mappings,
  get_next_group,
  groupAndSortTransactions,
  useUpdateTransactions,
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
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);
  const { data: all_mappings } =
    api.transactionCategoryMapping.getAll.useQuery();
  const updateTransactions = useUpdateTransactions();

  const [grouped_transactions, setGroupedTransactions] = useState(
    groupAndSortTransactions(data, 3),
  );
  const [currentTransactions, setCurrentTransactions] = useState<Transaction[]>(
    [],
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
      grouped_transactions[next_group]!.every(
        (transaction) => transaction.Category !== null,
      )
    ) {
      next_group = get_next_group(next_group, grouped_transactions);
    }

    if (next_group === undefined) {
      //flatten the grouped data
      let flattenedData: Transaction[] = [];
      Object.values(grouped_transactions).forEach((group) => {
        flattenedData = flattenedData.concat(group);
      });
      onNext(flattenedData);
    } else {
      setCurrentGroup(next_group);
      setCurrentTransactions(grouped_transactions[next_group]!);
    }
  }
  const groupNames = useMemo(
    () => Object.keys(grouped_transactions),
    [grouped_transactions],
  );
  return (
    <div className="">
      <h1>Group: {currentGroup} </h1>
      <h2>
        {currentGroup ? groupNames.indexOf(currentGroup) + 1 : 0} /{" "}
        {Object.keys(grouped_transactions).length}
      </h2>
      {currentGroup && (
        <div>
          <h1>test: {currentTransactions.length}</h1>
          <TransactionCategoryTable
            input_transactions={currentTransactions}
            onNext={(data: Transaction[]) => {
              setGroupedTransactions({
                ...grouped_transactions,
                [currentGroup]: data,
              });
              updateTransactions(data);

              setNextGroup();
            }}
          />
        </div>
      )}
    </div>
  );
}
