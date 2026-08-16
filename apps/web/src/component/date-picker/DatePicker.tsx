import React from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import { DatePicker as AntdDatePicker, Space, DatePickerProps as AntdDatePickerProps } from 'antd';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import styles from './DatePicker.module.scss';

// Day js plugins
dayjs.extend(weekday);
dayjs.extend(localeData);

type DatePickerPropsType = {
    name: string;
    defaultValue?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rhfControllerProps: Omit<UseControllerProps<any>, 'name' | 'defaultValue'>;
    customStyles?: React.CSSProperties;
    /** To decide if the field is valid or not */
    hasError?: boolean;
    /** To set the direction of the date picker form to horizontal or vertical */
    direction?: 'vertical' | 'horizontal';
    onChange?: AntdDatePickerProps['onChange'];
    antdDatePickerProps?: AntdDatePickerProps;
};

export const DatePicker = ({
    name,
    defaultValue = undefined,
    rhfControllerProps,
    customStyles = {},
    hasError,
    direction = 'vertical',
    onChange,
    antdDatePickerProps,
}: DatePickerPropsType) => {
    const {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        field: { onChange: rhfOnChange, ...rhfFields },
    } = useController({
        name,
        defaultValue,
        ...rhfControllerProps,
    });

    return (
        <Space direction={direction} style={{ width: '100%' }}>
            <AntdDatePicker
                className={hasError ? styles.datePickerError : styles.datePicker}
                style={customStyles}
                onChange={(date, dateString) => {
                    if (dateString) {
                        rhfOnChange(dateString);
                    } else {
                        rhfOnChange(date);
                    }

                    if (onChange) {
                        onChange(date, dateString);
                    }
                }}
                {...rhfFields}
                value={rhfFields.value ? dayjs(rhfFields.value as string) : null}
                {...antdDatePickerProps}
                data-testid={name}
            />
        </Space>
    );
};
