import { UserRole } from '@/src/types/models';

export type RoleLike = UserRole | null | undefined;

interface RoleCapability {
  title: string;
  description: string;
}

const capabilities: Record<UserRole, RoleCapability[]> = {
  guest: [
    {
      title: 'Explore & scan',
      description: 'Scan demo QR codes, preview public profiles, try NFC tap simulation, and browse themes.',
    },
    {
      title: 'No account saves',
      description: 'Cannot save profiles, contacts, settings sync, uploads, QR/NFC generation, or wallet passes.',
    },
    {
      title: 'Staff areas blocked',
      description: 'Sales, printer, admin, and payout tools redirect to the guest consumer experience.',
    },
  ],
  customer: [
    {
      title: 'Own profile',
      description: 'Can manage personal bio, language, theme, and customer order requests.',
    },
    {
      title: 'Limited access',
      description: 'Cannot view staff wages, branch queues, or global admin settings.',
    },
  ],
  sales: [
    {
      title: 'Sales orders',
      description: 'Can create orders and see only orders assigned to this sales account.',
    },
    {
      title: 'Payout tracking',
      description: 'Can review own commission and payout status after orders are delivered.',
    },
    {
      title: 'Account settings',
      description: 'Can change personal app preferences and sign out, but not edit global rates.',
    },
  ],
  printer: [
    {
      title: 'Create intake orders',
      description: 'Can create a new order directly when a customer request arrives at the print station.',
    },
    {
      title: 'Assigned queue',
      description: 'Can work on assigned or branch-visible print, NFC, and QA jobs.',
    },
    {
      title: 'Wages',
      description: 'Can view own completed jobs, card totals, failures, and salary status.',
    },
    {
      title: 'Account settings',
      description: 'Can change personal app preferences and sign out, but not manage users.',
    },
  ],
  admin: [
    {
      title: 'Global operations',
      description: 'Can manage users, orders, NFC logs, salaries, products, reports, and settings.',
    },
    {
      title: 'Staff oversight',
      description: 'Can review printer and sales activity across every branch.',
    },
    {
      title: 'Backend controlled',
      description: 'Role changes and privileged actions should be enforced by Firestore rules or custom claims.',
    },
  ],
  super_admin: [
    {
      title: 'Owner access',
      description: 'Should manage admins, staff roles, branches, rates, products, and backend configuration.',
    },
    {
      title: 'Audit authority',
      description: 'Should review all records and audit history across sales, printer, and admin accounts.',
    },
    {
      title: 'Production setup',
      description: 'Should be issued from trusted backend claims, not self-service registration.',
    },
  ],
};

export function getRoleLabel(role: RoleLike) {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'admin') return 'Admin';
  if (role === 'printer') return 'Printer';
  if (role === 'sales') return 'Sales Rep';
  if (role === 'customer') return 'Customer';
  return 'Guest';
}

export function getRoleCapabilities(role: RoleLike) {
  return capabilities[role ?? 'guest'] ?? capabilities.guest;
}

export function getRoleScopeSummary(role: RoleLike) {
  if (role === 'super_admin') return 'All branches, all users, backend-owned privileges.';
  if (role === 'admin') return 'All branches and operational records.';
  if (role === 'printer') return 'Assigned branch, print queue, NFC, QA, and own wages.';
  if (role === 'sales') return 'Own assigned customers, orders, and payouts.';
  if (role === 'customer') return 'Own profile and customer-facing records.';
  return 'Limited preview only.';
}
