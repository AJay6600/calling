export const ZITADEL_ORG_ID_CLAIM = 'urn:zitadel:iam:user:resourceowner:id';

export const ZITADEL_ORG_ID_HEADER = 'x-zitadel-org-id';
export const USER_ROLE_HEADER = 'x-user-role';

export type UserRole = 'org_admin' | 'org_member';

export const getZitadelOrgIdFromProfile = (
  profile: Record<string, unknown> | undefined,
): string | undefined => {
  if (profile === undefined) {
    return undefined;
  }

  const orgId = profile[ZITADEL_ORG_ID_CLAIM];

  if (typeof orgId !== 'string' || orgId === '') {
    return undefined;
  }

  return orgId;
};

export const getZitadelUserIdFromProfile = (
  profile: Record<string, unknown> | undefined,
): string | undefined => {
  if (profile === undefined) {
    return undefined;
  }

  const sub = profile['sub'];

  if (typeof sub !== 'string' || sub === '') {
    return undefined;
  }

  return sub;
};

export const getUserRoleFromProfile = (
  profile: Record<string, unknown> | undefined,
): UserRole => {
  // Check override in localStorage for role testing / simulation
  const override = localStorage.getItem('user_role_override');
  if (override === 'org_admin' || override === 'org_member') {
    return override;
  }

  if (profile === undefined) {
    return 'org_admin';
  }

  const roles =
    profile['urn:zitadel:iam:org:project:roles'] ||
    profile['roles'] ||
    profile['role'];

  if (typeof roles === 'object' && roles !== null) {
    const rolesObj = roles as Record<string, unknown>;
    if (rolesObj['org_admin'] || rolesObj['admin'] || rolesObj['ORG_ADMIN']) {
      return 'org_admin';
    }
  }

  if (Array.isArray(roles)) {
    if (
      roles.includes('org_admin') ||
      roles.includes('admin') ||
      roles.includes('ORG_ADMIN')
    ) {
      return 'org_admin';
    }
  }

  if (typeof roles === 'string' && roles.toLowerCase().includes('admin')) {
    return 'org_admin';
  }

  return 'org_admin';
};

export const setUserRoleOverride = (role: UserRole): void => {
  localStorage.setItem('user_role_override', role);
};
