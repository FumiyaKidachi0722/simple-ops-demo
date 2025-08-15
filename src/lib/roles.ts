import { type Role, ROLES } from "@/lib/types";

export const MANAGERIAL_ROLES: Role[] = [ROLES.MANAGER, ROLES.OWNER];

export function canManage(role?: Role | null): boolean {
  return role ? MANAGERIAL_ROLES.includes(role) : false;
}
