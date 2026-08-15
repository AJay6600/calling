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
