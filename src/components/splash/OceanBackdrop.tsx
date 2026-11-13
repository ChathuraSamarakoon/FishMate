import { useEffect, useMemo, useRef } from 'react';
import { Animated, Image, StyleSheet, useWindowDimensions, View } from 'react-native';

const backWave = require('../../../assets/fishmate/ocean-waves-back.png');
const frontWave = require('../../../assets/fishmate/ocean-waves-front.png');
const aquaGlow = require('../../../assets/fishmate/aqua-glow.png');

const BUBBLES = [
  { x: 0.14, y: 0.14, size: 5, shift: 0 },
  { x: 0.81, y: 0.24, size: 4, shift: 8 },
  { x: 0.28, y: 0.33, size: 3, shift: 16 },
  { x: 0.9, y: 0.4, size: 7, shift: 22 },
  { x: 0.08, y: 0.55, size: 4, shift: 11 },
  { x: 0.77, y: 0.67, size: 5, shift: 19 },
] as const;

/** Decorative ocean artwork shared by Splash and Welcome for a seamless hand-off. */
export function OceanBackdrop() {
  const { width, height } = useWindowDimensions();
  const backMove = useRef(new Animated.Value(0)).current;
  const frontMove = useRef(new Animated.Value(0)).current;
  const bubbleMove = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(backMove, { toValue: 1, duration: 7800, useNativeDriver: true }),
          Animated.timing(backMove, { toValue: 0, duration: 7800, useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(frontMove, { toValue: 1, duration: 5700, useNativeDriver: true }),
          Animated.timing(frontMove, { toValue: 0, duration: 5700, useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubbleMove, { toValue: 1, duration: 6800, useNativeDriver: true }),
          Animated.timing(bubbleMove, { toValue: 0, duration: 6800, useNativeDriver: true }),
        ]),
      ),
    ];
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [backMove, bubbleMove, frontMove]);

  const waveSize = useMemo(() => {
    const waveWidth = Math.max(width * 1.47, 540);
    return {
      width: waveWidth,
      height: Math.max(height * 0.56, 430),
      left: (width - waveWidth) / 2,
      top: height * 0.32,
    };
  }, [height, width]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={aquaGlow}
        resizeMode="contain"
        style={{
          position: 'absolute',
          width: width * 1.22,
          height: width * 1.22,
          left: -width * 0.11,
          top: height * 0.13,
          opacity: 0.58,
        }}
      />
      <Animated.Image
        source={backWave}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          ...waveSize,
          opacity: 0.96,
          transform: [{ translateX: backMove.interpolate({ inputRange: [0, 1], outputRange: [-24, 22] }) }],
        }}
      />
      <Animated.Image
        source={frontWave}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          ...waveSize,
          top: waveSize.top + 11,
          opacity: 0.78,
          transform: [
            { translateX: frontMove.interpolate({ inputRange: [0, 1], outputRange: [18, -20] }) },
            { translateY: frontMove.interpolate({ inputRange: [0, 1], outputRange: [-3, 5] }) },
          ],
        }}
      />
      {BUBBLES.map((bubble, index) => (
        <Animated.View
          key={`bubble-${index}`}
          style={{
            position: 'absolute',
            left: width * bubble.x,
            top: height * bubble.y,
            width: bubble.size,
            height: bubble.size,
            borderRadius: bubble.size / 2,
            borderWidth: 0.8,
            borderColor: '#5AAAB9',
            opacity: bubbleMove.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.09, 0.33, 0.1] }),
            transform: [
              {
                translateY: bubbleMove.interpolate({
                  inputRange: [0, 1],
                  outputRange: [bubble.shift + 4, -21 - bubble.shift],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
