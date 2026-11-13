import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

const brandIcon = require('../../../assets/fishmate/fishmate-icon.png');
const wordmark = require('../../../assets/fishmate/fishmate-wordmark.png');

// Ratios come from the actual extracted logo assets, not approximated text fonts.
const ICON_ASPECT = 467 / 844;
const WORDMARK_ASPECT = 232 / 1148;

type BrandMarkProps = {
  containerStyle?: StyleProp<ViewStyle>;
  iconOpacity?: Animated.Value;
  iconScale?: Animated.Value;
  wordOpacity?: Animated.Value;
  wordOffset?: Animated.Value;
};

export function BrandMark({
  containerStyle,
  iconOpacity,
  iconScale,
  wordOpacity,
  wordOffset,
}: BrandMarkProps) {
  const { width } = useWindowDimensions();
  const iconWidth = Math.min(width * 0.55, 226);
  const wordWidth = Math.min(width * 0.67, 282);

  return (
    <View style={[styles.mark, containerStyle]} accessibilityLabel="FishMate, connecting fishermen and customers">
      <Animated.Image
        source={brandIcon}
        resizeMode="contain"
        style={{
          width: iconWidth,
          height: iconWidth * ICON_ASPECT,
          opacity: iconOpacity ?? 1,
          transform: [{ scale: iconScale ?? 1 }],
        }}
      />
      <Animated.Image
        source={wordmark}
        resizeMode="contain"
        style={{
          width: wordWidth,
          height: wordWidth * WORDMARK_ASPECT,
          marginTop: 5,
          opacity: wordOpacity ?? 1,
          transform: [{ translateY: wordOffset ?? 0 }],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
