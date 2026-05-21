import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { AppText } from '@/src/components/AppText';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconHome({ active }: { active: boolean }) {
  const c = active ? '#7c3aed' : 'rgba(50,50,60,0.45)';
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
      <Path d="M3 11.5L13 3l10 8.5V23a1 1 0 0 1-1 1H16v-6h-6v6H4a1 1 0 0 1-1-1V11.5z" fill={c} />
    </Svg>
  );
}

function IconScanner({ active }: { active: boolean }) {
  const c = active ? '#7c3aed' : 'rgba(50,50,60,0.45)';
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
      <Path d="M2 9V5.5A3.5 3.5 0 0 1 5.5 2H9" stroke={c} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M24 9V5.5A3.5 3.5 0 0 0 20.5 2H17" stroke={c} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M2 17v3.5A3.5 3.5 0 0 0 5.5 24H9" stroke={c} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M24 17v3.5A3.5 3.5 0 0 1 20.5 24H17" stroke={c} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={2} y1={13} x2={24} y2={13} stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function IconOrders({ active }: { active: boolean }) {
  const c = active ? '#7c3aed' : 'rgba(50,50,60,0.45)';
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
      <Rect x={3} y={4} width={20} height={18} rx={3} fill={c} />
      <Rect x={7} y={9} width={12} height={2} rx={1} fill="white" opacity={0.8} />
      <Rect x={7} y={13} width={8} height={2} rx={1} fill="white" opacity={0.6} />
      <Rect x={7} y={17} width={5} height={2} rx={1} fill="white" opacity={0.4} />
    </Svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  const c = active ? '#7c3aed' : 'rgba(50,50,60,0.45)';
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
      <Circle cx={13} cy={9} r={4.5} fill={c} />
      <Path d="M4 23c0-5 4-8 9-8s9 3 9 8" fill={c} />
    </Svg>
  );
}

function IconSettings({ active }: { active: boolean }) {
  const c = active ? '#7c3aed' : 'rgba(50,50,60,0.45)';
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
      <Circle cx={13} cy={13} r={3.2} fill={c} />
      <Path d="M13 2.5v2M13 21.5v2M2.5 13h2M21.5 13h2M5.4 5.4l1.4 1.4M19.2 19.2l1.4 1.4M5.4 20.6l1.4-1.4M19.2 6.8l1.4-1.4"
        stroke={c} strokeWidth={2.2} strokeLinecap="round" />
      <Circle cx={13} cy={13} r={5.5} stroke={c} strokeWidth={2.2} />
    </Svg>
  );
}

// ─── Tab config ──────────────────────────────────────────────────────────────

const TABS = [
  { key: 'index',      label: 'Home',     Icon: IconHome },
  { key: 'attendance', label: 'Orders',   Icon: IconOrders },
  { key: 'profile',    label: 'Profile',  Icon: IconProfile },
  { key: 'settings',   label: 'Settings', Icon: IconSettings },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  state: any;
  navigation: any;
}

export function LiquidTabBar({ state, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [tabWidths, setTabWidths] = useState<number[]>([]);
  const [tabOffsets, setTabOffsets] = useState<number[]>([]);

  const indicatorLeft = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  const activeIndex = state.index;

  // Move indicator whenever active tab or layout changes
  useEffect(() => {
    if (tabWidths.length < TABS.length) return;
    const INSET = 5;
    Animated.parallel([
      Animated.spring(indicatorLeft, {
        toValue: tabOffsets[activeIndex] + INSET,
        useNativeDriver: false,
        damping: 18,
        stiffness: 160,
      }),
      Animated.spring(indicatorWidth, {
        toValue: tabWidths[activeIndex] - INSET * 2,
        useNativeDriver: false,
        damping: 18,
        stiffness: 160,
      }),
    ]).start();
  }, [activeIndex, tabWidths, tabOffsets]);

  function onTabLayout(index: number, e: LayoutChangeEvent) {
    const { x, width } = e.nativeEvent.layout;
    setTabWidths((prev) => {
      const next = [...prev];
      next[index] = width;
      return next;
    });
    setTabOffsets((prev) => {
      const next = [...prev];
      next[index] = x;
      return next;
    });
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom || 16 }]}>
      {/* Outer frosted pill */}
      <BlurView intensity={60} tint="light" style={styles.pill}>
        {/* Sliding active indicator */}
        <Animated.View
          style={[
            styles.indicator,
            { left: indicatorLeft, width: indicatorWidth },
          ]}
        />

        {TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          const route = state.routes[index];

          return (
            <Pressable
              key={tab.key}
              onLayout={(e) => onTabLayout(index, e)}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isActive && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={({ pressed }) => [
                styles.tabItem,
                pressed && styles.tabItemPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <tab.Icon active={isActive} />
              <AppText
                variant="caption"
                style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}
              >
                {tab.label}
              </AppText>
              {/* Active dot */}
              <View style={[styles.dot, isActive ? styles.dotVisible : styles.dotHidden]} />
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  pill: {
    flexDirection: 'row',
    borderRadius: 30,
    padding: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.18)',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },
  indicator: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 24,
    zIndex: 1,
  },
  tabItemPressed: {
    transform: [{ scale: 0.86 }],
  },
  label: {
    fontSize: 10,
    letterSpacing: -0.1,
  },
  labelActive: {
    color: '#5b21b6',
    fontWeight: '700',
  },
  labelInactive: {
    color: 'rgba(50,50,60,0.5)',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#7c3aed',
  },
  dotVisible: {
    opacity: 1,
  },
  dotHidden: {
    opacity: 0,
  },
});
