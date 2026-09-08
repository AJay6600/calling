export const ZITADEL_ORG_ID_CLAIM = 'urn:zitadel:iam:user:resourceowner:id';
export const ZITADEL_ORG_ID_HEADER = 'x-zitadel-org-id';

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

export const isUserAdmin = (
  profile: Record<string, unknown> | undefined,
): boolean => {
  if (profile === undefined) {
    return false;
  }

  // 1. Check custom flattened roles claim (e.g. profile.roles = ["admin"]) or standard claims
  const roles =
    profile['roles'] ||
    profile['urn:zitadel:iam:org:project:roles'] ||
    profile['role'];

  if (Array.isArray(roles)) {
    return roles.some(
      (r) =>
        typeof r === 'string' &&
        (r.toLowerCase() === 'admin' || r.toLowerCase() === 'org_admin'),
    );
  }

  if (typeof roles === 'object' && roles !== null) {
    const rolesObj = roles as Record<string, unknown>;
    return Boolean(
      rolesObj['admin'] ||
        rolesObj['org_admin'] ||
        rolesObj['ADMIN'] ||
        rolesObj['ORG_ADMIN'],
    );
  }

  if (typeof roles === 'string') {
    return roles.toLowerCase().includes('admin');
  }

  return false;
};
