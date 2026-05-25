import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { appRoutes } from '@/src/constants/navigation';
import { getRoleTheme, theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useOrders } from '@/src/hooks/useOrders';
import { usePrinterJobs } from '@/src/hooks/usePrinterJobs';
import { type AppUser } from '@/src/types/models';
import { getRoleLabel, getRoleScopeSummary } from '@/src/utils/roleCapabilities';

type ProfileVariant = 'sales' | 'printer';

interface ProfileStat {
  label: string;
  value: string;
  icon: AppIconName;
  tone?: string;
}

interface ProfileAction {
  label: string;
  description: string;
  icon: AppIconName;
  onPress: () => void;
}

interface ActivityItem {
  title: string;
  subtitle: string;
  meta: string;
}

interface Palette {
  background: string;
  primary: string;
  primaryDark: string;
  soft: string;
  text: string;
}

const palettes: Record<ProfileVariant, Palette> = {
  sales: getRoleTheme('sales'),
  printer: getRoleTheme('printer'),
};

function formatDate(value?: string) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitial(user: AppUser | null, fallback: string) {
  return (user?.displayName?.trim() || fallback).charAt(0).toUpperCase();
}

interface RoleProfileLayoutProps {
  variant: ProfileVariant;
  title: string;
  subtitle: string;
  stats: ProfileStat[];
  actions: ProfileAction[];
  activity: ActivityItem[];
  isLoading: boolean;
  error: string | null;
}

