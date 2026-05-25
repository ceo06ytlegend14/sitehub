/**
 * AppIcon - shared icon component using lucide-react-native.
 * All icons render with one stroke weight and size normalized to 20-24.
 *
 * Usage:
 *   <AppIcon name="ClipboardList" color={theme.colors.primary} />
 *   <AppIcon name="Printer" size={20} color="#fff" />
 */

import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  BadgeDollarSign,
  BadgeCheck,
  Bell,
  Calendar,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDollarSign,
  CircleUserRound,
  ExternalLink,
  Download,
  Eye,
  FileText,
  FileVideo,
  FlipHorizontal,
  Home,
  History,
  Image as ImageIcon,
  Info,
  Link,
  LogOut,
  MapPin,
  Mail,
  MoreHorizontal,
  Nfc,
  Package,
  PenLine,
  Phone,
  Printer,
  Plus,
  QrCode,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Search,
  Settings,
  Share,
  Shield,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Target,
  Trash2,
  TriangleAlert,
  TrendingUp,
  Truck,
  Upload,
  User,
  UserPlus,
  UserRound,
  Users,
  Wallet,
  X,
  Zap,
  ZapOff,
  type LucideProps,
} from 'lucide-react-native';
import { theme } from '@/src/constants/theme';

// Icon registry. Add new icons here so pages do not import icon libraries directly.
const ICON_STROKE_WIDTH = 2.25;
const DEFAULT_ICON_SIZE = 22;
const MIN_ICON_SIZE = 20;
const MAX_ICON_SIZE = 24;

const icons = {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Home,
  ClipboardList,
  Printer,
  Wallet,
  User,
  Phone,
  Package,
  Nfc,
  FileVideo,
  QrCode,
  ScanLine,
  CreditCard,
  CircleAlert,
  CircleCheck,
  CircleDollarSign,
  CircleUserRound,
  BadgeDollarSign,
  BadgeCheck,
  Bell,
  Calendar,
  CalendarDays,
  CheckCheck,
  Clock,
  ChevronLeft,
  Circle,
  LogOut,
  ChevronRight,
  ExternalLink,
  Download,
  Eye,
  FileText,
  History,
  ShieldCheck,
  Share,
  Shield,
  Snowflake,
  Search,
  Settings,
  Sparkles,
  Target,
  Trash2,
  TriangleAlert,
  TrendingUp,
  Truck,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Upload,
  Image: ImageIcon,
  Info,
  Link,
  MapPin,
  PenLine,
  RotateCcw,
  UserPlus,
  UserRound,
  Users,
  X,
  Zap,
  ZapOff,
  FlipHorizontal,
} as const;

export type AppIconName = keyof typeof icons;

interface AppIconProps extends Omit<LucideProps, 'ref' | 'size' | 'color' | 'strokeWidth'> {
  name: AppIconName;
  size?: number;
  color?: string;
}

export function AppIcon({
  name,
  size = DEFAULT_ICON_SIZE,
  color = theme.colors.textPrimary,
  ...rest
}: AppIconProps) {
  const Icon = icons[name];
  const normalizedSize = Math.min(MAX_ICON_SIZE, Math.max(MIN_ICON_SIZE, size));
  return (
    <Icon
      size={normalizedSize}
      color={color}
      strokeWidth={ICON_STROKE_WIDTH}
      absoluteStrokeWidth
      {...rest}
    />
  );
}
