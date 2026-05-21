import { useMemo } from 'react';
import { useAuth } from '@/src/hooks/useAuth';

export function useRoleFlags() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      role: user?.role ?? 'customer',
      isSales: user?.role === 'sales',
      isPrinter: user?.role === 'printer',
      isCustomer: user?.role === 'customer',
    }),
    [user?.role]
  );
}

