import React from "react";
import { Box, Text, HStack, Icon } from "@chakra-ui/react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { IconType } from "react-icons";

const SystemStatus = ({ date }: { date: Date | undefined }) => {
  const now = new Date();
  let message = "Invalid date";
  let color = "red.500";
  let iconComponent: IconType = FaTimesCircle as IconType;

  if (date) {
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays <= 7) {
      message = "System is up to date";
      color = "green.500";
      iconComponent = FaCheckCircle as IconType;
    } else if (diffInDays <= 30) {
      message = "System status is getting old";
      color = "yellow.500";
      iconComponent = FaExclamationCircle as IconType;
    }
  } else {
    message = "System status is outdated";
  }

  return (
    <HStack
      spacing={3}
      p={3}
      border="1px"
      borderColor={color}
      borderRadius="md"
    >
      <Icon as={iconComponent} color={color} boxSize={6} />
      <Box>
        <Text fontSize="lg" color={color}>
          {message}
        </Text>
        {date && <Text fontSize="sm">Date: {date.toDateString()}</Text>}
      </Box>
    </HStack>
  );
};

export default SystemStatus;
