import { BioTheme, CardDesign, OrderCardStatus, OrderStatus, PaymentStatus, UserRole } from '@/src/types/models';

export const roleOptions: { label: string; value: UserRole }[] = [
  { label: 'Sales', value: 'sales' },
  { label: 'Printer', value: 'printer' },
  { label: 'Customer', value: 'customer' },
];

export const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Khmer', value: 'km' },
  { label: 'Vietnamese', value: 'vi' },
  { label: 'Thai', value: 'th' },
] as const;

export const productTypeOptions = [
  { label: 'Wood Card',  value: 'wood_card',  price: 49,  emoji: '🪵' },
  { label: 'Metal Card', value: 'metal_card', price: 89,  emoji: '⚙️' },
  { label: 'PVC Card',   value: 'pvc_card',   price: 29,  emoji: '💳' },
] as const;

export type ProductType = typeof productTypeOptions[number]['value'];

export const paymentMethodOptions = [
  { label: 'Online',        value: 'online',       color: '#2BC48A' },
  { label: 'Later/Manual',  value: 'later_manual', color: '#FFB343' },
  { label: 'Deposit',       value: 'deposit',      color: '#7c3aed' },
  { label: 'Paid',          value: 'paid',         color: '#00A4A6' },
] as const;

export const priorityOptions = [
  { label: 'Standard', value: 'standard', color: '#6E8A95' },
  { label: 'Urgent', value: 'urgent', color: '#E74C3C' },
] as const;

export type Priority = typeof priorityOptions[number]['value'];

export const cardDesignOptions: { label: string; value: CardDesign }[] = [
  { label: 'Classic Black', value: 'classic_black' },
  { label: 'Matte Silver', value: 'matte_silver' },
  { label: 'Gold Premium', value: 'gold_premium' },
  { label: 'Rose Gold', value: 'rose_gold' },
  { label: 'Custom Design', value: 'custom' },
];

export const paymentStatusOptions: { label: string; value: PaymentStatus }[] = [
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Paid', value: 'paid' },
];

export const orderCardStatusOptions: { label: string; value: OrderCardStatus; color: string }[] = [
  { label: 'Active', value: 'active', color: '#2BC48A' },
  { label: 'Frozen', value: 'frozen', color: '#2563eb' },
  { label: 'Closed', value: 'closed', color: '#6E8A95' },
];

export const orderStatusOptions: { label: string; value: OrderStatus; color: string }[] = [
  { label: 'New',              value: 'new',              color: '#6E8A95' },
  { label: 'Design',           value: 'design',           color: '#FFB343' },
  { label: 'Printing',         value: 'printing',         color: '#00A4A6' },
  { label: 'NFC Writing',      value: 'nfc_writing',      color: '#7c3aed' },
  { label: 'NFC Verification', value: 'nfc_verification', color: '#2563eb' },
  { label: 'Ready',            value: 'ready',            color: '#2BC48A' },
  { label: 'Delivered',        value: 'delivered',        color: '#173E4A' },
];

export const paymentStatusColors: Record<PaymentStatus, string> = {
  unpaid: '#E74C3C',
  partial: '#FFB343',
  paid: '#2BC48A',
};

export const bioThemeOptions: { label: string; value: BioTheme; bg: string; accent: string; text: string }[] = [
  { label: 'Vibrant Pink',  value: 'vibrant_pink', bg: '#FFF0F6', accent: '#E91E8C', text: '#2D0A1E' },
  { label: 'Tech Noir',     value: 'tech_noir',    bg: '#0F0F1A', accent: '#7C3AED', text: '#F0F0FF' },
  { label: 'Editorial',     value: 'editorial',    bg: '#FAFAF7', accent: '#1A1A1A', text: '#1A1A1A' },
  { label: 'Ocean Wave',    value: 'ocean_wave',   bg: '#EBF8FF', accent: '#0EA5E9', text: '#0C2340' },
];