function RoleProfileLayout({
  variant,
  title,
  subtitle,
  stats,
  actions,
  activity,
  isLoading,
  error,
}: RoleProfileLayoutProps) {
  const { user, signOutUser } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const palette = palettes[variant];
  const fallbackName = variant === 'sales' ? 'Sales Rep' : 'Printer Operator';
  const displayName = user?.displayName?.trim() || fallbackName;
  const roleLabel = getRoleLabel(user?.role);

  async function performSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOutUser();
      router.replace(appRoutes.login);
    } catch (signOutError) {
      const message = signOutError instanceof Error ? signOutError.message : 'Unable to sign out.';
      Alert.alert('Error', message);
      setSigningOut(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.cover, { backgroundColor: palette.primary }]}>
          <View style={styles.coverTop}>
            <View style={styles.coverTitleWrap}>
              <AppText style={styles.coverSubtitle}>{subtitle}</AppText>
              <AppText style={styles.coverTitle}>{title}</AppText>
            </View>
            <Pressable
              disabled={signingOut}
              onPress={() => void performSignOut()}
              style={[styles.coverSignOut, { backgroundColor: palette.primaryDark }, signingOut && styles.disabled]}
            >
              <AppIcon name="LogOut" size={16} color={theme.colors.textInverse} />
              <AppText style={styles.coverSignOutText}>{signingOut ? '...' : 'Logout'}</AppText>
            </Pressable>
          </View>
        </View>

        <View style={styles.profileBlock}>
          <View style={[styles.avatar, { backgroundColor: palette.primaryDark, borderColor: palette.background }]}>
            <AppText style={styles.avatarText}>{getInitial(user, fallbackName)}</AppText>
          </View>
          <View style={styles.identityCopy}>
            <AppText style={[styles.name, { color: palette.text }]}>{displayName}</AppText>
            <AppText style={styles.email}>{user?.email ?? 'No email on file'}</AppText>
            <View style={[styles.roleBadge, { backgroundColor: palette.soft }]}>
              <AppText style={[styles.roleText, { color: palette.primaryDark }]}>{roleLabel}</AppText>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {actions.slice(0, 2).map((action, index) => (
              <Pressable
                key={action.label}
                onPress={action.onPress}
                style={[
                  styles.profileAction,
                  index === 0
                    ? { backgroundColor: palette.primary }
                    : { backgroundColor: palette.soft },
                ]}
              >
                <AppIcon name={action.icon} size={18} color={index === 0 ? theme.colors.textInverse : palette.primary} />
                <AppText style={[styles.profileActionText, { color: index === 0 ? theme.colors.textInverse : palette.primaryDark }]}>
                  {action.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.metaPanel}>
          <View style={styles.metaItem}>
            <AppIcon name="ShieldCheck" size={17} color={palette.primary} />
            <View style={styles.metaCopy}>
              <AppText style={styles.metaLabel}>Access</AppText>
              <AppText style={[styles.metaValue, { color: palette.text }]}>{getRoleScopeSummary(user?.role)}</AppText>
            </View>
          </View>
          <View style={styles.metaItem}>
            <AppIcon name="Home" size={17} color={palette.primary} />
            <View style={styles.metaCopy}>
              <AppText style={styles.metaLabel}>Branch</AppText>
              <AppText style={[styles.metaValue, { color: palette.text }]}>{user?.branch || 'Default branch'}</AppText>
            </View>
          </View>
          <View style={styles.metaItem}>
            <AppIcon name="Phone" size={17} color={palette.primary} />
            <View style={styles.metaCopy}>
              <AppText style={styles.metaLabel}>Contact</AppText>
              <AppText style={[styles.metaValue, { color: palette.text }]}>{user?.phone || 'No phone on file'}</AppText>
            </View>
          </View>
          <View style={styles.metaItem}>
            <AppIcon name="User" size={17} color={palette.primary} />
            <View style={styles.metaCopy}>
              <AppText style={styles.metaLabel}>Member Since</AppText>
              <AppText style={[styles.metaValue, { color: palette.text }]}>{formatDate(user?.createdAt)}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: palette.soft }]}>
                <AppIcon name={stat.icon} size={18} color={stat.tone ?? palette.primary} />
              </View>
              <AppText style={[styles.statValue, { color: stat.tone ?? palette.text }]}>{stat.value}</AppText>
              <AppText style={styles.statLabel}>{stat.label}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: palette.text }]}>Shortcuts</AppText>
          <View style={styles.menuList}>
            {actions.slice(2).map((action) => (
              <Pressable key={action.label} style={styles.menuItem} onPress={action.onPress}>
                <View style={[styles.menuIcon, { backgroundColor: palette.soft }]}>
                  <AppIcon name={action.icon} size={20} color={palette.primary} />
                </View>
                <View style={styles.menuCopy}>
                  <AppText style={[styles.menuLabel, { color: palette.text }]}>{action.label}</AppText>
                  <AppText style={styles.menuDescription}>{action.description}</AppText>
                </View>
                <AppIcon name="ChevronRight" size={18} color={theme.colors.textMuted} />
              </Pressable>
            ))}
            <Pressable
              disabled={signingOut}
              style={[styles.menuItem, signingOut && styles.disabled]}
              onPress={() => void performSignOut()}
            >
              <View style={[styles.signOutIcon, { backgroundColor: palette.soft }]}>
                <AppIcon name="LogOut" size={20} color={palette.primaryDark} />
              </View>
              <View style={styles.menuCopy}>
                <AppText style={styles.signOutText}>{signingOut ? 'Signing out...' : 'Sign Out'}</AppText>
                <AppText style={styles.menuDescription}>End the current session.</AppText>
              </View>
              <AppIcon name="ChevronRight" size={18} color={theme.colors.textMuted} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: palette.text }]}>Recent Activity</AppText>
          {isLoading ? (
            <View style={styles.emptyPanel}>
              <AppText style={styles.emptyText}>Loading account activity...</AppText>
            </View>
          ) : error ? (
            <View style={styles.errorPanel}>
              <AppText style={styles.errorText}>{error}</AppText>
            </View>
          ) : activity.length === 0 ? (
            <View style={styles.emptyPanel}>
              <AppText style={styles.emptyText}>No recent account activity yet.</AppText>
            </View>
          ) : (
            <View style={styles.activityList}>
              {activity.map((item) => (
                <View key={`${item.title}-${item.meta}`} style={styles.activityItem}>
                  <View style={[styles.activityDot, { backgroundColor: palette.primary }]} />
                  <View style={styles.activityCopy}>
                    <AppText style={[styles.activityTitle, { color: palette.text }]}>{item.title}</AppText>
                    <AppText style={styles.activitySubtitle}>{item.subtitle}</AppText>
                  </View>
                  <AppText style={styles.activityMeta}>{item.meta}</AppText>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SalesProfileScreen() {
  const { user } = useAuth();
  const { orders, isLoading, error } = useOrders('sales', user?.id ?? '');
  const delivered = orders.filter((order) => order.status === 'delivered').length;
  const active = orders.filter((order) => order.status !== 'delivered' && (order.cardStatus ?? 'active') !== 'closed').length;
  const paid = orders.filter((order) => order.paymentStatus === 'paid').length;

  return (
    <RoleProfileLayout
      variant="sales"
      title="Sales Profile"
      subtitle="Sales account"
      isLoading={isLoading}
      error={error}
      stats={[
        { label: 'Total Orders', value: String(orders.length), icon: 'ClipboardList' },
        { label: 'Active', value: String(active), icon: 'Package' },
        { label: 'Delivered', value: String(delivered), icon: 'ShieldCheck', tone: theme.roles.sales.primary },
        { label: 'Paid', value: String(paid), icon: 'Wallet', tone: theme.roles.sales.primary },
      ]}
      actions={[
        {
          label: 'New Order',
          description: 'Create a customer order.',
          icon: 'ClipboardList',
          onPress: () => router.push(appRoutes.sales.newOrder),
        },
        {
          label: 'Settings',
          description: 'Language, theme, access, and session.',
          icon: 'Settings',
          onPress: () => router.push(appRoutes.sales.settings),
        },
        {
          label: 'My Orders',
          description: 'View orders assigned to this sales account.',
          icon: 'ClipboardList',
          onPress: () => router.push(appRoutes.sales.orders),
        },
        {
          label: 'My Payouts',
          description: 'Track commission and payout status.',
          icon: 'Wallet',
          onPress: () => router.push(appRoutes.sales.payouts),
        },
      ]}
      activity={orders.slice(0, 4).map((order) => ({
        title: order.customerName,
        subtitle: `${order.productType.replace('_', ' ')} x ${order.quantity}`,
        meta: order.status.replace('_', ' '),
      }))}
    />
  );
}

export function PrinterProfileScreen() {
  const { jobs, isLoading, error } = usePrinterJobs();
  const done = jobs.filter((job) => job.stage === 'done').length;
  const active = jobs.filter((job) => job.stage !== 'done' && job.stage !== 'failed').length;
  const cards = jobs.reduce((sum, job) => sum + job.cardsPrinted, 0);
  const wages = jobs
    .filter((job) => job.stage === 'done')
    .reduce((sum, job) => sum + job.cardsPrinted * job.perCardBonus + job.perOrderBonus, 0);

  return (
    <RoleProfileLayout
      variant="printer"
      title="Printer Profile"
      subtitle="Workshop account"
      isLoading={isLoading}
      error={error}
      stats={[
        { label: 'Active Jobs', value: String(active), icon: 'Printer' },
        { label: 'Done', value: String(done), icon: 'ShieldCheck', tone: theme.roles.printer.primary },
        { label: 'Cards', value: String(cards), icon: 'Nfc' },
        { label: 'Wages', value: `$${wages.toFixed(2)}`, icon: 'BadgeDollarSign', tone: theme.roles.printer.primary },
      ]}
      actions={[
        {
          label: 'Open Queue',
          description: 'Continue assigned production jobs.',
          icon: 'ClipboardList',
          onPress: () => router.push(appRoutes.printer.queue),
        },
        {
          label: 'Settings',
          description: 'Language, theme, access, and session.',
          icon: 'Settings',
          onPress: () => router.push(appRoutes.printer.settings),
        },
        {
          label: 'Job Queue',
          description: 'Open print, NFC, and QA work.',
          icon: 'ClipboardList',
          onPress: () => router.push(appRoutes.printer.queue),
        },
        {
          label: 'My Wages',
          description: 'Review completed cards and pay status.',
          icon: 'BadgeDollarSign',
          onPress: () => router.push(appRoutes.printer.wages),
        },
      ]}
      activity={jobs.slice(0, 4).map((job) => ({
        title: `Job #${String(job.queueNumber).slice(-4)}`,
        subtitle: `${job.cardsPrinted} cards printed`,
        meta: job.stage.replace('_', ' '),
      }))}
    />
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 132,
  },
  cover: {
    minHeight: 132,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 10,
    paddingBottom: 46,
  },
  coverTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  coverTitleWrap: {
    flex: 1,
  },
  coverSubtitle: {
    color: theme.colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },
  coverTitle: {
    color: theme.colors.textInverse,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    marginTop: 2,
  },
  coverSignOut: {
    minHeight: 34,
    borderRadius: 18,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.primaryDark,
  },
  coverSignOutText: {
    color: theme.colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  profileBlock: {
    marginHorizontal: theme.spacing.md,
    marginTop: -46,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    paddingTop: 52,
    ...theme.shadows.card,
  },
  avatar: {
    position: 'absolute',
    top: -42,
    left: 18,
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.textInverse,
    fontSize: 34,
    fontWeight: '700',
  },
  identityCopy: {
    gap: 4,
  },
  name: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  email: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  profileAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  profileActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  metaPanel: {
    margin: theme.spacing.md,
    marginBottom: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  metaCopy: {
    flex: 1,
    gap: 2,
  },
  metaLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  metaValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  statCard: {
    width: '47.8%',
    minHeight: 116,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 6,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  menuList: {
    gap: 10,
  },
  menuItem: {
    minHeight: 72,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCopy: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  menuDescription: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  signOutText: {
    color: theme.colors.primaryDark,
    fontSize: 15,
    fontWeight: '700',
  },
  activityList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    gap: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityCopy: {
    flex: 1,
    gap: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  activitySubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  activityMeta: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  emptyPanel: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  errorPanel: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 16,
    padding: 16,
  },
  errorText: {
    color: theme.colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
});
