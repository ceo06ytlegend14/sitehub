import { AppUser, UserRole } from '@/src/types/models';

export const AUTH_ROLES: UserRole[] = ['guest', 'customer', 'sales', 'printer', 'admin', 'super_admin'];
export const STAFF_ROLES: UserRole[] = ['sales', 'printer'];

export type DashboardRoute = '/auth/login' | '/(tabs)' | '/sales' | '/printer/queue' | '/admin';

export function normalizeRole(role: unknown): UserRole {
  if (role === 'super_admin') return 'super_admin';
  if (role === 'admin') return 'admin';
  if (role === 'printer' || role === 'printer_staff') return 'printer';
  if (role === 'sales' || role === 'sales_rep') return 'sales';
  if (role === 'customer' || role === 'user') return 'customer';
  return 'guest';
}

export function getDashboardRoute(user: AppUser | null): DashboardRoute {
  if (!user) return '/auth/login';
  if (user.role === 'admin' || user.role === 'super_admin') return '/admin';
  if (user.role === 'printer') return '/printer/queue';
  if (user.role === 'sales') return '/sales';
  return '/(tabs)';
}

export function canAccessRole(user: AppUser | null, allowedRoles?: UserRole[]) {
  if (!allowedRoles || allowedRoles.length === 0) return Boolean(user);
  if (!user) return false;
  if (user.role === 'super_admin' && allowedRoles.includes('admin')) return true;
  return allowedRoles.includes(user.role);
}

export function isGuestUser(user: AppUser | null) {
  return !user || user.isGuest === true || user.role === 'guest';
}

export function isStaffRole(role: UserRole) {
  return STAFF_ROLES.includes(role);
}
