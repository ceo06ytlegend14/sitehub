import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firebaseCollections } from '@/src/constants/collections';
import { db } from '@/src/services/firebaseClient';
import { AppUser, BioPage, NfcCard, Order, Payout, PrinterJob, UserRole } from '@/src/types/models';

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

export async function createOrder(payload: Pick<Order, 'customerName' | 'item' | 'amount' | 'createdBy'>) {
  const orderRef = await addDoc(collection(db, firebaseCollections.orders), {
    ...payload,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, firebaseCollections.printerJobs), {
    orderId: orderRef.id,
    queueNumber: Date.now(),
    stage: 'queued',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return orderRef.id;
}

export async function listOrders(role: UserRole, userId: string): Promise<Order[]> {
  const source =
    role === 'sales'
      ? query(
          collection(db, firebaseCollections.orders),
          where('createdBy', '==', userId),
          orderBy('createdAt', 'desc')
        )
      : query(collection(db, firebaseCollections.orders), orderBy('createdAt', 'desc'));

  const snapshot = await getDocs(source);
  return snapshot.docs.map((entry) => {
    const data = entry.data();
    return {
      id: entry.id,
      customerName: data.customerName,
      item: data.item,
      amount: data.amount,
      status: data.status,
      createdBy: data.createdBy,
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt),
    } as Order;
  });
}

export function subscribePrinterJobs(callback: (jobs: PrinterJob[]) => void) {
  const jobsQuery = query(collection(db, firebaseCollections.printerJobs), orderBy('createdAt', 'desc'));
  return onSnapshot(jobsQuery, (snapshot) => {
    const jobs = snapshot.docs.map((entry) => {
      const data = entry.data();
      return {
        id: entry.id,
        orderId: data.orderId,
        queueNumber: data.queueNumber,
        stage: data.stage,
        notes: data.notes,
        qaVideoUrl: data.qaVideoUrl,
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      } as PrinterJob;
    });

    callback(jobs);
  });
}

export async function updatePrinterJob(jobId: string, stage: PrinterJob['stage'], notes?: string) {
  await updateDoc(doc(db, firebaseCollections.printerJobs, jobId), {
    stage,
    notes: notes ?? null,
    updatedAt: serverTimestamp(),
  });
}

export async function saveQaVideo(jobId: string, videoUrl: string) {
  await updateDoc(doc(db, firebaseCollections.printerJobs, jobId), {
    stage: 'done',
    qaVideoUrl: videoUrl,
    updatedAt: serverTimestamp(),
  });
}

export async function listPayouts(userId: string): Promise<Payout[]> {
  const payoutQuery = query(
    collection(db, firebaseCollections.payouts),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(payoutQuery);
  return snapshot.docs.map((entry) => {
    const data = entry.data();
    return {
      id: entry.id,
      userId: data.userId,
      amount: data.amount,
      periodLabel: data.periodLabel,
      status: data.status,
      createdAt: toIso(data.createdAt),
    } as Payout;
  });
}

export async function upsertBioPage(
  userId: string,
  payload: Omit<BioPage, 'id' | 'userId' | 'updatedAt'>
): Promise<void> {
  await setDoc(doc(db, firebaseCollections.bioPages, userId), {
    ...payload,
    userId,
    updatedAt: serverTimestamp(),
  });
}

export async function getBioPage(userId: string): Promise<BioPage | null> {
  const snapshot = await getDoc(doc(db, firebaseCollections.bioPages, userId));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId: data.userId,
    slug: data.slug,
    title: data.title,
    bio: data.bio,
    links: data.links ?? [],
    theme: data.theme ?? 'mint',
    updatedAt: toIso(data.updatedAt),
  };
}

export async function getPublicBioPageBySlug(slug: string): Promise<BioPage | null> {
  const source = query(collection(db, firebaseCollections.bioPages), where('slug', '==', slug));
  const snapshot = await getDocs(source);
  const first = snapshot.docs[0];
  if (!first) return null;
  const data = first.data();

  return {
    id: first.id,
    userId: data.userId,
    slug: data.slug,
    title: data.title,
    bio: data.bio,
    links: data.links ?? [],
    theme: data.theme ?? 'mint',
    updatedAt: toIso(data.updatedAt),
  };
}

export async function activateNfcCard(user: AppUser, cardCode: string) {
  await setDoc(doc(db, firebaseCollections.nfcCards, cardCode), {
    userId: user.id,
    cardCode,
    activated: true,
    updatedAt: serverTimestamp(),
  });
}

export async function getNfcCard(cardCode: string): Promise<NfcCard | null> {
  const snapshot = await getDoc(doc(db, firebaseCollections.nfcCards, cardCode));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();

  return {
    id: snapshot.id,
    userId: data.userId,
    cardCode: data.cardCode,
    activated: data.activated,
    linkedBioSlug: data.linkedBioSlug,
    updatedAt: toIso(data.updatedAt),
  };
}

export async function linkCardToBio(cardCode: string, slug: string) {
  await updateDoc(doc(db, firebaseCollections.nfcCards, cardCode), {
    linkedBioSlug: slug,
    updatedAt: serverTimestamp(),
  });
}

interface ProgramNfcInput {
  jobId: string;
  cardCode: string;
  programmedBy: string;
}

export async function programNfcCardForJob(input: ProgramNfcInput) {
  await setDoc(
    doc(db, firebaseCollections.nfcCards, input.cardCode),
    {
      cardCode: input.cardCode,
      latestJobId: input.jobId,
      programmedBy: input.programmedBy,
      activated: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
