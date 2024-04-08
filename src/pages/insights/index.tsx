//Create a new page

import { Box, MenuItem, Select } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { DataContext } from "~/components/data_context";
import { Transaction } from "~/components/types";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const TotalSpendings = ({ transactions }: { transactions: Transaction[] }) => {
  //calculate the total amount spend, so to say aggregate all negative amounts
  const total = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  return <Box>Total spendings: {total}</Box>;
};

const TotalEarnings = ({ transactions }: { transactions: Transaction[] }) => {
  //calculate the total amount earned, so to say aggregate all positive amounts
  const total = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  return <Box>Total earnings: {total}</Box>;
};

const TotalTransactions = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  //calculate the total number of transactions
  return <Box>Total transactions: {transactions.length}</Box>;
};

const CategoryPieChart = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  //Create a plotly pie chart
  //Break down by using the category of each transaction, if no category is selected use "no category" as the category

  const data = transactions.reduce(
    (acc, transaction) => {
      if (transaction.amount > 0) return acc;
      const category = transaction.category?.name ?? "No category";
      if (acc[category]) {
        acc[category] += Math.abs(transaction.amount);
      } else {
        acc[category] = transaction.amount;
      }
      return acc;
    },
    {} as Record<string, number>,
  );
  const labels = Object.keys(data);
  const values = Object.values(data);
  console.log(data);
  //return the plotly pie chart
  return (
    <Box>
      <Plot
        data={[
          {
            values,
            labels,
            type: "pie",
          },
        ]}
        layout={{
          width: 800,
          height: 800,
          plot_bgcolor: "rgba(0,0,0,0)",
          paper_bgcolor: "rgba(0,0,0,0)",
        }}
        config={{ displayModeBar: false }}
      />
    </Box>
  );
};

//Create a plot to show the negative transactions per day, each bar should be colorized by its category
//The interval should be changeable by the user, for example dailoy, weekly, monthly, yearly
const NegativeTransactionsPerInterval = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const [interval, setInterval] = useState("daily");
  const [sampledTransactions, setSampledTransactions] = useState(transactions);
  console.log(sampledTransactions);
  useEffect(() => {
    const results = [];
    for (const transaction of transactions) {
      const date = new Date(transaction.date);
      if (transaction.amount > 0) continue; // Skip positive transactions

      if (interval === "weekly") {
        date.setDate(date.getDate() - date.getDay());
      } else if (interval === "monthly") {
        date.setDate(1);
      }
      results.push({ ...transaction, date });
    }

    setSampledTransactions(results);
  }, [interval]);

  const traces = sampledTransactions.reduce(
    (
      acc: Record<
        string,
        { x: Date[]; y: number[]; type: "bar"; name: string }
      >,
      transaction,
    ) => {
      const category = transaction.category?.name ?? "No category";
      const { x = [], y = [] } = acc[category] ?? {};

      return {
        ...acc,
        [category]: {
          x: [...x, transaction.date],
          y: [...y, transaction.amount * -1],
          type: "bar" as const,
          name: category,
        },
      };
    },
    {},
  );

  return (
    <>
      <Select
        value={interval}
        onChange={(event) => setInterval(event.target.value)}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </Select>

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
    </>
  );
};

const InsightsPage = () => {
  //get the data from the context
  const { data } = useContext(DataContext);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      Insights Page
      <TotalSpendings transactions={data} />
      <TotalEarnings transactions={data} />
      <TotalTransactions transactions={data} />
      <h3>Transactions per day</h3>
      <NegativeTransactionsPerInterval transactions={data} />
      <h3>Category Pie Chart</h3>
      <CategoryPieChart transactions={data} />
    </div>
  );
};
export default InsightsPage;
