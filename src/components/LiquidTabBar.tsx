import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { appRoutes } from '@/src/constants/navigation';
import { getRoleTheme, theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useOrders } from '@/src/hooks/useOrders';
import { usePreferences } from '@/src/hooks/usePreferences';

interface Props {
  state: any;
  navigation: any;
  descriptors?: Record<string, any>;
}

type RouteItem = { type: 'route'; route: any };
type ActionItem = { type: 'action'; key: 'new-order' };
type NavItem = RouteItem | ActionItem;

const routeIcons: Record<string, AppIconName> = {
  index: 'Home',
  orders: 'ClipboardList',
  payouts: 'Wallet',
  me: 'User',
  queue: 'ClipboardList',
  scan: 'ScanLine',
  wages: 'BadgeDollarSign',
  attendance: 'CalendarDays',
  profile: 'User',
  settings: 'Settings',
};

function routeLabel(route: any, descriptors?: Record<string, any>) {
  const options = descriptors?.[route.key]?.options ?? {};
  return options.title ?? route.name.charAt(0).toUpperCase() + route.name.slice(1);
}

function TabIcon({
  routeName,
  active,
  accentColor,
  mutedColor,
  badgeLabel,
}: {
  routeName: string;
  active: boolean;
  accentColor: string;
  mutedColor: string;
  badgeLabel?: string;
}) {
  return (
    <View style={styles.iconShell}>
      <AppIcon
        name={routeIcons[routeName] ?? 'Home'}
        size={active ? 24 : 22}
        color={active ? accentColor : mutedColor}
      />
      {badgeLabel ? (
        <View style={styles.badge}>
          <AppText style={styles.badgeText} numberOfLines={1}>
            {badgeLabel}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function useReduceTransparency() {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let mounted = true;
    const accessibility = AccessibilityInfo as typeof AccessibilityInfo & {
      isReduceTransparencyEnabled?: () => Promise<boolean>;
    };

    if (typeof accessibility.isReduceTransparencyEnabled === 'function') {
      accessibility.isReduceTransparencyEnabled()
        .then((enabled) => {
          if (mounted) setReduceTransparency(enabled);
        })
        .catch(() => undefined);
    }

    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceTransparencyChanged',
      setReduceTransparency
    );

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return reduceTransparency;
}

function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    const accessibility = AccessibilityInfo as typeof AccessibilityInfo & {
      isReduceMotionEnabled?: () => Promise<boolean>;
    };

    if (typeof accessibility.isReduceMotionEnabled === 'function') {
      accessibility.isReduceMotionEnabled()
        .then((enabled) => {
          if (mounted) setReduceMotion(enabled);
        })
        .catch(() => undefined);
    }

    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      setReduceMotion
    );

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return reduceMotion;
}

export function LiquidTabBar({ state, navigation, descriptors }: Props) {
  const { colors } = usePreferences();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const reduceTransparency = useReduceTransparency();
  const reduceMotion = useReduceMotion();
  const entrance = useRef(new Animated.Value(0)).current;
  const activePulse = useRef(new Animated.Value(0)).current;
  const sheen = useRef(new Animated.Value(0)).current;
  const activeRoute = state.routes[state.index];
  const activeOptions = descriptors?.[activeRoute?.key]?.options ?? {};
  const shouldHide = activeOptions.href === null || activeOptions.tabBarStyle?.display === 'none';

  const visibleRoutes = state.routes.filter((route: any) => {
    const options = descriptors?.[route.key]?.options ?? {};
    return options.href !== null && options.tabBarStyle?.display !== 'none';
  });
  const isSalesBar =
    visibleRoutes.some((route: any) => route.name === 'orders') &&
    visibleRoutes.some((route: any) => route.name === 'payouts');
  const isPrinterBar =
    visibleRoutes.some((route: any) => route.name === 'queue') &&
    visibleRoutes.some((route: any) => route.name === 'wages');
  const roleTheme = getRoleTheme(isSalesBar ? 'sales' : isPrinterBar ? 'printer' : 'default');
  const accentColor = colors.primary;
  const mutedColor = colors.textMuted;

  const isSalesUser = user?.role === 'sales';
  const { orders } = useOrders(isSalesUser ? 'sales' : 'guest', isSalesUser ? user?.id ?? 'guest' : 'guest');
  const activeOrdersCount = useMemo(
    () =>
      isSalesUser
        ? orders.filter((order) => order.status !== 'delivered' && (order.cardStatus ?? 'active') !== 'closed').length
        : 0,
    [isSalesUser, orders]
  );
  const ordersBadgeLabel = activeOrdersCount > 99 ? '99+' : activeOrdersCount > 0 ? String(activeOrdersCount) : '';

  const newOrderHref = isSalesBar
    ? appRoutes.sales.newOrder
    : isPrinterBar
      ? appRoutes.printer.newOrder
      : appRoutes.newOrder;

  const items: NavItem[] = isSalesBar || isPrinterBar
    ? [
        ...visibleRoutes.slice(0, 2).map((route: any) => ({ type: 'route', route }) as RouteItem),
        { type: 'action', key: 'new-order' },
        ...visibleRoutes.slice(2).map((route: any) => ({ type: 'route', route }) as RouteItem),
      ]
    : visibleRoutes.map((route: any) => ({ type: 'route', route }) as RouteItem);

  const blurIntensity = reduceTransparency ? 0 : Platform.select({ ios: 78, android: 58, default: 66 });
  const activeScale = activePulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.035, 1],
  });
  const barTransform = {
    opacity: reduceMotion ? 1 : entrance,
    transform: [
      {
        translateY: reduceMotion
          ? 0
          : entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [18, 0],
            }),
      },
      {
        scale: reduceMotion
          ? 1
          : entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [0.96, 1],
            }),
      },
    ],
  };
  const sheenTranslate = sheen.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 360],
  });

  useEffect(() => {
    if (reduceMotion) {
      entrance.setValue(1);
      return;
    }

    Animated.spring(entrance, {
      toValue: 1,
      damping: 18,
      stiffness: 150,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
  }, [entrance, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      activePulse.setValue(0);
      return;
    }

    activePulse.setValue(0);
    Animated.timing(activePulse, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activePulse, reduceMotion, state.index]);

  useEffect(() => {
    if (reduceMotion || reduceTransparency) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2200),
        Animated.timing(sheen, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheen, {
          toValue: 0,
          duration: 1,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [reduceMotion, reduceTransparency, sheen]);

  if (shouldHide) return null;

  return (
    <Animated.View style={[styles.wrapper, barTransform, { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) }]}>
      <BlurView
        intensity={blurIntensity}
        tint="light"
        style={[styles.bar, reduceTransparency && styles.barReducedTransparency]}
      >
        {!reduceTransparency ? (
          <View pointerEvents="none" style={styles.glassLayer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.82)', 'rgba(255,255,255,0.42)', 'rgba(255,255,255,0.72)']}
              locations={[0, 0.46, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.innerStroke} />
            <View style={styles.topShine} />
            <Animated.View
              style={[
                styles.movingSheen,
                {
                  transform: [
                    { translateX: sheenTranslate },
                    { rotate: '-18deg' },
                  ],
                },
              ]}
            />
          </View>
        ) : null}

        {items.map((item) => {
          if (item.type === 'action') {
            return (
              <View key={item.key} style={styles.actionSlot}>
                <Pressable
                  onPress={() => router.push(newOrderHref)}
                  style={({ pressed }) => [
                    styles.actionButton,
                    {
                      backgroundColor: reduceTransparency ? roleTheme.primary : `${roleTheme.primary}E8`,
                      shadowColor: roleTheme.primary,
                    },
                    pressed && styles.actionButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="New order"
                >
                  {!reduceTransparency ? (
                    <>
                      <LinearGradient
                        pointerEvents="none"
                        colors={[`${roleTheme.primary}F2`, `${roleTheme.primaryDark}E8`]}
                        style={StyleSheet.absoluteFill}
                      />
                      <View pointerEvents="none" style={styles.actionGloss} />
                    </>
                  ) : null}
                  <View style={styles.actionIcon}>
                    <AppIcon name="PlusSimple" size={26} color={colors.textInverse} />
                  </View>
                </Pressable>
                <AppText variant="caption" weight="bold" style={[styles.actionLabel, { color: roleTheme.primary }]}>
                  New
                </AppText>
              </View>
            );
          }

          const route = item.route;
          const isActive = activeRoute?.name === route.name;
          const label = routeLabel(route, descriptors);
          const showOrdersBadge = isSalesBar && route.name === 'orders' && activeOrdersCount > 0;

          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!isActive && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              style={({ pressed }) => [styles.tabItem, pressed && styles.tabItemPressed]}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: isActive }}
            >
              <Animated.View
                style={[
                  styles.tabGlass,
                  isActive && styles.tabGlassActive,
                  isActive && {
                    backgroundColor: reduceTransparency ? roleTheme.soft : `${roleTheme.primary}12`,
                    borderColor: `${roleTheme.primary}30`,
                  },
                  isActive && !reduceMotion && { transform: [{ scale: activeScale }] },
                ]}
              >
                {isActive && !reduceTransparency ? (
                  <LinearGradient
                    pointerEvents="none"
                    colors={['rgba(255,255,255,0.68)', 'rgba(255,255,255,0.18)']}
                    style={StyleSheet.absoluteFill}
                  />
                ) : null}
                <TabIcon
                  routeName={route.name}
                  active={isActive}
                  accentColor={accentColor}
                  mutedColor={mutedColor}
                  badgeLabel={showOrdersBadge ? ordersBadgeLabel : undefined}
                />
                <AppText
                  variant="caption"
                  weight={isActive ? 'bold' : 'medium'}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                  style={[
                    styles.label,
                    isActive ? { color: roleTheme.primary } : styles.labelInactive,
                  ]}
                >
                  {label}
                </AppText>
              </Animated.View>
            </Pressable>
          );
        })}
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: 'transparent',
  },
  bar: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 7,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.58)',
    shadowColor: '#0A1020',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 10,
  },
  barReducedTransparency: {
    backgroundColor: theme.colors.surface,
  },
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  innerStroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  topShine: {
    position: 'absolute',
    top: 1,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  movingSheen: {
    position: 'absolute',
    top: -36,
    bottom: -36,
    width: 56,
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  tabItemPressed: {
    opacity: 0.72,
  },
  tabGlass: {
    width: '100%',
    minHeight: 58,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  tabGlassActive: {
    shadowColor: '#0A1020',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  iconShell: {
    width: 32,
    height: 28,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.danger,
  },
  badgeText: {
    color: theme.colors.textInverse,
    fontSize: 9,
    fontWeight: '700',
  },
  label: {
    maxWidth: '100%',
    fontSize: 10.5,
    letterSpacing: 0,
  },
  labelInactive: {
    color: theme.colors.textMuted,
  },
  actionSlot: {
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 8,
  },
  actionButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
  actionGloss: {
    position: 'absolute',
    top: 5,
    left: 12,
    right: 12,
    height: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.36)',
  },
  actionIcon: {
    zIndex: 1,
  },
  actionLabel: {
    color: theme.roles.sales.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
