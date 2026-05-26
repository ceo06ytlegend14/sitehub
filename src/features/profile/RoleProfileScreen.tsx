import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppAvatar } from '@/src/components/AppAvatar';
import type { AppIconName } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import {
  ProfileStatCell,
  ProfileStatsGrid,
  SettingsGroup,
  SettingsRow,
  SettingsSection,
} from '@/src/components/SettingsGroup';
import { appRoutes } from '@/src/constants/navigation';
import { getRoleTheme, theme } from '@/src/constants/theme';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useAuth } from '@/src/hooks/useAuth';
import { useOrders } from '@/src/hooks/useOrders';
import { usePrinterJobs } from '@/src/hooks/usePrinterJobs';
import { useBioPage } from '@/src/hooks/useBioPage';
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

function formatDate(value?: string) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

interface RoleProfileLayoutProps {
  variant: ProfileVariant;
  title: string;
  subtitle: string;
  stats: ProfileStat[];
  wageStats?: ProfileStat[];
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
  wageStats,
  actions,
  activity,
  isLoading,
  error,
}: RoleProfileLayoutProps) {
  const { user, signOutUser } = useAuth();
  const { bioPage } = useBioPage(user?.id ?? '');
  const { colors } = useAppTheme();
  const [signingOut, setSigningOut] = useState(false);
  const roleTheme = getRoleTheme(variant);
  const fallbackName = variant === 'sales' ? 'Sales Rep' : 'Printer Operator';
  const displayName = user?.displayName?.trim() || fallbackName;
  const roleLabel = getRoleLabel(user?.role);
  const primaryActions = actions.slice(0, 2);
  const shortcutActions = actions.slice(2);

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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderCopy}>
            <AppText variant="body" weight="bold" style={[styles.navTitle, { color: colors.typographyColor }]}>
              {title}
            </AppText>
            <AppText variant="caption" tone="muted">
              {subtitle}
            </AppText>
          </View>
          <Pressable
            disabled={signingOut}
            onPress={() => void performSignOut()}
            style={({ pressed }) => [styles.headerSignOut, pressed && { opacity: 0.55 }, signingOut && styles.disabled]}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            hitSlop={8}
          >
            <AppText variant="body" weight="medium" style={{ color: roleTheme.primary }}>
              {signingOut ? '...' : 'Sign Out'}
            </AppText>
          </Pressable>
        </View>

        <SettingsGroup compact style={styles.firstGroup}>
          <View style={styles.profileRow}>
            <AppAvatar
              name={displayName}
              role={variant}
              size={48}
              source={bioPage?.photoUrl ? { uri: bioPage.photoUrl } : undefined}
            />
            <View style={styles.profileCopy}>
              <AppText variant="body" weight="semibold" numberOfLines={1} style={{ color: colors.typographyColor }}>
                {displayName}
              </AppText>
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {user?.email ?? 'No email on file'}
              </AppText>
              <View style={[styles.rolePill, { backgroundColor: roleTheme.soft }]}>
                <AppText variant="caption" weight="semibold" style={{ color: roleTheme.primaryDark }}>
                  {roleLabel}
                </AppText>
              </View>
            </View>
          </View>
          <View style={[styles.profileSeparator, { backgroundColor: colors.border }]} />
          {primaryActions.map((action, index) => (
            <SettingsRow
              key={action.label}
              compact
              icon={action.icon}
              iconColor={roleTheme.primary}
              iconBackgroundColor={roleTheme.soft}
              title={action.label}
              subtitle={action.description}
              onPress={action.onPress}
              isLast={index === primaryActions.length - 1}
            />
          ))}
        </SettingsGroup>

        <SettingsSection title="Account" compact />
        <SettingsGroup compact>
          <SettingsRow
            compact
            icon="ShieldCheck"
            iconColor={roleTheme.primary}
            iconBackgroundColor={roleTheme.soft}
            title="Access"
            value={getRoleScopeSummary(user?.role)}
            showChevron={false}
          />
          <SettingsRow
            compact
            icon="Home"
            iconColor={roleTheme.primary}
            iconBackgroundColor={roleTheme.soft}
            title="Branch"
            value={user?.branch || 'Default branch'}
            showChevron={false}
          />
          <SettingsRow
            compact
            icon="Phone"
            iconColor={roleTheme.primary}
            iconBackgroundColor={roleTheme.soft}
            title="Contact"
            value={user?.phone || 'No phone on file'}
            showChevron={false}
          />
          <SettingsRow
            compact
            icon="User"
            iconColor={roleTheme.primary}
            iconBackgroundColor={roleTheme.soft}
            title="Member Since"
            value={formatDate(user?.createdAt)}
            showChevron={false}
            isLast
          />
        </SettingsGroup>

        <SettingsSection title="Overview" compact />
        <SettingsGroup compact>
          <ProfileStatsGrid>
            {stats.map((stat, index) => (
              <ProfileStatCell
                key={stat.label}
                compact
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                tone={stat.tone}
                index={index}
                total={stats.length}
              />
            ))}
          </ProfileStatsGrid>
        </SettingsGroup>

        {wageStats && wageStats.length > 0 ? (
          <>
            <SettingsSection title="My Wage" compact />
            <SettingsGroup compact>
              <ProfileStatsGrid>
                {wageStats.map((stat, index) => (
                  <ProfileStatCell
                    key={stat.label}
                    compact
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    tone={stat.tone}
                    index={index}
                    total={wageStats.length}
                  />
                ))}
              </ProfileStatsGrid>
            </SettingsGroup>
          </>
        ) : null}

        <SettingsSection title="Shortcuts" compact />
        <SettingsGroup compact>
          {shortcutActions.map((action) => (
            <SettingsRow
              key={action.label}
              compact
              icon={action.icon}
              iconColor={roleTheme.primary}
              iconBackgroundColor={roleTheme.soft}
              title={action.label}
              subtitle={action.description}
              onPress={action.onPress}
              isLast={false}
            />
          ))}
          <SettingsRow
            compact
            icon="LogOut"
            iconColor={theme.colors.danger}
            iconBackgroundColor={colors.surfaceSoft}
            title={signingOut ? 'Signing out...' : 'Sign Out'}
            subtitle="End the current session."
            onPress={() => void performSignOut()}
            destructive
            disabled={signingOut}
            isLast
          />
        </SettingsGroup>

        <SettingsSection title="Recent Activity" compact />
        {isLoading ? (
          <View style={[styles.stateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText variant="body" tone="muted">
              Loading account activity...
            </AppText>
          </View>
        ) : error ? (
          <View
            style={[
              styles.stateCard,
              { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
            ]}
          >
            <AppText variant="body" style={{ color: theme.colors.danger }}>
              {error}
            </AppText>
          </View>
        ) : activity.length === 0 ? (
          <View style={[styles.stateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText variant="body" tone="muted">
              No recent account activity yet.
            </AppText>
          </View>
        ) : (
          <SettingsGroup compact>
            {activity.map((item, index) => (
              <SettingsRow
                key={`${item.title}-${item.meta}`}
                compact
                icon="Clock"
                iconColor={roleTheme.primary}
                iconBackgroundColor={roleTheme.soft}
                title={item.title}
                subtitle={item.subtitle}
                value={item.meta}
                showChevron={false}
                isLast={index === activity.length - 1}
              />
            ))}
          </SettingsGroup>
        )}
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
  const salesTheme = getRoleTheme('sales');

  return (
    <RoleProfileLayout
      variant="sales"
      title="Profile"
      subtitle="Sales account"
      isLoading={isLoading}
      error={error}
      stats={[
        { label: 'Total Orders', value: String(orders.length), icon: 'ClipboardList' },
        { label: 'Active', value: String(active), icon: 'Package' },
        { label: 'Delivered', value: String(delivered), icon: 'ShieldCheck', tone: salesTheme.primary },
        { label: 'Paid', value: String(paid), icon: 'Wallet', tone: salesTheme.primary },
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
  const wages = jobs
    .filter((job) => job.stage === 'done')
    .reduce((sum, job) => sum + job.cardsPrinted * job.perCardBonus + job.perOrderBonus, 0);
  const completedJobs = jobs.filter((job) => job.stage === 'done');
  const cardsPrinted = completedJobs.reduce((sum, job) => sum + job.cardsPrinted, 0);
  const failedCards = completedJobs.reduce((sum, job) => sum + job.failedCards, 0);
  const printerTheme = getRoleTheme('printer');

  return (
    <RoleProfileLayout
      variant="printer"
      title="Profile"
      subtitle="Workshop account"
      isLoading={isLoading}
      error={error}
      stats={[
        { label: 'Active Jobs', value: String(active), icon: 'Printer' },
        { label: 'Done', value: String(done), icon: 'ShieldCheck', tone: printerTheme.primary },
        { label: 'Earned', value: `$${wages.toFixed(2)}`, icon: 'BadgeDollarSign', tone: printerTheme.primary },
        { label: 'Completed', value: String(completedJobs.length), icon: 'ClipboardList' },
      ]}
      wageStats={[
        { label: 'Cards Printed', value: String(cardsPrinted), icon: 'Printer', tone: printerTheme.primary },
        {
          label: 'Failed Cards',
          value: String(failedCards),
          icon: 'ShieldCheck',
          tone: failedCards > 0 ? theme.status.error : theme.status.success,
        },
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
    paddingTop: 2,
    paddingBottom: 120,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 4,
    paddingBottom: 6,
  },
  pageHeaderCopy: {
    flex: 1,
    gap: 1,
  },
  navTitle: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  headerSignOut: {
    paddingTop: 1,
    paddingLeft: theme.spacing.xs,
  },
  firstGroup: {
    marginTop: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 11,
  },
  profileCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  profileSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: theme.spacing.md,
  },
  rolePill: {
    alignSelf: 'flex-start',
    marginTop: 3,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stateCard: {
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.55,
  },
});
