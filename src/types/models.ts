export type UserRole = 'guest' | 'customer' | 'sales' | 'printer' | 'admin' | 'super_admin';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  language: string;
  phone?: string;
  branch?: string;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  isGuest?: boolean;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'new'
  | 'design'
  | 'printing'
  | 'nfc_writing'
  | 'nfc_verification'
  | 'ready'
  | 'delivered';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export type OrderCardStatus = 'active' | 'frozen' | 'closed';

export type CardDesign =
  | 'classic_black'
  | 'matte_silver'
  | 'gold_premium'
  | 'rose_gold'
  | 'custom';

export interface Order {
  id: string;
  // Customer info
  customerName: string;
  phone: string;
  telegram?: string;
  whatsapp?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  deliveryAddress?: string;
  // Order details
  productType: string;
  quantity: number;
  cardDesign: CardDesign;
  designArtworkUrl?: string;
  designArtworkPath?: string;
  designArtworkFileName?: string;
  cardCode: string;
  profileUrl: string;
  nfcEnabled?: boolean;
  nfcTargetUrl?: string;
  qrPrinted?: boolean;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  depositAmount?: number;
  dueDate?: string;
  priority?: 'standard' | 'urgent';
  notes?: string;
  cardStatus?: OrderCardStatus;
  freezeReason?: string;
  frozenAt?: string;
  frozenBy?: string;
  closedAt?: string;
  closedBy?: string;
  // Workflow
  status: OrderStatus;
  assignedSalesman: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Printer Job ──────────────────────────────────────────────────────────────

export type PrinterJobStage =
  | 'queued'
  | 'printing'
  | 'nfc_writing'
  | 'nfc_verification'
  | 'done'
  | 'failed';

export interface PrinterJob {
  id: string;
  orderId: string;
  printerId: string;
  queueNumber: number;
  stage: PrinterJobStage;
  cardsPrinted: number;
  failedCards: number;
  reprintedCards: number;
  failedCardsApproved: boolean;
  perCardBonus: number;
  perOrderBonus: number;
  salaryStatus: 'unpaid' | 'paid';
  notes?: string;
  qaVideoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── NFC Card ─────────────────────────────────────────────────────────────────

export type NfcStatus =
  | 'not_written'
  | 'writing'
  | 'written'
  | 'verified'
  | 'failed'
  | 'rewrite_needed'
  | 'disabled';

export interface NfcCard {
  id: string;
  chipUID: string;
  profileUrl: string;
  orderId: string;
  cardCode: string;
  writtenBy: string;
  writtenAt: string;
  verificationStatus: NfcStatus;
  updatedAt: string;
}

// ─── Salary ───────────────────────────────────────────────────────────────────

export interface SalaryRecord {
  id: string;
  printerId: string;
  printerName: string;
  period: string;            // e.g. "2025-05"
  baseSalary: number;
  totalCards: number;
  failedCards: number;
  approvedFailedCards: number;
  perCardBonus: number;
  qualityBonus: number;
  total: number;
  status: 'unpaid' | 'paid';
  createdAt: string;
  updatedAt: string;
}

// ─── Legacy / kept for bio pages ─────────────────────────────────────────────

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  periodLabel: string;
  status: 'pending' | 'paid';
  createdAt: string;
}

// ─── Bio Page ─────────────────────────────────────────────────────────────────

export type BioTheme = 'vibrant_pink' | 'tech_noir' | 'editorial' | 'ocean_wave';

export interface BioPage {
  id: string;
  userId: string;
  slug: string;
  displayName: string;
  tagline?: string;
  photoUrl?: string;
  whatsapp?: string;
  instagram?: string;
  telegram?: string;
  email?: string;
  customLinks: { label: string; url: string }[];
  theme: BioTheme;
  updatedAt: string;
}

export type ProfileTheme = 'aqua' | 'ocean' | 'slate';

export type TypographyColorKey =
  | 'deep_teal'
  | 'ocean_blue'
  | 'forest'
  | 'slate'
  | 'indigo'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'charcoal'
  | 'midnight';

export interface UiPreferences {
  language: string;
  /** Bio page theme (public profile pages). */
  theme: BioTheme;
  /** App-wide profile chrome theme. */
  profileTheme: ProfileTheme;
  colorMode: 'light' | 'dark';
  typographyColor: TypographyColorKey;
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId?: string;
  priority?: NotificationPriority;
  actionUrl?: string;
}
