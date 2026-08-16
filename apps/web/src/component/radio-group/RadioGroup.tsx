import React from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import {
  Radio,
  RadioGroupProps as AntdRadioGroupProps,
  RadioProps as AntdRadioProps,
  CheckboxOptionType,
} from 'antd';

/** Display mode type to decide whether to show radios in row or column view */
type DisplayModeType = 'row' | 'column';

export type RadioGroupPropsType = Omit<
  AntdRadioGroupProps,
  'name' | 'onChange' | 'value' | 'options'
> & {
  name: string;
  /** The options for radio group */
  options: Array<CheckboxOptionType<string | number | boolean>>;
  /** To decide if the radios to be shown in row or column view */
  displayMode?: DisplayModeType;
  /** Props for each of the radio inputs */
  antdRadioProps?: AntdRadioProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rhfControllerProps: Omit<UseControllerProps<any>, 'name'>;
  /** Function to be called on onChange if we want any custom logic, in addition to rhfOnChange */
  onChange?: AntdRadioGroupProps['onChange'];
};

export const RadioGroup = ({
  name,
  options,
  displayMode = 'row',
  antdRadioProps = {},
  rhfControllerProps,
  onChange = undefined,
  ...radioGroupProps
}: RadioGroupPropsType) => {
  const {
    field: { onChange: rhfOnChange, ...rhfFields },
  } = useController({
    name,
    ...rhfControllerProps,
  });

  return (
    <Radio.Group
      onChange={(e) => {
        if (onChange) {
          onChange(e);
        }
        rhfOnChange(e.target.value);
      }}
      {...rhfFields}
      {...radioGroupProps}
      data-testid={name}
    >
      {options.map((option) => {
        let radioStyle: React.CSSProperties = {};
        if (antdRadioProps?.style) {
          radioStyle = antdRadioProps?.style;
        }
        if (displayMode === 'column') {
          radioStyle.display = 'block';
          radioStyle.marginBottom = 5;
        }
        return (
          <Radio
            key={option.value.toString()}
            disabled={option.disabled}
            value={option.value}
            {...antdRadioProps}
            style={radioStyle}
            className="font-normal text-sm"
            data-testid={option.value}
          >
            {option.label}
          </Radio>
        );
      })}
    </Radio.Group>
  );
};
