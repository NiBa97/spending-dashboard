import { Transaction } from "~/components/types";
import { Box, Text } from "@chakra-ui/react";

export const TotalSpendings = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  //calculate the total amount spend, so to say aggregate all negative amounts
  const total = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  return <Box>Total spendings: {Math.abs(total)}</Box>;
};

export const TotalEarnings = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  //calculate the total amount earned, so to say aggregate all positive amounts
  const total = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  return <Box>Total earnings: {total}</Box>;
};

export const TotalDiff = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const total = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0,
  );
  // Add a green or a red icon infront
  return (
    <Box>
      Total difference{" "}
      <Text as="span" color={total > 0 ? "green" : "white"} fontWeight={"bold"}>
        {total}
      </Text>
    </Box>
  );
};

export const TotalTransactions = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  //calculate the total number of transactions
  return (
    <Box>
      Total transactions: <br />
      {transactions.length}
    </Box>
  );
};
