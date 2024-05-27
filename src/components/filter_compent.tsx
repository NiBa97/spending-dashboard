import FilterPopover from "~/components/transaction_table/FilterPopover";
import {
  Box,
  Text,
  SimpleGrid,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderTrack,
  RangeSliderThumb,
  RangeSliderThumbProps,
  useRangeSliderContext,
} from "@chakra-ui/react";
import { Transaction } from "~/components/types";
import { useState, useEffect } from "react";

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

export const FilterComponent = ({
  data,
  setDataSelection,
}: {
  data: Transaction[];
  setDataSelection: React.Dispatch<React.SetStateAction<Transaction[]>>;
}) => {
  const [columnFilters, setColumnFilters] = useState<
    { id: string; value: string[] }[]
  >([]);
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
    oldestTransaction.date.getTime(),
    newestTransaction.date.getTime(),
  ]);
  const refreshDataSelection = () => {
    const filterStatuses =
      columnFilters.find((f) => f.id === "category")?.value ?? [];
    const result = data.filter((transaction) => {
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
  useEffect(() => {
    refreshDataSelection();
  }, [rangeValue, columnFilters]);
  return (
    <SimpleGrid
      border={"solid 1px black"}
      borderRadius={5}
      paddingY={30}
      paddingX={30}
      columns={2}
    >
      <Box marginBottom={5}>
        <Text fontWeight={"bold"}>Category filter:</Text>
        <FilterPopover
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
      </Box>
      <Box>
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
    </SimpleGrid>
  );
};
