import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase.shared';

export const auth = getAuth(app);
