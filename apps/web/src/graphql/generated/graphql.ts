/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client/react';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  timestamptz: { input: unknown; output: unknown; }
  uuid: { input: unknown; output: unknown; }
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** columns and relationships of "agent_language_enum" */
export type Agent_Language_Enum = {
  __typename?: 'agent_language_enum';
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

/** aggregated selection of "agent_language_enum" */
export type Agent_Language_Enum_Aggregate = {
  __typename?: 'agent_language_enum_aggregate';
  aggregate?: Maybe<Agent_Language_Enum_Aggregate_Fields>;
  nodes: Array<Agent_Language_Enum>;
};

/** aggregate fields of "agent_language_enum" */
export type Agent_Language_Enum_Aggregate_Fields = {
  __typename?: 'agent_language_enum_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Agent_Language_Enum_Max_Fields>;
  min?: Maybe<Agent_Language_Enum_Min_Fields>;
};


/** aggregate fields of "agent_language_enum" */
export type Agent_Language_Enum_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Agent_Language_Enum_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "agent_language_enum". All fields are combined with a logical 'AND'. */
export type Agent_Language_Enum_Bool_Exp = {
  _and?: InputMaybe<Array<Agent_Language_Enum_Bool_Exp>>;
  _not?: InputMaybe<Agent_Language_Enum_Bool_Exp>;
  _or?: InputMaybe<Array<Agent_Language_Enum_Bool_Exp>>;
  id?: InputMaybe<String_Comparison_Exp>;
  label?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "agent_language_enum" */
export enum Agent_Language_Enum_Constraint {
  /** unique or primary key constraint on columns "id" */
  AgentLanguageEnumPkey = 'agent_language_enum_pkey'
}

export enum Agent_Language_Enum_Enum {
  /** English */
  English = 'english',
  /** Hindi */
  Hindi = 'hindi',
  /** Marathi */
  Marathi = 'marathi'
}

/** Boolean expression to compare columns of type "agent_language_enum_enum". All fields are combined with logical 'AND'. */
export type Agent_Language_Enum_Enum_Comparison_Exp = {
  _eq?: InputMaybe<Agent_Language_Enum_Enum>;
  _in?: InputMaybe<Array<Agent_Language_Enum_Enum>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Agent_Language_Enum_Enum>;
  _nin?: InputMaybe<Array<Agent_Language_Enum_Enum>>;
};

/** input type for inserting data into table "agent_language_enum" */
export type Agent_Language_Enum_Insert_Input = {
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Agent_Language_Enum_Max_Fields = {
  __typename?: 'agent_language_enum_max_fields';
  id?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Agent_Language_Enum_Min_Fields = {
  __typename?: 'agent_language_enum_min_fields';
  id?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "agent_language_enum" */
export type Agent_Language_Enum_Mutation_Response = {
  __typename?: 'agent_language_enum_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Agent_Language_Enum>;
};

/** on_conflict condition type for table "agent_language_enum" */
export type Agent_Language_Enum_On_Conflict = {
  constraint: Agent_Language_Enum_Constraint;
  update_columns?: Array<Agent_Language_Enum_Update_Column>;
  where?: InputMaybe<Agent_Language_Enum_Bool_Exp>;
};

/** Ordering options when selecting data from "agent_language_enum". */
export type Agent_Language_Enum_Order_By = {
  id?: InputMaybe<Order_By>;
  label?: InputMaybe<Order_By>;
};

/** primary key columns input for table: agent_language_enum */
export type Agent_Language_Enum_Pk_Columns_Input = {
  id: Scalars['String']['input'];
};

/** select columns of table "agent_language_enum" */
export enum Agent_Language_Enum_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  Label = 'label'
}

/** input type for updating data in table "agent_language_enum" */
export type Agent_Language_Enum_Set_Input = {
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "agent_language_enum" */
export type Agent_Language_Enum_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Agent_Language_Enum_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Agent_Language_Enum_Stream_Cursor_Value_Input = {
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "agent_language_enum" */
export enum Agent_Language_Enum_Update_Column {
  /** column name */
  Id = 'id',
  /** column name */
  Label = 'label'
}

export type Agent_Language_Enum_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Agent_Language_Enum_Set_Input>;
  /** filter the rows which have to be updated */
  where: Agent_Language_Enum_Bool_Exp;
};

/** columns and relationships of "agents" */
export type Agents = {
  __typename?: 'agents';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id: Scalars['uuid']['output'];
  language?: Maybe<Agent_Language_Enum_Enum>;
  name: Scalars['String']['output'];
  /** An object relationship */
  organization: Organizations;
  organization_id: Scalars['uuid']['output'];
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  zitadel_org_id: Scalars['String']['output'];
};

/** aggregated selection of "agents" */
export type Agents_Aggregate = {
  __typename?: 'agents_aggregate';
  aggregate?: Maybe<Agents_Aggregate_Fields>;
  nodes: Array<Agents>;
};

export type Agents_Aggregate_Bool_Exp = {
  count?: InputMaybe<Agents_Aggregate_Bool_Exp_Count>;
};

export type Agents_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Agents_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Agents_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "agents" */
export type Agents_Aggregate_Fields = {
  __typename?: 'agents_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Agents_Max_Fields>;
  min?: Maybe<Agents_Min_Fields>;
};


/** aggregate fields of "agents" */
export type Agents_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Agents_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "agents" */
export type Agents_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Agents_Max_Order_By>;
  min?: InputMaybe<Agents_Min_Order_By>;
};

/** input type for inserting array relation for remote table "agents" */
export type Agents_Arr_Rel_Insert_Input = {
  data: Array<Agents_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Agents_On_Conflict>;
};

/** Boolean expression to filter rows from the table "agents". All fields are combined with a logical 'AND'. */
export type Agents_Bool_Exp = {
  _and?: InputMaybe<Array<Agents_Bool_Exp>>;
  _not?: InputMaybe<Agents_Bool_Exp>;
  _or?: InputMaybe<Array<Agents_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  language?: InputMaybe<Agent_Language_Enum_Enum_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<Uuid_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  zitadel_org_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "agents" */
export enum Agents_Constraint {
  /** unique or primary key constraint on columns "id" */
  AgentsPkey = 'agents_pkey'
}

/** input type for inserting data into table "agents" */
export type Agents_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  language?: InputMaybe<Agent_Language_Enum_Enum>;
  name?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  zitadel_org_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Agents_Max_Fields = {
  __typename?: 'agents_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  zitadel_org_id?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "agents" */
export type Agents_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  zitadel_org_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Agents_Min_Fields = {
  __typename?: 'agents_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  zitadel_org_id?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "agents" */
export type Agents_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  zitadel_org_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "agents" */
export type Agents_Mutation_Response = {
  __typename?: 'agents_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Agents>;
};

/** on_conflict condition type for table "agents" */
export type Agents_On_Conflict = {
  constraint: Agents_Constraint;
  update_columns?: Array<Agents_Update_Column>;
  where?: InputMaybe<Agents_Bool_Exp>;
};

/** Ordering options when selecting data from "agents". */
export type Agents_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  language?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  zitadel_org_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: agents */
export type Agents_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "agents" */
export enum Agents_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Language = 'language',
  /** column name */
  Name = 'name',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  ZitadelOrgId = 'zitadel_org_id'
}

/** input type for updating data in table "agents" */
export type Agents_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  language?: InputMaybe<Agent_Language_Enum_Enum>;
  name?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  zitadel_org_id?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "agents" */
export type Agents_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Agents_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Agents_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  language?: InputMaybe<Agent_Language_Enum_Enum>;
  name?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  zitadel_org_id?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "agents" */
export enum Agents_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Language = 'language',
  /** column name */
  Name = 'name',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  ZitadelOrgId = 'zitadel_org_id'
}

export type Agents_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Agents_Set_Input>;
  /** filter the rows which have to be updated */
  where: Agents_Bool_Exp;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "agent_language_enum" */
  delete_agent_language_enum?: Maybe<Agent_Language_Enum_Mutation_Response>;
  /** delete single row from the table: "agent_language_enum" */
  delete_agent_language_enum_by_pk?: Maybe<Agent_Language_Enum>;
  /** delete data from the table: "agents" */
  delete_agents?: Maybe<Agents_Mutation_Response>;
  /** delete single row from the table: "agents" */
  delete_agents_by_pk?: Maybe<Agents>;
  /** delete data from the table: "organizations" */
  delete_organizations?: Maybe<Organizations_Mutation_Response>;
  /** delete single row from the table: "organizations" */
  delete_organizations_by_pk?: Maybe<Organizations>;
  /** delete data from the table: "users" */
  delete_users?: Maybe<Users_Mutation_Response>;
  /** delete single row from the table: "users" */
  delete_users_by_pk?: Maybe<Users>;
  /** insert data into the table: "agent_language_enum" */
  insert_agent_language_enum?: Maybe<Agent_Language_Enum_Mutation_Response>;
  /** insert a single row into the table: "agent_language_enum" */
  insert_agent_language_enum_one?: Maybe<Agent_Language_Enum>;
  /** insert data into the table: "agents" */
  insert_agents?: Maybe<Agents_Mutation_Response>;
  /** insert a single row into the table: "agents" */
  insert_agents_one?: Maybe<Agents>;
  /** insert data into the table: "organizations" */
  insert_organizations?: Maybe<Organizations_Mutation_Response>;
  /** insert a single row into the table: "organizations" */
  insert_organizations_one?: Maybe<Organizations>;
  /** insert data into the table: "users" */
  insert_users?: Maybe<Users_Mutation_Response>;
  /** insert a single row into the table: "users" */
  insert_users_one?: Maybe<Users>;
  /** update data of the table: "agent_language_enum" */
  update_agent_language_enum?: Maybe<Agent_Language_Enum_Mutation_Response>;
  /** update single row of the table: "agent_language_enum" */
  update_agent_language_enum_by_pk?: Maybe<Agent_Language_Enum>;
  /** update multiples rows of table: "agent_language_enum" */
  update_agent_language_enum_many?: Maybe<Array<Maybe<Agent_Language_Enum_Mutation_Response>>>;
  /** update data of the table: "agents" */
  update_agents?: Maybe<Agents_Mutation_Response>;
  /** update single row of the table: "agents" */
  update_agents_by_pk?: Maybe<Agents>;
  /** update multiples rows of table: "agents" */
  update_agents_many?: Maybe<Array<Maybe<Agents_Mutation_Response>>>;
  /** update data of the table: "organizations" */
  update_organizations?: Maybe<Organizations_Mutation_Response>;
  /** update single row of the table: "organizations" */
  update_organizations_by_pk?: Maybe<Organizations>;
  /** update multiples rows of table: "organizations" */
  update_organizations_many?: Maybe<Array<Maybe<Organizations_Mutation_Response>>>;
  /** update data of the table: "users" */
  update_users?: Maybe<Users_Mutation_Response>;
  /** update single row of the table: "users" */
  update_users_by_pk?: Maybe<Users>;
  /** update multiples rows of table: "users" */
  update_users_many?: Maybe<Array<Maybe<Users_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_Agent_Language_EnumArgs = {
  where: Agent_Language_Enum_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Agent_Language_Enum_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_AgentsArgs = {
  where: Agents_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Agents_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_OrganizationsArgs = {
  where: Organizations_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Organizations_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_UsersArgs = {
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Users_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootInsert_Agent_Language_EnumArgs = {
  objects: Array<Agent_Language_Enum_Insert_Input>;
  on_conflict?: InputMaybe<Agent_Language_Enum_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Agent_Language_Enum_OneArgs = {
  object: Agent_Language_Enum_Insert_Input;
  on_conflict?: InputMaybe<Agent_Language_Enum_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_AgentsArgs = {
  objects: Array<Agents_Insert_Input>;
  on_conflict?: InputMaybe<Agents_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Agents_OneArgs = {
  object: Agents_Insert_Input;
  on_conflict?: InputMaybe<Agents_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_OrganizationsArgs = {
  objects: Array<Organizations_Insert_Input>;
  on_conflict?: InputMaybe<Organizations_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Organizations_OneArgs = {
  object: Organizations_Insert_Input;
  on_conflict?: InputMaybe<Organizations_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_UsersArgs = {
  objects: Array<Users_Insert_Input>;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Users_OneArgs = {
  object: Users_Insert_Input;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_Agent_Language_EnumArgs = {
  _set?: InputMaybe<Agent_Language_Enum_Set_Input>;
  where: Agent_Language_Enum_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Agent_Language_Enum_By_PkArgs = {
  _set?: InputMaybe<Agent_Language_Enum_Set_Input>;
  pk_columns: Agent_Language_Enum_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Agent_Language_Enum_ManyArgs = {
  updates: Array<Agent_Language_Enum_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_AgentsArgs = {
  _set?: InputMaybe<Agents_Set_Input>;
  where: Agents_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Agents_By_PkArgs = {
  _set?: InputMaybe<Agents_Set_Input>;
  pk_columns: Agents_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Agents_ManyArgs = {
  updates: Array<Agents_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_OrganizationsArgs = {
  _set?: InputMaybe<Organizations_Set_Input>;
  where: Organizations_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Organizations_By_PkArgs = {
  _set?: InputMaybe<Organizations_Set_Input>;
  pk_columns: Organizations_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Organizations_ManyArgs = {
  updates: Array<Organizations_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_UsersArgs = {
  _set?: InputMaybe<Users_Set_Input>;
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Users_By_PkArgs = {
  _set?: InputMaybe<Users_Set_Input>;
  pk_columns: Users_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Users_ManyArgs = {
  updates: Array<Users_Updates>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

/** columns and relationships of "organizations" */
export type Organizations = {
  __typename?: 'organizations';
  /** An array relationship */
  agents: Array<Agents>;
  /** An aggregate relationship */
  agents_aggregate: Agents_Aggregate;
  bolna_api_key?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id: Scalars['uuid']['output'];
  name: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An array relationship */
  users: Array<Users>;
  /** An aggregate relationship */
  users_aggregate: Users_Aggregate;
  zitadel_org_id: Scalars['String']['output'];
};


/** columns and relationships of "organizations" */
export type OrganizationsAgentsArgs = {
  distinct_on?: InputMaybe<Array<Agents_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Agents_Order_By>>;
  where?: InputMaybe<Agents_Bool_Exp>;
};


/** columns and relationships of "organizations" */
export type OrganizationsAgents_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Agents_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Agents_Order_By>>;
  where?: InputMaybe<Agents_Bool_Exp>;
};


/** columns and relationships of "organizations" */
export type OrganizationsUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


/** columns and relationships of "organizations" */
export type OrganizationsUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** aggregated selection of "organizations" */
export type Organizations_Aggregate = {
  __typename?: 'organizations_aggregate';
  aggregate?: Maybe<Organizations_Aggregate_Fields>;
  nodes: Array<Organizations>;
};

/** aggregate fields of "organizations" */
export type Organizations_Aggregate_Fields = {
  __typename?: 'organizations_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Organizations_Max_Fields>;
  min?: Maybe<Organizations_Min_Fields>;
};


/** aggregate fields of "organizations" */
export type Organizations_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Organizations_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "organizations". All fields are combined with a logical 'AND'. */
export type Organizations_Bool_Exp = {
  _and?: InputMaybe<Array<Organizations_Bool_Exp>>;
  _not?: InputMaybe<Organizations_Bool_Exp>;
  _or?: InputMaybe<Array<Organizations_Bool_Exp>>;
  agents?: InputMaybe<Agents_Bool_Exp>;
  agents_aggregate?: InputMaybe<Agents_Aggregate_Bool_Exp>;
  bolna_api_key?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  users?: InputMaybe<Users_Bool_Exp>;
  users_aggregate?: InputMaybe<Users_Aggregate_Bool_Exp>;
  zitadel_org_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "organizations" */
export enum Organizations_Constraint {
  /** unique or primary key constraint on columns "id" */
  OrganizationsPkey = 'organizations_pkey',
  /** unique or primary key constraint on columns "zitadel_org_id" */
  OrganizationsZitadelOrgIdKey = 'organizations_zitadel_org_id_key'
}

/** input type for inserting data into table "organizations" */
export type Organizations_Insert_Input = {
  agents?: InputMaybe<Agents_Arr_Rel_Insert_Input>;
  bolna_api_key?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  users?: InputMaybe<Users_Arr_Rel_Insert_Input>;
  zitadel_org_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Organizations_Max_Fields = {
  __typename?: 'organizations_max_fields';
  bolna_api_key?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  zitadel_org_id?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Organizations_Min_Fields = {
  __typename?: 'organizations_min_fields';
  bolna_api_key?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  zitadel_org_id?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "organizations" */
export type Organizations_Mutation_Response = {
  __typename?: 'organizations_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Organizations>;
};

/** input type for inserting object relation for remote table "organizations" */
export type Organizations_Obj_Rel_Insert_Input = {
  data: Organizations_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Organizations_On_Conflict>;
};

/** on_conflict condition type for table "organizations" */
export type Organizations_On_Conflict = {
  constraint: Organizations_Constraint;
  update_columns?: Array<Organizations_Update_Column>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};

/** Ordering options when selecting data from "organizations". */
export type Organizations_Order_By = {
  agents_aggregate?: InputMaybe<Agents_Aggregate_Order_By>;
  bolna_api_key?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  users_aggregate?: InputMaybe<Users_Aggregate_Order_By>;
  zitadel_org_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: organizations */
export type Organizations_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "organizations" */
export enum Organizations_Select_Column {
  /** column name */
  BolnaApiKey = 'bolna_api_key',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  ZitadelOrgId = 'zitadel_org_id'
}

/** input type for updating data in table "organizations" */
export type Organizations_Set_Input = {
  bolna_api_key?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  zitadel_org_id?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "organizations" */
export type Organizations_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Organizations_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Organizations_Stream_Cursor_Value_Input = {
  bolna_api_key?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  zitadel_org_id?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "organizations" */
export enum Organizations_Update_Column {
  /** column name */
  BolnaApiKey = 'bolna_api_key',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  ZitadelOrgId = 'zitadel_org_id'
}

export type Organizations_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Organizations_Set_Input>;
  /** filter the rows which have to be updated */
  where: Organizations_Bool_Exp;
};

export type Query_Root = {
  __typename?: 'query_root';
  /** fetch data from the table: "agent_language_enum" */
  agent_language_enum: Array<Agent_Language_Enum>;
  /** fetch aggregated fields from the table: "agent_language_enum" */
  agent_language_enum_aggregate: Agent_Language_Enum_Aggregate;
  /** fetch data from the table: "agent_language_enum" using primary key columns */
  agent_language_enum_by_pk?: Maybe<Agent_Language_Enum>;
  /** An array relationship */
  agents: Array<Agents>;
  /** An aggregate relationship */
  agents_aggregate: Agents_Aggregate;
  /** fetch data from the table: "agents" using primary key columns */
  agents_by_pk?: Maybe<Agents>;
  /** fetch data from the table: "organizations" */
  organizations: Array<Organizations>;
  /** fetch aggregated fields from the table: "organizations" */
  organizations_aggregate: Organizations_Aggregate;
  /** fetch data from the table: "organizations" using primary key columns */
  organizations_by_pk?: Maybe<Organizations>;
  /** An array relationship */
  users: Array<Users>;
  /** An aggregate relationship */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
};


export type Query_RootAgent_Language_EnumArgs = {
  distinct_on?: InputMaybe<Array<Agent_Language_Enum_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Agent_Language_Enum_Order_By>>;
  where?: InputMaybe<Agent_Language_Enum_Bool_Exp>;
};


export type Query_RootAgent_Language_Enum_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Agent_Language_Enum_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Agent_Language_Enum_Order_By>>;
  where?: InputMaybe<Agent_Language_Enum_Bool_Exp>;
};


export type Query_RootAgent_Language_Enum_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootAgentsArgs = {
  distinct_on?: InputMaybe<Array<Agents_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Agents_Order_By>>;
  where?: InputMaybe<Agents_Bool_Exp>;
};


export type Query_RootAgents_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Agents_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Agents_Order_By>>;
  where?: InputMaybe<Agents_Bool_Exp>;
};


export type Query_RootAgents_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootOrganizationsArgs = {
  distinct_on?: InputMaybe<Array<Organizations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organizations_Order_By>>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};


export type Query_RootOrganizations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organizations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organizations_Order_By>>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};


export type Query_RootOrganizations_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "agent_language_enum" */
  agent_language_enum: Array<Agent_Language_Enum>;
  /** fetch aggregated fields from the table: "agent_language_enum" */
  agent_language_enum_aggregate: Agent_Language_Enum_Aggregate;
  /** fetch data from the table: "agent_language_enum" using primary key columns */
  agent_language_enum_by_pk?: Maybe<Agent_Language_Enum>;
  /** fetch data from the table in a streaming manner: "agent_language_enum" */
  agent_language_enum_stream: Array<Agent_Language_Enum>;
  /** An array relationship */
  agents: Array<Agents>;
  /** An aggregate relationship */
  agents_aggregate: Agents_Aggregate;
  /** fetch data from the table: "agents" using primary key columns */
  agents_by_pk?: Maybe<Agents>;
  /** fetch data from the table in a streaming manner: "agents" */
  agents_stream: Array<Agents>;
  /** fetch data from the table: "organizations" */
  organizations: Array<Organizations>;
  /** fetch aggregated fields from the table: "organizations" */
  organizations_aggregate: Organizations_Aggregate;
  /** fetch data from the table: "organizations" using primary key columns */
  organizations_by_pk?: Maybe<Organizations>;
  /** fetch data from the table in a streaming manner: "organizations" */
  organizations_stream: Array<Organizations>;
  /** An array relationship */
  users: Array<Users>;
  /** An aggregate relationship */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** fetch data from the table in a streaming manner: "users" */
  users_stream: Array<Users>;
};


export type Subscription_RootAgent_Language_EnumArgs = {
  distinct_on?: InputMaybe<Array<Agent_Language_Enum_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Agent_Language_Enum_Order_By>>;
  where?: InputMaybe<Agent_Language_Enum_Bool_Exp>;
};


export type Subscription_RootAgent_Language_Enum_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Agent_Language_Enum_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Agent_Language_Enum_Order_By>>;
  where?: InputMaybe<Agent_Language_Enum_Bool_Exp>;
};


export type Subscription_RootAgent_Language_Enum_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootAgent_Language_Enum_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Agent_Language_Enum_Stream_Cursor_Input>>;
  where?: InputMaybe<Agent_Language_Enum_Bool_Exp>;
};


export type Subscription_RootAgentsArgs = {
  distinct_on?: InputMaybe<Array<Agents_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Agents_Order_By>>;
  where?: InputMaybe<Agents_Bool_Exp>;
};


export type Subscription_RootAgents_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Agents_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Agents_Order_By>>;
  where?: InputMaybe<Agents_Bool_Exp>;
};


export type Subscription_RootAgents_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootAgents_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Agents_Stream_Cursor_Input>>;
  where?: InputMaybe<Agents_Bool_Exp>;
};


export type Subscription_RootOrganizationsArgs = {
  distinct_on?: InputMaybe<Array<Organizations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organizations_Order_By>>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};


export type Subscription_RootOrganizations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organizations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organizations_Order_By>>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};


export type Subscription_RootOrganizations_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootOrganizations_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Organizations_Stream_Cursor_Input>>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};


export type Subscription_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootUsers_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Users_Stream_Cursor_Input>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

/** columns and relationships of "users" */
export type Users = {
  __typename?: 'users';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  name: Scalars['String']['output'];
  /** An object relationship */
  organization: Organizations;
  organization_id: Scalars['uuid']['output'];
  password: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  zitadel_user_id: Scalars['String']['output'];
};

/** aggregated selection of "users" */
export type Users_Aggregate = {
  __typename?: 'users_aggregate';
  aggregate?: Maybe<Users_Aggregate_Fields>;
  nodes: Array<Users>;
};

export type Users_Aggregate_Bool_Exp = {
  count?: InputMaybe<Users_Aggregate_Bool_Exp_Count>;
};

export type Users_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Users_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Users_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "users" */
export type Users_Aggregate_Fields = {
  __typename?: 'users_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Users_Max_Fields>;
  min?: Maybe<Users_Min_Fields>;
};


/** aggregate fields of "users" */
export type Users_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Users_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "users" */
export type Users_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Users_Max_Order_By>;
  min?: InputMaybe<Users_Min_Order_By>;
};

/** input type for inserting array relation for remote table "users" */
export type Users_Arr_Rel_Insert_Input = {
  data: Array<Users_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Users_On_Conflict>;
};

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  _and?: InputMaybe<Array<Users_Bool_Exp>>;
  _not?: InputMaybe<Users_Bool_Exp>;
  _or?: InputMaybe<Array<Users_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<Uuid_Comparison_Exp>;
  password?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  zitadel_user_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "users" */
export enum Users_Constraint {
  /** unique or primary key constraint on columns "email" */
  UsersEmailKey = 'users_email_key',
  /** unique or primary key constraint on columns "id" */
  UsersPkey = 'users_pkey',
  /** unique or primary key constraint on columns "zitadel_user_id" */
  UsersZitadelUserIdKey = 'users_zitadel_user_id_key'
}

/** input type for inserting data into table "users" */
export type Users_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  zitadel_user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Users_Max_Fields = {
  __typename?: 'users_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  zitadel_user_id?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "users" */
export type Users_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  password?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  zitadel_user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Users_Min_Fields = {
  __typename?: 'users_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  zitadel_user_id?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "users" */
export type Users_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  password?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  zitadel_user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "users" */
export type Users_Mutation_Response = {
  __typename?: 'users_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Users>;
};

/** on_conflict condition type for table "users" */
export type Users_On_Conflict = {
  constraint: Users_Constraint;
  update_columns?: Array<Users_Update_Column>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** Ordering options when selecting data from "users". */
export type Users_Order_By = {
  created_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  password?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  zitadel_user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: users */
export type Users_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "users" */
export enum Users_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  Password = 'password',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  ZitadelUserId = 'zitadel_user_id'
}

/** input type for updating data in table "users" */
export type Users_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  zitadel_user_id?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "users" */
export type Users_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Users_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Users_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  zitadel_user_id?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "users" */
export enum Users_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  Password = 'password',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  ZitadelUserId = 'zitadel_user_id'
}

export type Users_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Users_Set_Input>;
  /** filter the rows which have to be updated */
  where: Users_Bool_Exp;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['uuid']['input']>;
  _gt?: InputMaybe<Scalars['uuid']['input']>;
  _gte?: InputMaybe<Scalars['uuid']['input']>;
  _in?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['uuid']['input']>;
  _lte?: InputMaybe<Scalars['uuid']['input']>;
  _neq?: InputMaybe<Scalars['uuid']['input']>;
  _nin?: InputMaybe<Array<Scalars['uuid']['input']>>;
};

export type GetOrganizationWithUserQueryVariables = Exact<{
  zitadel_org_id: string;
  zitadel_user_id: string;
}>;


export type GetOrganizationWithUserQuery = { organizations: Array<{ id: unknown, zitadel_org_id: string, name: string, created_at: unknown, updated_at: unknown, users: Array<{ id: unknown, zitadel_user_id: string, email: string, organization_id: unknown }> }> };


export const GetOrganizationWithUserDocument = gql`
    query GetOrganizationWithUser($zitadel_org_id: String!, $zitadel_user_id: String!) {
  organizations(where: { zitadel_org_id: { _eq: $zitadel_org_id } }, limit: 1) {
    id
    zitadel_org_id
    name
    created_at
    updated_at
    users(where: { zitadel_user_id: { _eq: $zitadel_user_id } }, limit: 1) {
      id
      zitadel_user_id
      email
      organization_id
    }
  }
}
    `;

/**
 * __useGetOrganizationWithUserQuery__
 *
 * To run a query within a React component, call `useGetOrganizationWithUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationWithUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationWithUserQuery({
 *   variables: {
 *      zitadel_org_id: // value for 'zitadel_org_id'
 *      zitadel_user_id: // value for 'zitadel_user_id'
 *   },
 * });
 */
export function useGetOrganizationWithUserQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetOrganizationWithUserQuery, GetOrganizationWithUserQueryVariables> & ({ variables: GetOrganizationWithUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetOrganizationWithUserQuery, GetOrganizationWithUserQueryVariables>(GetOrganizationWithUserDocument, options);
      }
export function useGetOrganizationWithUserLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetOrganizationWithUserQuery, GetOrganizationWithUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetOrganizationWithUserQuery, GetOrganizationWithUserQueryVariables>(GetOrganizationWithUserDocument, options);
        }
// @ts-ignore
export function useGetOrganizationWithUserSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetOrganizationWithUserQuery, GetOrganizationWithUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetOrganizationWithUserQuery, GetOrganizationWithUserQueryVariables>;
export function useGetOrganizationWithUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetOrganizationWithUserQuery, GetOrganizationWithUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetOrganizationWithUserQuery | undefined, GetOrganizationWithUserQueryVariables>;
export function useGetOrganizationWithUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetOrganizationWithUserQuery, GetOrganizationWithUserQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetOrganizationWithUserQuery, GetOrganizationWithUserQueryVariables>(GetOrganizationWithUserDocument, options);
        }
export type GetOrganizationWithUserQueryHookResult = ReturnType<typeof useGetOrganizationWithUserQuery>;
export type GetOrganizationWithUserLazyQueryHookResult = ReturnType<typeof useGetOrganizationWithUserLazyQuery>;
export type GetOrganizationWithUserSuspenseQueryHookResult = ReturnType<typeof useGetOrganizationWithUserSuspenseQuery>;
export type GetOrganizationWithUserQueryResult = ApolloReactCommon.QueryResult<GetOrganizationWithUserQuery, GetOrganizationWithUserQueryVariables>;