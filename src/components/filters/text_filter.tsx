import { InputGroup, Icon, Input, InputLeftElement } from "@chakra-ui/react";
import React, { useImperativeHandle, forwardRef } from "react";
import { type IconType } from "react-icons";
import { FaSearch } from "react-icons/fa";

interface TextFilterComponentProps {
  textFilter: string;
  placeholder: string;
  setTextFilter: React.Dispatch<React.SetStateAction<string>>;
}

export const TextFilterComponent = forwardRef<
  { reset: () => void },
  TextFilterComponentProps
>(({ textFilter, placeholder, setTextFilter }, ref) => {
  useImperativeHandle(ref, () => ({
    reset() {
      setTextFilter("");
    },
  }));

  return (
    <InputGroup maxW="12rem">
      <InputLeftElement>
        <Icon as={FaSearch as IconType} fontSize={"20px"} />
      </InputLeftElement>
      <Input
        type="text"
        variant="filled"
        placeholder={placeholder}
        borderRadius={5}
        value={textFilter}
        onChange={(e) => setTextFilter(e.target.value)}
        size="md"
      />
    </InputGroup>
  );
});
