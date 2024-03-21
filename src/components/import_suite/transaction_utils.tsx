import type { Mapping, Transaction } from "../types";
import _, { update } from "lodash";
import { api } from "~/utils/api";

export function apply_existing_mappings(
  data: Record<string, Transaction[]>,
  all_mappings: Mapping[],
) {
  //check if all mappings data is available
  if (data === undefined || all_mappings === undefined) {
    return data;
  }

  //iterate through each transaction in the current group
  //check if its hash value as an assigned category, if so, set it
  // data contains the grouped transactions
  //iterate through all groups and each transaction in that group
  //iterate ofver all keys inside the data dict
  Object.keys(data).forEach((key) => {
    data[key]!.forEach((transaction: Transaction) => {
      const mapping = all_mappings.find(
        (mapping) => mapping.hash === transaction.Hash,
      );

      if (mapping) {
        transaction.Category = mapping.category;
      }
    });
  });
  return data;
}
export function groupAndSortTransactions(
  transactions: Transaction[],
  minCount: number,
): Record<string, Transaction[]> {
  // Group the transactions by name
  const grouped = _.groupBy(transactions, "Receiver");
  // Filter groups by member count and sort them
  const filteredGroups: Record<string, Transaction[]> = {};
  const otherGroup: Transaction[] = [];

  Object.entries(grouped).forEach(([key, value]) => {
    if (value.length >= minCount) {
      filteredGroups[key] = value;
    } else {
      otherGroup.push(...value);
    }
  });

  // Sort the groups by member count
  const sortedGroups = Object.entries(filteredGroups).sort(
    (a, b) => b[1].length - a[1].length,
  );
  // Add the "Other" group
  if (otherGroup.length > 0) {
    sortedGroups.push(["Other", otherGroup]);
  }
  // Convert back to an object
  const result: Record<string, Transaction[]> = {};
  sortedGroups.forEach(([key, value]) => {
    result[key] = value;
  });

  return result;
}

export function get_next_group(
  current_group: string | null,
  grouped_transactions: Record<string, Transaction[]>,
) {
  const groupNames = Object.keys(grouped_transactions);
  if (current_group === null) {
    return groupNames[0];
  }
  // get the index of the current group, and return the value of the next index
  const currentIndex = groupNames.indexOf(current_group);
  console.log("currentIndex", currentIndex);
  if (currentIndex === groupNames.length - 1) {
    return undefined;
  }
  return groupNames[currentIndex + 1];
}

export function useUpdateTransactions() {
  const { mutate: mapping } =
    api.transactionCategoryMapping.upsert.useMutation();
  const { mutate: transaction } = api.transactions.createMany.useMutation();

  function updateTransactions(transactions: Transaction[]) {
    transaction(
      transactions.map((transaction) => ({
        date: transaction.Date,
        hash: transaction.Hash,
        categoryId: transaction.Category ? transaction.Category.id : "",
        receiver: transaction.Receiver,
        usage: transaction.Usage,
        amount: transaction.Amount,
      })),
    );
    return;
    transactions.forEach((transaction) => {
      //check if the transaction has a category
      const hash = transaction.Hash;

      mapping({
        hash: hash,
        categoryID: transaction.Category!.id,
      });
    });
  }
  return updateTransactions;
}
