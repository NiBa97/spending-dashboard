import {
  Box,
  Button,
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
import { FieldValues, useForm } from "react-hook-form";
import { DataContext } from "./data_context";

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

  const { register, handleSubmit, reset } = useForm();
  const utils = api.useUtils();
  const onSubmit = (data: FieldValues) => {
    mutate(
      { name: data.name, color: data.color },
      {
        onSuccess: (newCategory: Category) => {
          // Handle the new category here
          console.log(newCategory);
          //invalidate the get all query
          utils.category.getAll.invalidate();
          onChange(newCategory);
          reset();
          setOpen(false);
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
              <Input
                placeholder="Category Name"
                {...register("name", { required: true })}
              />
              <Input
                placeholder="Category Color"
                {...register("color", { required: true })}
              />
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
