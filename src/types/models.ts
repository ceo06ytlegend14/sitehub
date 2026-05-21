export type UserRole = 'guest' | 'sales' | 'printer' | 'customer';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  language: string;
  createdAt: string;
  updatedAt: string;
isGuest?: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  item: string;
  amount: number;
  status: 'pending' | 'programming' | 'ready' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  periodLabel: string;
  status: 'pending' | 'paid';
  createdAt: string;
}

export interface PrinterJob {
  id: string;
  orderId: string;
  queueNumber: number;
  stage: 'queued' | 'nfc_programming' | 'qa_capture' | 'done';
  notes?: string;
  qaVideoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BioPage {
  id: string;
  userId: string;
  slug: string;
  title: string;
  bio: string;
  links: string[];
  theme: 'mint' | 'coral' | 'ocean';
  updatedAt: string;
}

export interface NfcCard {
  id: string;
  userId: string;
  cardCode: string;
  activated: boolean;
  linkedBioSlug?: string;
  updatedAt: string;
}

export interface UiPreferences {
  language: string;
  theme: 'mint' | 'coral' | 'ocean';
}

