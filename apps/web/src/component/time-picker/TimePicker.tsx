import React from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import styles from './TimePicker.module.scss';
import { TimePicker as AntdTimePicker, TimePickerProps as AntdTimePickerProps } from 'antd';
import dayjs from 'dayjs';

type PropsType = {
  name: string;
  defaultValue?: string;
  /** Function to be called on onChange if we want any custom logic, in addition to rhfOnChange*/
  onChange?: AntdTimePickerProps['onChange'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rhfControllerProps: Omit<UseControllerProps<any>, 'name' | 'defaultValue'>;
  customStyles?: React.CSSProperties;
  /** To decide if the field is valid or not */
  hasError?: boolean;
  antdTimePickerProps?: AntdTimePickerProps;
  /** To decide if the picker is for time selection or duration selection */
  pickerType?: 'time' | 'duration';
};

export const TimePicker = ({
  name,
  defaultValue = undefined,
  rhfControllerProps,
  customStyles = {},
  hasError,
  antdTimePickerProps,
  onChange,
  pickerType = 'time',
}: PropsType) => {
  const {
    field: { onChange: rhfOnChange, ...rhfFields },
  } = useController({
    name,
    defaultValue,
    ...rhfControllerProps,
  });

  const valueFormat = pickerType === 'time' ? 'YYYY-MM-DD h:mm a' : 'YYYY-MM-DD h:mm';

  return (
    <AntdTimePicker
      className={hasError ? styles.timePickerError : styles.timePicker}
      style={customStyles}
      onChange={(date, dateString) => {
        if (onChange) {
          onChange(date, dateString);
        }
        rhfOnChange(dateString);
      }}
      {...rhfFields}
      value={
        rhfFields.value
          ? dayjs(`${dayjs().format('YYYY-MM-DD')} ${rhfFields.value}`, valueFormat)
          : null
      }
      {...antdTimePickerProps}
      data-testid={name}
    />
  );
};

export default TimePicker;
