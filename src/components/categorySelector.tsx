import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import type { Category } from "./types";
import { api } from "~/utils/api";
import { type FieldValues, useForm } from "react-hook-form";
import { DataContext } from "./data_context";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import InputColor from "react-input-color";

const CategoryDisplay = ({ category }: { category: Category }) => {
  return (
    <div key={category.id}>
      <Box
        width="50px"
        height="50px"
        backgroundColor={category.color ?? "black"}
      />
      <Text>{category.name}</Text>
      <Text>{category.color}</Text>
    </div>
  );
};

export default function CategorySelector({
  selectedCategory,
  onChange,
}: {
  selectedCategory: Category | null;
  onChange: (category: Category) => void;
}) {
  const [open, setOpen] = useState(false);
  const { categories } = useContext(DataContext);

  const { mutate } = api.category.create.useMutation();
  const [color, setColor] = useState({ hex: "#000000" });

  const { register, handleSubmit, reset } = useForm();
  const utils = api.useUtils();
  const onSubmit = (data: FieldValues) => {
    void mutate(
      { name: data.name as string, color: color.hex as string },
      {
        onSuccess: (newCategory: Category) => {
          //invalidate the get all query
          utils.category.getAll
            .invalidate()
            .then(() => {
              onChange(newCategory);
              reset();
              setOpen(false);
            })
            .catch(console.error);
        },
      },
    );
  };

  return (
    <div>
      <Menu isLazy offset={[0, 0]} flip={false} autoSelect={false}>
        <MenuButton
          h="100%"
          w="100%"
          textAlign="left"
          p={1.5}
          bg={selectedCategory?.color ?? "transparent"}
          color="gray.900"
        >
          {selectedCategory?.name ?? "Select Category"}
        </MenuButton>
        <MenuList>
          {categories?.map((category) => (
            <MenuItem onClick={() => onChange(category)} key={category.id}>
              <CategoryDisplay category={category} />
            </MenuItem>
          ))}
          <MenuItem onClick={() => setOpen(true)}>Add New</MenuItem>
        </MenuList>
      </Menu>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Modal Title</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex className="items-center">
                <InputColor
                  initialValue={""}
                  onChange={(value) => setColor(value)}
                  className="mr-1 !h-6 !w-6"
                />
                <Input
                  placeholder="Category Name"
                  {...register("name", { required: true })}
                />
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button type="submit">Save</Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </div>
  );
}
