import { useMemo } from 'react';
import { useAuth } from '@/src/hooks/useAuth';

export function useRoleFlags() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      role: user?.role ?? 'guest',
      isSales: user?.role === 'sales',
      isPrinter: user?.role === 'printer',
      isCustomer: user?.role === 'customer',
      isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
      isSuperAdmin: user?.role === 'super_admin',
      isGuest: !user || user.isGuest === true || user.role === 'guest',
    }),
    [user]
  );
}
