// apps/web/src/app/component/OrganizationGuard.tsx
import type { ReactNode } from 'react';
import { useAuth } from 'react-oidc-context';
import { useQuery } from '@apollo/client/react';
import { Alert, Button, Result, Spin } from 'antd';
import { GET_ORGANIZATION_WITH_USER } from '../graphql/queries';
import {
  getZitadelOrgIdFromProfile,
  getZitadelUserIdFromProfile,
} from '../utils';
import type { OrganizationType, UserType } from '../utils/types';

type OrganizationGuardPropsType = {
  children: ReactNode;
};

type OrganizationWithUsersType = OrganizationType & {
  users: UserType[];
};

type GetOrganizationWithUserDataType = {
  organizations: OrganizationWithUsersType[];
};

export const OrganizationGuard = ({ children }: OrganizationGuardPropsType) => {
  const auth = useAuth();
  const zitadelOrgId = getZitadelOrgIdFromProfile(auth.user?.profile);
  const zitadelUserId = getZitadelUserIdFromProfile(auth.user?.profile);

  const { data, loading, error, refetch } =
    useQuery<GetOrganizationWithUserDataType>(GET_ORGANIZATION_WITH_USER, {
      variables: {
        zitadel_org_id: zitadelOrgId ?? '',
        zitadel_user_id: zitadelUserId ?? '',
      },
      skip: zitadelOrgId === undefined || zitadelUserId === undefined,
      fetchPolicy: 'network-only',
    });

  if (loading) {
    return <Spin fullscreen tip="Verifying account access..." />;
  }

  if (zitadelOrgId === undefined || zitadelUserId === undefined) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-6">
        <Result
          status="warning"
          title="Account context missing"
          subTitle="Your login token does not include the expected organization or user claims."
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
          message="Unable to verify account"
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

  const user = organization.users?.[0];

  if (user === undefined) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-6">
        <Alert
          type="error"
          showIcon
          message="User not registered"
          description="Your organization is registered, but your user account has not been provisioned yet. Please contact your administrator."
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