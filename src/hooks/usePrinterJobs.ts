import { useEffect, useState } from 'react';
import { subscribePrinterJobs } from '@/src/services/firestoreService';
import { PrinterJob } from '@/src/types/models';
import { useAuth } from '@/src/hooks/useAuth';

export function usePrinterJobs() {
  const [jobs, setJobs] = useState<PrinterJob[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.isGuest) return;
    const unsubscribe = subscribePrinterJobs((next) => setJobs(next));
    return unsubscribe;
  }, [user]);

  return jobs;
}

