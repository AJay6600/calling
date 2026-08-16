import { Row, Spin, SpinProps } from 'antd';

type QueryLoadingPropsType = {
  customClassName?: string;
  spinnerSize?: SpinProps['size'];
};

export const QueryLoading = ({
  customClassName = '',
  spinnerSize = 'large',
}: QueryLoadingPropsType) => {
  return (
    <Row
      data-testid="queryLoader"
      className={`h-full flex justify-center items-center ${customClassName}`}
    >
      <Spin size={spinnerSize} />
    </Row>
  );
};

export default QueryLoading;
