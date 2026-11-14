import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Keyboard, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomerIcon } from './Icon';
import { customerUi } from './theme';

type Tab = { key: 'home' | 'search' | 'inquiries' | 'account'; label: string; route: string; icon: 'home' | 'search' | 'message' | 'user' };
const TABS: Tab[] = [
  { key: 'home', label: 'Home', icon: 'home', route: '/customer/home' },
  { key: 'search', label: 'Explore', icon: 'search', route: '/customer/search' },
  { key: 'inquiries', label: 'Inquiries', icon: 'message', route: '/customer/inquiries' },
  { key: 'account', label: 'Profile', icon: 'user', route: '/customer/account' },
];

export function AnimatedCustomerTabs({ current }: { current: string }) {
  const index = Math.max(0, TABS.findIndex((t) => t.key === current));
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const dockWidth = Math.min(width - 34, 356);
  const slot = (dockWidth - 20) / TABS.length;
  const position = useRef(new Animated.Value(index)).current;
  const rise = useRef(new Animated.Value(1)).current;
  const stretch = useRef(new Animated.Value(1)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  useEffect(() => {
    Animated.parallel([
      Animated.spring(position, { toValue: index, tension: 74, friction: 10, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(rise, { toValue: 0.87, duration: 105, useNativeDriver: true }),
        Animated.spring(rise, { toValue: 1, tension: 180, friction: 5, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(stretch, { toValue: 1.13, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(stretch, { toValue: 1, tension: 130, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, [index, position, rise, stretch]);

  const x = position.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0, slot, slot * 2, slot * 3] });
  if (keyboardVisible) return null;
  return (
    <View pointerEvents="box-none" style={[styles.absolute, { bottom: Math.max(12, insets.bottom + 4) }]}>
      <View style={[styles.dock, { width: dockWidth }]}>
        <Animated.View pointerEvents="none" style={[styles.pillTrack, { width: slot, transform: [{ translateX: x }, { scaleX: stretch }] }]} />
        <Animated.View pointerEvents="none" style={[styles.orbHolder, { left: 10 + (slot - 46) / 2, transform: [{ translateX: x }, { scale: rise }] }]}>
          <View style={styles.orb}><CustomerIcon name={TABS[index].icon} size={23} color="#FFFFFF" /></View>
        </Animated.View>
        {TABS.map((tab, i) => {
          const active = i === index;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityLabel={`${tab.label} tab`}
              accessibilityState={{ selected: active }}
              onPress={() => { if (!active) router.replace(tab.route as never); }}
              style={[styles.tab, { width: slot }]}
            >
              <View style={styles.tabIconBox}>{active ? null : <CustomerIcon name={tab.icon} size={20} color="#B7C9CD" />}</View>
              <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  absolute: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  dock: {
    height: 72, borderRadius: 28, backgroundColor: '#153B4B',
    borderColor: 'rgba(242,255,255,0.23)', borderWidth: 1,
    paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#0B3549', shadowOpacity: .25, shadowRadius: 20, shadowOffset: { width: 0, height: 11 }, elevation: 12,
  },
  pillTrack: {
    position: 'absolute', height: 55, left: 10, top: 8, borderRadius: 20,
    backgroundColor: 'rgba(22,183,175,0.19)', borderWidth: 1, borderColor: 'rgba(158,251,224,0.14)',
  },
  orbHolder: { position: 'absolute', top: -19, width: 46, height: 46, zIndex: 5, alignItems: 'center', justifyContent: 'center' },
  orb: {
    height: 46, width: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center',
    backgroundColor: customerUi.teal, borderWidth: 3, borderColor: '#EAFBF7',
    shadowColor: '#13B7AF', shadowOpacity: 0.35, shadowRadius: 13, shadowOffset: { width: 0, height: 5 }, elevation: 9,
  },
  tab: { height: 62, alignItems: 'center', justifyContent: 'center', gap: 3, zIndex: 2 },
  tabIconBox: { height: 26, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 10, color: '#B7C9CD', fontWeight: '700' },
  activeLabel: { color: '#DFFFF6', fontWeight: '800' },
});
