import React from 'react';
import { UseControllerProps, useController } from 'react-hook-form';
import { Select as AntdSelect, SelectProps as AntdSelectPropType } from 'antd';
import styles from './Select.module.scss';
import { DefaultOptionType } from 'antd/es/select';

/** Type for mode of antd Select component, in multiple mode, we can select multiple options from the options list, in tag mode
 * also we can select multiple options, but additionally we can also add the new option which is not present in options list
 */
type SelectModeType = 'multiple' | 'tags';

/** Type for options data which we will be passed to option prop of Select component */
export type OptionsDataType = {
    /** Value which will be returned when the option is selected */
    value: string | number;
    /** Label for option in select dropdown */
    label: string | number;
};

type SelectPropsType = {
    name: string;
    defaultValue?: string | undefined;
    placeholder?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rhfControllerProps: { control?: any; [key: string]: any };
    customStyles?: React.CSSProperties;
    /** Props for antd Select component */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    antdSelectProps?: Omit<AntdSelectPropType<any>, 'mode' | 'onChange' | 'value'>;
    /** To store the array of options, to be shown in select dropdown */
    options: AntdSelectPropType['options'];
    /** Function to be called on onChange if we want any custom logic, in addition to rhfOnChange */
    onChange?: AntdSelectPropType<string | number | boolean>['onChange'];
    /** To set the mode of the select, it can be multiple or tags */
    mode?: SelectModeType;
    /** To decide if the field is valid or not */
    hasError?: boolean;
};

/**
 * Custom filter function for the Select component's search functionality.
 * This function extends the search to match against both label and value fields,
 * ensuring a better search experience for the end user.
 * @param input - The search string typed by the user
 * @param option - The option object containing label and value fields
 * @returns - true if either the label or value contains the search string (case-insensitive)
 */
const customFilterOption = (input: string, option?: DefaultOptionType): boolean => {
    const searchTerm = input.toLowerCase();
    const labelMatch = String(option?.label ?? '')
        .toLowerCase()
        .includes(searchTerm);
    const valueMatch = String(option?.value ?? '')
        .toLowerCase()
        .includes(searchTerm);
    return labelMatch || valueMatch;
};

export const Select = ({
    name,
    defaultValue = undefined,
    placeholder = '',
    rhfControllerProps,
    customStyles = {},
    antdSelectProps = {},
    options,
    onChange = undefined,
    mode = undefined,
    hasError = false,
}: SelectPropsType) => {
    const {
        field: { onChange: rhfOnChange, value: rhfValue, ...rhfFields },
    } = useController({
        name,
        defaultValue,
        ...rhfControllerProps,
    });

    const onChangeHandler = (value: string | number | boolean) => {
        if (onChange) {
            onChange(value, options);
        }
        rhfOnChange(value);
    };

    return (
        <AntdSelect
            options={options}
            placeholder={placeholder}
            className={hasError ? styles.selectError : styles.select}
            style={{ width: '100%', ...customStyles }}
            mode={mode}
            onChange={onChangeHandler}
            filterOption={customFilterOption}
            value={rhfValue || undefined}
            {...rhfFields}
            {...antdSelectProps}
            data-testid={name}
        />
    );
};
