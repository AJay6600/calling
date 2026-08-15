import type { ReactNode } from 'react';
import { useAuth } from 'react-oidc-context';
import { useQuery } from '@apollo/client/react';
import { Alert, Button, Result, Spin } from 'antd';
import { GET_ORGANIZATION_BY_ZITADEL_ID } from '../graphql/queries';
import { getZitadelOrgIdFromProfile } from '../utils';
import type { OrganizationType } from '../utils/types';

type OrganizationGuardPropsType = {
  children: ReactNode;
};

type GetOrganizationByZitadelIdDataType = {
  organizations: OrganizationType[];
};

export const OrganizationGuard = ({ children }: OrganizationGuardPropsType) => {
  const auth = useAuth();
  const zitadelOrgId = getZitadelOrgIdFromProfile(auth.user?.profile);

  const { data, loading, error, refetch } =
    useQuery<GetOrganizationByZitadelIdDataType>(GET_ORGANIZATION_BY_ZITADEL_ID, {
      variables: { zitadel_org_id: zitadelOrgId ?? '' },
      skip: zitadelOrgId === undefined,
      fetchPolicy: 'network-only',
    });

  if (loading) {
    return <Spin fullscreen tip="Verifying organization access..." />;
  }

  if (zitadelOrgId === undefined) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-6">
        <Result
          status="warning"
          title="Organization context missing"
          subTitle="Your login token does not include a Zitadel organization ID."
          extra={
            <Button type="primary" onClick={() => auth.signoutRedirect()}>
              Sign Out
            </Button>
          }
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-6">
        <Alert
          type="error"
          showIcon
          message="Unable to verify organization"
          description={error.message}
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const organization = data?.organizations?.[0];

  if (organization === undefined) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-6">
        <Alert
          type="error"
          showIcon
          message="Organization not registered"
          description={`Your organization (Zitadel ID: ${zitadelOrgId}) is not registered in the platform. Please contact your administrator to be onboarded before using the app.`}
          action={
            <Button size="small" onClick={() => refetch()}>
              Check Again
            </Button>
          }
        />
      </div>
    );
  }

  return children;
};
