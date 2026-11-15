import { Image, type ImageStyle, type StyleProp } from 'react-native';

type IconName = 'home' | 'search' | 'message' | 'user' | 'arrow-left' | 'pin' | 'bag' | 'heart' | 'filter' | 'check' | 'plus' | 'minus' | 'phone' | 'chevron-right' | 'clock' | 'sparkles';

const icons = {
  home: require('../../../assets/customer/icons/home.png'),
  search: require('../../../assets/customer/icons/search.png'),
  message: require('../../../assets/customer/icons/message.png'),
  user: require('../../../assets/customer/icons/user.png'),
  'arrow-left': require('../../../assets/customer/icons/arrow-left.png'),
  pin: require('../../../assets/customer/icons/pin.png'),
  bag: require('../../../assets/customer/icons/bag.png'),
  heart: require('../../../assets/customer/icons/heart.png'),
  filter: require('../../../assets/customer/icons/filter.png'),
  check: require('../../../assets/customer/icons/check.png'),
  plus: require('../../../assets/customer/icons/plus.png'),
  minus: require('../../../assets/customer/icons/minus.png'),
  phone: require('../../../assets/customer/icons/phone.png'),
  'chevron-right': require('../../../assets/customer/icons/chevron-right.png'),
  clock: require('../../../assets/customer/icons/clock.png'),
  sparkles: require('../../../assets/customer/icons/sparkles.png'),
} as const;

export function CustomerIcon({ name, color = '#123C57', size = 22, style }: { name: IconName; color?: string; size?: number; style?: StyleProp<ImageStyle> }) {
  return <Image source={icons[name]} resizeMode="contain" style={[{ width: size, height: size, tintColor: color }, style]} />;
}
