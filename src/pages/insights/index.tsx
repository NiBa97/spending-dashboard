import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderThumbProps,
  RangeSliderTrack,
  Select,
  Spacer,
  Text,
  useRangeSliderContext,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { DataContext } from "~/components/data_context";
import { Filter, Transaction } from "~/components/types";
import dynamic from "next/dynamic";
import TransactionTable from "~/components/transaction_table/TransactionTable";
import { Heading } from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa";
import FilterPopover from "~/components/transaction_table/FilterPopover";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const TotalSpendings = ({ transactions }: { transactions: Transaction[] }) => {
  //calculate the total amount spend, so to say aggregate all negative amounts
  const total = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  return <Box>Total spendings: {Math.abs(total)}</Box>;
};

const TotalEarnings = ({ transactions }: { transactions: Transaction[] }) => {
  //calculate the total amount earned, so to say aggregate all positive amounts
  const total = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  return <Box>Total earnings: {total}</Box>;
};

const TotalDiff = ({ transactions }: { transactions: Transaction[] }) => {
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

  //for each date and category, group all the transaction amounts on the traces

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
    </>
  );
};
const RangeSliderThumbWithHint = (props: RangeSliderThumbProps) => {
  const { state } = useRangeSliderContext();
  return (
    <RangeSliderThumb {...props}>
      <Box
        top={-8}
        pos="absolute"
        h={6}
        minWidth={4}
        px={2}
        borderRadius={8}
        bg="gray.100"
        border="1px solid"
        borderColor="gray.200"
        pointerEvents="none"
        transition="opacity 200ms ease-out"
        sx={{
          ".chakra-slider__thumb:not([data-active]):not(:hover) > &": {
            opacity: 0,
          },
        }}
      >
        {new Date(state.value[props.index]!).toLocaleDateString()}
      </Box>
    </RangeSliderThumb>
  );
};
const InsightsPage = () => {
  //get the data from the context
  const { data } = useContext(DataContext);
  const [dataSelection, setDataSelection] = useState(data);
  if (!data || !dataSelection) {
    return <div>Loading...</div>;
  }

  const oldestTransaction = data.reduce((acc, transaction) => {
    if (!acc || transaction.date < acc.date) {
      return transaction;
    }
    return acc;
  });

  const newestTransaction = data.reduce((acc, transaction) => {
    if (!acc || transaction.date > acc.date) {
      return transaction;
    }
    return acc;
  });

  const [rangeValue, setRangeValue] = useState([
    //find the first date in the data, but keep in mind that the data is not sorted
    oldestTransaction.date.getTime(),
    newestTransaction.date.getTime(),
  ]);

  const refreshDataSelection = () => {
    const filterStatuses =
      columnFilters.find((f) => f.id === "category")?.value ?? [];
    console.log("Filter", filterStatuses);
    const result = data.filter((transaction) => {
      //check if the date is in the range
      //then check if the category is selected
      const date = new Date(transaction.date);
      const date_fit =
        rangeValue === undefined ||
        (date.getTime() >= rangeValue[0]! && date.getTime() <= rangeValue[1]!);
      const category = transaction.category?.id ?? "null";
      const category_fit =
        filterStatuses.length === 0 || filterStatuses.includes(category);
      return date_fit && category_fit;
    });
    setDataSelection(result);
  };

  const [columnFilters, setColumnFilters] = useState<Filter[]>([]);
  useEffect(() => {
    refreshDataSelection();
  }, [rangeValue, columnFilters]);
  const { handleDeleteTransaction, handleUpdateTransactionCategory } =
    useContext(DataContext);
  return (
    <div>
      <Heading>Insights Page</Heading>
      <Flex>
        <Box>
          <Text as="span" fontWeight={"bold"}>
            Date range:{" "}
          </Text>
          <Text as="span">{new Date(rangeValue[0]!).toLocaleDateString()}</Text>{" "}
          -{" "}
          <Text as="span">{new Date(rangeValue[1]!).toLocaleDateString()}</Text>
          <TotalTransactions transactions={dataSelection} />
          <TotalSpendings transactions={dataSelection} />
          <TotalEarnings transactions={dataSelection} />
          <TotalDiff transactions={dataSelection} />
        </Box>
        <Spacer></Spacer>
        <Box
          border={"solid 1px black"}
          borderRadius={5}
          paddingY={30}
          paddingX={30}
          w="60%"
        >
          <Box marginBottom={5}>
            <Text fontWeight={"bold"}>Category filter:</Text>
            <FilterPopover
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
            />
          </Box>
          <Text marginBottom={10} fontWeight={"bold"}>
            Date range:
          </Text>
          <RangeSlider
            aria-label={["min", "max"]}
            min={oldestTransaction.date.getTime()}
            max={newestTransaction.date.getTime()}
            defaultValue={rangeValue}
            onChangeEnd={(val) => setRangeValue(val)}
            datatype="date"
          >
            <Box position={"absolute"} left={"0"} top={25}>
              {oldestTransaction.date.toLocaleDateString()}
            </Box>
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumbWithHint index={0}>
              <Text marginTop={-50} align={"right"}></Text>
            </RangeSliderThumbWithHint>
            <RangeSliderThumbWithHint index={1}></RangeSliderThumbWithHint>
            <Box right={0} position={"absolute"} top={25}>
              {newestTransaction.date.toLocaleDateString()}
            </Box>
          </RangeSlider>
        </Box>
      </Flex>
      <NegativeTransactionsPerInterval transactions={dataSelection} />
      <Heading>Category Pie Chart</Heading>
      <CategoryPieChart transactions={dataSelection} />
      <Heading>Table</Heading>
      <TransactionTable
        data={dataSelection}
        handleDeleteTransaction={async (id) => {
          await handleDeleteTransaction(id);
          refreshDataSelection();
        }}
        handleUpdateTransactionCategory={async (id, category) => {
          await handleUpdateTransactionCategory(id, category);
          refreshDataSelection();
        }}
      />
    </div>
  );
};
export default InsightsPage;
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
interface Trace {
  x: string[];
  y: number[];
  type: "bar";
  name: string;
  marker: { color: string };
}
