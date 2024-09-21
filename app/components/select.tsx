import {
  Button,
  ComboBox,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Section,
  Text,
} from "react-aria-components";
import { useSearchParams } from "@remix-run/react";
import React from "react";
import { enumAlertType } from "../routes/logs.interface";
import { MyComboBox } from "./comboBox";

export function AlertSelector() {
  const [searchParams, setSearchParams] = useSearchParams();

  const options = React.useMemo(
    () => Object.entries(enumAlertType).map(([id, name]) => ({ id, name })),
    []
  );

  const [selectedAlert, setSelectedAlert] = React.useState<string>(
    searchParams.get("alert") ?? ""
  );

  return (
    <MyComboBox
      label="Select an alert"
      isRequired
      onInputChange={(value) => {
        setSelectedAlert(value);
        setSearchParams({ alert: value });
      }}
    >
      {options.map(({ id, name }) => (
        <MyComboBox.Item key={id} id={id} value={{ id, name }}>
          {name}
        </MyComboBox.Item>
      ))}
    </MyComboBox>
  );
}
