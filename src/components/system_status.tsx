import React from "react";
import { Text, Icon, Flex } from "@chakra-ui/react";
import { FaExclamationCircle, FaTimesCircle } from "react-icons/fa";
import { type IconType } from "react-icons";

const SystemStatus = ({ date }: { date: Date }) => {
  const now = new Date();
  const iconComponent: IconType = FaExclamationCircle as IconType;
  FaTimesCircle as IconType;

  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays < 30) {
    return <></>;
  }

  return (
    <Flex
      p={3}
      my={3}
      bg={"yellow.500"}
      borderRadius="md"
      color={"white"}
      justifyContent={"space-between"}
      alignContent={"center"}
    >
      <Flex>
        <Icon
          as={iconComponent}
          color={"white"}
          boxSize={6}
          display={"inline"}
          mr={2}
        />
        <Text fontSize="lg" display={"inline"}>
          {"System status is getting old"}
        </Text>
      </Flex>
      <Text fontSize="sm">
        Last imported transaction is {diffInDays} days old.
      </Text>
    </Flex>
  );
};

export default SystemStatus;
