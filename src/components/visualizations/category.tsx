import dynamic from "next/dynamic";
import { Transaction } from "../types";
import { getTransactionsAmountByCategoryList } from "./utils";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
export function CategoryPlotly({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const groupedTransactions = getTransactionsAmountByCategoryList(transactions);

  // Create a pie chart using Plotly

  const data = [
    {
      values: groupedTransactions.map((group) => group.amount),
      labels: groupedTransactions.map((group) => group.name),
      type: "pie" as const,
    },
  ];

  const layout = {
    height: 400,
    width: 400,
  };

  return <Plot data={data} layout={layout} />;
}
