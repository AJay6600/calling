import { ErrorLike } from '@apollo/client';
import { Row } from 'antd';

type QueryErrorPropsType = {
  /** The error object from Apollo Client, which provides details about the error encountered during a GraphQL query or mutation */
  error: ErrorLike;
};

export const QueryError = ({ error }: QueryErrorPropsType) => {
  return <Row className="h-full flex justify-center items-center text-error">{error.message}</Row>;
};

export default QueryError;
