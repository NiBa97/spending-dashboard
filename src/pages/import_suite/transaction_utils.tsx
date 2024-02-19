import { Mapping, Transaction } from "./types";
import _ from "lodash";
import { createHash } from "crypto";
import { api } from "~/utils/api";
export function apply_existing_mappings(data: any, all_mappings: Mapping[]) {
  //check if all mappings data is available
  if (data === undefined || all_mappings === undefined) {
    return data;
  }
  console.log("data", data);

  //iterate through each transaction in the current group
  //check if its hash value as an assigned category, if so, set it
  // data contains the grouped transactions
  //iterate through all groups and each transaction in that group
  //iterate ofver all keys inside the data dict
  Object.keys(data).forEach((key) => {
    data[key].forEach((transaction: Transaction) => {
      const hash = createHash("sha256")
        .update(
          JSON.stringify({
            name: transaction.Name,
            usage: transaction.Usage,
            amount: transaction.Amount,
            date: transaction.Date,
          }),
        )
        .digest("hex");
      const mapping = all_mappings.find((mapping) => mapping.hash === hash);

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
): { [key: string]: Transaction[] } {
  // Group the transactions by name
  const grouped = _.groupBy(transactions, "Name");

  // Filter groups by member count and sort them
  const filteredGroups: { [key: string]: Transaction[] } = {};
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
  const result: { [key: string]: Transaction[] } = {};
  sortedGroups.forEach(([key, value]) => {
    result[key] = value;
  });

  return result;
}

export function get_next_group(
  current_group: string,
  grouped_transactions: { [key: string]: Transaction[] },
) {
  if (current_group === null) {
    // get the first group
    console.log("return", Object.keys(grouped_transactions)[0]);
    return Object.keys(grouped_transactions)[0];
  }
  const groupNames = Object.keys(grouped_transactions);

  return groupNames.find(
    (group, index) => group === current_group && index < groupNames.length - 1,
  );
}

export function updateTransactions(transactions: Transaction[]) {
  const { mutate } = api.transactionCategoryMapping.upsert.useMutation();
  transactions.forEach((transaction) => {
    //check if the transaction has a category
    const hash = createHash("sha256")
      .update(
        JSON.stringify({
          name: transaction.Name,
          usage: transaction.Usage,
          amount: transaction.Amount,
          date: transaction.Date,
        }),
      )
      .digest("hex");

    mutate({
      hash: hash,
      category: transaction.Category!,
    });
  });
}
