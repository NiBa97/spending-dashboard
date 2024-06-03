import { Transaction } from "~/components/types";
import {
  Box,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/react";

export const TotalSpendings = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  //calculate the total amount spend, so to say aggregate all negative amounts
  const total = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  return (
    <Stat>
      <StatLabel>Total spendings</StatLabel>
      <StatNumber>{Math.abs(total).toFixed(2)}€</StatNumber>
    </Stat>
  );
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
  return (
    <Stat>
      <StatLabel>Total earnings</StatLabel>
      <StatNumber>{total.toFixed(2)}€</StatNumber>
    </Stat>
  );
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
    <Stat>
      <StatLabel>Total difference</StatLabel>
      <StatNumber>
        <StatArrow type={total > 0 ? "increase" : "decrease"} mt={-1} ml={2} />
        {Math.abs(total).toFixed(2)}€
      </StatNumber>
    </Stat>
  );
};

export const TotalTransactions = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  if (transactions.length === 0) {
    return <Box>No transactions found</Box>;
  }

  //calculate the total number of transactions
  return (
    <Stat>
      <StatLabel>Total transactions</StatLabel>
      <StatNumber>{transactions.length}</StatNumber>
    </Stat>
  );
};
