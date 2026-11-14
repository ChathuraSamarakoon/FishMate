import { Image, StyleSheet, Text, View, type ImageStyle, type StyleProp } from 'react-native';
import { fishermanUi } from './theme';

export type FishermanIconName =
  | 'home'
  | 'bag'
  | 'message'
  | 'user'
  | 'arrow-left'
  | 'chevron-right'
  | 'clock'
  | 'pin'
  | 'filter'
  | 'check'
  | 'plus'
  | 'minus'
  | 'phone'
  | 'sparkles'
  | 'search'
  | 'boat'
  | 'revenue'
  | 'profit'
  | 'orders'
  | 'alert'
  | 'listings';

const baseIcons = {
  home: require('../../../assets/customer/icons/home.png'),
  bag: require('../../../assets/customer/icons/bag.png'),
  message: require('../../../assets/customer/icons/message.png'),
  user: require('../../../assets/customer/icons/user.png'),
  'arrow-left': require('../../../assets/customer/icons/arrow-left.png'),
  'chevron-right': require('../../../assets/customer/icons/chevron-right.png'),
  clock: require('../../../assets/customer/icons/clock.png'),
  pin: require('../../../assets/customer/icons/pin.png'),
  filter: require('../../../assets/customer/icons/filter.png'),
  check: require('../../../assets/customer/icons/check.png'),
  plus: require('../../../assets/customer/icons/plus.png'),
  minus: require('../../../assets/customer/icons/minus.png'),
  phone: require('../../../assets/customer/icons/phone.png'),
  sparkles: require('../../../assets/customer/icons/sparkles.png'),
  search: require('../../../assets/customer/icons/search.png'),
} as const;

export function FishermanIcon({
  name,
  color = fishermanUi.navy,
  size = 20,
  style,
}: {
  name: FishermanIconName;
  color?: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  if (name in baseIcons) {
    const source = baseIcons[name as keyof typeof baseIcons];
    return (
      <Image
        source={source}
        resizeMode="contain"
        style={[{ width: size, height: size, tintColor: color }, style]}
      />
    );
  }

  // Visual glyph fallback for specialized nautical / metric icons
  if (name === 'boat') {
    return (
      <View style={[styles.glyphContainer, { width: size, height: size }]}>
        <Text style={[styles.glyphText, { fontSize: size * 0.85, color }]}>⚓</Text>
      </View>
    );
  }
  if (name === 'revenue' || name === 'profit') {
    return (
      <View style={[styles.glyphContainer, { width: size, height: size }]}>
        <Text style={[styles.glyphText, { fontSize: size * 0.8, color }]}>Rs</Text>
      </View>
    );
  }
  if (name === 'listings') {
    return (
      <View style={[styles.glyphContainer, { width: size, height: size }]}>
        <Text style={[styles.glyphText, { fontSize: size * 0.85, color }]}>🐟</Text>
      </View>
    );
  }
  if (name === 'orders') {
    return (
      <Image
        source={baseIcons.bag}
        resizeMode="contain"
        style={[{ width: size, height: size, tintColor: color }, style]}
      />
    );
  }
  if (name === 'alert') {
    return (
      <View style={[styles.glyphContainer, { width: size, height: size }]}>
        <Text style={[styles.glyphText, { fontSize: size * 0.85, color }]}>!</Text>
      </View>
    );
  }

  return (
    <Image
      source={baseIcons.sparkles}
      resizeMode="contain"
      style={[{ width: size, height: size, tintColor: color }, style]}
    />
  );
}

const styles = StyleSheet.create({
  glyphContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
