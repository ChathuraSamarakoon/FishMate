import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FishermanIcon, type FishermanIconName } from './FishermanIcon';

type Tab = {
  key: 'dashboard' | 'orders' | 'listings' | 'trips' | 'profile';
  label: string;
  icon: FishermanIconName;
  route: string;
};

const TABS: Tab[] = [
  { key: 'dashboard', label: 'Home', icon: 'home', route: '/fisherman/dashboard' },
  { key: 'orders', label: 'Orders', icon: 'bag', route: '/fisherman/s22' },
  { key: 'listings', label: 'My Catch', icon: 'sparkles', route: '/fisherman/listings' },
  { key: 'trips', label: 'Trips', icon: 'clock', route: '/fisherman/trips' },
  { key: 'profile', label: 'Profile', icon: 'user', route: '/fisherman/profile' },
];

export function AnimatedFishermanTabs({ current }: { current: string }) {
  const normalizedKey =
    current === 's22'
      ? 'orders'
      : current === 's06'
      ? 'listings'
      : current === 's12'
      ? 'trips'
      : current === 's03' || current === 's04' || current === 'a07'
      ? 'profile'
      : current;

  const index = Math.max(
    0,
    TABS.findIndex((t) => t.key === normalizedKey),
  );

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const dockWidth = Math.min(width - 24, 450);
  const slot = (dockWidth - 16) / TABS.length;

  const [position] = useState(() => new Animated.Value(index));
  const [rise] = useState(() => new Animated.Value(1));
  const [stretch] = useState(() => new Animated.Value(1));
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(position, {
        toValue: index,
        tension: 74,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(rise, { toValue: 0.87, duration: 105, useNativeDriver: true }),
        Animated.spring(rise, { toValue: 1, tension: 180, friction: 5, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(stretch, {
          toValue: 1.13,
          duration: 140,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(stretch, { toValue: 1, tension: 130, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, [index, position, rise, stretch]);

  const x = position.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [0, slot, slot * 2, slot * 3, slot * 4],
  });

  if (keyboardVisible) return null;

  const activeTab = TABS[index] || TABS[0];

  return (
    <View
      pointerEvents="box-none"
      style={[styles.absolute, { bottom: Math.max(12, insets.bottom + 4) }]}
    >
      <View style={[styles.dock, { width: dockWidth }]}>
        {/* EXACT CUSTOMER INNER RIM */}
        <View pointerEvents="none" style={styles.innerRim} />

        {/* EXACT CUSTOMER PILL TRACK */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pillTrack,
            { width: slot, transform: [{ translateX: x }, { scaleX: stretch }] },
          ]}
        />

        {/* EXACT CUSTOMER FLOATING GLOWING ORB */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.orbHolder,
            { left: 8 + (slot - 50) / 2, transform: [{ translateX: x }, { scale: rise }] },
          ]}
        >
          <View style={styles.orb}>
            <View style={styles.orbInner}>
              <View style={styles.orbShine} />
              <FishermanIcon name={activeTab.icon} size={23} color="#FFFFFF" />
            </View>
          </View>
        </Animated.View>

        {/* EXACT CUSTOMER GLOWING BOTTOM INDICATOR */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            { left: 8 + (slot - 28) / 2, transform: [{ translateX: x }] },
          ]}
        />

        {/* TABS */}
        {TABS.map((tab, i) => {
          const active = i === index;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${tab.label} tab`}
              onPress={() => {
                if (!active) router.replace(tab.route as never);
              }}
              style={[styles.tab, { width: slot }]}
            >
              {i > 0 && i !== index && i - 1 !== index ? (
                <View pointerEvents="none" style={styles.divider} />
              ) : null}

              <View style={styles.tabIconBox}>
                {active ? null : (
                  <FishermanIcon name={tab.icon} size={20} color="#BCECF5" />
                )}
              </View>

              <Text
                numberOfLines={1}
                style={[styles.label, active ? styles.activeLabel : null]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  dock: {
    height: 72,
    borderRadius: 36,
    backgroundColor: '#063F50',
    borderColor: '#16D5D7',
    borderWidth: 2,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#023D4D',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  innerRim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 34,
    borderWidth: 2,
    borderTopColor: '#438B9C',
    borderLeftColor: '#087E91',
    borderRightColor: '#087E91',
    borderBottomColor: '#03AEB8',
  },
  pillTrack: {
    position: 'absolute',
    height: 66,
    left: 6,
    top: 1,
    borderRadius: 33,
    backgroundColor: '#076878',
    borderRightWidth: 1,
    borderColor: '#23BBC1',
  },
  orbHolder: {
    position: 'absolute',
    top: -11,
    width: 50,
    height: 50,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00B8BA',
    borderWidth: 2,
    borderColor: '#48F5EB',
    shadowColor: '#08E9DF',
    shadowOpacity: 0.65,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 9,
  },
  orbInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#009CA8',
    borderWidth: 2,
    borderColor: '#DAFFFF',
    overflow: 'hidden',
  },
  orbShine: {
    position: 'absolute',
    top: 1,
    left: 6,
    right: 6,
    height: 15,
    borderRadius: 18,
    backgroundColor: 'rgba(105,255,236,0.25)',
  },
  tab: {
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    zIndex: 2,
    paddingBottom: 5,
  },
  tabIconBox: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    color: '#C7EFF7',
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  indicator: {
    position: 'absolute',
    bottom: 7,
    width: 28,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#B8FFFA',
    shadowColor: '#00FFF0',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  divider: {
    position: 'absolute',
    left: 0,
    top: 22,
    width: 1,
    height: 23,
    backgroundColor: '#2D8295',
  },
});
