import type {
  ComboBoxProps,
  ListBoxItemProps,
  ValidationResult,
} from "react-aria-components";
import { Button, ComboBox, FieldError, Group, Input, Label, ListBox, ListBoxItem, Popover, Text } from "react-aria-components";

interface MyComboBoxProps<T extends object>
  extends Omit<ComboBoxProps<T>, "children"> {
  label?: string;
  description?: string | null;
  errorMessage?: string | ((validation: ValidationResult) => string);
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function MyComboBox<T extends object>({
  label,
  description,
  errorMessage,
  children,
  ...props
}: MyComboBoxProps<T>) {
  return (
    <ComboBox {...props} className="group flex flex-col gap-1 w-[200px]">
      <Label>{label}</Label>
      <Group className="flex rounded-lg bg-white bg-opacity-90 focus-within:bg-opacity-100 transition shadow-md ring-1 ring-black/10 focus-visible:ring-2 focus-visible:ring-black">
        <Input className="flex-1 w-full border-none py-2 px-3 leading-5 text-gray-900 bg-transparent outline-none text-base" />
        <Button className="px-3 flex items-center text-gray-700 transition border-0 border-solid border-l border-l-sky-200 bg-transparent rounded-r-lg pressed:bg-sky-100">
          ▼
        </Button>
      </Group>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="max-h-60 w-[--trigger-width] overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black/5 entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out">
        <ListBox className="outline-none p-1">{children}</ListBox>
      </Popover>
    </ComboBox>
  );
}

function MyItem(props: ListBoxItemProps) {
  return (
    <ListBoxItem
      {...props}
      className="group flex items-center gap-2 cursor-default select-none py-2 pl-2 pr-4 outline-none rounded text-gray-900 focus:bg-sky-600 focus:text-white selected:
      "
    />
  );
}

MyComboBox.Item = MyItem;