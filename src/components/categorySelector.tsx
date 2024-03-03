import {
  Box,
  Button,
  Divider,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
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
const CategoryDisplay = ({ category }: { category: Category }) => {
  return (
    <Box key={category.id} display="flex" alignItems="baseline">
      <Box
        width="10px"
        height="10px"
        backgroundColor={category.color ?? "black"}
        borderRadius="50%"
        mr="2"
      />
      <Text>{category.name}</Text>
    </Box>
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
    void mutate(
      { name: data.name as string, color: data.color as string },
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
          color="gray.900"
          as={Button}
          rightIcon={<FaChevronDown />}
        >
          {selectedCategory ? (
            <CategoryDisplay category={selectedCategory} />
          ) : (
            "Select Category"
          )}
        </MenuButton>
        <MenuList>
          {categories?.map((category) => (
            <MenuItem onClick={() => onChange(category)} key={category.id}>
              <CategoryDisplay category={category} />
            </MenuItem>
          ))}

          <MenuDivider />
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
