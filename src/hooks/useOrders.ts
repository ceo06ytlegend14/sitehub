import { useCallback, useEffect, useState } from 'react';
import { createOrder, listOrders } from '@/src/services/firestoreService';
import { Order, UserRole } from '@/src/types/models';

export function useOrders(role: UserRole, userId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId || userId === 'guest') return;
    setIsLoading(true);
    try {
      const result = await listOrders(role, userId);
      setOrders(result);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [role, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitOrder = useCallback(
    async (payload: Pick<Order, 'customerName' | 'item' | 'amount' | 'createdBy'>) => {
      await createOrder(payload);
      await refresh();
    },
    [refresh]
  );

  return { orders, isLoading, refresh, submitOrder };
}

