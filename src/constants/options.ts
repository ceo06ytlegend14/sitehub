import { UserRole } from '@/src/types/models';

export const roleOptions: { label: string; value: UserRole }[] = [
  { label: 'Sales', value: 'sales' },
  { label: 'Printer', value: 'printer' },
  { label: 'Customer', value: 'customer' },
];

export const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Bahasa Indonesia', value: 'id' },
  { label: 'Khmer', value: 'km' },
  { label: 'Vietnamese', value: 'vi' },
] as const;

export const themeOptions = [
  { label: 'Tropical Mint', value: 'mint' },
  { label: 'Coral Pop', value: 'coral' },
  { label: 'Ocean Sky', value: 'ocean' },
] as const;
