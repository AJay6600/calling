import React from 'react';
import { Row, Col } from 'antd';
import styles from './FormItem.module.scss';

/** Type for display mode, to decide whether to show label and input in one row or column */
type DisplayModeType = 'row' | 'column';

type FormItemPropsType = {
    label?: string | React.ReactNode;
    /** Prop to pass help text */
    helpText?: string;
    errorText?: string;
    isRequired?: boolean;
    children: React.ReactNode;
    containerStyle?: React.CSSProperties;
    /** To decide whether the label and children be shown in row or column view */
    displayMode?: DisplayModeType;
    labelStyle?: React.CSSProperties;
    errorTextStyle?: React.CSSProperties;
    /** Input container style */
    inputContainerStyle?: React.CSSProperties;
    /** Custom span value for input */
    inputSpan?: number;
    /** Custom span value for label */
    labelSpan?: number;
};

export const FormItem = ({
    label = undefined,
    helpText = undefined,
    errorText = undefined,
    isRequired = false,
    children,
    containerStyle = {},
    displayMode = 'row',
    labelStyle = {},
    errorTextStyle = {},
    inputContainerStyle = {},
    inputSpan = 24,
    labelSpan = 24,
}: FormItemPropsType) => {
    /** Const used to store default value of label span */
    const defaultLabelSpan = displayMode === 'column' ? 12 : labelSpan;

    /** Const used to store default value of input span */
    const defaultInputSpan = displayMode === 'column' ? 12 : inputSpan;

    return (
        <Row
            className={styles.inputContainer}
            style={{ paddingTop: 15, ...containerStyle }}
            gutter={[16, 8]}
        >
            <Col xs={24} sm={defaultLabelSpan} style={labelStyle}>
                {label && isRequired ? <span style={{ color: 'var(--color-error)' }}>*</span> : null}
                <label className={styles.labelName}>{label}</label>
            </Col>

            <Col xs={24} sm={defaultInputSpan} style={label ? { ...inputContainerStyle } : undefined}>
                {helpText ? (
                    <span style={{ color: 'var(--color-grey)', fontStyle: 'italic', fontSize: 12 }}>
                        {helpText}
                    </span>
                ) : null}
                {children}
                {errorText ? (
                    <div className={styles.errorText} style={errorTextStyle}>
                        {errorText}
                    </div>
                ) : null}
            </Col>
        </Row>
    );
};
