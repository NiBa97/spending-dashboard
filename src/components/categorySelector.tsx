import {
  Box,
  Button,
  Flex,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import type { Category } from "./types";
import { api } from "~/utils/api";
import { type FieldValues, useForm } from "react-hook-form";
import { DataContext } from "./data_context";

import { SketchPicker } from "react-color";
const CategoryDisplay = ({ category }: { category: Category }) => {
  return (
    <Flex key={category.id} justifyItems={"center"} alignItems={"center"}>
      <Box
        width="12px"
        height="12px"
        borderRadius="50%"
        backgroundColor={category.color ?? "black"}
        marginRight={1}
      />
      <Text>{category.name}</Text>
    </Flex>
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
  const [color, setColor] = useState("");

  const { register, handleSubmit, reset } = useForm();
  const utils = api.useUtils();
  const onSubmit = (data: FieldValues) => {
    void mutate(
      { name: data.name as string, color: color },
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
        <MenuButton h="100%" w="100%" textAlign="left" p={1.5} color="gray.900">
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
            <ModalHeader>Create Category</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex className="items-center">
                <Popover>
                  <PopoverTrigger>
                    <Button bg={color} marginRight={4}>
                      {color}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent width={"fit-content"}>
                    <SketchPicker
                      color={color}
                      onChange={(color) => setColor(color.hex)}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  {...register("name")}
                  placeholder="Category Name"
                  required
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
