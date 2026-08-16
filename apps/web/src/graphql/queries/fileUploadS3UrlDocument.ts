import { graphql } from '../gql/gql';

export const fileUploadS3UrlDocument = graphql(`
  query fileUploadS3Url($fileName: String!, $contentType: String!) {
    fileUploadS3Url(fileName: $fileName, contentType: $contentType) {
      url
      key
      policy
      algorithm
      credential
      date
      signature
      contentType
      contentDisposition
    }
  }
`);
