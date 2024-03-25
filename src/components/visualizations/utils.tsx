import { Transaction } from "../types";

export function getTransactionsAmountByCategory(
  transactions: Transaction[],
  categoryName: string,
  isPositive: boolean,
): number {
  let totalAmount = 0;
  transactions.forEach((transaction) => {
    if (transaction.Category && transaction.Category.name === categoryName) {
      totalAmount += isPositive ? transaction.Amount : -transaction.Amount;
    }
  });
  return totalAmount;
}
// Write a function that takes a list of transactions and a category name and returns the amount for each category
// use the getTransactionsAmountByCategory function, and set isPositive by the mean of the transaction amount
export function getTransactionsAmountByCategoryList(
  transactions: Transaction[],
): { name: string; amount: number }[] {
  const categories = transactions.reduce((acc, transaction) => {
    if (transaction.Category) {
      acc.add(transaction.Category.name);
    }
    return acc;
  }, new Set<string>());

  return Array.from(categories).map((category) => ({
    name: category,
    amount: getTransactionsAmountByCategory(
      transactions,
      category,
      transactions.reduce((acc, transaction) => acc + transaction.Amount, 0) >
        0,
    ),
  }));
}
