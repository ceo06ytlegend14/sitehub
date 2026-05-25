import {
  BioTheme,
  CardDesign,
  OrderCardStatus,
  OrderStatus,
  PaymentStatus,
  ProfileTheme,
  TypographyColorKey,
  UserRole,
} from '@/src/types/models';
import { typographyColorMap } from '@/src/constants/themeResolver';

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
  { label: 'Wood Card', value: 'wood_card', price: 49, emoji: 'WOOD' },
  { label: 'Metal Card', value: 'metal_card', price: 89, emoji: 'METAL' },
  { label: 'PVC Card', value: 'pvc_card', price: 29, emoji: 'PVC' },
] as const;

export type ProductType = typeof productTypeOptions[number]['value'];

export const paymentMethodOptions = [
  { label: 'Online', value: 'online', color: '#30D158' },
  { label: 'Later/Manual', value: 'later_manual', color: '#FF9F0A' },
  { label: 'Deposit', value: 'deposit', color: '#007AFF' },
  { label: 'Paid', value: 'paid', color: '#30D158' },
] as const;

export const priorityOptions = [
  { label: 'Standard', value: 'standard', color: '#6E8A95' },
  { label: 'Urgent', value: 'urgent', color: '#FF3B30' },
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
  { label: 'Active', value: 'active', color: '#30D158' },
  { label: 'Frozen', value: 'frozen', color: '#007AFF' },
  { label: 'Closed', value: 'closed', color: '#6E8A95' },
];

export const orderStatusOptions: { label: string; value: OrderStatus; color: string }[] = [
  { label: 'New', value: 'new', color: '#6E8A95' },
  { label: 'Design', value: 'design', color: '#FF9F0A' },
  { label: 'Printing', value: 'printing', color: '#007AFF' },
  { label: 'NFC Writing', value: 'nfc_writing', color: '#5E5CE6' },
  { label: 'NFC Verification', value: 'nfc_verification', color: '#0A84FF' },
  { label: 'Ready', value: 'ready', color: '#30D158' },
  { label: 'Delivered', value: 'delivered', color: '#111111' },
];

export const paymentStatusColors: Record<PaymentStatus, string> = {
  unpaid: '#FF3B30',
  partial: '#FF9F0A',
  paid: '#30D158',
};

export const bioThemeOptions: { label: string; value: BioTheme; bg: string; accent: string; text: string }[] = [
  { label: 'iOS Light', value: 'vibrant_pink', bg: '#F5F5F7', accent: '#007AFF', text: '#111111' },
  { label: 'Charcoal', value: 'tech_noir', bg: '#1C1C1E', accent: '#0A84FF', text: '#F5F5F7' },
  { label: 'Editorial', value: 'editorial', bg: '#FFFFFF', accent: '#111111', text: '#111111' },
  { label: 'Blue Glass', value: 'ocean_wave', bg: '#F5F5F7', accent: '#007AFF', text: '#111111' },
];

export const profileThemeOptions: {
  label: string;
  value: ProfileTheme;
  bg: string;
  accent: string;
  text: string;
}[] = [
  { label: 'iOS Light', value: 'aqua', bg: '#F5F5F7', accent: '#007AFF', text: '#111111' },
  { label: 'Blue Glass', value: 'ocean', bg: '#F5F5F7', accent: '#007AFF', text: '#111111' },
  { label: 'Charcoal', value: 'slate', bg: '#1C1C1E', accent: '#0A84FF', text: '#F5F5F7' },
];

export const typographyColorOptions: { label: string; value: TypographyColorKey; color: string }[] =
  (Object.entries(typographyColorMap) as [TypographyColorKey, { label: string; color: string }][]).map(
    ([value, { label, color }]) => ({ value, label, color })
  );
