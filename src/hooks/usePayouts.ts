import { useCallback, useEffect, useState } from 'react';
import { listPayouts } from '@/src/services/firestoreService';
import { Payout } from '@/src/types/models';

export function usePayouts(userId: string) {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const result = await listPayouts(userId);
      setPayouts(result);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { payouts, isLoading, refresh };
}

