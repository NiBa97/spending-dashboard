import type { Transaction } from "../types";
import _ from "lodash";
import { api } from "~/utils/api";

export function group_and_sort_transactions(
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
  currentGroup: string | null,
  groupedTransactions: Record<string, Transaction[]>,
) {
  const groupNames = Object.keys(groupedTransactions);
  if (currentGroup === null) {
    return groupNames[0];
  }
  // get the index of the current group, and return the value of the next index
  const currentIndex = groupNames.indexOf(currentGroup);
  console.log("currentIndex", currentIndex);
  if (currentIndex === groupNames.length - 1) {
    return undefined;
  }
  return groupNames[currentIndex + 1];
}

export function use_update_transactions() {
  const { mutate: transaction } = api.transactions.createMany.useMutation();

  function update_transactions(transactions: Transaction[]): Transaction[] {
    return transaction(
      transactions.map((transaction) => ({
        date: transaction.date,
        categoryId: transaction.category ? transaction.category.id : "",
        receiver: transaction.receiver,
        usage: transaction.usage,
        amount: transaction.amount,
      })),
    )! as Transaction[];
  }
  return update_transactions;
}
