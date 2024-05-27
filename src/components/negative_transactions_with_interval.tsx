//Create a plot to show the negative transactions per day, each bar should be colorized by its category

import {
  Menu,
  Heading,
  Box,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

import { Transaction } from "~/components/types";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
interface Trace {
  x: string[];
  y: number[];
  type: "bar";
  name: string;
  marker: { color: string };
}

function transactions_to_traces(
  sampledTransactions: {
    category: { name: string; color: string; id: string } | null;
    date: Date;
    id: string;
    receiver: string;
    usage: string;
    amount: number;
  }[],
): Record<string, Trace> {
  const traces_data: Record<string, Trace> = sampledTransactions.reduce(
    (trans_traces: Record<string, Trace>, transaction) => {
      const category = transaction.category?.name ?? "No category";
      const date = transaction.date.toISOString();
      if (!trans_traces[category]) {
        trans_traces[category] = {
          x: [],
          y: [],
          type: "bar",
          name: category,
          marker: { color: transaction.category?.color ?? "black" },
        };
      }

      //Check if date is already in x array and get the index of the value
      const index = trans_traces[category]!.x.indexOf(date);
      if (index === -1) {
        trans_traces[category]!.x.push(date);
        trans_traces[category]!.y.push(transaction.amount * -1);
      } else {
        trans_traces[category]!.y[index] += transaction.amount * -1;
      }

      return trans_traces;
    },
    {},
  );
  return traces_data;
}
export const NegativeTransactionsPerInterval = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const [interval, setInterval] = useState("day");
  const [sampledTransactions, setSampledTransactions] = useState(transactions);
  useEffect(() => {
    const results = [];
    for (const transaction of transactions) {
      const date = new Date(transaction.date);
      if (transaction.amount > 0) continue; // Skip positive transactions

      if (interval === "week") {
        date.setDate(date.getDate() - date.getDay());
      } else if (interval === "month") {
        date.setDate(1);
      }
      results.push({ ...transaction, date });
    }

    setSampledTransactions(results);
  }, [interval, transactions]);

  const traces = transactions_to_traces(sampledTransactions);

  //Group transactions by category
  const categorized_transactions = transactions.reduce(
    (acc, transaction) => {
      if (transaction.amount > 0) return acc;

      const category = transaction.category?.name ?? "No category";
      const amount = Math.abs(transaction.amount);
      const color = transaction.category?.color ?? "black";

      if (acc[category]) {
        acc[category]!.amount += amount;
        acc[category]!.color = color; // Assuming the color of the last transaction is used
      } else {
        acc[category] = { amount, color };
      }

      return acc;
    },
    {} as Record<string, { amount: number; color: string }>,
  );

  console.log(categorized_transactions);

  return (
    <>
      <Menu>
        <Heading>
          Transactions per{" "}
          <MenuButton
            as={Button}
            textTransform={"capitalize"}
            rightIcon={<FaChevronDown />}
          >
            {interval}
          </MenuButton>
        </Heading>
        <MenuList>
          <MenuItem onClick={() => setInterval("day")}>Day</MenuItem>
          <MenuItem onClick={() => setInterval("week")}>Week</MenuItem>
          <MenuItem onClick={() => setInterval("month")}>Month</MenuItem>
        </MenuList>
      </Menu>

      <Plot
        data={Object.values(traces)}
        layout={{
          autosize: true,
          plot_bgcolor: "rgba(0,0,0,0)",
          paper_bgcolor: "rgba(0,0,0,0)",
          barmode: "stack",
          xaxis: { fixedrange: true },
          yaxis: { fixedrange: true },
        }}
        config={{ displayModeBar: false }}
        style={{ width: "100%", height: "100%" }}
      />

      <SimpleGrid columns={5} gap={4}>
        {Object.entries(categorized_transactions).map(([category, summary]) => (
          <Box
            key={category}
            bg={summary.color}
            color="white"
            p={4}
            borderRadius="md"
            textAlign="center"
            position="relative"
            minH="50px"
          >
            <Text
              fontSize="sm"
              bg="rgba(0, 0, 0, 0.5)"
              borderRadius="md"
              p={1}
              top={2}
              marginBottom={1}
            >
              {category}
            </Text>
            <Text fontSize="2xl" mt={4}>
              €{summary.amount.toFixed(2)}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </>
  );
};
