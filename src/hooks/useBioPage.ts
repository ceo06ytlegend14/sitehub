import { useCallback, useEffect, useState } from 'react';
import { getBioPage, upsertBioPage } from '@/src/services/firestoreService';
import { BioPage } from '@/src/types/models';

export function useBioPage(userId: string) {
  const [bioPage, setBioPage] = useState<BioPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId || userId === 'guest') {
      setBioPage(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result = await getBioPage(userId);
      setBioPage(result);
    } catch {
      setBioPage(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveBioPage = useCallback(
    async (payload: Omit<BioPage, 'id' | 'userId' | 'updatedAt'>) => {
      await upsertBioPage(userId, payload);
      await refresh();
    },
    [refresh, userId]
  );

  return { bioPage, isLoading, refresh, saveBioPage };
}
