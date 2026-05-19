import type { UserInfo } from '@gosaas/core';
import {
  getPermission,
  isGrant,
  type PermissionAcl,
  type PermissionRequirement,
} from '@gosaas/core';
/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: UserInfo } | undefined) {
  const { currentUser } = initialState ?? {};
  const aclList: PermissionAcl[] = getPermission()?.values ?? [];

  const can = (requirement?: PermissionRequirement[]) => {
    if (!requirement?.length) {
      return true;
    }
    if (!aclList.length) {
      return false;
    }
    return isGrant(requirement, aclList);
  };

  return {
    canAdmin: currentUser,
    can,
  };
}
