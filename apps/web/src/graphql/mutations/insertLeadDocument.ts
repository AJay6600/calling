import { graphql } from '../gql/gql';

export const insertLeadDocument = graphql(`
  mutation InsertLead($object: leads_insert_input!) {
    insert_leads_one(object: $object) {
      id
      phone_number
      name
      email
      company_name
      status
      created_at
    }
  }
`);
