import { Button, ComboBox, FieldError, Input, Label, ListBox, ListBoxItem, Popover, Section, Text } from 'react-aria-components';
import { useSearchParams } from '@remix-run/react';
import React from 'react';
import { enumAlertType } from '../routes/logs.interface';

export function AlertSelector() {
    const [searchParams, setSearchParams] = useSearchParams();

    const options = React.useMemo(
        () => Object.entries(enumAlertType).map(([id, name]) => ({ id, name })),
        []
    );

    const [selectedAlert, setSelectedAlert] = React.useState<string>(searchParams.get('alert')?? '');

    return (
        <ComboBox
            onSelectionChange={(selection) => {
                setSelectedAlert(selection?.toString() ?? selectedAlert);
                setSearchParams({ alert: selection?.toString() ?? selectedAlert });
            }}
            inputValue={selectedAlert}
        >
            <Label
                className="text-black"
            > Bleeper</Label>
            <div>
                <Input className="bg-white min-w-[180px] text-black" />
                <Button
                    className="text-black"
                >▼</Button>
            </div>
            <Text slot="description" />
            <FieldError />
            <Popover
                className="bg-white z-[999] text-green-900 border-grey-300 shadow-lg  display-block min-w-[180px] flex-col "
            >
                <ListBox>
                    {options.map(({ id, name }) => (
                        <ListBoxItem
                            key={id}
                            id={id}
                            value={{ id, name }}
                            textValue={name}
                        >
                            <p>{name}</p>
                        </ListBoxItem>
                    ))}
                </ListBox>
            </Popover>
        </ComboBox >
    )
}